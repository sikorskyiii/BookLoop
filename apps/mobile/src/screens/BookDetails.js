import { useEffect, useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import { api } from "../api/client";

export default function BookDetails({ route, navigation }) {
  const { id } = route.params || {};
  const [item, setItem] = useState(null);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const { data } = await api.get("/books");
        const found = data.find(x => String(x.id) === String(id)) || data[0];
        if (on) setItem(found);
      } catch {}
    })();
    return () => { on = false; };
  }, [id]);

  if (!item) return null;

  return (
    <View style={{ flex:1, backgroundColor: theme.colors.bg }}>
      <View style={{ position:"relative" }}>
        <Image source={{ uri: item.cover || "https://placehold.co/1200x800/png" }} style={{ width:"100%", height: 260 }} />
        <Pressable onPress={() => navigation.goBack()} style={{
          position:"absolute", top: 52, left: 16, width:40, height:40,
          borderRadius:20, backgroundColor:"#0008", alignItems:"center", justifyContent:"center"
        }}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
      </View>

      <View style={{ padding:16, gap:8 }}>
        <Text style={{ color: theme.colors.text, fontSize:20, fontWeight:"800" }}>{item.title}</Text>
        <Text style={{ color: theme.colors.textMuted }}>{item.author}</Text>
        {!!item.description && <Text style={{ color: theme.colors.textMuted, marginTop:8 }}>{item.description}</Text>}
      </View>
    </View>
  );
}
