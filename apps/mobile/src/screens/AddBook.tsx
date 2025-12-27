import { useState } from "react";
import { View, TextInput, Alert, Text, TextInputProps, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBooks } from "../store/useBooks";
import { useAuth } from "../store/useAuth";
import Header from "../components/Header";
import { theme } from "../theme/theme";
import { RootStackScreenProps } from "../types/navigation";
import CityAutocomplete from "../components/CityAutocomplete";

export default function AddBook({ navigation }: RootStackScreenProps<"AddBook">) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [cover, setCover] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const { add, loading } = useBooks();
  const { isGuest, user } = useAuth();

  async function onSave() {
    if (isGuest) {
      Alert.alert("Обмеження", "Для додавання книг потрібна реєстрація. Увійдіть або зареєструйтесь.");
      return;
    }
    if (!title || !author) {
      Alert.alert("Помилка", "Заповніть назву й автора");
      return;
    }
    
    const priceNum = price ? parseFloat(price) : null;
    if (price && (isNaN(priceNum!) || priceNum! < 0)) {
      Alert.alert("Помилка", "Невірна ціна");
      return;
    }

    try {
      await add(title, author, {
        cover: cover || undefined,
        description: description || undefined,
        category: category || undefined,
        price: priceNum,
        location: location || undefined
      });
      Alert.alert("Успіх", "Книгу додано");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Помилка", error?.message || "Не вдалося додати книгу");
    }
  }

  const Input = (p: TextInputProps) => (
    <TextInput
      {...p}
      placeholderTextColor={theme.colors.textMuted}
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 12,
        padding: 12,
        color: theme.colors.text,
        backgroundColor: theme.colors.card
      }}
    />
  );

  if (isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <Header title="Нова книга" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
          <Text style={{ color: theme.colors.textMuted, textAlign: "center", fontSize: 16 }}>
            Додавання книг доступне тільки для зареєстрованих користувачів
          </Text>
          <View style={{ gap: 12, width: "100%", maxWidth: 300 }}>
            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: theme.colors.primary,
                alignItems: "center"
              }}
            >
              <Text style={{ color: "#0b0d12", fontWeight: "700" }}>Увійти</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Register")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: "center"
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "600" }}>Реєстрація</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Header title="Нова книга" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, gap: 12 }}>
          <Input placeholder="Назва *" value={title} onChangeText={setTitle} />
          <Input placeholder="Автор *" value={author} onChangeText={setAuthor} />
          <Input placeholder="URL обкладинки (необов'язково)" value={cover} onChangeText={setCover} />
          <Input
            placeholder="Опис (необов'язково)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <Input placeholder="Категорія (Fiction/Sci-Fi/...)" value={category} onChangeText={setCategory} />
          
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginBottom: 8 }}>Ціна (грн)</Text>
            <Input
              placeholder="0"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 4 }}>
              Залиште порожнім, якщо обмін
            </Text>
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginBottom: 8 }}>Місто</Text>
            <CityAutocomplete
              value={location}
              onChangeText={setLocation}
              placeholder="Введіть місто"
            />
          </View>

          <Pressable
            onPress={onSave}
            disabled={loading}
            style={{
              marginTop: 24,
              paddingVertical: 16,
              borderRadius: 30,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              opacity: loading ? 0.6 : 1
            }}
          >
            <Text style={{ color: "#0b0d12", fontSize: 16, fontWeight: "700" }}>
              {loading ? "Збереження..." : "Додати оголошення"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

