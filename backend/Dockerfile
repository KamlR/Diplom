# 1. Базовый образ — лёгкий Alpine с Node.js
FROM node:20-alpine

# Устанавливаем bash
RUN apk add --no-cache bash

# 2. Рабочая директория внутри контейнера
WORKDIR /app

# 3. Копируем только package.json и package-lock.json (для кэширования слоёв)
COPY package*.json ./

# 4. Установка зависимостей
RUN npm install

# 5. Копируем остальной код приложения
COPY . ./

RUN chmod -R +x /app/*.sh

# 6. Открываем порт (5001, как указано в docker-compose)
EXPOSE 5001

# 7. Запускаем backend (если это Express или другое Node-приложение)
CMD ["npm", "start"]
