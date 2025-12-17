import { Pressable, Text } from "react-native";
import { theme } from "../theme/theme";

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        marginRight: 8,
        backgroundColor: active ? theme.colors.primary : "transparent",
        borderColor: active ? theme.colors.primary : theme.colors.border
      }}
    >
      <Text style={{ color: active ? "#0b0d12" : theme.colors.textMuted, fontWeight: "600" }}>
        {label}
      </Text>
    </Pressable>
  );
}

