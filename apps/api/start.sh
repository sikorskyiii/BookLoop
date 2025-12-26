#!/bin/bash
cd "$(dirname "$0")"

# Спробувати через npm start
if command -v npm &> /dev/null; then
  npm start
# Якщо npm не працює, спробувати через node з tsx
elif [ -f "node_modules/.bin/tsx" ]; then
  ./node_modules/.bin/tsx src/index.ts
# Якщо tsx не знайдено, спробувати через npx
elif command -v npx &> /dev/null; then
  npx tsx src/index.ts
else
  echo "Помилка: не вдалося знайти спосіб запуску сервера"
  echo "Встановіть залежності: npm install"
  exit 1
fi

