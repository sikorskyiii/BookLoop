import { v2 as cloudinary } from 'cloudinary';

// Змінні оточення мають бути завантажені в index.ts перед імпортом цього модуля

// Конфігурація Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Завантажує base64 зображення в Cloudinary
 * @param base64Image - Base64 рядок зображення (з префіксом data:image/... або без)
 * @param folder - Папка для зберігання (опціонально)
 * @returns Promise з URL завантаженого зображення
 */
export async function uploadImageToCloudinary(
  base64Image: string,
  folder: string = 'profile-pictures'
): Promise<string> {
  try {
    // Перевіряємо конфігурацію
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    }

    // Якщо base64 не має префіксу data:image, додаємо його
    let imageData = base64Image;
    if (!base64Image.startsWith('data:image')) {
      imageData = `data:image/jpeg;base64,${base64Image}`;
    }

    // Завантажуємо в Cloudinary
    const result = await cloudinary.uploader.upload(imageData, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Обмежуємо розмір
        { quality: 'auto' }, // Автоматична оптимізація якості
        { format: 'jpg' } // Конвертуємо в JPG для кращої стиснення
      ]
    });

    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
}

/**
 * Видаляє зображення з Cloudinary за URL
 * @param imageUrl - URL зображення в Cloudinary
 */
export async function deleteImageFromCloudinary(imageUrl: string): Promise<void> {
  try {
    // Витягуємо public_id з URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    
    // Видаляємо зображення
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    // Не кидаємо помилку, щоб не блокувати інші операції
  }
}

export { cloudinary };

