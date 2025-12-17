import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme/theme";

interface FABProps {
  onPress: () => void;
}

export default function FAB({ onPress }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute",
        right: 16,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
        ...theme.shadow.card
      }}
    >
      <Ionicons name="add" size={26} color="#0b0d12" />
    </Pressable>
  );
}

