import express from 'express'
import { logger } from './src/logger'
import authorizationController from './src/controllers/workers_crm/authrorization/authorization'
import tokensController from './src/tokens/tokensApi'
import workersController from './src/controllers/workers/crud'
import salaryController from './src/controllers/salary/salaryPaymentProcess'
//import './src/controllers/salary/cronTasks'
import './src/controllers/salary/telegram'
import { connectToDatabase } from './database/src/database'
import { startPayrollJob } from './src/controllers/salary/cronTasks'

const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()

app.use(cookieParser())
// Middleware для обработки JSON-данных
app.use(express.json())
app.use(
  cors({
    origin: 'http://localhost:3000', // Фронтенд
    credentials: true, // Разрешаем отправку кук
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
)

// Логирование всех запросов
app.use((req, res, next) => {
  logger(req, res, next)
})
connectToDatabase()

app.use('/workers_crm', authorizationController)
app.use('/tokens', tokensController)
app.use('/workers', workersController)
app.use('/salary', salaryController)
const port = 5001

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`)
})
