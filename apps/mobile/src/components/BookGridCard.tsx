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
  created_at: string;
}

interface BookGridCardProps {
  item: Book;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function BookGridCard({ item, onPress, style }: BookGridCardProps) {
  const hasPrice = item.price !== null && item.price !== undefined;
  const hasLocation = !!item.location;
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return `Сьогодні, ${date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (days === 1) {
      return `Вчора, ${date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (days < 7) {
      return `${days} дн. тому`;
    } else {
      return date.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flex: 1,
          margin: 6,
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style
      ]}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: item.cover || "https://placehold.co/200x300/png" }}
          style={{ width: "100%", aspectRatio: 2 / 3 }}
          resizeMode="cover"
        />
        <View
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: 20,
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {hasPrice ? (
            <Ionicons name="cart-outline" size={18} color={theme.colors.text} />
          ) : (
            <Ionicons name="refresh-outline" size={18} color={theme.colors.text} />
          )}
        </View>
      </View>
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: theme.colors.text,
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            {item.title}
          </Text>
          <Ionicons name="bookmark-outline" size={16} color={theme.colors.textMuted} style={{ marginLeft: 4 }} />
        </View>
        {hasPrice && (
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", marginTop: 4 }}>
            {item.price}грн.
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
        <Text style={{ color: theme.colors.textMuted, fontSize: 10, marginTop: 4 }}>
          {formatDate(item.created_at)}
        </Text>
      </View>
    </Pressable>
  );
}

