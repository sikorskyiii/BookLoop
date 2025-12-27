import { useEffect, useState } from "react";
import { View, Text, Image, Pressable, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import { api } from "../api/client";
import { useWishlist } from "../store/useWishlist";
import { useAuth } from "../store/useAuth";
import { RootStackScreenProps } from "../types/navigation";

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  cover?: string | null;
  category?: string | null;
  price?: number | null;
  location?: string | null;
}

export default function BookDetails({ route, navigation }: RootStackScreenProps<"BookDetails">) {
  const { id } = route.params || {};
  const [item, setItem] = useState<Book | null>(null);
  const { add: addToWishlist, remove: removeFromWishlist, isInWishlist, fetch: fetchWishlist } = useWishlist();
  const { user, isGuest } = useAuth();
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        // Спробуємо отримати конкретну книгу або зі списку
        const { data } = await api.get<{ items?: Book[] }>("/books");
        const items = data.items || (Array.isArray(data) ? data : []);
        const found = items.find((x) => String(x.id) === String(id));
        if (on && found) {
          setItem(found);
        } else if (on && items.length > 0) {
          // Fallback - перша книга зі списку
          setItem(items[0]);
        }
      } catch (error) {
        console.error("Error fetching book:", error);
      }
    })();
    if (user && !isGuest) {
      fetchWishlist();
    }
    return () => {
      on = false;
    };
  }, [id, user]);

  const handleWishlistToggle = async () => {
    if (isGuest || !user) {
      Alert.alert("Обмеження", "Для додавання до вішлисту потрібна реєстрація");
      return;
    }

    if (!item) return;

    setWishlistLoading(true);
    try {
      if (isInWishlist(item.id)) {
        const result = await removeFromWishlist(item.id);
        if (result.ok) {
          Alert.alert("Успіх", "Книгу видалено з вішлисту");
        } else {
          Alert.alert("Помилка", result.error?.message || "Не вдалося видалити з вішлисту");
        }
      } else {
        const result = await addToWishlist(item.id);
        if (result.ok) {
          Alert.alert("Успіх", "Книгу додано до вішлисту");
        } else {
          Alert.alert("Помилка", result.error?.message || "Не вдалося додати до вішлисту");
        }
      }
    } catch (error) {
      Alert.alert("Помилка", "Сталася несподівана помилка");
    } finally {
      setWishlistLoading(false);
    }
  };

  if (!item) return null;

  const inWishlist = isInWishlist(item.id);
  const hasPrice = item.price !== null && item.price !== undefined;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: item.cover || "https://placehold.co/1200x800/png" }}
          style={{ width: "100%", height: 260 }}
        />
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            top: 52,
            left: 16,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#0008",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        {!isGuest && (
          <Pressable
            onPress={handleWishlistToggle}
            disabled={wishlistLoading}
            style={{
              position: "absolute",
              top: 52,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#0008",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons
              name={inWishlist ? "bookmark" : "bookmark-outline"}
              size={22}
              color={inWishlist ? theme.colors.primary : "#fff"}
            />
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, gap: 8 }}>
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "800" }}>{item.title}</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 16 }}>{item.author}</Text>
          
          <View style={{ flexDirection: "row", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            {item.category && (
              <View
                style={{
                  backgroundColor: theme.colors.card,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.border
                }}
              >
                <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "600" }}>
                  {item.category}
                </Text>
              </View>
            )}
            {item.location && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="location-outline" size={16} color={theme.colors.textMuted} />
                <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>{item.location}</Text>
              </View>
            )}
          </View>

          {hasPrice && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700" }}>
                {item.price}₴
              </Text>
            </View>
          )}

          {!!item.description && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 }}>
                {item.description}
              </Text>
            </View>
          )}

          {!isGuest && (
            <Pressable
              onPress={handleWishlistToggle}
              disabled={wishlistLoading}
              style={{
                marginTop: 24,
                paddingVertical: 14,
                borderRadius: 20,
                backgroundColor: inWishlist ? theme.colors.card : theme.colors.primary,
                borderWidth: inWishlist ? 1 : 0,
                borderColor: theme.colors.border,
                alignItems: "center",
                opacity: wishlistLoading ? 0.6 : 1
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons
                  name={inWishlist ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color={inWishlist ? theme.colors.text : "#0b0d12"}
                />
                <Text
                  style={{
                    color: inWishlist ? theme.colors.text : "#0b0d12",
                    fontSize: 16,
                    fontWeight: "600"
                  }}
                >
                  {inWishlist ? "У вішлисті" : "Додати до вішлисту"}
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

