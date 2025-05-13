import express, { Request, Response } from 'express'
import AuthMiddleware from '../tokens/AuthMiddleware'
import { validateSignSalaryUserOp, validateChangeSalaryDate } from './schema'
import { callBundler } from '../../blockchain/bundler'
import { startPayrollJob } from '../../cron-task/cronTasks'
import fs from 'fs'
import { CronExpressionParser } from 'cron-parser'
import Accountant from '../../../database/src/models/accountant'
import CronJob from '../../../database/src/models/cronJob'

const salaryController = express.Router()

// TODO: а вдруг нет файла или поля userOpHash
salaryController.get(
  '/user-op-hash',
  AuthMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    try {
      const data = fs.readFileSync('userOpData.json', 'utf-8')
      const userOpData = JSON.parse(data)
      res.status(200).json({ userOpHash: userOpData.userOpHash })
    } catch (error) {
      res.status(500).json({ error: 'Failed to get UserOpHash' })
    }
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
      const walletAddress = req.params.walletAddress
      const signature = req.body.signature
      const signedAccountants = await Accountant.countDocuments({ signStatus: true })
      await Accountant.updateOne({ walletAddress }, { $set: { signStatus: true, signature } })

      if (signedAccountants + 1 >= 1) {
        callBundler()
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message })
      return
    }

    res.status(200).json({ message: 'OK' })
    return
  }
)

salaryController.put(
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
      await CronJob.updateOne({ job: 'payroll' }, { $set: { schedule: cronSchedule } })
      startPayrollJob(cronSchedule)
      res.status(200).json({})
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update salary date' })
    }
  }
)

salaryController.get('/date', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  let result
  try {
    result = await CronJob.findOne({ job: 'payroll' })
    if (!result?.schedule) {
      res.status(400).json({ error: 'Schedule is not defined' })
      return
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get salary date' })
    return
  }
  const interval = CronExpressionParser.parse(result?.schedule, { tz: 'UTC' })
  const nextDate = interval.next().toDate()
  const isoDate = nextDate.toISOString()
  res.status(200).json({ date: isoDate })
})

function convertScheduleToCron(date: string) {
  const schedule = date.slice(0, -5)
  const [datePart, timePart] = schedule.split('T')
  const [hour, minute, second] = timePart.split(':').map(Number)
  const [year, month, day] = datePart.split('-').map(Number)
  return `${minute} ${hour} ${day} * *`
}

export default salaryController
