import express, { Request, Response } from 'express'
import AuthMiddleware from '../../tokens/AuthMiddleware'
import { validateSignSalaryUserOp, validateChangeSalaryDate } from './schema'
import { connectToDatabase } from '../../../database/database'
import { callBundler } from './blockchain/bundler'
import { startPayrollJob } from './cronTasks'
import fs from 'fs'
import { CronExpressionParser } from 'cron-parser'
import { DateTime } from 'luxon'

const salaryController = express.Router()

// TODO: а вдруг нет файла или поля userOpHash
salaryController.get(
  '/user-op-hash',
  AuthMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    const data = fs.readFileSync('userOpData.json', 'utf-8')
    const userOpData = JSON.parse(data)
    res.status(200).json({ userOpHash: userOpData.userOpHash })
  }
)

salaryController.post(
  '/sign-salary-userop',
  AuthMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    const valid = validateSignSalaryUserOp(req.body)
    if (!valid) {
      res.status(400).json({ error: 'Invalid data format' })
      return
    }

    try {
      const db = await connectToDatabase()
      const accountantsCollection = db.collection('accountants')
      const signature = req.body.signature
      await accountantsCollection.updateOne(
        { walletAddress: req.params.walletAddress },
        { $set: { signStatus: true, signature } }
      )

      const signedAccountants = await accountantsCollection.countDocuments({
        signStatus: true
      })
      if (signedAccountants >= 1) {
        callBundler()
      }
    } catch (error: any) {
      console.log(error)
      res.status(500).json({ error: error.message })
      return
    }

    res.status(200).json({ message: 'OK' })
    return
  }
)

salaryController.post(
  '/change-salary-date',
  AuthMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    const valid = validateChangeSalaryDate(req.body)
    if (!valid) {
      res.status(400).json({ error: 'Invalid data format' })
      return
    }
    const { newDate } = req.body
    const cronSchedule = convertScheduleToCron(newDate)
    try {
      const db = await connectToDatabase()
      const cronJobsCollection = db.collection('cron-jobs')
      await cronJobsCollection.updateOne(
        { job: 'payroll' },
        { $set: { schedule: cronSchedule } }
      )
    } catch (error: any) {
      res.status(500).json({ error: error.message })
      return
    }
    startPayrollJob(cronSchedule)
    res.status(200).json({})
  }
)

salaryController.get(
  '/date',
  AuthMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    let result
    try {
      const db = await connectToDatabase()
      const cronJobsCollection = db.collection('cron-jobs')
      result = await cronJobsCollection.findOne({ job: 'payroll' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
      return
    }
    const interval = CronExpressionParser.parse(result?.schedule)
    const nextDate = interval.next().toDate()
    const formatted = DateTime.fromJSDate(nextDate)
      .setZone('UTC')
      .toFormat('HH:mm:ss yyyy-MM-dd  ')
    res.status(200).json({ date: formatted })
  }
)

function convertScheduleToCron(schedule: string) {
  const [timePart, datePart] = schedule.split(' ')
  const [hour, minute, second] = timePart.split(':').map(Number)
  const [year, month, day] = datePart.split('-').map(Number)
  return `${minute} ${hour} ${day} * *`
}

export default salaryController
