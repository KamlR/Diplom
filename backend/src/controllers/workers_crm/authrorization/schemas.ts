import Ajv from 'ajv'

const ajv = new Ajv()

const authorizationSchema = {
  type: 'object',
  properties: {
    expectedWalletAddress: { type: 'string' },
    role: { type: 'string' },
    message: { type: 'string' },
    signature: { type: 'string' }
  },
  required: ['expectedWalletAddress', 'role', 'message', 'signature'],
  additionalProperties: false
}

const addInfoSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' }
  },
  required: ['firstName', 'lastName']
}

export const validateAuthorization = ajv.compile(authorizationSchema)
export const validateAddInfoSchema = ajv.compile(addInfoSchema)
