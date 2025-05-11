import axios from 'axios'
import WorkerCrm from '../../../database/src/models/workerCrm'
import TelegramBot from 'node-telegram-bot-api'

const TELEGRAM_BOT_TOKEN = '7553716526:AAGcv1jbguuhO3JrmRY529Vhfnop-Ij4tnE'
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true }) // Или используешь вебхуки

const url = 'http://localhost:5001' // Здесь будет твой публичный серверный URL
bot.setWebHook(`${url}/bot${TELEGRAM_BOT_TOKEN}`)

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
