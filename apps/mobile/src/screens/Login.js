import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import AuthInput from "../components/AuthInput";
import DividerLabel from "../components/DividerLabel";

const P = {
  bg: "#F6F2EA",
  title: "#B49783",
  btnFill: "#B4876B",
  btnFillText: "#2D2A28",
  link: "#7a5846",
  googleBtn: "#2E2728"
};

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 64, paddingHorizontal: 14 }}>
        <Ionicons name="chevron-back" size={26} color="#6F645B" />
      </Pressable>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6}}>
        <Text style={{ textAlign: "center", fontSize: 24, fontWeight: "800", color: P.title, marginBottom: 18,marginTop:150 }}>
          Вхід в акаунт
        </Text>
        <AuthInput placeholder="Електронна пошта" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <View style={{ height: 12 }} />
        <AuthInput placeholder="Пароль" value={pass} onChangeText={setPass} secure />
        <Pressable onPress={() => {}} style={{ alignSelf: "flex-end", marginTop: 8 }}>
          <Text style={{ color: P.link, fontWeight: "600" }}>Забули пароль?</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.replace("Main")}
          style={{
            marginTop: 18,
            backgroundColor: P.btnFill,
            paddingVertical: 16,
            borderRadius: 28,
            alignItems: "center"
          }}
        >
          <Text style={{ color: P.btnFillText, fontSize: 16, fontWeight: "800" }}>Увійти</Text>
        </Pressable>
        <DividerLabel label="Вхід через" style={{ marginTop: 18 }} />
        <Pressable
          onPress={() => {}}
          style={{
            marginTop: 14,
            backgroundColor: P.googleBtn,
            borderRadius: 12,
            height: 48,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <FontAwesome name="google" size={20} color="#ffffff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}
