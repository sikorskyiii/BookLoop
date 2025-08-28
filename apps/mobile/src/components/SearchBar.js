import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme/theme";

export default function SearchBar({ value, onChangeText, placeholder="Пошук…" }) {
  return (
    <View style={{
      marginHorizontal: 16, marginTop: 12, flexDirection:"row",
      alignItems:"center", backgroundColor: theme.colors.card,
      borderRadius: theme.radius.lg, paddingHorizontal: 12,
      borderWidth:1, borderColor: theme.colors.border
    }}>
      <Ionicons name="search" size={18} color={theme.colors.textMuted} />
      <TextInput
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={{ flex:1, color: theme.colors.text, paddingVertical: 12, marginLeft: 8 }}
      />
    </View>
  );
}
