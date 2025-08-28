import { View, Text } from "react-native";

export default function DividerLabel({ label, color = "#B8B0AA", line = "#DDD6CB", style }) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 12 }, style]}>
      <View style={{ flex: 1, height: 1, backgroundColor: line }} />
      <Text style={{ color, fontSize: 14 }}>{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: line }} />
    </View>
  );
}

