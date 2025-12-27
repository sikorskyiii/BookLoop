import { api } from "../api/client";
import * as FileSystem from "expo-file-system/legacy";

/**
 * Завантажує зображення в Firebase Storage через API та повертає URL
 * @param localUri - Локальний URI зображення (file://...)
 * @param userId - ID користувача для створення унікального шляху
 * @returns URL завантаженого зображення
 */
export async function uploadProfileImage(
  localUri: string,
  userId: string
): Promise<string> {
  try {
    // Перевіряємо, чи це локальний файл
    if (!localUri.startsWith("file://") && !localUri.startsWith("content://")) {
      // Якщо це вже URL (наприклад, з Firebase), повертаємо його
      return localUri;
    }

    console.log("Початок завантаження фото через API, URI:", localUri);

    // Читаємо файл
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (!fileInfo.exists) {
      throw new Error("Файл не знайдено");
    }

    console.log("Файл знайдено, розмір:", fileInfo.size);

    // Читаємо файл як base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("Файл прочитано, розмір base64:", base64.length);
    console.log("Відправка на сервер...");

    // Відправляємо на сервер для завантаження
    const response = await api.post("/auth/upload-profile-picture", {
      imageBase64: base64,
    });

    console.log("Відповідь від сервера:", response.data);
    const downloadURL = response.data.url;

    if (!downloadURL) {
      throw new Error("Сервер не повернув URL зображення");
    }

    console.log("URL отримано:", downloadURL);
    return downloadURL;
  } catch (error: any) {
    console.error("Помилка завантаження зображення:", error);
    console.error("Деталі помилки:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    
    // Більш детальне повідомлення про помилку
    let errorMessage = "Не вдалося завантажити зображення. Спробуйте ще раз.";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}

