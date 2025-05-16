// File: app/_layout.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FavoritesProvider } from './context/FavoritesContext';  // Make sure this import is correct

const APP_NAME = 'Recipe Finder';
const PRIMARY_COLOR = '#ff6b6b';

export default function RootLayout() {
  return (
    <FavoritesProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false, // Hide header for all screens
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="home/index"  // Change from 'home' to 'home/index'
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="recipes/index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="recipes/[id]"
            options={{
              headerShown: false,
              title: "Recipe Details",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="favorites/index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="grocery-list/index"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </FavoritesProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});