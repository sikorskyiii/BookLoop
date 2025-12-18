import { View, Text, Pressable, Dimensions, StatusBar, Image } from "react-native";
import { RootStackScreenProps } from "../types/navigation";
import { useAuth } from "../store/useAuth";

const { width, height } = Dimensions.get("window");

export default function Entry({ navigation }: RootStackScreenProps<"Entry">) {
  const { skipAuth } = useAuth();
  const goLogin = () => navigation.navigate("Login");
  const goRegister = () => navigation.navigate("Register");
  const handleSkip = async () => {
    await skipAuth();
    navigation.replace("Main");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F6CBB0" }}>
      <StatusBar barStyle="dark-content" />
      <Pressable
        onPress={handleSkip}
        style={{
          position: "absolute",
          top: StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 88,
          right: 26,
          zIndex: 10,
          paddingHorizontal: 32,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          borderWidth: 1,
          borderColor: "rgba(154, 107, 82, 0.5)"
        }}
      >
        <Text style={{ color: "#7a5846", fontSize: 14, fontWeight: "600" }}>Skip</Text>
      </Pressable>
      <View
        style={{
          position: "absolute",
          top: -height * 0.1,
          right: -width * 0.1,
          width: width * 0.8,
          height: height * 0.7,
          backgroundColor: "#F9E4BE",
          borderRadius: width,
          transform: [{ rotate: "12deg" }],
          opacity: 0.95
        }}
      />
      <View
        style={{
          position: "absolute",
          top: height * 0.25,
          left: -width * 0.3,
          width: width * 0.9,
          height: height * 0.6,
          backgroundColor: "#F2B6A0",
          borderRadius: width,
          transform: [{ rotate: "-8deg" }],
          opacity: 0.6
        }}
      />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            width: width * 0.68,
            height: width * 0.68,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 12 },
            shadowRadius: 16,
            marginTop: 80,
            marginLeft:25,
            elevation: 10
          }}
        >
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: "85%", height: "85%", borderRadius: (width * 0.58 * 0.85) / 2 }}
            resizeMode="contain"
          />
        </View>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <Pressable
          onPress={goLogin}
          style={{
            backgroundColor: "#B4876B",
            paddingVertical: 16,
            borderRadius: 28,
            alignItems: "center",
            marginBottom: 22
          }}
        >
          <Text style={{ color: "#000", fontSize: 18, fontWeight: "700" }}>Вхід</Text>
        </Pressable>
        <Pressable
          onPress={goRegister}
          style={{
            backgroundColor: "transparent",
            paddingVertical: 16,
            borderRadius: 28,
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: "#9A6B52",
            marginBottom: 72
          }}
        >
          <Text style={{ color: "#000", fontSize: 18, fontWeight: "700" }}>Реєстрація</Text>
        </Pressable>
      </View>
    </View>
  );
}

