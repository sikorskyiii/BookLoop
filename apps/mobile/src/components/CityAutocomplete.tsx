import { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import { theme } from "../theme/theme";

// Список українських міст
const UKRAINIAN_CITIES = [
  "Київ", "Харків", "Одеса", "Дніпро", "Донецьк", "Запоріжжя", "Львів", "Кривий Ріг",
  "Миколаїв", "Маріуполь", "Луганськ", "Вінниця", "Севастополь", "Сімферополь", "Херсон",
  "Полтава", "Чернігів", "Черкаси", "Хмельницький", "Чернівці", "Житомир", "Суми",
  "Рівне", "Івано-Франківськ", "Кропивницький", "Тернопіль", "Луцьк", "Ужгород",
  "Мелітополь", "Краматорськ", "Біла Церква", "Красноармійськ", "Макіївка", "Бердянськ",
  "Нікополь", "Стрий", "Павлоград", "Горлівка", "Каменське", "Конотоп", "Ковель",
  "Шостка", "Бровари", "Бердичів", "Ніжин", "Нова Каховка", "Славута", "Енергодар",
  "Покровськ", "Марганець", "Олександрія", "Кам'янець-Подільський", "Лисичанськ",
  "Білгород-Дністровський", "Мукачеве", "Умань", "Дрогобич", "Новомосковськ",
  "Костянтинівка", "Стаханов", "Краснодон", "Сніжне", "Алчевськ", "Ровеньки",
  "Дебальцеве", "Лісичанськ", "Сєвєродонецьк", "Краматорськ", "Слов'янськ"
].sort();

interface CityAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

export default function CityAutocomplete({
  value,
  onChangeText,
  placeholder = "Введіть місто",
  style
}: CityAutocompleteProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!value.trim() || !isFocused) {
      return [];
    }
    const searchTerm = value.toLowerCase().trim();
    return UKRAINIAN_CITIES.filter(
      (city) => city.toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Показуємо максимум 10 результатів
  }, [value, isFocused]);

  const handleSelectCity = (city: string) => {
    onChangeText(city);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Затримка для дозволу натискання на елемент списку
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "600"
          }
        ]}
      />
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            style={styles.suggestionsList}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectCity(item)}
                style={styles.suggestionItem}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1
  },
  input: {
    paddingVertical: 0,
    minHeight: 24
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 4,
    maxHeight: 200,
    ...theme.shadow.soft,
    zIndex: 1000
  },
  suggestionsList: {
    maxHeight: 200
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  suggestionText: {
    color: theme.colors.text,
    fontSize: 14
  }
});

