import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { validateToken } from './shemas'
const jwt = require('jsonwebtoken')
dotenv.config({ path: './env/api.env' })

const { REFRESH_TOKEN_KEY, ACCESS_TOKEN_KEY } = process.env

const tokensController = express.Router()

tokensController.get('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken
  const valid = validateToken(refreshToken)
  if (!valid) {
    res.status(400).json({ error: 'Invalid data format' })
    return
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_KEY, (err: any, decoded: any) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'The token has expired' })
      }
      return res.status(401).json({ error: 'The authorization token is invalid' })
    }
    const { walletAddress } = decoded
    const accessToken = jwt.sign({ walletAddress }, ACCESS_TOKEN_KEY, {
      expiresIn: '1h'
    })
    return res.status(200).json({ accessToken: accessToken })
  })
})

export default tokensController
