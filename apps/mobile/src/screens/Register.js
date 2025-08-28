import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";

export default function Register({ navigation }) {
  const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  return (
    <View style={{ flex:1, padding:16, backgroundColor:"#0f1115" }}>
      <Text style={{ color:"#e6e8ee", fontSize:22, fontWeight:"800", marginBottom:16 }}>Реєстрація</Text>
      <TextInput placeholder="Email" placeholderTextColor="#9aa3b2"
        value={email} onChangeText={setEmail}
        style={{ color:"#e6e8ee", borderColor:"#232734", borderWidth:1, borderRadius:12, padding:12, marginBottom:12 }} />
      <TextInput placeholder="Пароль" placeholderTextColor="#9aa3b2" secureTextEntry
        value={pass} onChangeText={setPass}
        style={{ color:"#e6e8ee", borderColor:"#232734", borderWidth:1, borderRadius:12, padding:12, marginBottom:16 }} />
      <Pressable onPress={() => navigation.replace("Main")}
        style={{ backgroundColor:"#7c5cff", padding:14, borderRadius:12, alignItems:"center" }}>
        <Text style={{ color:"#0b0d12", fontWeight:"700" }}>Створити акаунт</Text>
      </Pressable>
    </View>
  );
}
