import { View, Text, StyleProp, ViewStyle } from "react-native";

interface DividerLabelProps {
  label: string;
  color?: string;
  line?: string;
  style?: StyleProp<ViewStyle>;
}

export default function DividerLabel({ label, color = "#B8B0AA", line = "#DDD6CB", style }: DividerLabelProps) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 12 }, style]}>
      <View style={{ flex: 1, height: 1, backgroundColor: line }} />
      <Text style={{ color, fontSize: 14 }}>{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: line }} />
    </View>
  );
}

