import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSearchParams } from 'expo-router';
import axios from 'axios';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Create a mock HomeScreen, FavoritesScreen, and BrowseScreen component since they aren't defined
const HomeScreen = () => <View><Text>Home Screen</Text></View>;
const FavoritesScreen = () => <View><Text>Favorites Screen</Text></View>;
const BrowseScreen = () => <View><Text>Browse Screen</Text></View>;

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#ffffff' },
        tabBarActiveTintColor: '#008080', 
        tabBarInactiveTintColor: '#95a5a6',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={{
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        }}
      />
    </Tab.Navigator>
  );
}

// Standalone implementation of the recipe details page with custom bottom navigation
export function RecipeDetailsScreen() {
  // This would normally be populated from your API or route params
  const recipeDetails = {
    name: "Almond Cookie Slices",
    calories: "350 kcal per serving",
    protein: "5g",
    carbs: "40g",
    fat: "18g",
    ingredients: [
      "100 grams Almond slices",
      "15 grams Saffron baking powder",
      "125 grams Kerrygold butter, softened",
      "300 grams German #405 flour",
      "150 grams German Quark (or fromage frais)",
      "90 ml Safflower oil",
      "1/2 teaspoon salt",
      "1 1/2 cups sugar",
      "20 grams Vanilla sugar",
      "1/2 cup organic whole milk"
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{recipeDetails.name}</Text>
        <Text style={styles.content}>Calories: {recipeDetails.calories}</Text>
        <Text style={styles.content}>Protein: {recipeDetails.protein}</Text>
        <Text style={styles.content}>Carbs: {recipeDetails.carbs}</Text>
        <Text style={styles.content}>Fat: {recipeDetails.fat}</Text>
        <Text style={styles.content}>Ingredients:</Text>
        {recipeDetails.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientContainer}>
            <Text style={styles.ingredientText}>{ingredient}</Text>
          </View>
        ))}
      </View>
      
      {/* Custom Footer Navigation - Using explicit colors with fully qualified hex codes */}
      <View style={styles.customBottomNav}>
        <TouchableOpacity 
          style={[styles.customNavButton, { backgroundColor: '#ff5733' }]} // Bright red for "Back to Recipes"
          activeOpacity={0.8}
        >
          <Text style={styles.customNavButtonText}>Back to Recipes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.customNavButton, { backgroundColor: '#33c4ff' }]} // Bright blue for "Grocery List"
          activeOpacity={0.8}
        >
          <Text style={styles.customNavButtonText}>Grocery List</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.customNavButton, { backgroundColor: '#28a745' }]} // Bright green for "Favorites"
          activeOpacity={0.8}
        >
          <Text style={styles.customNavButtonText}>Favorites</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// This is the original component with API fetching
export function FoodDetails() {
  const { id } = useSearchParams();
  const [foodDetails, setFoodDetails] = useState(null);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const response = await axios.get('https://platform.fatsecret.com/rest/food/v4', {
          headers: {
            Authorization: 'Bearer YOUR_ACCESS_TOKEN',
          },
          params: {
            food_id: id,
            format: 'json',
          },
        });
        setFoodDetails(response.data.food);
      } catch (error) {
        console.error('Error fetching food details:', error);
      }
    };

    fetchFoodDetails();
  }, [id]);

  if (!foodDetails) {
    return (
      <View style={styles.container}>
        <Text>Loading food details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{foodDetails.name}</Text>
        <Text style={styles.content}>Calories: {foodDetails.calories}</Text>
        <Text style={styles.content}>Protein: {foodDetails.protein}</Text>
        <Text style={styles.content}>Carbs: {foodDetails.carbs}</Text>
        <Text style={styles.content}>Fat: {foodDetails.fat}</Text>
        <Text style={styles.content}>Ingredients:</Text>
        {foodDetails.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientContainer}>
            <Text style={styles.ingredientText}>{ingredient}</Text>
          </View>
        ))}
      </View>
      
      {/* Custom Footer Navigation with DIRECT COLOR APPLICATION */}
      <View style={styles.customBottomNav}>
        <TouchableOpacity 
          style={[
            styles.customNavButton, 
            {backgroundColor: '#008080'} // Teal - direct color application
          ]}
        >
          <Text style={styles.customNavButtonText}>Back to Recipes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.customNavButton, 
            {backgroundColor: '#5f9ea0'} // Cadet Blue - direct color application
          ]}
        >
          <Text style={styles.customNavButtonText}>Grocery List</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.customNavButton, 
            {backgroundColor: '#367588'} // Steel Blue - direct color application
          ]}
        >
          <Text style={styles.customNavButtonText}>Favorites</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  content: {
    fontSize: 18,
    marginBottom: 8,
    color: '#333333',
  },
  ingredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333333',
  },
  // Custom bottom navigation styles with explicit properties
  customBottomNav: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  customNavButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // No border radius to match screenshot
  },
  customNavButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});