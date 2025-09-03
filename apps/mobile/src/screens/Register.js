import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import AuthInput from "../components/AuthInput";
import { theme } from "../theme/theme";
import { useAuth } from "../store/useAuth";

const P = {
  bg: theme.colors.bg,
  title: "#B49783",
  btnFill: theme.colors.primary,
  btnFillText: "#2D2A28",
  googleBtn: theme.colors.googleBtn
};

export default function Register({ navigation }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const { register, loading, error } = useAuth();

  async function onSubmit() {
    const res = await register({
      firstName: first,
      lastName: last,
      email:email,
      password: pass
    });
    if (res.ok) 
    { 
        navigation.reset({        
        index: 0,
        routes: [{ name: "Login", params: { emailPrefill: email, justRegistered: true } }]
        });;
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <Pressable
        onPress={() =>  navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Entry")}
        style={{ paddingTop: 64, paddingHorizontal: 14 }}
      >      
        <Ionicons name="chevron-back" size={26} color="#6F645B" />
      </Pressable>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6 }}>
        <Text style={{ textAlign: "center", fontSize: 24, fontWeight: "800", color: P.title, marginBottom: 18, marginTop: 100 }}>
          Ласкаво просимо!
        </Text>

        <AuthInput placeholder="Повне імʼя" value={first} onChangeText={setFirst} autoCapitalize="words" />
        <View style={{ height: 12 }} />
        <AuthInput placeholder="Прізвище" value={last} onChangeText={setLast} autoCapitalize="words" />
        <View style={{ height: 12 }} />
        <AuthInput placeholder="Електронна пошта" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <View style={{ height: 12 }} />
        <AuthInput placeholder="Пароль" value={pass} onChangeText={setPass} secure />

        {!!error && (
          <Text style={{ color: theme.colors.danger, marginTop: 8 }}>{String(error)}</Text>
        )}

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
            {loading ? "Зачекайте…" : "Зареєструватись"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
