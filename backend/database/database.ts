import { MongoClient, Db } from 'mongodb'
import dotenv from 'dotenv'

// Загрузка переменных окружения
dotenv.config()

// Константы подключения
const uri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`
const dbName = process.env.MONGO_DATABASE

let db: Db | null = null

export const connectToDatabase = async (): Promise<Db> => {
  if (db) {
    return db // Если уже подключено, возвращаем существующее подключение
  }

  try {
    const client = new MongoClient(uri)
    await client.connect()
    console.log('Подключено к MongoDB')
    db = client.db(dbName)
    return db
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error)
    throw error
  }
}
