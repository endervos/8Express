FROM node:18-alpine

RUN apk add --no-cache bash dos2unix

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g sequelize-cli

COPY . .

RUN dos2unix entrypoint.sh
RUN chmod +x entrypoint.sh

ENV NODE_ENV=docker

EXPOSE 5000
ENTRYPOINT ["sh", "./entrypoint.sh"]