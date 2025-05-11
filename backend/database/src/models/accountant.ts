import { Schema, Document, model } from 'mongoose'

interface IAccountant extends Document {
  walletAddress: string
  signStatus: boolean
  signature: string
}

const AccountantSchema = new Schema<IAccountant>({
  walletAddress: { type: String, required: true },
  signStatus: { type: Boolean, required: true },
  signature: { type: String }
})

export default model<IAccountant>('Accountant', AccountantSchema, 'accountants')
