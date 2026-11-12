# ---------- Сборка статического бандла ----------
FROM node:22-alpine AS build
WORKDIR /app

# Сначала только манифесты: слой с зависимостями кэшируется, пока они не менялись.
# package-lock.json* — звёздочка делает файл необязательным.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Параметры сборки. Переменные VITE_* вшиваются в клиентский бандл.
# Ключ в образ не зашит: его нужно передать одним из способов
#   1) docker build --build-arg VITE_FAVORIT_API_KEY=... -t parts-search .
#   2) создать файл .env из .env.example рядом с Dockerfile (он попадёт в контекст сборки).
ARG VITE_FAVORIT_API_KEY
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .

# Пустой аргумент не должен перекрывать значение из .env, поэтому снимаем переменную, если она пуста.
# Если ключа нет нигде — останавливаем сборку с понятным сообщением, а не выпускаем нерабочий сайт.
RUN if [ -z "$VITE_FAVORIT_API_KEY" ]; then \
      unset VITE_FAVORIT_API_KEY; \
      grep -qE '^VITE_FAVORIT_API_KEY=.+' .env 2>/dev/null || { \
        echo "Ошибка: не задан VITE_FAVORIT_API_KEY. Передайте --build-arg или создайте .env из .env.example." >&2; \
        exit 1; }; \
    fi; \
    npm run build

# ---------- Раздача статики и прокси к API ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
