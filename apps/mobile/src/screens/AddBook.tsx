import { useState } from "react";
import { View, TextInput, Button, Alert, Text, TextInputProps, Pressable } from "react-native";
import { useBooks } from "../store/useBooks";
import { useAuth } from "../store/useAuth";
import Header from "../components/Header";
import { theme } from "../theme/theme";
import { RootStackScreenProps } from "../types/navigation";

export default function AddBook({ navigation }: RootStackScreenProps<"AddBook">) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [cover, setCover] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const { add } = useBooks();
  const { isGuest } = useAuth();

  async function onSave() {
    if (isGuest) {
      Alert.alert("Обмеження", "Для додавання книг потрібна реєстрація. Увійдіть або зареєструйтесь.");
      return;
    }
    if (!title || !author) return Alert.alert("Помилка", "Заповніть назву й автора");
    await add(title, author, { cover, description, category });
    navigation.goBack();
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
      <View style={{ padding: 16, gap: 12 }}>
        <Input placeholder="Назва" value={title} onChangeText={setTitle} />
        <Input placeholder="Автор" value={author} onChangeText={setAuthor} />
        <Input placeholder="URL обкладинки (необов'язково)" value={cover} onChangeText={setCover} />
        <Input
          placeholder="Опис (необов'язково)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Input placeholder="Категорія (Fiction/Sci-Fi/...)" value={category} onChangeText={setCategory} />
        <Button title="Зберегти" onPress={onSave} />
      </View>
    </View>
  );
}

