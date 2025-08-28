import { useState } from "react";
import { View, TextInput, Button, Alert, Text } from "react-native";
import { useBooks } from "../store/useBooks";
import Header from "../components/Header";
import { theme } from "../theme/theme";

export default function AddBook({ navigation }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [cover, setCover] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const { add } = useBooks();

  async function onSave() {
    if (!title || !author) return Alert.alert("Помилка", "Заповніть назву й автора");
    await add(title, author, { cover, description, category });
    navigation.goBack();
  }

  const Input = (p) => (
    <TextInput
      {...p} placeholderTextColor={theme.colors.textMuted}
      style={{
        borderWidth:1, borderColor: theme.colors.border, borderRadius: 12,
        padding: 12, color: theme.colors.text, backgroundColor: theme.colors.card
      }}
    />
  );

  return (
    <View style={{ flex:1, backgroundColor: theme.colors.bg }}>
      <Header title="Нова книга" />
      <View style={{ padding:16, gap:12 }}>
        <Input placeholder="Назва" value={title} onChangeText={setTitle} />
        <Input placeholder="Автор" value={author} onChangeText={setAuthor} />
        <Input placeholder="URL обкладинки (необов’язково)" value={cover} onChangeText={setCover} />
        <Input placeholder="Опис (необов’язково)" value={description} onChangeText={setDescription} multiline />
        <Input placeholder="Категорія (Fiction/Sci-Fi/...)" value={category} onChangeText={setCategory} />
        <Button title="Зберегти" onPress={onSave} />
      </View>
    </View>
  );
}
