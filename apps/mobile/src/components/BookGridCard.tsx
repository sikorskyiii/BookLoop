import { View, Text, Image, Pressable, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme/theme";

interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string | null;
  price?: number | null;
  location?: string | null;
  category?: string | null;
}

interface BookGridCardProps {
  item: Book;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function BookGridCard({ item, onPress, style }: BookGridCardProps) {
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
          width: "100%"
        },
        style
      ]}
    >
      <Image
        source={{ uri: item.cover || "https://placehold.co/200x300/png" }}
        style={{ width: "100%", height: 200, resizeMode: "cover" }}
      />
      <View style={{ padding: 12 }}>
        <Text numberOfLines={2} style={{ color: theme.colors.text, fontWeight: "700", fontSize: 14, marginBottom: 4 }}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 12, marginBottom: 8 }}>
          {item.author}
        </Text>
        {hasPrice && (
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", marginBottom: 4 }}>
            {item.price}₴
          </Text>
        )}
        {hasLocation && (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Ionicons name="location-outline" size={12} color={theme.colors.textMuted} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginLeft: 4 }}>
              {item.location}
            </Text>
          </View>
        )}
      </View>
      <View style={{ position: "absolute", top: 8, right: 8, flexDirection: "row", gap: 8 }}>
        {hasPrice ? (
          <Ionicons name="cart-outline" size={18} color="#fff" style={{ textShadowColor: "#000", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }} />
        ) : (
          <Ionicons name="refresh-outline" size={18} color="#fff" style={{ textShadowColor: "#000", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }} />
        )}
        <Ionicons name="bookmark-outline" size={18} color="#fff" style={{ textShadowColor: "#000", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }} />
      </View>
    </Pressable>
  );
}

