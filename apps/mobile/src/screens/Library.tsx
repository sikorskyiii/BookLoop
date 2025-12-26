import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import BookCard from "../components/BookCard";
import { theme } from "../theme/theme";
import { useBooks } from "../store/useBooks";
import { useAuth } from "../store/useAuth";
import { RootStackScreenProps } from "../types/navigation";

export default function Library({ navigation }: RootStackScreenProps<"Library">) {
  const { items, fetch, loading } = useBooks();
  const { isGuest } = useAuth();
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filtered = useMemo(() => {
    if (!q) return items;
    return items.filter(
      (x) =>
        (x.title || "").toLowerCase().includes(q.toLowerCase()) ||
        (x.author || "").toLowerCase().includes(q.toLowerCase())
    );
  }, [items, q]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar barStyle="dark-content" />
      {/* Header with menu, search, and add button */}
      <View
        style={{
          paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 52,
          paddingBottom: 12,
          paddingHorizontal: 16,
          backgroundColor: theme.colors.bg
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Pressable
            onPress={() => {
              // TODO: Open menu drawer
            }}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="menu" size={24} color={theme.colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <SearchBar value={q} onChangeText={setQ} />
          </View>
          {!isGuest && (
            <Pressable
              onPress={() => navigation.navigate("AddBook")}
              style={{ marginLeft: 12 }}
            >
              <Ionicons name="document-text-outline" size={24} color={theme.colors.text} />
            </Pressable>
          )}
        </View>
          </View>

      {/* Book List */}
      <FlatList
        data={filtered}
        keyExtractor={(it, i) => String(it.id ?? i)}
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        refreshing={loading}
        onRefresh={fetch}
        renderItem={({ item }) => (
          <BookCard item={item} onPress={() => navigation.navigate("BookDetails", { id: item.id })} />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 64 }}>
            <Text style={{ color: theme.colors.textMuted, textAlign: "center", fontSize: 16 }}>
            Порожньо
          </Text>
            <Text style={{ color: theme.colors.textMuted, textAlign: "center", fontSize: 14, marginTop: 8 }}>
              Додайте книги, щоб почати
            </Text>
          </View>
        }
      />
    </View>
  );
}

