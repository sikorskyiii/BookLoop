import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import Entry from "./src/screens/Entry";
import Login from "./src/screens/Login";
import Register from "./src/screens/Register";

import Library from "./src/screens/Library";
import BookDetails from "./src/screens/BookDetails";
import AddBook from "./src/screens/AddBook";
import Search from "./src/screens/Search";
import Profile from "./src/screens/Profile";
import { theme } from "./src/theme/theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();       // для Library stack
const RootStack = createNativeStackNavigator();   // для Entry/Login/Register/Main

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: theme.colors.bg, card: theme.colors.bg, text: theme.colors.text, border: theme.colors.border }
};

function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
      <Stack.Screen name="Library" component={Library} />
      <Stack.Screen name="BookDetails" component={BookDetails} />
      <Stack.Screen name="AddBook" component={AddBook} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textMuted,
      tabBarIcon: ({ color, size }) => {
        const map = { Home: "home-outline", Search: "search-outline", Profile: "person-outline" };
        return <Ionicons name={map[route.name]} size={size} color={color} />;
      }
    })}>
      <Tab.Screen name="Home" component={LibraryStack} options={{ title: "Головна" }} />
      <Tab.Screen name="Search" component={Search} options={{ title: "Пошук" }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: "Профіль" }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Entry" component={Entry} />
        <RootStack.Screen name="Login" component={Login} />
        <RootStack.Screen name="Register" component={Register} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
