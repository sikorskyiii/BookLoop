import { View, Text, Image, Pressable, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme/theme";

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  cover?: string | null;
  category?: string | null;
  location?: string | null;
  price?: number | null;
}

interface BookCardProps {
  item: Book;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const categoryLabels: Record<string, string> = {
  Fiction: "Роман",
  "Sci-Fi": "Фантастика",
  "Non-Fiction": "Нон-фікшн",
  Tech: "Технології",
  Other: "Інше",
  Biography: "Біографія",
  Psychology: "Психологія",
  Fantasy: "Фентезі"
};

export default function BookCard({ item, onPress, style }: BookCardProps) {
  const categoryLabel = categoryLabels[item.category || ""] || item.category || "Інше";
  const hasPrice = item.price !== null && item.price !== undefined;
  const hasLocation = !!item.location;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: 12
        },
        style
      ]}
    >
      <View style={{ flexDirection: "row", padding: 12 }}>
        <Image
          source={{ uri: item.cover || "https://placehold.co/80x120/png" }}
          style={{ width: 60, height: 90, borderRadius: 6 }}
          resizeMode="cover"
        />
        <View style={{ flex: 1, marginLeft: 12, justifyContent: "space-between" }}>
          <View>
            <Text numberOfLines={2} style={{ color: theme.colors.text, fontWeight: "700", fontSize: 15, marginBottom: 4 }}>
              {item.title}
            </Text>
            <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 13, marginBottom: 8 }}>
              {item.author}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
              <View
                style={{
                  backgroundColor: "#E6DED5",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12
                }}
              >
                <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: "500" }}>
                  {categoryLabel}
                </Text>
              </View>
            </View>
            {hasLocation && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
                <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginLeft: 4 }}>
                  {item.location}
                </Text>
              </View>
            )}
            {hasPrice && (
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", marginTop: 4 }}>
                {item.price}₴
              </Text>
            )}
          </View>
        </View>
        <View style={{ justifyContent: "space-between", alignItems: "flex-end", paddingLeft: 8 }}>
          {hasPrice ? (
            <Ionicons name="cart-outline" size={20} color={theme.colors.textMuted} />
          ) : (
            <Ionicons name="refresh-outline" size={20} color={theme.colors.textMuted} />
          )}
          <Ionicons name="bookmark-outline" size={20} color={theme.colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

