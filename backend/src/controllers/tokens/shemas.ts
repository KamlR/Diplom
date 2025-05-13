import Ajv, { JSONSchemaType } from 'ajv'

const ajv = new Ajv()

// Схема для запроса с адресом кошелька
const tokenSchema: JSONSchemaType<{ refreshToken: string }> = {
  type: 'object',
  properties: {
    refreshToken: {
      type: 'string'
    }
  },
  required: ['refreshToken'], // Поле обязательно
  additionalProperties: false // Запрещает дополнительные свойства
}

// Компиляция схемы
export const validateToken = ajv.compile(tokenSchema)
