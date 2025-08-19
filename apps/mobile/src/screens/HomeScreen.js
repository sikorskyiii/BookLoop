import { useEffect, useState } from 'react';
import { View, Text, Button, Platform } from 'react-native';

const getApiBase = () => (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://127.0.0.1:3000');

export default function HomeScreen({ navigation }) {
  const [msg, setMsg] = useState('…');

  const ping = async () => {
    try {
      const res = await fetch(`${getApiBase()}/api/ping`);
      const data = await res.json();
      setMsg(data.message || JSON.stringify(data));
    } catch {
      setMsg('API unreachable');
    }
  };

  useEffect(() => { ping(); }, []);

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ fontSize:22, marginBottom:12 }}>BookLoop</Text>
      <Text style={{ marginBottom:12 }}>Ping: {msg}</Text>
      <Button title="Open Book" onPress={() => navigation.navigate('BookDetails')} />
    </View>
  );
}
