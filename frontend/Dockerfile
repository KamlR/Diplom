FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY .env ./

COPY . ./

RUN chmod -R +x /app/*.sh

EXPOSE 3000

CMD ["npm", "start"]
