import express from 'express'
import { logger } from './logger'
import { ethers, JsonRpcProvider, JsonRpcSigner, Wallet } from 'ethers'
import abi from './abis/EntryPoint.json'
import { UserOperation } from './userOperation'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const { JSON_RPC_SERVER_URL, PORT } = process.env
const BUNDLER_EOA_PRIVATE_KEY: string = process.env.BUNDLER_EOA_PRIVATE_KEY as string

const app = express()

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  logger(req, res, next)
})

app.post('/send-user-operation', async (req, res) => {
  const { userOp, entryPoint } = req.body

  const [provider, signer] = await getProviderAndSigner()

  try {
    await validateUserOp(provider, entryPoint, userOp)
    console.log('✅ Валидация успешно пройдена')
  } catch (error: any) {
    console.error('❌ Ошибка в validateUserOp:', error)
    res.status(400).send({ error: error.revert.args[0] })
    return
  }
  const entryPointContract = new ethers.Contract(entryPoint, abi, signer)
  try {
    const result = await entryPointContract.handleOps([userOp])
    console.log('✅ Функция на смарт контракте успешно выполнена')
    res.status(200).json()
  } catch (error: any) {
    console.log('❌ Ошибка во время выполнения выплат', error)
    res.status(500).send({})
  }
})

async function getProviderAndSigner() {
  const provider = new ethers.JsonRpcProvider(JSON_RPC_SERVER_URL)
  const signer = new ethers.Wallet(BUNDLER_EOA_PRIVATE_KEY, provider)
  return [provider, signer]
}

async function validateUserOp(
  provider: JsonRpcProvider | Wallet,
  entryPoint: string,
  userOp: UserOperation
) {
  const entryPointContract = new ethers.Contract(entryPoint, abi, provider)
  const callData = entryPointContract.interface.encodeFunctionData('validateUserOp', [userOp])
  const result = await provider.call({
    to: entryPoint,
    data: callData
  })

  return result
}
app.listen(PORT, () => {
  console.log(`🚀 Бандлер слушает на http://localhost:${PORT}`)
})
