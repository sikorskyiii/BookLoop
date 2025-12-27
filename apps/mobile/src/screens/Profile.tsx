import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Image, FlatList, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../theme/theme";
import { useAuth } from "../store/useAuth";
import { useBooks } from "../store/useBooks";
import { useWishlist } from "../store/useWishlist";
import { useProfile } from "../store/useProfile";
import { RootStackParamList } from "../types/navigation";
import BookGridCard from "../components/BookGridCard";

type TabType = "books" | "wishlist";

export default function Profile() {
  const { user, logout, isGuest } = useAuth();
  const { items: books, loading: booksLoading, fetch: fetchBooks } = useBooks();
  const { items: wishlistBooks, loading: wishlistLoading, fetch: fetchWishlist } = useWishlist();
  const { stats, fetchProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<TabType>("books");
  const [refreshing, setRefreshing] = useState(false);
  
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
      fetchBooks(user.id);
      fetchWishlist();
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await Promise.all([
        fetchProfile(user.id),
        fetchBooks(user.id),
        fetchWishlist()
      ]);
    }
    setRefreshing(false);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "wishlist" && wishlistBooks.length === 0) {
      fetchWishlist();
    }
  };


  if (!user && !isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}>
          <Text style={{ color: theme.colors.textMuted, textAlign: "center" }}>
            Ви не авторизовані. Увійдіть, щоб переглянути профіль.
          </Text>
          <Pressable
            onPress={() => rootNavigation.replace("Login")}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: theme.colors.primary
            }}
          >
            <Text style={{ color: "#0b0d12", fontWeight: "700" }}>Увійти</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
          <Text style={{ color: theme.colors.textMuted, textAlign: "center", fontSize: 16 }}>
            Ви переглядаєте додаток як гість
          </Text>
          <Text style={{ color: theme.colors.textMuted, textAlign: "center", fontSize: 14 }}>
            Для повного доступу до всіх функцій увійдіть або зареєструйтесь
          </Text>
          <View style={{ gap: 12, width: "100%", maxWidth: 300 }}>
            <Pressable
              onPress={() => rootNavigation.navigate("Login")}
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
              onPress={() => rootNavigation.navigate("Register")}
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
            <Pressable
              onPress={logout}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center"
              }}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>Продовжити як гість</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const city = user.city || "Не вказано";
  const bio = user.bio || "Немає біографії";
  const readers = stats?.readers || 0;
  const following = stats?.following || 0;
  const profilePictureUrl = user.profilePictureUrl; 

  const displayBooks = activeTab === "books" ? books : wishlistBooks;
  const isLoading = activeTab === "books" ? booksLoading : wishlistLoading;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Header */}
        <View style={{ padding: 20, paddingTop: 60 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Image
              source={{ uri: profilePictureUrl || "https://placehold.co/png" }}
              style={{ width: 80, height: 80, borderRadius: 40, marginRight: 16 }}
            />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={{ fontSize: 22, fontWeight: "700", color: theme.colors.text, marginRight: 8 }}>
                  {fullName}
                </Text>
                <Ionicons name="location-outline" size={16} color={theme.colors.textMuted} />
                <Text style={{ fontSize: 14, color: theme.colors.textMuted, marginLeft: 4 }}>
                  {city}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
                <Text style={{ fontSize: 14, color: theme.colors.text }}>
                  <Text style={{ fontWeight: "600" }}>{readers}</Text> читачі
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.text }}>
                  <Text style={{ fontWeight: "600" }}>{following}</Text> відстежування
                </Text>
              </View>
            </View>
          </View>

          {/* Bio */}
          <Text style={{ fontSize: 14, color: theme.colors.text, marginBottom: 16, lineHeight: 20 }}>
            {bio}
          </Text>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <Pressable
              onPress={() => rootNavigation.navigate("EditProfile")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 20,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: "center"
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "600", fontSize: 14 }}>
                Редагувати профіль
              </Text>
            </Pressable>
            <Pressable
              onPress={() => rootNavigation.navigate("ShareProfile")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 20,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: "center"
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "600", fontSize: 14 }}>
                Поширити профіль
              </Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={{ flexDirection: "row", marginBottom: 16, gap: 20 }}>
            <Pressable
              onPress={() => handleTabChange("books")}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons
                name={activeTab === "books" ? "book" : "book-outline"}
                size={24}
                color={activeTab === "books" ? theme.colors.text : theme.colors.textMuted}
              />
            </Pressable>
            <Pressable
              onPress={() => handleTabChange("wishlist")}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons
                name={activeTab === "wishlist" ? "list" : "list-outline"}
                size={24}
                color={activeTab === "wishlist" ? theme.colors.text : theme.colors.textMuted}
              />
            </Pressable>
          </View>

          {/* Content Header */}
          {activeTab === "books" && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: theme.colors.text }}>
                Знайдено {books.length} оголошень
              </Text>
              <Pressable
                onPress={() => rootNavigation.navigate("AddBook")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primary,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="add" size={24} color="#0b0d12" />
              </Pressable>
            </View>
          )}

          {activeTab === "wishlist" && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="add-circle-outline" size={20} color={theme.colors.text} />
                <Text style={{ fontSize: 16, fontWeight: "600", color: theme.colors.text }}>
                  Додати до вішлисту
                </Text>
              </View>
              <Pressable
                onPress={() => rootNavigation.navigate("Search")}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: theme.colors.primary,
                  alignItems: "center"
                }}
              >
                <Text style={{ color: "#0b0d12", fontWeight: "600", fontSize: 14 }}>
                  Пошук книг
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Books Grid */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          {isLoading && displayBooks.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ color: theme.colors.textMuted }}>Завантаження...</Text>
            </View>
          ) : activeTab === "books" ? (
            books.length > 0 ? (
              <FlatList
                data={books}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={{ width: "48%" }}>
                    <BookGridCard
                      item={item}
                      onPress={() => rootNavigation.navigate("BookDetails", { id: item.id })}
                    />
                  </View>
                )}
              />
            ) : (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ color: theme.colors.textMuted, textAlign: "center" }}>
                  Немає оголошень. Додайте першу книгу!
                </Text>
              </View>
            )
          ) : (
            wishlistBooks.length > 0 ? (
              <View style={{ gap: 12 }}>
                {wishlistBooks.map((book) => (
                  <Pressable
                    key={book.id}
                    onPress={() => rootNavigation.navigate("BookDetails", { id: book.id })}
                    style={{
                      flexDirection: "row",
                      backgroundColor: theme.colors.card,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: theme.colors.border
                    }}
                  >
                    <Image
                      source={{ uri: book.cover || "https://placehold.co/50x75/png" }}
                      style={{ width: 50, height: 75, borderRadius: 6 }}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1, marginLeft: 12, justifyContent: "center" }}>
                      <Text style={{ fontSize: 16, fontWeight: "600", color: theme.colors.text, marginBottom: 4 }}>
                        {book.title}
                      </Text>
                      <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>
                        {book.author}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ color: theme.colors.textMuted, textAlign: "center" }}>
                  Вішлист порожній. Додайте книги до вішлисту!
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}
