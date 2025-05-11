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

const updateEmployeeSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    salary: { type: 'number' },
    walletAddress: { type: 'string' },
    position: { type: 'string' },
    department: { type: 'string' }
  },
  required: ['firstName', 'lastName', 'salary', 'walletAddress', 'position', 'department'],
  additionalProperties: false
}

const updateEmployee = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
      },
      required: ['id']
    },
    body: updateEmployeeSchema
  },
  required: ['params', 'body']
}

const deleteEmployeeSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
      },
      required: ['id']
    }
  },
  required: ['params']
}

export const validateAddEmployee = ajv.compile(addEmployeeSchema)
export const validateChangeEmployee = ajv.compile(updateEmployee)
export const validateDeleteEmployee = ajv.compile(deleteEmployeeSchema)
