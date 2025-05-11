import express, { Request, Response } from 'express'
import { validateAddEmployee, validateChangeEmployee, validateDeleteEmployee } from './schemas'
import Worker from '../../../database/src/models/worker'
import Accountant from '../../../database/src/models/accountant'
import AuthMiddleware from '../../tokens/AuthMiddleware'

import fs from 'fs'

const workersController = express.Router()

workersController.get('', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  try {
    const workers = await Worker.find()

    const userOpDataAvailable = await checkAccountantSignStatus(req.params.walletAddress)
    res.status(200).json({ workers, userOpDataAvailable })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get workers' })
  }
})

workersController.post('', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  const valid = validateAddEmployee(req.body)
  if (!valid) {
    res.status(400).json({ error: 'Invalid data format' })
    return
  }
  try {
    const worker = new Worker(req.body)
    await worker.save()
    res.status(200).json({ message: 'Add successfully', worker })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// TODO: проверить, если ли в бд с таким id кто-то
// TODO: подставляется walletAddress другой в verifyToken
workersController.put('/:id', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  console.log(req)
  const valid = validateChangeEmployee({
    params: req.params,
    body: req.body
  })
  if (!valid) {
    res.status(400).json({ error: 'Invalid data format' })
    return
  }
  try {
    const workerId = req.params.id
    console.log(workerId)
    const worker = await Worker.exists({ _id: workerId })
    if (!worker) {
      res.status(400).json({ error: 'No worker with such ID' })
      return
    }
    const updatedData = req.body
    const updatedWorker = await Worker.findByIdAndUpdate(workerId, updatedData, {
      new: true,
      runValidators: true,
      overwrite: true
    })
    res.status(200).json({ message: 'Worker updated successfully', updatedWorker })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update worker' })
  }
})

// TODO: проверка, что переданный ID есть
// TODO: добавить схему валидации
workersController.delete(
  '/:id',
  AuthMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    const valid = validateDeleteEmployee({
      params: req.params
    })
    if (!valid) {
      res.status(400).json({ error: 'Invalid data format' })
      return
    }
    try {
      const workerId = req.params.id
      const worker = await Worker.exists({ _id: workerId })
      if (!worker) {
        res.status(400).json({ error: 'No worker with such ID' })
        return
      }
      await Worker.deleteOne({ _id: workerId })
      res.status(200).json({ message: 'Worker deleted successfully' })
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete worker' })
    }
  }
)

async function checkAccountantSignStatus(workerCrmWalletAddress: string) {
  const fileName = './userOpData.json'
  if (!fs.existsSync(fileName)) {
    return false
  }
  const accountant = await Accountant.findOne(
    { walletAddress: workerCrmWalletAddress },
    { signStatus: 1, _id: 0 }
  )
  return !accountant?.signStatus
}

export default workersController
