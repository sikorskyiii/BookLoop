#!/bin/bash
cd "$(dirname "$0")"

# Спочатку спробувати через node з tsx import (найнадійніший спосіб для Node.js v20+)
if [ -f "node_modules/tsx/dist/esm/index.mjs" ]; then
  echo "Запуск через node з tsx import..."
  node --import ./node_modules/tsx/dist/esm/index.mjs src/index.ts
# Якщо loader не знайдено, спробувати через tsx CLI напряму
elif [ -f "node_modules/tsx/dist/cli.mjs" ]; then
  echo "Запуск через tsx CLI..."
  node node_modules/tsx/dist/cli.mjs src/index.ts
# Якщо tsx CLI не знайдено, спробувати через symlink
elif [ -f "node_modules/.bin/tsx" ]; then
  echo "Запуск через tsx symlink..."
  ./node_modules/.bin/tsx src/index.ts
# Якщо npm працює, спробувати через npm start
elif command -v npm &> /dev/null; then
  echo "Запуск через npm start..."
  npm start
# Якщо npx доступний, спробувати через npx
elif command -v npx &> /dev/null; then
  echo "Запуск через npx..."
  npx tsx src/index.ts
else
  echo "Помилка: не вдалося знайти спосіб запуску сервера"
  echo "Встановіть залежності: npm install"
  exit 1
fi

