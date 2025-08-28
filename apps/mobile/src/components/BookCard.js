import { View, Text, Image, Pressable } from "react-native";
import { theme } from "../theme/theme";

export default function BookCard({ item, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ backgroundColor: theme.colors.card, borderRadius: theme.radius.lg,
        overflow:"hidden", borderWidth:1, borderColor: theme.colors.border }}
    >
      <View style={{ flexDirection:"row" }}>
        <Image
          source={{ uri: item.cover || "https://placehold.co/120x160/png" }}
          style={{ width: 96, height: 128 }}
        />
        <View style={{ flex:1, padding: 12, gap: 6 }}>
          <Text numberOfLines={1} style={{ color: theme.colors.text, fontWeight:"700", fontSize:16 }}>{item.title}</Text>
          <Text numberOfLines={1} style={{ color: theme.colors.textMuted }}>{item.author}</Text>
          {!!item.description && (
            <Text numberOfLines={2} style={{ color: theme.colors.textMuted, fontSize: 12 }}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
