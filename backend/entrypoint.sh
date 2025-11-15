#!/bin/sh

export NODE_ENV=docker

echo "Waiting for MySQL to be ready..."

while ! nc -z mysql 3306; do
  echo "MySQL is not up yet..."
  sleep 2
done

echo "MySQL is ready!"

echo "Running Sequelize migrations..."
npx sequelize-cli db:migrate --env docker

echo "Running Seeders..."
npx sequelize-cli db:seed:all --env docker

echo "Starting Node server..."
node server.js