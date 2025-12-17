import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme/theme";

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "BookLoop" }: HeaderProps) {
  return (
    <View
      style={{
        paddingTop: 52,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.bg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 8
      }}
    >
      <Ionicons name="book-outline" size={22} color={theme.colors.primary} />
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>{title}</Text>
    </View>
  );
}

