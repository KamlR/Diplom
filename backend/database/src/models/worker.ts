import { Schema, Document, model } from 'mongoose'

interface IWorker extends Document {
  firstName: string
  lastName: string
  salary: number
  walletAddress: string
  position: string
  department: string
}

const WorkerSchema = new Schema<IWorker>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  salary: { type: Number, required: true },
  walletAddress: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true }
})

export default model<IWorker>('Worker', WorkerSchema, 'workers')
