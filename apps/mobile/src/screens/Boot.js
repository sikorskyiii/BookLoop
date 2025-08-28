import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../store/useAuth";
import { theme } from "../theme/theme";

export default function Boot({ navigation }) {
  const { init, token, loading } = useAuth();

  useEffect(() => {
    let on = true;
    (async () => {
      await init();
      if (!on) return;
      navigation.replace(token ? "Main" : "Entry");
    })();
    return () => { on = false; };
  }, [token]);

  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center", backgroundColor: theme.colors.bg }}>
      <ActivityIndicator />
    </View>
  );
}
