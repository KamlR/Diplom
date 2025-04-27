import Ajv from 'ajv'

const ajv = new Ajv()

const signSalaryUserOp = {
  type: 'object',
  properties: {
    signature: { type: 'string' }
  },
  required: ['signature']
}

const changeSalaryDate = {
  type: 'object',
  properties: {
    newDate: { type: 'string' }
  },
  required: ['newDate']
}

export const validateSignSalaryUserOp = ajv.compile(signSalaryUserOp)
export const validateChangeSalaryDate = ajv.compile(changeSalaryDate)
