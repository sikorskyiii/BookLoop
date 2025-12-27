# Cloudinary Setup для зберігання зображень

Cloudinary використовується для зберігання зображень профілю замість Firebase Storage.

## Крок 1: Створіть безкоштовний акаунт Cloudinary

1. Відкрийте [Cloudinary](https://cloudinary.com/)
2. Натисніть **Sign Up for Free**
3. Заповніть форму реєстрації
4. Підтвердіть email

## Крок 2: Отримайте API ключі

Після реєстрації ви автоматично потрапите на Dashboard:

1. На Dashboard знайдіть секцію **Account Details**
2. Скопіюйте наступні значення:
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

## Крок 3: Додайте змінні оточення в .env

Відкрийте файл `.env` в директорії `apps/api/` і додайте:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Приклад:**
```env
CLOUDINARY_CLOUD_NAME=bookloop
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Крок 4: Встановіть залежності

```bash
cd apps/api
npm install
```

## Крок 5: Перезапустіть API сервер

```bash
npm run dev
# або
./start.sh
```

## Безкоштовний план Cloudinary

Безкоштовний план включає:
- **25 GB** зберігання
- **25 GB** bandwidth на місяць
- Автоматична оптимізація зображень
- Трансформації зображень

Цього більш ніж достатньо для розробки та тестування!

## Переваги Cloudinary

- ✅ Безкоштовний план з великими лімітами
- ✅ Автоматична оптимізація зображень
- ✅ CDN для швидкого завантаження
- ✅ Не потрібна картка для безкоштовного плану
- ✅ Проста інтеграція

## Troubleshooting

### Помилка "Cloudinary is not configured"
Перевірте, чи всі три змінні оточення встановлені в `.env` файлі:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Помилка завантаження
Перевірте, чи API ключі правильні в Cloudinary Dashboard → Settings → Security.

