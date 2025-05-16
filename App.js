import * as Font from 'expo-font';
import { useState, useEffect } from 'react';
import { useFonts, Poppins_400Regular, Popping_700Bold } from 'expo-font';

// In your App component:
const [fontsLoaded, setFontsLoaded] = useState(false);

useEffect(() => {
  async function loadFonts() {
    await Font.loadAsync({
      'Poppins-Regular': require('./src/assets/fonts/Poppins-Regular.ttf'),
      'Poppins-Medium': require('./src/assets/fonts/Poppins-Medium.ttf'),
      // Add other font weights
    });
    setFontsLoaded(true);
  }
  
  loadFonts();
}, []);

if (!fontsLoaded) {
  return <LoadingScreen />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Bold': Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <Text>Welcome to the App!</Text>
  );
}// Rest of your app