import Ajv from 'ajv'

const ajv = new Ajv()

const addEmployeeSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    salary: { type: 'number' },
    walletAddress: { type: 'string' },
    position: { type: 'string' },
    department: { type: 'string' }
  },
  required: ['firstName', 'lastName', 'walletAddress', 'position', 'department']
}

const changeEmployeeSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    salary: { type: 'number' },
    walletAddress: { type: 'string' },
    position: { type: 'string' },
    department: { type: 'string' }
  },
  required: ['id', 'firstName', 'lastName', 'walletAddress', 'position', 'department'],
  additionalProperties: false
}

const deleteEmployeeSchema = {}

export const validateAddEmployee = ajv.compile(addEmployeeSchema)
export const validateChangeEmployee = ajv.compile(changeEmployeeSchema)
export const validateDeleteEmployee = ajv.compile(deleteEmployeeSchema)
