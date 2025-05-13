# 1. Базовый образ — лёгкий Alpine с Node.js
FROM node:20-alpine

# 2. Установка bash (если ты используешь shell-скрипты или некоторые npm-пакеты это требуют)
RUN apk add --no-cache bash

# 3. Рабочая директория внутри контейнера
WORKDIR /app

# 4. Копируем только package.json и lock-файл
COPY package*.json ./

# 5. Установка зависимостей
RUN npm install

# 6. Копируем .env (если есть переменные окружения для React)
COPY .env ./

# 7. Копируем остальной код
COPY . ./

RUN chmod -R +x /app/*.sh

# 8. Открываем порт дев-сервера CRA
EXPOSE 3000

# 9. Запуск в режиме разработки
CMD ["npm", "start"]
