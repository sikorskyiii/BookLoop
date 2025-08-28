import { useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const C = {
  fieldBg: "#2E2728",
  fieldText: "#EEE9E3",
  placeholder: "#B8B0AA",
  eye: "#B8B0AA",
  border: "transparent"
};

export default function AuthInput({
  placeholder,
  value,
  onChangeText,
  secure = false,
  keyboardType = "default",
  autoCapitalize = "none",
  style
}) {
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View
      style={[
        {
          backgroundColor: C.fieldBg,
          borderRadius: 14,
          paddingHorizontal: 14,
          height: 52,
          justifyContent: "center",
          borderWidth: 1,
          borderColor: C.border
        },
        style
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.placeholder}
        secureTextEntry={secure && hidden}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={{ color: C.fieldText, fontSize: 16, paddingRight: secure ? 36 : 0 }}
      />
      {secure && (
        <Pressable
          onPress={() => setHidden((s) => !s)}
          style={{ position: "absolute", right: 12, top: 0, bottom: 0, justifyContent: "center" }}
          hitSlop={10}
        >
          <Ionicons name={hidden ? "eye-off-outline" : "eye-outline"} size={20} color={C.eye} />
        </Pressable>
      )}
    </View>
  );
}
