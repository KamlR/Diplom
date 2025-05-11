import { Schema, Document, model } from 'mongoose'

interface ICronJob extends Document {
  job: string
  schedule: string
}

const CronJobSchema = new Schema<ICronJob>({
  job: { type: String, required: true },
  schedule: { type: String, required: true }
})

export default model<ICronJob>('CronJob', CronJobSchema, 'cron-jobs')
