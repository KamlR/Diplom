import fs from 'fs'
import axios from 'axios'
import { sendMessages } from '../telegram'
import Accountant from '../../../../database/src/models/accountant'

export async function callBundler() {
  const entryPoint = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  const rawData = fs.readFileSync('userOpData.json', 'utf-8')
  let userOperationData = JSON.parse(rawData).userOp

  const accountantsData = await Accountant.find({ signStatus: true }).select('signature -_id')

  userOperationData.signature =
    '0x' + accountantsData.map(accountant => accountant.signature.slice(2)).join('')
  try {
    const response = await axios.post(
      'http://localhost:4337/send-user-operation',
      {
        userOp: userOperationData,
        entryPoint: entryPoint
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
    console.error('❌ Ошибка при отправке в бандлер:', error.response?.data || error.message)
  }
}

async function changeSignStatusToFalse() {
  await Accountant.updateMany({ signStatus: true }, { $set: { signStatus: false } })
}
