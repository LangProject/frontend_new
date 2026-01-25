# ЭТАП 1: Сборка (Build)
FROM node:20-alpine as build

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем React приложение в папку dist
RUN npm run build

# ЭТАП 2: Запуск (Serve)
FROM nginx:alpine

# Копируем собранные файлы из этапа build в папку Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем наш кастомный конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Порт, который слушает Nginx
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]