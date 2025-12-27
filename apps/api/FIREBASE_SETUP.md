# Firebase Admin Setup

Для роботи Google OAuth потрібно налаштувати Firebase Admin SDK.

**Примітка:** Для зберігання зображень використовується Cloudinary (див. `CLOUDINARY_SETUP.md`), а не Firebase Storage.

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
# Опціонально: якщо потрібен конкретний bucket (за замовчуванням використовується <project-id>.appspot.com)
# Для проекту bookloop-af1c8 bucket за замовчуванням: bookloop-af1c8.appspot.com
# Якщо використовується інший bucket, розкоментуйте та вкажіть:
# FIREBASE_STORAGE_BUCKET=bookloop-af1c8.appspot.com

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

## Крок 4: Увімкніть Firebase Storage

Firebase Storage потрібен для завантаження зображень профілю.

1. Відкрийте [Firebase Console](https://console.firebase.google.com/)
2. Виберіть проект `bookloop-af1c8`
3. Перейдіть до **Storage** в лівому меню
4. Натисніть **Get started** (якщо Storage ще не увімкнено)
5. Виберіть режим безпеки:
   - **Test mode** (для розробки) - дозволяє читання/запис на 30 днів
   - **Production mode** (для продакшену) - потрібні правила безпеки
6. Виберіть локацію для bucket (наприклад, `us-central1`)
7. Натисніть **Done**

Після цього буде автоматично створено bucket `bookloop-af1c8.appspot.com`.

**Важливо:** Переконайтеся, що service account має права на Storage:
1. Перейдіть до [Google Cloud Console](https://console.cloud.google.com/)
2. IAM & Admin → Service Accounts
3. Знайдіть ваш service account (email з `FIREBASE_CLIENT_EMAIL`)
4. Переконайтеся, що є роль **Storage Admin** або **Storage Object Admin**
5. Якщо ролі немає, натисніть на service account → **Permissions** → **Grant Access** → додайте роль **Storage Admin**

## Крок 5: Перезапустіть API сервер

Після створення `.env` файлу та увімкнення Firebase Storage перезапустіть API сервер:

```bash
cd apps/api
npm run dev
```

Перевірте логи - має з'явитися повідомлення "Firebase Admin initialized successfully".

