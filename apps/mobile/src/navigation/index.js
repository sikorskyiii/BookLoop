import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import BookDetailsScreen from '../screens/BookDetailsScreen';

const Stack = createNativeStackNavigator();

export default function RootNav() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
