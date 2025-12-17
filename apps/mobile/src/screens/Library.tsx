import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, ScrollView } from "react-native";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Chip from "../components/Chip";
import BookCard from "../components/BookCard";
import FAB from "../components/FAB";
import { theme } from "../theme/theme";
import { useBooks } from "../store/useBooks";
import { RootStackScreenProps } from "../types/navigation";

const CATS = ["Усі", "Fiction", "Sci-Fi", "Non-Fiction", "Tech", "Other"];

export default function Library({ navigation }: RootStackScreenProps<"Library">) {
  const { items, fetch, loading } = useBooks();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Усі");

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filtered = useMemo(() => {
    const base = cat === "Усі" ? items : items.filter((x) => (x.category || "Other") === cat);
    if (!q) return base;
    return base.filter(
      (x) =>
        (x.title || "").toLowerCase().includes(q.toLowerCase()) ||
        (x.author || "").toLowerCase().includes(q.toLowerCase())
    );
  }, [items, q, cat]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Header />
      <SearchBar value={q} onChangeText={setQ} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 16, paddingTop: 12 }}
      >
        {CATS.map((label) => (
          <Chip key={label} label={label} active={label === cat} onPress={() => setCat(label)} />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 16, paddingTop: 12 }}
      >
        {filtered.slice(0, 5).map((item) => (
          <View
            key={item.id || item.title}
            style={{
              width: 220,
              height: 140,
              marginRight: 12,
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card
            }}
          >
            <Text
              style={{ color: theme.colors.text, fontWeight: "700", fontSize: 14, padding: 12 }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </View>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(it, i) => String(it.id ?? i)}
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 12 }}
        refreshing={loading}
        onRefresh={fetch}
        renderItem={({ item }) => (
          <BookCard item={item} onPress={() => navigation.navigate("BookDetails", { id: item.id })} />
        )}
        ListEmptyComponent={
          <Text style={{ color: theme.colors.textMuted, textAlign: "center", marginTop: 32 }}>
            Порожньо
          </Text>
        }
      />

      <FAB onPress={() => navigation.navigate("AddBook")} />
    </View>
  );
}

