import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv()
addFormats(ajv)

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
