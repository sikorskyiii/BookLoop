import { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest, ResponseType } from "expo-auth-session";
import * as Crypto from "expo-crypto";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import AuthInput from "../components/AuthInput";
import DividerLabel from "../components/DividerLabel";
import GoogleLogo from "../components/GoogleLogo";
import { theme } from "../theme/theme";
import { useAuth } from "../store/useAuth";
import { RootStackScreenProps } from "../types/navigation";
import { auth } from "../lib/firebase";

WebBrowser.maybeCompleteAuthSession();

const P = {
  bg: "#FAF5F0",
  title: "#95897D",
  btnFill: "#867B71",
  btnFillText: "#3D3838",
  googleBtn: "#2E2728",
  backIcon: "#919191"
};

export default function Register({ navigation }: RootStackScreenProps<"Register">) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const { register, googleLogin, loading, error } = useAuth();

  const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID;
  const redirectUri = useMemo(() => "https://auth.expo.dev/@sikorskyii/bookloop", []);
  const discovery = useMemo(
    () => ({
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      revocationEndpoint: "https://oauth2.googleapis.com/revoke"
    }),
    []
  );
  const nonceRef = useRef(
    Crypto.randomUUID?.() || `${Date.now()}.${Math.random().toString(36).slice(2)}`
  );

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: WEB_CLIENT_ID,
      responseType: ResponseType.IdToken,
      redirectUri,
      scopes: ["openid", "email", "profile"],
      extraParams: { prompt: "select_account", nonce: nonceRef.current },
      usePKCE: false
    },
    discovery
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
    const res = await register({
      firstName: first,
      lastName: last,
      email: email,
      password: pass
    });
    if (res.ok) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login", params: { emailPrefill: email, justRegistered: true } }]
      });
    }
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
            marginTop: 60
          }}
        >
          Ласкаво просимо!
        </Text>

        <AuthInput placeholder="Повне імʼя" value={first} onChangeText={setFirst} autoCapitalize="words" />
        <View style={{ height: 16 }} />
        <AuthInput placeholder="Прізвище" value={last} onChangeText={setLast} autoCapitalize="words" />
        <View style={{ height: 16 }} />
        <AuthInput
          placeholder="Електронна пошта"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <View style={{ height: 16 }} />
        <AuthInput placeholder="Пароль" value={pass} onChangeText={setPass} secure />

        {!!error && <Text style={{ color: theme.colors.danger, marginTop: 12, fontSize: 14 }}>{String(error)}</Text>}

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
            {loading ? "Зачекайте…" : "Зареєструватись"}
          </Text>
        </Pressable>

        <View style={{ marginTop: 28, marginBottom: 24 }}>
          <DividerLabel label="Реєстрація через" color={P.btnFillText} line="#DDD6CB" />
        </View>

        <Pressable
          onPress={() => promptAsync()}
          disabled={!request}
          style={{
            backgroundColor: P.googleBtn,
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            height: 56,
            opacity: !request ? 0.6 : 1
          }}
        >
          <GoogleLogo size={24} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

