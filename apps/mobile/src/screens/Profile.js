import { View, Text } from "react-native";
import Header from "../components/Header";
import { theme } from "../theme/theme";

export default function Profile(){
  return (
    <View style={{ flex:1, backgroundColor: theme.colors.bg }}>
      <Header title="Профіль" />
      <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <Text style={{ color: theme.colors.textMuted }}>Налаштування зʼявляться пізніше</Text>
      </View>
    </View>
  );
}
