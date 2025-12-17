import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../store/useAuth";
import { theme } from "../theme/theme";
import { RootStackScreenProps } from "../types/navigation";

export default function Boot({ navigation }: RootStackScreenProps<"Boot">) {
  const { init, token, loading, isGuest } = useAuth();

  useEffect(() => {
    let on = true;
    (async () => {
      await init();
      if (!on) return;
      if (token || isGuest) {
        navigation.replace("Main");
      } else {
        navigation.replace("Entry");
      }
    })();
    return () => {
      on = false;
    };
  }, [token, isGuest, navigation, init]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.bg }}>
      <ActivityIndicator />
    </View>
  );
}

