import fs from 'fs'
import axios from 'axios'
import { sendMessages } from '../telegram/telegram'
import Accountant from '../../database/src/models/accountant'
import dotenv from 'dotenv'

dotenv.config({ path: './env/blockchain.env' })
const { BUNDLER_BASE_URL, ENTRYPOINT_ADDRESS } = process.env

export async function callBundler() {
  const rawData = fs.readFileSync('userOpData.json', 'utf-8')
  let userOperationData = JSON.parse(rawData).userOp

  const accountantsData = await Accountant.find({ signStatus: true }).select('signature -_id')

  userOperationData.signature =
    '0x' + accountantsData.map(accountant => accountant.signature.slice(2)).join('')
  try {
    const response = await axios.post(
      `${BUNDLER_BASE_URL}/send-user-operation`,
      {
        userOp: userOperationData,
        entryPoint: ENTRYPOINT_ADDRESS
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (response.status == 200) {
      fs.unlinkSync('userOpData.json')
      const message = '💸 Зарплаты успешно отправлены'
      await sendMessages(message, { role: 'accountant' })
      await changeSignStatusToFalse()
    }
  } catch (error: any) {
    await Accountant.updateMany({ signStatus: true }, { $set: { signStatus: false } })
    console.error('❌ Ошибка при отправке в бандлер:', error.response?.data || error.message)
  }
}

async function changeSignStatusToFalse() {
  await Accountant.updateMany({ signStatus: true }, { $set: { signStatus: false } })
}
