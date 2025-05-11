import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DATABASE } =
  process.env

const uri = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`

export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(uri)
    console.log('✅ Подключено к MongoDB через Mongoose')
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error)
    throw error // Может быть, надо будет убрать
  }
}
