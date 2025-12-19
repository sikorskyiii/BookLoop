# Firebase Admin Setup

Для роботи Google OAuth потрібно налаштувати Firebase Admin SDK.

## Крок 1: Отримайте Service Account ключ

1. Відкрийте [Firebase Console](https://console.firebase.google.com/)
2. Виберіть проект `bookloop-af1c8`
3. Перейдіть до **Project Settings** (⚙️) → **Service Accounts**
4. Натисніть **Generate new private key**
5. Завантажте JSON файл

## Крок 2: Створіть .env файл

Створіть файл `.env` в директорії `apps/api/` з наступним вмістом:

```env
# Database
DATABASE_URL=postgresql://app:app@localhost:5432/appdb

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d

# Firebase Admin SDK
# Витягніть значення з завантаженого JSON файлу
FIREBASE_PROJECT_ID=bookloop-af1c8
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bookloop-af1c8.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Server
PORT=3000
```

## Крок 3: Витягніть значення з JSON

У завантаженому JSON файлі знайдіть:
- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY`

**Важливо:** Для `FIREBASE_PRIVATE_KEY`:
- Обгорніть значення в подвійні лапки `"`
- Збережіть всі символи `\n` як є (не замінюйте на реальні переноси рядків)
- Або замініть `\n` на `\\n` в .env файлі

Приклад:
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

## Крок 4: Перезапустіть API сервер

Після створення `.env` файлу перезапустіть API сервер:

```bash
cd apps/api
npm run dev
```

Перевірте логи - має з'явитися повідомлення "Firebase Admin initialized successfully".

