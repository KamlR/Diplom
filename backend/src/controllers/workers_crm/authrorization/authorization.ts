import express, { Request, Response } from 'express'
import WorkerCrm from '../../../../database/src/models/workerCrm'
import Accountant from '../../../../database/src/models/accountant'
import { validateAuthorization, validateAddInfoSchema } from './schemas'
import AuthMiddleware from '../../tokens/AuthMiddleware'
import { ethers } from 'ethers'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config({ path: './env/api.env' })

const ACCESS_TOKEN_KEY: string = process.env.ACCESS_TOKEN_KEY as string
const REFRESH_TOKEN_KEY: string = process.env.REFRESH_TOKEN_KEY as string

const authorizationController = express.Router()

authorizationController.post('/authorize', async (req: Request, res: Response) => {
  const valid = validateAuthorization(req.body)
  if (!valid) {
    res.status(400).json({ error: 'Invalid data format' })
    return
  }
  const { expectedWalletAddress, role, message, signature } = req.body
  const isWalletAddressValid = checkWalletAddress(expectedWalletAddress, message, signature)
  if (!isWalletAddressValid) {
    res.status(400).json('Invalid signature')
    return
  }
  let existWorker
  try {
    existWorker = await WorkerCrm.exists({ walletAddress: expectedWalletAddress })
    if (!existWorker) {
      const newWorker = new WorkerCrm({
        walletAddress: expectedWalletAddress,
        role: role
      })
      await newWorker.save()

      if (role == 'accountant') {
        const newAccountant = new Accountant({
          walletAddress: expectedWalletAddress,
          signStatus: false
        })
        await newAccountant.save()
      }
    }
  } catch (error) {
    console.error('Error during authorization:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
  const accessToken = jwt.sign({ expectedWalletAddress }, ACCESS_TOKEN_KEY, {
    expiresIn: '10h'
  })
  const refreshToken = jwt.sign({ expectedWalletAddress }, REFRESH_TOKEN_KEY, {
    expiresIn: '7d'
  })

  // Тут потом можно добавить ещё настроек
  res.cookie('refreshToken', refreshToken, {
    httpOnly: false,
    secure: false,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.status(200).json({
    accessToken: accessToken,
    existWorker: existWorker == null ? false : true
  })
})

authorizationController.post(
  '/add_info',
  AuthMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    const valid = validateAddInfoSchema(req.body)
    if (!valid) {
      res.status(400).json({ error: 'Invalid data format' })
      return
    }
    const { firstName, lastName, telegramID } = req.body
    const walletAddress = req.params.walletAddress
    try {
      const result = await WorkerCrm.updateOne(
        { walletAddress },
        {
          $set: {
            lastName,
            firstName,
            telegramID
          }
        }
      )
      res.status(200).json()
    } catch (error) {
      res.status(500).json({ error: 'Failed to add info' })
    }
  }
)

authorizationController.get(
  '/role',
  AuthMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    const walletAddress = req.params.walletAddress
    try {
      const workerCrm = await WorkerCrm.findOne({ walletAddress }, { role: 1, _id: 0 })
      res.status(200).json({ role: workerCrm?.role })
    } catch (error) {
      res.status(500).json({ error: 'Failed to get role' })
    }
  }
)

authorizationController.get(
  '/check-telegrambot-connection',
  AuthMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    const walletAddress = req.params.walletAddress
    try {
      const workerCrm = await WorkerCrm.findOne({ walletAddress }, { chatID: 1, _id: 0 })
      res.status(200).json({ chatID: workerCrm?.chatID })
    } catch (error) {
      res.status(500).json({ error: 'Failed to get chatID' })
    }
  }
)

function checkWalletAddress(
  expectedWalletAddress: string,
  message: string,
  signature: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === expectedWalletAddress.toLowerCase()
  } catch (error) {
    console.log('error while verifyMessage')
    return false
  }
}

export default authorizationController
