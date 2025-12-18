import { useEffect, useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest, ResponseType, makeRedirectUri } from "expo-auth-session";

import AuthInput from "../components/AuthInput";
import DividerLabel from "../components/DividerLabel";
import GoogleLogo from "../components/GoogleLogo";
import { useAuth } from "../store/useAuth";
import { theme } from "../theme/theme";
import { RootStackScreenProps } from "../types/navigation";

import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../lib/firebase";

WebBrowser.maybeCompleteAuthSession();

const P = {
  bg: "#FAF5F0",
  title: "#95897D",
  btnFill: "#867B71",
  btnFillText: "#3D3838",
  link: "#B8B0AA",
  backIcon: "#919191",
  googleBtn: "#2E2728"
};

export default function Login({ navigation, route }: RootStackScreenProps<"Login">) {
  const prefill = route?.params?.emailPrefill || "";
  const justRegistered = !!route?.params?.justRegistered;

  const [email, setEmail] = useState(prefill);
  const [pass, setPass] = useState("");

  const { login, googleLogin, loading, error } = useAuth();

  const fieldErr = (error && error.errors) || {};
  const generalMsg = typeof error === "object" ? error?.message : error ? String(error) : null;

  const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID;

  const redirectUri = useMemo(() => makeRedirectUri({ scheme: "bookloop" }), []);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: WEB_CLIENT_ID,
      responseType: ResponseType.IdToken,
      redirectUri,
      scopes: ["openid", "email", "profile"],
      extraParams: { prompt: "select_account" }
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      revocationEndpoint: "https://oauth2.googleapis.com/revoke"
    }
  );

  useEffect(() => {
    (async () => {
      if (!response) return;
      if (response.type === "success") {
        try {
          const googleIdToken = response.params?.id_token;
          if (!googleIdToken) return;
          const credential = GoogleAuthProvider.credential(googleIdToken);
          const userCred = await signInWithCredential(auth, credential);
          const firebaseIdToken = await userCred.user.getIdToken();
          const r = await googleLogin(firebaseIdToken);
          if (r?.ok) navigation.replace("Main");
        } catch (e) {
          console.log("Google sign-in failed:", e);
        }
      } else if (response.type === "error") {
        console.log("OAuth error:", response.params || response);
      }
    })();
  }, [response, navigation, googleLogin]);

  async function onSubmit() {
    const r = await login({ email, password: pass });
    if (r.ok) navigation.replace("Main");
  }

  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <Pressable
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Entry"))}
        style={{ paddingTop: 64, paddingLeft: 20, paddingBottom: 8 }}
      >
        <Ionicons name="chevron-back" size={24} color={P.backIcon} />
      </Pressable>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 26,
            fontWeight: "600",
            color: P.title,
            marginBottom: 32,
            marginTop: 100
          }}
        >
          Вхід в акаунт
        </Text>

        {justRegistered && (
          <Text style={{ color: P.link, textAlign: "center", marginBottom: 8, fontSize: 14 }}>
            Акаунт створено. Увійдіть, будь ласка.
          </Text>
        )}

        {generalMsg && (
          <Text style={{ color: theme.colors.danger, textAlign: "center", marginBottom: 8, fontSize: 14 }}>
            {generalMsg}
          </Text>
        )}

        <AuthInput
          placeholder="Електронна пошта"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {!!fieldErr.email && <Text style={{ color: theme.colors.danger, marginTop: 6, fontSize: 14 }}>{fieldErr.email}</Text>}

        <View style={{ height: 16 }} />
        <AuthInput placeholder="Пароль" value={pass} onChangeText={setPass} secure />
        {!!fieldErr.password && (
          <Text style={{ color: theme.colors.danger, marginTop: 6, fontSize: 14 }}>{fieldErr.password}</Text>
        )}

        <Pressable onPress={() => {}} style={{ alignSelf: "flex-end", marginTop: 8 }}>
          <Text style={{ color: P.link, fontSize: 14 }}>Забули пароль?</Text>
        </Pressable>

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={{
            marginTop: 24,
            backgroundColor: P.btnFill,
            paddingVertical: 16,
            borderRadius: 30,
            alignItems: "center",
            opacity: loading ? 0.6 : 1
          }}
        >
          <Text style={{ color: P.btnFillText, fontSize: 16, fontWeight: "600" }}>
            {loading ? "Зачекайте…" : "Увійти"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 20, alignItems: "center" }}
        >
          <Text style={{ color: P.link, fontSize: 14 }}>
            Ще не маєте акаунту? <Text style={{ fontWeight: "600" }}>Зареєструватись</Text>
          </Text>
        </Pressable>

        <View style={{ marginTop: 28, marginBottom: 24 }}>
          <DividerLabel label="Вхід через" color={P.link} line="#DDD6CB" />
        </View>

        <Pressable
          disabled={!request || loading}
          onPress={() => promptAsync()}
          style={{
            backgroundColor: P.googleBtn,
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            height: 56,
            opacity: !request || loading ? 0.6 : 1
          }}
        >
          <GoogleLogo size={24} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

