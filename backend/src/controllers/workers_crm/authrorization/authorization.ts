import express, { Request, Response } from 'express'
import { connectToDatabase } from '../../../../database/database'
import { validateAuthorization, validateAddInfoSchema } from './schemas'
import AuthMiddleware from '../../../tokens/AuthMiddleware'
import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config()

const jwt = require('jsonwebtoken')
const authorizationController = express.Router()

authorizationController.post('/authorize', async (req: Request, res: Response) => {
  const valid = validateAuthorization(req.body)
  if (!valid) {
    res.status(400).json({ error: 'Invalid data format' })
    return
  }
  const { expectedWalletAddress, role, message, signature } = req.body
  const isWalletAddressValid = checkWalletAddress(
    expectedWalletAddress,
    message,
    signature
  )
  if (!isWalletAddressValid) {
    res.status(400).json('Invalid signature')
    return
  }
  let existWorker
  try {
    const db = await connectToDatabase()
    const workersCrmCollection = db.collection('workers_crm')
    existWorker = await workersCrmCollection.findOne({
      walletAddress: expectedWalletAddress
    })
    if (existWorker == null) {
      await workersCrmCollection.insertOne({
        walletAddress: expectedWalletAddress,
        role: role
      })

      if (role == 'accountant') {
        const accountsCollection = db.collection('accountants')
        await accountsCollection.insertOne({
          walletAddress: expectedWalletAddress,
          signStatus: false
        })
      }
    }
  } catch (error) {
    console.error('Error during authorization:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
  const accessToken = jwt.sign({ expectedWalletAddress }, process.env.ACCESS_TOKEN_KEY, {
    expiresIn: '10h'
  })
  const refreshToken = jwt.sign(
    { expectedWalletAddress },
    process.env.REFRESH_TOKEN_KEY,
    {
      expiresIn: '7d'
    }
  )

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
    }
    const { firstName, lastName, telegramID } = req.body
    const walletAddress = req.params.walletAddress
    try {
      const db = await connectToDatabase()
      const workersCrmCollection = db.collection('workers_crm')
      await workersCrmCollection.updateOne(
        { walletAddress },
        { $set: { lastName, firstName, telegramID } }
      )
      res.status(200).json()
    } catch (error) {
      console.log('Error during addInfoController')
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

authorizationController.get(
  '/role',
  AuthMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    const walletAddress = req.params.walletAddress
    const db = await connectToDatabase()
    const workersCrmCollection = db.collection('workers_crm')
    const user = await workersCrmCollection.findOne({ walletAddress })
    res.status(200).json({ role: user?.role })
  }
)

authorizationController.get(
  '/check-telegrambot-connection',
  AuthMiddleware.verifyToken,
  async (req: Request, res: Response) => {
    const walletAddress = req.params.walletAddress
    const db = await connectToDatabase()
    const workersCrmCollection = db.collection('workers_crm')
    const user = await workersCrmCollection.findOne({ walletAddress })

    res.status(200).json({ chatID: user?.chatID })
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
