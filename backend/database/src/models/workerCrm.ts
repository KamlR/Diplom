import { Schema, Document, model } from 'mongoose'

interface IWorkerCrm extends Document {
  walletAddress: string
  role: string
  firstName: string
  lastName: string
  telegramID: string
  chatID: number
}

const WorkerCrmSchema = new Schema<IWorkerCrm>({
  walletAddress: { type: String, required: true },
  role: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  telegramID: { type: String },
  chatID: { type: Number }
})

export default model<IWorkerCrm>('WorkerCrm', WorkerCrmSchema, 'workers-crm')
