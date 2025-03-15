import { Request, Response, NextFunction } from 'express'

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  const ip = req.ip
  const path = req.path
  const query = JSON.stringify(req.query)
  const body = JSON.stringify(req.body)

  console.log(`[${timestamp}] IP: ${ip} | Path: ${path} | Query: ${query} | Body: ${body}`)

  next()
}
