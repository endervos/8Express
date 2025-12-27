#!/bin/sh

export NODE_ENV=docker

while ! nc -z mysql 3306; do
  sleep 2
done

npx sequelize-cli db:migrate --env docker
npx sequelize-cli db:seed:all --env docker
node server.js