FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE 4337

CMD ["npm", "start"]
