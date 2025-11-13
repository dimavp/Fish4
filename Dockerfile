# --- ЭТАП 1: СБОРКА (Конструктор) ---
# Берем Node.js, чтобы "собрать" проект
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем ВЕСЬ код проекта
COPY . .

# Запускаем "сборку" (Vite создаст папку 'dist')
RUN npm run build

# --- ЭТАП 2: РАЗДАЧА (Официант) ---
# Берем крошечный Nginx
FROM nginx:stable-alpine

# Копируем "собранные" файлы из папки 'dist' ЭТАПА 1
# в рабочую папку Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Настраиваем Nginx, чтобы он работал с React (для URL-адресов)
RUN echo 'server { \
      listen 80; \
      location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
      } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
