import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Image, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import { useAuth } from "../store/useAuth";
import { useProfile } from "../store/useProfile";
import { useBooks } from "../store/useBooks";
import { RootStackScreenProps } from "../types/navigation";
import CityAutocomplete from "../components/CityAutocomplete";
import { uploadProfileImage } from "../utils/uploadImage";

export default function EditProfile({ navigation }: RootStackScreenProps<"EditProfile">) {
  const { user } = useAuth();
  const { updateProfile, loading } = useProfile();
  const { fetch: fetchBooks } = useBooks();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [city, setCity] = useState(user?.city || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePictureUrl || "");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setCity(user.city || "");
      setBio(user.bio || "");
      setProfilePictureUrl(user.profilePictureUrl || "");
    }
  }, [user]);

  const pickImage = async () => {
    console.log("pickImage called");
    try {
      let ImagePicker;
      try {
        console.log("Attempting to import react-native-image-picker...");
        const imagePickerModule = await import("react-native-image-picker");
        // Модуль експортує функції як named exports
        ImagePicker = imagePickerModule;
        console.log("ImagePicker imported successfully:", ImagePicker);
        console.log("ImagePicker module keys:", Object.keys(imagePickerModule));
      } catch (importError: any) {
        console.error("Import error:", importError);
        const errorMsg = importError?.message || String(importError);
        if (errorMsg.includes("native module") || 
            errorMsg.includes("Cannot find") ||
            errorMsg.includes("RNImagePicker") ||
            errorMsg.includes("Cannot resolve module") ||
            errorMsg.includes("MODULE_NOT_FOUND")) {
          Alert.alert(
            "Пакет не встановлений",
            "Для вибору фото потрібно встановити пакет:\n\nnpm install\n\nПотім перебудувати додаток:\n\nnpx expo run:ios"
          );
          return;
        }
        throw importError;
      }

      // Перевіряємо, чи модуль завантажився правильно
      console.log("ImagePicker object:", ImagePicker);
      console.log("ImagePicker keys:", ImagePicker ? Object.keys(ImagePicker) : "null");
      
      // react-native-image-picker експортує функції як named exports
      const launchImageLibrary = ImagePicker?.launchImageLibrary || ImagePicker?.default?.launchImageLibrary;
      
      console.log("launchImageLibrary available:", !!launchImageLibrary);
      console.log("launchImageLibrary type:", typeof launchImageLibrary);
      
      if (!launchImageLibrary || typeof launchImageLibrary !== 'function') {
        console.error("ImagePicker.launchImageLibrary not available or not a function");
        console.error("Available methods:", ImagePicker ? Object.keys(ImagePicker) : "none");
        Alert.alert(
          "Функція недоступна",
          "Для вибору фото з галереї потрібно перебудувати додаток з нативними модулями через:\n\nnpx expo run:ios\n\nНативний модуль не знайдено або не доступний."
        );
        return;
      }

      // Відкриваємо галерею для вибору фото
      console.log("Calling launchImageLibrary with options:", {
        mediaType: "photo",
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
        selectionLimit: 1,
      });
      
      try {
        console.log("About to call launchImageLibrary function...");
        const result = launchImageLibrary(
        {
          mediaType: "photo",
          quality: 0.8,
          maxWidth: 1000,
          maxHeight: 1000,
          selectionLimit: 1,
        },
        (response: any) => {
          console.log("ImagePicker response:", response);
          console.log("Response type:", typeof response);
          console.log("Response keys:", response ? Object.keys(response) : "null");

          if (response && response._j && Array.isArray(response._j) && response._j.length > 0) {
            const error = response._j[0];
            console.error("Native module error detected:", error);
            const errorMessage = error?.message || String(error);
            
            if (errorMessage.includes("null") || errorMessage.includes("Cannot read property")) {
              Alert.alert(
                "Потрібна нативна перебудова",
                "Нативний модуль react-native-image-picker не доступний.\n\nПотрібно перебудувати додаток:\n\nnpx expo run:ios\n\nЦе встановить нативний модуль та зробить функцію доступною."
              );
              return;
            }
          }
          
          // Перевіряємо стандартний формат відповіді
          if (response && response.didCancel) {
            console.log("User cancelled image selection");
            // Користувач скасував вибір
            return;
          } else if (response && response.errorMessage) {
            console.error("ImagePicker error:", response.errorMessage);
            Alert.alert(
              "Помилка",
              `Не вдалося вибрати фото: ${response.errorMessage}`
            );
          } else if (response && response.assets && response.assets[0]) {
            console.log("Image selected:", response.assets[0].uri);
            setProfilePictureUrl(response.assets[0].uri || "");
          } else {
            // Якщо response має структуру помилки, показуємо Alert
            if (response && (response._j || response._i === 2)) {
              console.error("Unexpected error response:", response);
              Alert.alert(
                "Потрібна нативна перебудова",
                "Нативний модуль не доступний. Потрібно перебудувати додаток:\n\nnpx expo run:ios"
              );
            } else {
              console.log("Unexpected response format:", response);
            }
          }
        }
        );
        console.log("launchImageLibrary called, result:", result);
        
        // Перевіряємо, чи результат містить помилку (якщо функція повертає Promise з помилкою)
        const resultAny = result as any;
        if (resultAny && typeof resultAny === 'object' && resultAny._j && Array.isArray(resultAny._j) && resultAny._j.length > 0) {
          const error = resultAny._j[0];
          const errorMessage = error?.message || String(error);
          
          // Логуємо помилку, але не як ERROR, бо це очікувана ситуація
          console.warn("Native module not available (expected if app not rebuilt):", errorMessage);
          
          if (errorMessage.includes("null") || errorMessage.includes("Cannot read property")) {
            Alert.alert(
              "Потрібна нативна перебудова",
              "Нативний модуль react-native-image-picker не доступний.\n\nПотрібно перебудувати додаток:\n\nnpx expo run:ios\n\nЦе встановить нативний модуль та зробить функцію доступною."
            );
            return;
          }
        }
        
        // Якщо результат - Promise, обробляємо його (але не показуємо Alert, бо вже показали вище)
        if (resultAny && typeof resultAny.then === 'function') {
          resultAny.catch((promiseError: any) => {
            // Логуємо як warning, бо це очікувана ситуація, якщо додаток не перебудований
            const errorMsg = promiseError?.message || String(promiseError);
            if (errorMsg.includes("null") || errorMsg.includes("Cannot read property")) {
              console.warn("Native module error (expected if app not rebuilt):", errorMsg);
            } else {
              console.error("Unexpected Promise error:", promiseError);
            }
            // Не показуємо Alert тут, бо вже показали вище при виявленні помилки в result
          });
        }
      } catch (callError: any) {
        console.error("Error calling launchImageLibrary:", callError);
        const errorMsg = callError?.message || String(callError);
        if (errorMsg.includes("null") || errorMsg.includes("Cannot read property")) {
          Alert.alert(
            "Потрібна нативна перебудова",
            "Нативний модуль react-native-image-picker не доступний.\n\nПотрібно перебудувати додаток:\n\nnpx expo run:ios\n\nЦе встановить нативний модуль та зробить функцію доступною."
          );
        } else {
          Alert.alert(
            "Помилка виклику",
            `Не вдалося викликати launchImageLibrary:\n${errorMsg}\n\nПотрібно перебудувати додаток:\nnpx expo run:ios`
          );
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const errorString = String(error);
      
      // Перевіряємо різні типи помилок
      if (errorMessage.includes("native module") || 
          errorMessage.includes("Cannot find") ||
          errorMessage.includes("RNImagePicker") ||
          errorString.includes("native module") ||
          errorString.includes("RNImagePicker")) {
        Alert.alert(
          "Потрібна нативна перебудова",
          "Для вибору фото з галереї потрібно запустити додаток через:\n\nnpx expo run:ios\n\nАбо через Xcode після перебудови."
        );
      } else if (errorMessage.includes("permission") || 
                 errorMessage.includes("дозвіл") ||
                 errorString.includes("permission")) {
        Alert.alert(
          "Дозвіл не надано",
          "Потрібен дозвіл на доступ до фото. Перевірте налаштування додатку."
        );
      } else {
        console.error("Помилка вибору фото:", error);
        Alert.alert(
          "Помилка",
          `Не вдалося вибрати фото.\n\nПомилка: ${errorMessage || errorString}\n\nПереконайтеся, що додаток запущений через:\nnpx expo run:ios`
        );
      }
    }
  };

  const handleSave = async () => {
    console.log("handleSave called");
    console.log("firstName:", firstName);
    console.log("lastName:", lastName);
    console.log("city:", city);
    console.log("bio:", bio);

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Помилка", "Ім'я та прізвище обов'язкові");
      return;
    }

    if (!user?.id) {
      Alert.alert("Помилка", "Користувач не знайдений");
      return;
    }

    try {
      let finalProfilePictureUrl = profilePictureUrl;

      // Якщо фото - локальний файл, завантажуємо його в Firebase Storage
      if (profilePictureUrl && (profilePictureUrl.startsWith("file://") || profilePictureUrl.startsWith("content://"))) {
        console.log("Завантаження фото в Firebase Storage...");
        try {
          finalProfilePictureUrl = await uploadProfileImage(profilePictureUrl, user.id);
          console.log("Фото завантажено, URL:", finalProfilePictureUrl);
        } catch (uploadError: any) {
          console.error("Помилка завантаження фото:", uploadError);
          Alert.alert("Помилка", uploadError?.message || "Не вдалося завантажити фото. Спробуйте ще раз.");
          return;
        }
      }

      console.log("Calling updateProfile...");
      const result = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        city: city.trim() || undefined,
        bio: bio.trim() || undefined,
        profilePictureUrl: finalProfilePictureUrl || undefined
      });

      console.log("Update result:", result);

      if (result.ok) {
        if (user?.id) {
          await fetchBooks(user.id);
        }
        navigation.goBack();
      } else {
        console.error("Update failed:", result.error);
        Alert.alert("Помилка", result.error?.message || "Не вдалося оновити профіль");
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      Alert.alert("Помилка", "Сталася несподівана помилка. Спробуйте ще раз.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "600", color: theme.colors.text }}>
          Редагувати профіль
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Profile Picture */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View style={{ position: "relative", marginBottom: 12 }}>
              <Image
                source={{ uri: profilePictureUrl || user?.profilePictureUrl || "https://placehold.co/100x100/png" }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            </View>
            <Pressable 
              onPress={() => {
                console.log("Button pressed - calling pickImage");
                pickImage();
              }}
            >
              <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: "600" }}>
                Змінити світлину
              </Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <View style={{ gap: 0, marginBottom: 24 }}>
            <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginBottom: 8 }}>Ім'я</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}
                placeholderTextColor={theme.colors.textMuted}
                placeholder="Введіть ім'я"
              />
            </View>

            <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginBottom: 8 }}>Прізвище</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}
                placeholderTextColor={theme.colors.textMuted}
                placeholder="Введіть прізвище"
              />
            </View>

            <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginBottom: 8 }}>Місто</Text>
              <CityAutocomplete
                value={city}
                onChangeText={setCity}
                placeholder="Введіть місто"
              />
            </View>

            <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginBottom: 8 }}>Біографія</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                style={{ color: theme.colors.text, fontSize: 16 }}
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

          </View>

          {/* Save Button */}
          <Pressable
            onPress={() => {
              console.log("Save button pressed");
              handleSave();
            }}
            disabled={loading}
            style={({ pressed }) => ({
              paddingVertical: 16,
              borderRadius: 30,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              marginBottom: 40,
              opacity: loading || pressed ? 0.6 : 1
            })}
          >
            <Text style={{ color: "#0b0d12", fontSize: 16, fontWeight: "700" }}>
              {loading ? "Збереження..." : "Зберегти"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

