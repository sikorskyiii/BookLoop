import { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";

import AuthInput from "../components/AuthInput";
import DividerLabel from "../components/DividerLabel";
import GoogleLogo from "../components/GoogleLogo";
import { useAuth } from "../store/useAuth";
import { theme } from "../theme/theme";
import { RootStackScreenProps } from "../types/navigation";

import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../lib/firebase";

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

  // Get the appropriate client ID based on platform
  const { clientId, redirectUri } = useMemo(() => {
    const extra = Constants?.expoConfig?.extra ?? Constants?.manifestExtra ?? Constants?.manifest?.extra ?? {};
    const firebaseConfig = extra?.firebase || {};
    const iosClientId = firebaseConfig.iosClientId;
    
    if (!iosClientId) {
      console.warn("iOS Client ID не налаштовано");
    }
    
    const cId = iosClientId || "";
    
    // For iOS Client ID, use reverse client ID format for redirect URI
    // Format: com.googleusercontent.apps.{FULL_CLIENT_ID_WITHOUT_SUFFIX}:/oauth2redirect
    // Extract the full client ID without the .apps.googleusercontent.com suffix
    const clientIdWithoutSuffix = iosClientId?.replace(".apps.googleusercontent.com", "") || "";
    const rUri = `com.googleusercontent.apps.${clientIdWithoutSuffix}:/oauth2redirect`;
    
    return { clientId: cId, redirectUri: rUri };
  }, []);

  const handleAuthSuccess = useCallback(async (idToken: string) => {
    try {
      console.log("Received idToken, signing in with Firebase...");
      const credential = GoogleAuthProvider.credential(idToken);
      const userCred = await signInWithCredential(auth, credential);
      console.log("Firebase sign-in successful, getting ID token...");
      const firebaseIdToken = await userCred.user.getIdToken();
      console.log("Calling googleLogin API...");
      const r = await googleLogin(firebaseIdToken);
      if (r?.ok) {
        console.log("Google login successful!");
        navigation.replace("Main");
      } else {
        console.log("Google login failed:", r?.error);
      }
    } catch (error: any) {
      console.log("Error signing in with credential:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      Alert.alert("Помилка", `Помилка обробки відповіді від Google: ${error?.message || "Невідома помилка"}`);
    }
  }, [googleLogin, navigation]);

  // Use authorization code flow with PKCE for iOS Client ID
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code, // Use code flow instead of id_token
      redirectUri,
      usePKCE: true, // PKCE is required for authorization code flow
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    }
  );

  useEffect(() => {
    if (response?.type === "success" && request && request.codeVerifier) {
      // Exchange authorization code for id_token with PKCE code_verifier
      // redirectUri must exactly match the one used in authorization request
      // code_verifier is automatically handled by expo-auth-session from request
      console.log("Exchanging code for token...");
      console.log("Code:", response.params.code?.substring(0, 20) + "...");
      console.log("Redirect URI:", redirectUri);
      console.log("Code verifier present:", !!request.codeVerifier);
      
      AuthSession.exchangeCodeAsync(
        {
          clientId,
          code: response.params.code,
          redirectUri: request.redirectUri || redirectUri, // Use redirectUri from request to ensure exact match
          extraParams: {
            code_verifier: request.codeVerifier, // PKCE code_verifier
          },
        },
        {
          tokenEndpoint: "https://oauth2.googleapis.com/token",
        }
      )
        .then((tokenResponse) => {
          if (tokenResponse.idToken) {
            handleAuthSuccess(tokenResponse.idToken);
          } else {
            console.log("Token response:", tokenResponse);
            Alert.alert("Помилка", "Не вдалося отримати токен від Google");
          }
        })
        .catch((error) => {
          console.log("Error exchanging code:", error);
          console.log("Error details:", JSON.stringify(error, null, 2));
          Alert.alert("Помилка", `Помилка обміну коду на токен: ${error?.message || "Невідома помилка"}`);
        });
    } else if (response?.type === "error") {
      console.log("OAuth error:", response.error);
      Alert.alert("Помилка", "Не вдалося увійти через Google");
    } else if (response?.type === "success" && !request?.codeVerifier) {
      console.log("Missing code verifier in request");
      Alert.alert("Помилка", "OAuth запит не містить code verifier");
    }
  }, [response, request, handleAuthSuccess]);

  async function handleGoogleSignIn() {
    if (!clientId) {
      Alert.alert("Помилка", "Google Client ID не налаштовано");
      return;
    }

    if (!request) {
      Alert.alert("Помилка", "OAuth запит не готовий");
      return;
    }

    // Prevent multiple simultaneous auth sessions
    if (loading) {
      return;
    }

    try {
      await promptAsync();
    } catch (error: any) {
      console.log("Google sign-in failed:", error);
      Alert.alert("Помилка", error?.message || "Не вдалося увійти через Google");
    }
  }

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
          disabled={loading}
          onPress={handleGoogleSignIn}
          style={{
            backgroundColor: P.googleBtn,
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            height: 56,
            opacity: loading ? 0.6 : 1
          }}
        >
          <GoogleLogo size={24} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

