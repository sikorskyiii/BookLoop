import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";

import AuthInput from "../components/AuthInput";
import DividerLabel from "../components/DividerLabel";
import { useAuth } from "../store/useAuth";
import { theme } from "../theme/theme";

WebBrowser.maybeCompleteAuthSession();

const P = {
  bg: theme.colors.bg,
  title: "#B49783",
  btnFill: theme.colors.primary,
  btnFillText: "#2D2A28",
  link: theme.colors.accentWarm
};

export default function Login({ navigation, route }) {
  const prefill = route?.params?.emailPrefill || "";
  const justRegistered = !!route?.params?.justRegistered;

  const [email, setEmail] = useState(prefill);
  const [pass, setPass] = useState("");

  const { login, googleLogin, loading, error } = useAuth();

  const fieldErr = (error && error.errors) || {};
  const generalMsg =
    typeof error === "object" ? error?.message : error ? String(error) : null;

  const extra = Constants?.expoConfig?.extra || {};
    const appCfg = Constants?.expoConfig || {};
    const owner = String(appCfg.owner || "sikorskyii").replace(/^@/, "");
    const slug = String(appCfg.slug || "bookloop");

    const redirectUri = `https://auth.expo.dev/@${owner}/${slug}`;
    console.log("redirectUri used:", redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      expoClientId: extra.googleExpoClientId, 
      iosClientId: extra.googleIosClientId || undefined, 
      androidClientId: extra.googleAndroidClientId || undefined, 
      webClientId: extra.googleWebClientId,
      responseType: "id_token",
      redirectUri,
      scopes: ["openid", "email", "profile"],
      extraParams: { prompt: "select_account" }
    },
    { useProxy: false }
  );

  const [googleErr, setGoogleErr] = useState(null);

    useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      const idToken =
        response.params?.id_token || response.authentication?.idToken;

      if (idToken) {
        (async () => {
          const r = await googleLogin(idToken);
          if (r?.ok) navigation.replace("Main");
          else setGoogleErr(r?.error?.message || "Не вдалося увійти через Google");
        })();
      } else {
        setGoogleErr("Не отримано id_token від Google");
      }
    } else if (response.type === "error") {
      setGoogleErr(response.error?.message || "Помилка Google авторизації");
    } else if (response.type === "cancel") {
      setGoogleErr(null); 
    }
  }, [response]);

  async function onSubmit() {
    const res = await login({ email, password: pass });
    if (res.ok) navigation.replace("Main");
  }

  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <Pressable
        onPress={() =>
          navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Entry")
        }
        style={{ paddingTop: 74, paddingHorizontal: 14 }}
      >
        <Ionicons name="chevron-back" size={26} color="#6F645B" />
      </Pressable>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6 }}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 24,
            fontWeight: "800",
            color: P.title,
            marginTop: 175,
            marginBottom: 18
          }}
        >
          Вхід в акаунт
        </Text>

        {justRegistered && (
          <Text style={{ color: theme.colors.textMuted, textAlign: "center", marginBottom: 8 }}>
            Акаунт створено. Увійдіть, будь ласка.
          </Text>
        )}

        {(generalMsg || googleErr) && (
          <Text style={{ color: theme.colors.danger, textAlign: "center", marginBottom: 8 }}>
            {generalMsg || googleErr}
          </Text>
        )}

        <AuthInput
          placeholder="Електронна пошта"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {!!fieldErr.email && (
          <Text style={{ color: theme.colors.danger, marginTop: 6 }}>{fieldErr.email}</Text>
        )}

        <View style={{ height: 12 }} />
        <AuthInput placeholder="Пароль" value={pass} onChangeText={setPass} secure />
        {!!fieldErr.password && (
          <Text style={{ color: theme.colors.danger, marginTop: 6 }}>{fieldErr.password}</Text>
        )}

        <Pressable onPress={() => {}} style={{ alignSelf: "flex-end", marginTop: 8 }}>
          <Text style={{ color: P.link, fontWeight: "600" }}>Забули пароль?</Text>
        </Pressable>

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

        <Text style={{ textAlign: "center", color: theme.colors.textMuted, marginTop: 24 }}>
          Немає акаунту?{" "}
          <Text onPress={() => navigation.navigate("Register")} style={{ color: P.link, fontWeight: "600" }}>
            Зареєструватись
          </Text>
        </Text>

        <DividerLabel label="Вхід через" style={{ marginTop: 18 }} />

        <View style={{ height: 18 }} />
        <Pressable
          disabled={!request || loading}
          onPress={() => promptAsync({useProxy: true, showInRecents: true})}
          style={{
            backgroundColor: "#2E2728",
            borderRadius: 12,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            opacity: !request || loading ? 0.6 : 1
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="logo-google" size={20} color="#ffffff" />
            <Text style={{ color: "#ffffff", fontWeight: "700" }}>Увійти з Google</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}
