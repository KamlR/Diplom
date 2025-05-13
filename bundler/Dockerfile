# 1. Базовый образ — лёгкий Alpine с Node.js
FROM node:20-alpine

# Устанавливаем bash
RUN apk add --no-cache bash

# 2. Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# 3. Копируем package.json и package-lock.json (для кэширования слоёв)
COPY package*.json ./

# 4. Установка зависимостей
RUN npm install

# 5. Копируем остальной код приложения
COPY . ./


# 6. Открываем порт CRA дев-сервера
EXPOSE 4337

# 7. Запускаем Create React App в режиме разработки
CMD ["npm", "start"]
