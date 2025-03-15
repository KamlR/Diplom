import { Request, Response, NextFunction } from 'express'
const jwt = require('jsonwebtoken')
import dotenv from 'dotenv'

dotenv.config()

class AuthMiddleware {
  static verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ error: 'The authorization token is missing' })
      return
    }
    const token = authHeader.split(' ')[1]
    if (!token) {
      res.status(401).json({ error: 'The authorization token is missing' })
      return
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err: any, decoded: any) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'The token has expired' })
        }
        return res.status(401).json({ error: 'The authorization token is invalid' })
      }
      req.params.walletAddress = decoded.expectedWalletAddress
      next()
    })
  }
}
export default AuthMiddleware
