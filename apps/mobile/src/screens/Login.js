import { useEffect, useState, useRef, useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest, ResponseType } from "expo-auth-session";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";

import { Platform } from "react-native";
import AuthInput from "../components/AuthInput";
import { useAuth } from "../store/useAuth";
import { theme } from "../theme/theme";
import DividerLabel from "../components/DividerLabel";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../lib/firebase";

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
  const generalMsg = typeof error === "object" ? error?.message : (error ? String(error) : null);


const extraRoot = (Constants?.expoConfig?.extra) ?? Constants?.manifestExtra ?? (Constants?.manifest?.extra) ?? {};
const fb = extraRoot.firebase || {};

const GOOGLE_WEB_CLIENT_ID =
  fb.googleWebClientId || process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID;
const IOS_CLIENT_ID =
  fb.iosClientId || process.env.EXPO_PUBLIC_FIREBASE_IOS_CLIENT_ID;
const ANDROID_CLIENT_ID =
  fb.androidClientId || process.env.EXPO_PUBLIC_FIREBASE_ANDROID_CLIENT_ID;

  const discovery = {
 authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke"
 };

 const nonce = useRef(
  Crypto.randomUUID?.() ||
    `${Date.now()}.${Math.random().toString(36).slice(2)}`
).current;

console.log("OAuth cfg:", {
  hasWebId: !!GOOGLE_WEB_CLIENT_ID,
  iosId: IOS_CLIENT_ID,
  webId: GOOGLE_WEB_CLIENT_ID
});
const CLIENT_ID = Platform.select({
    ios: IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    android: ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    default: GOOGLE_WEB_CLIENT_ID
 });

  const redirectUri = makeRedirectUri({ useProxy: true, scheme: "bookloop" });
if (!GOOGLE_WEB_CLIENT_ID) {
  console.warn("❌ Немає GOOGLE_WEB_CLIENT_ID. Перевір .env або extra.firebase.googleWebClientId.");
}


const [request, response, promptAsync] = useAuthRequest(
   {
     clientId: CLIENT_ID,
    responseType: ResponseType.IdToken,
    redirectUri,
     scopes: ["openid", "email", "profile"],
    extraParams: { prompt: "select_account", nonce }
   },
   discovery
  );
  useEffect(() => {
    (async () => {
      if (!response) return;
      if (response.type === "success") {
        const googleIdToken = response.params?.id_token;
        if (!googleIdToken) return;

        const credential = GoogleAuthProvider.credential(googleIdToken);
        const userCred = await signInWithCredential(auth, credential);
        const firebaseIdToken = await userCred.user.getIdToken();
        const r = await googleLogin(firebaseIdToken);
        if (r?.ok) navigation.replace("Main");
      } else  if (response.type === "error") {
        console.log("OAuth error:", response.params || response);
      }
    })();
  }, [response]);

  async function onSubmit() {
    const r = await login({ email, password: pass });
    if (r.ok) navigation.replace("Main");
  }

  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <Pressable
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Entry"))}
        style={{ paddingTop: 74, paddingHorizontal: 14 }}
      >
        <Ionicons name="chevron-back" size={26} color="#6F645B" />
      </Pressable>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 6 }}>
        <Text style={{ textAlign: "center", fontSize: 24, fontWeight: "800", color: P.title, marginTop: 175, marginBottom: 18 }}>
          Вхід в акаунт
        </Text>

        {justRegistered && (
          <Text style={{ color: theme.colors.textMuted, textAlign: "center", marginBottom: 8 }}>
            Акаунт створено. Увійдіть, будь ласка.
          </Text>
        )}

        {generalMsg && <Text style={{ color: theme.colors.danger, textAlign: "center", marginBottom: 8 }}>{generalMsg}</Text>}

        <AuthInput placeholder="Електронна пошта" value={email} onChangeText={setEmail} keyboardType="email-address" />
        {!!fieldErr.email && <Text style={{ color: theme.colors.danger, marginTop: 6 }}>{fieldErr.email}</Text>}

        <View style={{ height: 12 }} />
        <AuthInput placeholder="Пароль" value={pass} onChangeText={setPass} secure />
        {!!fieldErr.password && <Text style={{ color: theme.colors.danger, marginTop: 6 }}>{fieldErr.password}</Text>}

        <Pressable onPress={() => {}} style={{ alignSelf: "flex-end", marginTop: 8 }}>
          <Text style={{ color: P.link, fontWeight: "600" }}>Забули пароль?</Text>
        </Pressable>

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={{ marginTop: 18, backgroundColor: P.btnFill, paddingVertical: 16, borderRadius: 28, alignItems: "center", opacity: loading ? 0.6 : 1 }}
        >
          <Text style={{ color: P.btnFillText, fontSize: 16, fontWeight: "800" }}>{loading ? "Зачекайте…" : "Увійти"}</Text>
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
          onPress={() => promptAsync({ useProxy: true, showInRecents: true })}
          style={{ backgroundColor: "#2E2728", borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center", opacity: !request || loading ? 0.6 : 1 }}
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
