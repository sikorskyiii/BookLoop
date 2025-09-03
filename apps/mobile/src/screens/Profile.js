
import { View, Text, Pressable } from "react-native";
import Header from "../components/Header";
import { theme } from "../theme/theme";
import { useAuth } from "../store/useAuth";

function Row({ label, value }) {
  return (
    <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
      <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginBottom: 4 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>{value || "—"}</Text>
    </View>
  );
}

export default function Profile({ navigation }){
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={{ flex:1, backgroundColor: theme.colors.bg }}>
        <Header title="Профіль" />
        <View style={{ flex:1, alignItems:"center", justifyContent:"center", gap: 12, padding: 24 }}>
          <Text style={{ color: theme.colors.textMuted, textAlign:"center" }}>
           Ви не авторизовані. Увійдіть, щоб переглянути профіль.
         </Text>
          <Pressable
            onPress={() => navigation.replace("Login")}
           style={{ paddingHorizontal:16, paddingVertical:12, borderRadius:12, backgroundColor: theme.colors.primary }}
          >
            <Text style={{ color: "#0b0d12", fontWeight:"700" }}>Увійти</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
   <View style={{ flex:1, backgroundColor: theme.colors.bg }}>
      <Header title="Профіль" />
      <View style={{ padding:16, gap: 12 }}>
        <View style={{ backgroundColor: theme.colors.card, borderRadius: 16, borderWidth:1, borderColor: theme.colors.border, padding:16 }}>
          <Row label="Імʼя" value={user.firstName} />
          <Row label="Прізвище" value={user.lastName} />
          <Row label="Email" value={user.email} />
      
        </View>
        <Pressable
          onPress={logout}
          style={{ marginTop: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth:1, borderColor: theme.colors.border, alignItems:"center" }}
        >
          <Text style={{ color: theme.colors.text, fontWeight:"600" }}>Вийти</Text>
        </Pressable>
      </View>
    </View>
  );
}

