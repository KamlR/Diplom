FROM node:20-alpine

RUN apk add --no-cache bash

RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

RUN chmod -R +x /app/*.sh

EXPOSE 8545

CMD ["/app/entrypoint.sh"]
