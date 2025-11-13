# 1. Берем готовый образ Node.js
FROM node:20-alpine

# 2. Создаем рабочую папку
WORKDIR /usr/src/app

# 3. Копируем package.json и устанавливаем 'express'
# (ВАЖНО: У вас в репозитории должен быть package.json!)
COPY package*.json ./
RUN npm install

# 4. Копируем весь остальной код (включая server.js)
COPY . .

# 5. Сообщаем, что "Повар" будет на порту 3000
EXPOSE 3000

# 6. Запускаем "Повара"
CMD [ "node", "server.js" ]
