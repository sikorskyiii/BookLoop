import { View, Text, Pressable } from "react-native";
import Header from "../components/Header";
import { theme } from "../theme/theme";
import { useAuth } from "../store/useAuth";
import { RootStackScreenProps } from "../types/navigation";

interface RowProps {
  label: string;
  value: string | null | undefined;
}

function Row({ label, value }: RowProps) {
  return (
    <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
      <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginBottom: 4 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>{value || "—"}</Text>
    </View>
  );
}

export default function Profile({ navigation }: RootStackScreenProps<"Profile">) {
  const { user, logout, isGuest } = useAuth();

  if (!user && !isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <Header title="Профіль" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}>
          <Text style={{ color: theme.colors.textMuted, textAlign: "center" }}>
            Ви не авторизовані. Увійдіть, щоб переглянути профіль.
          </Text>
          <Pressable
            onPress={() => navigation.replace("Login")}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: theme.colors.primary
            }}
          >
            <Text style={{ color: "#0b0d12", fontWeight: "700" }}>Увійти</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <Header title="Профіль" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
          <Text style={{ color: theme.colors.textMuted, textAlign: "center", fontSize: 16 }}>
            Ви переглядаєте додаток як гість
          </Text>
          <Text style={{ color: theme.colors.textMuted, textAlign: "center", fontSize: 14 }}>
            Для повного доступу до всіх функцій увійдіть або зареєструйтесь
          </Text>
          <View style={{ gap: 12, width: "100%", maxWidth: 300 }}>
            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: theme.colors.primary,
                alignItems: "center"
              }}
            >
              <Text style={{ color: "#0b0d12", fontWeight: "700" }}>Увійти</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Register")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: "center"
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "600" }}>Реєстрація</Text>
            </Pressable>
            <Pressable
              onPress={logout}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center"
              }}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>Продовжити як гість</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Header title="Профіль" />
      <View style={{ padding: 16, gap: 12 }}>
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: 16
          }}
        >
          <Row label="Імʼя" value={user.firstName} />
          <Row label="Прізвище" value={user.lastName} />
          <Row label="Email" value={user.email} />
        </View>
        <Pressable
          onPress={logout}
          style={{
            marginTop: 8,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: "center"
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "600" }}>Вийти</Text>
        </Pressable>
      </View>
    </View>
  );
}

