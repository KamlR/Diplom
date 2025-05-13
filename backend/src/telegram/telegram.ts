import axios from 'axios'
import WorkerCrm from '../../database/src/models/workerCrm'
import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv'

dotenv.config({ path: './env/telegram.env' })
const TELEGRAM_BOT_TOKEN: string = process.env.TELEGRAM_BOT_TOKEN as string
const { SERVER_URL } = process.env

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true })
bot.setWebHook(`${SERVER_URL}/bot${TELEGRAM_BOT_TOKEN}`)

bot.onText(/\/start/, async msg => {
  const chatID = msg.chat.id
  const telegramID = msg.from?.username
  try {
    const user = await WorkerCrm.findOne({ telegramID })
    if (!user) {
      bot.sendMessage(chatID, 'У вас нет доступа к боту!')
    } else {
      const walletAddress = user.walletAddress
      await WorkerCrm.updateOne({ walletAddress }, { $set: { chatID } }, { upsert: false })
      bot.sendMessage(chatID, 'Вы успешно подписаны на уведомления!')
    }
  } catch (error) {
    bot.sendMessage(chatID, 'Возникла ошибка, попробуйте подключить бота позже!')
  }
})

export async function sendMessages(message: string, filter: Object) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  try {
    const users = await WorkerCrm.find(filter)
    await Promise.all(
      users.map(user =>
        axios.post(url, {
          chat_id: user.chatID,
          text: message,
          parse_mode: 'Markdown'
        })
      )
    )
  } catch (error) {
    console.error('❌ Ошибка при отправке сообщения в Telegram:', error)
  }
}
