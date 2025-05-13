FROM node:20-alpine

RUN apk add --no-cache bash

RUN apk add --no-cache curl

WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./
RUN npm install

# Копируем остальные файлы, исключая те, что в .dockerignore
COPY . ./

RUN chmod -R +x /app/*.sh

EXPOSE 8545

# Запускаем hardhat ноду в фоне, потом деплой контрактов
CMD ["/app/entrypoint.sh"]
