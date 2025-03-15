import express, { Request, Response } from 'express'
import { connectToDatabase } from '../../../database/database'
import { validateAddEmployee, validateChangeEmployee, validateDeleteEmployee } from './schemas'
import { ObjectId } from 'mongodb'
import AuthMiddleware from '../../tokens/AuthMiddleware'
import Worker from '../..//models/worker'

const workersController = express.Router()

workersController.get('', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  try {
    const db = await connectToDatabase()
    const workersCollection = db.collection('workers')

    const workersData = await workersCollection.find().toArray()
    const workers = workersData.map(
      worker =>
        new Worker(
          worker._id.toString(),
          worker.firstName,
          worker.lastName,
          worker.salary,
          worker.walletAddress,
          worker.position,
          worker.department
        )
    )
    res.status(200).json(workers)
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
    const db = await connectToDatabase()
    const workersCollection = db.collection('workers')
    const newId = new ObjectId()
    const worker = new Worker(
      newId.toString(),
      req.body.firstName,
      req.body.lastName,
      req.body.salary,
      req.body.walletAddress,
      req.body.position,
      req.body.department
    )
    await workersCollection.insertOne(worker)
    res.status(200).json({ message: 'Сотрудник добавлен', worker })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// TODO: проверить, если ли в бд с таким id кто-то
// TODO: подставляется walletAddress другой в verifyToken
workersController.put('', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  const valid = validateChangeEmployee(req.body)
  if (!valid) {
    res.status(400).json({ error: 'Invalid data format' })
    return
  }

  try {
    const db = await connectToDatabase()
    const workersCollection = db.collection('workers')
    console.log(req.body)
    const result = await workersCollection.updateOne(
      { _id: new ObjectId(req.body.id) },
      {
        $set: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          salary: req.body.salary,
          walletAddress: req.body.walletAddress,
          position: req.body.position,
          department: req.body.department
        }
      }
    )
    console.log(result)

    res.status(200).json({ message: 'Worker updated successfully' })
  } catch (error: any) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// TODO: проверка, что переданный ID есть
// TODO: добавить схему валидации
workersController.delete('/:id', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  try {
    const workerId = new ObjectId(req.params.id)
    console.log(workerId)
    const db = await connectToDatabase()
    const workersCollection = db.collection('workers')

    await workersCollection.deleteOne({ _id: workerId })
    res.status(200).json({ message: 'Worker deleted successfully' })
  } catch (error: any) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default workersController
