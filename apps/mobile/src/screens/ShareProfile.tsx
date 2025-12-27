import { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Image, Alert, Share, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { theme } from "../theme/theme";
import { useAuth } from "../store/useAuth";
import { RootStackScreenProps } from "../types/navigation";
import Clipboard from "@react-native-clipboard/clipboard";

export default function ShareProfile({ navigation }: RootStackScreenProps<"ShareProfile">) {
  const { user } = useAuth();
  const profileUrl = user?.id ? `https://bookloop.app/profile/${user.id}` : "";
  const qrCodeRef = useRef<View>(null);
  const [downloading, setDownloading] = useState(false);

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const profilePictureUrl = user?.profilePictureUrl;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Перегляньте мій профіль на BookLoop: ${profileUrl}`,
        url: profileUrl
      });
    } catch (error) {
      Alert.alert("Помилка", "Не вдалося поширити профіль");
    }
  };

  const handleCopyLink = () => {
    try {
      Clipboard.setString(profileUrl);
      Alert.alert("Успіх", "Посилання скопійовано");
    } catch (error) {
      Alert.alert("Помилка", "Не вдалося скопіювати посилання");
    }
  };

  const handleDownload = async () => {
    if (!profileUrl) {
      Alert.alert("Помилка", "Неможливо згенерувати QR код без посилання на профіль");
      return;
    }

    setDownloading(true);
    try {
      if (!qrCodeRef.current) {
        Alert.alert("Помилка", "Не вдалося знайти QR код");
        setDownloading(false);
        return;
      }

      // Перевіряємо доступність нативних модулів
      try {
        // Створюємо знімок QR коду
        const uri = await captureRef(qrCodeRef.current, {
          format: "png",
          quality: 1.0,
        });

        // Використовуємо URI безпосередньо з captureRef для sharing
        // captureRef вже створює тимчасовий файл, який можна використати
        try {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(uri, {
              mimeType: "image/png",
              dialogTitle: "Зберегти QR код",
            });
            Alert.alert("Успіх", "QR код готовий до збереження");
          } else {
            // Якщо Sharing недоступний, використовуємо стандартний Share API
            try {
              await Share.share({
                url: Platform.OS === "ios" ? uri : `file://${uri}`,
                message: "QR код мого профілю BookLoop"
              });
            } catch (shareError) {
              Alert.alert("Успіх", "QR код готовий до збереження");
            }
          }
        } catch (shareError: any) {
          console.error("Sharing error:", shareError);
          // Якщо Sharing не працює, використовуємо стандартний Share API як fallback
          try {
            await Share.share({
              url: Platform.OS === "ios" ? uri : `file://${uri}`,
              message: "QR код мого профілю BookLoop"
            });
          } catch (fallbackError) {
            Alert.alert("Помилка", "Не вдалося поділитися QR кодом");
          }
        }
      } catch (nativeError: any) {
        // Якщо нативні модулі недоступні, показуємо інструкцію
        const errorMessage = nativeError?.message || "";
        if (errorMessage.includes("native module") || errorMessage.includes("RNViewShot")) {
          Alert.alert(
            "Потрібна перебудова додатку",
            "Для завантаження QR коду потрібно перебудувати додаток з нативними модулями.\n\nВиконайте команду:\nnpx expo run:ios",
            [{ text: "OK" }]
          );
        } else {
          throw nativeError;
        }
      }
    } catch (error: any) {
      console.error("Error downloading QR code:", error);
      Alert.alert("Помилка", `Не вдалося завантажити QR код: ${error?.message || "Невідома помилка"}`);
    } finally {
      setDownloading(false);
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
          Поширити профіль
        </Text>
        <Pressable>
          <Ionicons name="qr-code-outline" size={24} color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
          {/* Profile Card */}
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              padding: 32,
              alignItems: "center",
              width: "100%",
              maxWidth: 320,
              marginBottom: 40,
              ...theme.shadow.card
            }}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: theme.colors.primaryMuted,
                marginBottom: 20,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}
            >
              <Image
                source={{ uri: profilePictureUrl || "https://placehold.co/120x120/png" }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
              />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "700", color: theme.colors.text, marginBottom: 20 }}>
              {fullName}
            </Text>
            
            {/* QR Code */}
            <View
              ref={qrCodeRef}
              style={{
                backgroundColor: "#fff",
                padding: 16,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {profileUrl ? (
                <QRCode
                  value={profileUrl}
                  size={200}
                  color="#000"
                  backgroundColor="#fff"
                />
              ) : (
                <View style={{ width: 200, height: 200, backgroundColor: theme.colors.border, borderRadius: 8 }} />
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ width: "100%", maxWidth: 320, gap: 12 }}>
            <Pressable
              onPress={handleShare}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 16,
                borderRadius: 20,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                gap: 12
              }}
            >
              <Ionicons name="share-outline" size={24} color={theme.colors.text} />
              <Text style={{ color: theme.colors.text, fontWeight: "600", fontSize: 16 }}>
                Поширити профіль
              </Text>
            </Pressable>

            <Pressable
              onPress={handleCopyLink}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 16,
                borderRadius: 20,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                gap: 12
              }}
            >
              <Ionicons name="link-outline" size={24} color={theme.colors.text} />
              <Text style={{ color: theme.colors.text, fontWeight: "600", fontSize: 16 }}>
                Копіювати посилання
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDownload}
              disabled={downloading || !profileUrl}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 16,
                borderRadius: 20,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                gap: 12,
                opacity: downloading || !profileUrl ? 0.6 : 1
              }}
            >
              <Ionicons name="download-outline" size={24} color={theme.colors.text} />
              <Text style={{ color: theme.colors.text, fontWeight: "600", fontSize: 16 }}>
                {downloading ? "Завантаження..." : "Завантажити QR код"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

