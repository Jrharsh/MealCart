import React from 'react';
import {
   View,
   Text,
   StyleSheet,
   ImageBackground,
   TouchableOpacity,
   SafeAreaView,
   Platform
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  // Using system fonts instead of custom fonts to avoid any loading issues
  
  return (
    <ImageBackground
      source={require('../../src/assets/images/Home.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.overlay}>
          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to MealCart!</Text>
            <Text style={styles.subtitle}>Discover delicious recipes and plan your meals</Text>
          </View>
          
          {/* Buttons Section */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/recipes')}
            >
              <Text style={styles.buttonText}>Browse Recipes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/favorites')}
            >
              <Text style={styles.buttonText}>My Favorites</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/grocery-list')}
            >
              <Text style={styles.buttonText}>Grocery List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    // Using system fonts instead of custom fonts
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    fontSize: 30,
    color: '#5F9EA0',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    // Using system fonts instead of custom fonts
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    fontSize: 16, 
    color: '#5F9EA0',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%', // Reduced from 100% to make buttons smaller
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#5F9EA0',
    paddingVertical: 12, // Reduced from 16
    borderRadius: 10,
    marginBottom: 14, // Reduced from 16
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
  },
});