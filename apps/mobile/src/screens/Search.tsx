import { useState, useMemo } from "react";
import { View, FlatList } from "react-native";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import BookCard from "../components/BookCard";
import { useBooks } from "../store/useBooks";
import { theme } from "../theme/theme";
import { RootStackScreenProps } from "../types/navigation";

export default function Search({ navigation }: RootStackScreenProps<"Search">) {
  const { items } = useBooks();
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return [];
    return items.filter(
      (x) =>
        (x.title || "").toLowerCase().includes(q.toLowerCase()) ||
        (x.author || "").toLowerCase().includes(q.toLowerCase())
    );
  }, [items, q]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Header title="Пошук" />
      <SearchBar value={q} onChangeText={setQ} />
      <FlatList
        data={filtered}
        keyExtractor={(it, i) => String(it.id ?? i)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <BookCard item={item} onPress={() => navigation.navigate("BookDetails", { id: item.id })} />
        )}
      />
    </View>
  );
}

