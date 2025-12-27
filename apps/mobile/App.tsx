import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

import Boot from "./src/screens/Boot";
import Entry from "./src/screens/Entry";
import Login from "./src/screens/Login";
import Register from "./src/screens/Register";

import Library from "./src/screens/Library";
import BookDetails from "./src/screens/BookDetails";
import AddBook from "./src/screens/AddBook";
import Search from "./src/screens/Search";
import Profile from "./src/screens/Profile";
import EditProfile from "./src/screens/EditProfile";
import ShareProfile from "./src/screens/ShareProfile";
import { theme } from "./src/theme/theme";
import { RootStackParamList, TabParamList } from "./src/types/navigation";

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.nav,
    card: theme.colors.bg,
    text: theme.colors.text,
    border: theme.colors.border
  }
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

function RecsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: theme.colors.textMuted }}>Recs</Text>
    </View>
  );
}

function ChatScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: theme.colors.textMuted }}>Chat</Text>
    </View>
  );
}

function ProfileTab() {
  return <Profile />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.nav, borderTopColor: theme.colors.border },
        tabBarActiveTintColor: theme.colors.active,
        tabBarInactiveTintColor: theme.colors.inactive,
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: "home-outline",
            Recs: "grid-outline",
            Chat: "chatbubble-outline",
            Profile: "person-outline"
          };
          return <Ionicons name={map[route.name]} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={LibraryStack} options={{ title: "Home" }} />
      <Tab.Screen name="Recs" component={RecsScreen} options={{ title: "Recs" }} />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: "Chat",
          tabBarBadge: 2,
          tabBarBadgeStyle: { backgroundColor: theme.colors.danger }
        }}
      />
      <Tab.Screen name="Profile" component={ProfileTab} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Boot">
        <RootStack.Screen name="Boot" component={Boot} />
        <RootStack.Screen name="Entry" component={Entry} />
        <RootStack.Screen name="Login" component={Login} />
        <RootStack.Screen name="Register" component={Register} />
        <RootStack.Screen name="Main" component={MainTabs} />
        <RootStack.Screen name="Search" component={Search} />
        <RootStack.Screen name="EditProfile" component={EditProfile} />
        <RootStack.Screen name="ShareProfile" component={ShareProfile} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

