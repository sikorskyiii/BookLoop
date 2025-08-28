import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import AuthInput from "../components/AuthInput";
import DividerLabel from "../components/DividerLabel";
import { useAuth } from "../store/useAuth";
import { theme } from "../theme/theme";

const P = {
  bg: theme.colors.bg,
  title: "#B49783",
  btnFill: theme.colors.primary,
  btnFillText: "#2D2A28",
  link: theme.colors.accentWarm,
  googleBtn: theme.colors.googleBtn
};

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const { login, loading, error } = useAuth();

  async function onSubmit() {
    const res = await login({ email, password: pass });
    if (res.ok) navigation.replace("Main");
  }

  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 14, paddingHorizontal: 14 }}>
        <Ionicons name="chevron-back" size={26} color="#6F645B" />
      </Pressable>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6 }}>
        <Text style={{ textAlign: "center", fontSize: 24, fontWeight: "800", color: P.title, marginBottom: 18 }}>
          Вхід в акаунт
        </Text>

        <AuthInput placeholder="Електронна пошта" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <View style={{ height: 12 }} />
        <AuthInput placeholder="Пароль" value={pass} onChangeText={setPass} secure />

        <Pressable onPress={() => {}} style={{ alignSelf: "flex-end", marginTop: 8 }}>
          <Text style={{ color: P.link, fontWeight: "600" }}>Забули пароль?</Text>
        </Pressable>

        {!!error && <Text style={{ color: theme.colors.danger, marginTop: 8 }}>{String(error)}</Text>}

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={{
            marginTop: 18,
            backgroundColor: P.btnFill,
            paddingVertical: 16,
            borderRadius: 28,
            alignItems: "center",
            opacity: loading ? 0.6 : 1
          }}
        >
          <Text style={{ color: P.btnFillText, fontSize: 16, fontWeight: "800" }}>
            {loading ? "Зачекайте…" : "Увійти"}
          </Text>
        </Pressable>

        <DividerLabel label="Вхід через" style={{ marginTop: 18 }} />

        <Pressable
          onPress={() => {}}
          style={{ marginTop: 14, backgroundColor: P.googleBtn, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center" }}
        >
          <FontAwesome name="google" size={20} color="#ffffff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}
