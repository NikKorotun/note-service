#!/bin/sh
set -e

# Пока фронтенд не инициализирован — держим контейнер живым, чтобы можно было
# зайти внутрь и выполнить `npm create vite@latest . -- --template react-ts`
if [ ! -f package.json ]; then
    echo "package.json not found in /app, waiting for frontend initialization..."
    exec tail -f /dev/null
fi

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules)" ]; then
    npm install
fi

exec "$@"
