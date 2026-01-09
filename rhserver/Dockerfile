FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5003

CMD ["sh", "-c", "npx sequelize-cli db:migrate && npx sequelize-cli db:migrate --migrations-path platform/migrations --config platform/config/config.js && node app.js"]
