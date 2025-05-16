// Troubleshooting steps for ENOENT error in React Native Expo app

// 1. First, verify that the path to your background image is correct
// Make sure the directory and filename match exactly what's in your project

// Let's try a simplified version of your favorites screen

// File: app/favorites/index.js - Simplified version
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API configuration for Spoonacular
const API_URL = 'https://api.spoonacular.com/recipes';
const API_KEY = '97fb1a3b54ff43339fbb8fc58bb28619'; // Your API key

// Storage key for favorites (must match the one in recipes/index.js)
const FAVORITES_STORAGE_KEY = 'favoriteRecipes';

const FavoritesScreen = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipeDetails, setRecipeDetails] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

useEffect(() => {
  saveFavorites();
}, [favorites]);

  const addToFavorites = async (recipeId) => {
  try {
    // Check if already in favorites
    const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    let favoritesList = [];
    
    if (storedFavorites) {
      favoritesList = JSON.parse(storedFavorites);
    }
    
    // Add if not already in favorites
    if (!favoritesList.includes(recipeId)) {
      favoritesList.push(recipeId);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesList));
      console.log('Added to favorites:', recipeId);
      console.log('Current favorites:', favoritesList);
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
  }
};
// Function to load favorite recipe IDs from AsyncStorage
  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // Get favorite IDs from storage
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      let favoriteIds = [];
      
      if (storedFavorites) {
        favoriteIds = JSON.parse(storedFavorites);
        console.log('Loaded favorites:', favoriteIds);
        setFavorites(favoriteIds);
        
        // Only fetch details if we have favorites
        if (favoriteIds.length > 0) {
          await fetchRecipeDetails(favoriteIds);
        } else {
          setRecipeDetails([]);
          setLoading(false);
        }
      } else {
        // No favorites stored yet
        setFavorites([]);
        setRecipeDetails([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('Failed to load your favorite recipes.');
      setLoading(false);
    }
  };

  // Save favorites to AsyncStorage
  const saveFavorites = async () => {
    try {
      const jsonValue = JSON.stringify(favorites);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, jsonValue);
      console.log('Saved favorites:', favorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
      Alert.alert('Error', 'Failed to save your favorites');
    }
  };

  // Function to fetch details for multiple recipes at once
  const fetchRecipeDetails = async (recipeIds) => {
    if (!recipeIds || recipeIds.length === 0) {
      setRecipeDetails([]);
      setLoading(false);
      return;
    }
    
    try {
      // Convert array of IDs to comma-separated string for API
      const ids = recipeIds.join(',');
      
      const response = await axios.get(`${API_URL}/informationBulk`, {
        params: {
          apiKey: API_KEY,
          ids: ids
        }
      });
      
      if (response.data) {
        console.log(`Fetched details for ${response.data.length} recipes`);
        setRecipeDetails(response.data);
      } else {
        setRecipeDetails([]);
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      setError('Failed to load recipe details. Please check your internet connection or API key.');
    } finally {
      setLoading(false);
    }
  };

  // Remove a recipe from favorites
  const removeFromFavorites = (recipeId) => {
    // Create a new array without the recipe to remove
    const updatedFavorites = favorites.filter(id => id !== recipeId);
    
    // Update state
    setFavorites(updatedFavorites);
    
    // Update recipe details array
    const updatedDetails = recipeDetails.filter(recipe => recipe.id !== recipeId);
    setRecipeDetails(updatedDetails);
    
    // Show feedback to user
    Alert.alert('Removed', 'Recipe removed from favorites');
  };

  // Navigate to recipe details screen
  const navigateToRecipe = (recipeId) => {
    router.push(`/recipes/${recipeId}`);
  };

  // Render each favorite recipe item
  const renderFavoriteItem = ({ item }) => (
    <View style={styles.recipeCard}>
      <TouchableOpacity 
        style={styles.recipeImageContainer}
        onPress={() => navigateToRecipe(item.id)}
      >
        <Image 
          source={{ uri: item.image || 'https://spoonacular.com/recipeImages/default-image.jpg' }} 
          style={styles.recipeImage} 
        />
      </TouchableOpacity>
      
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        
        <View style={styles.recipeDetails}>
          <Text style={styles.recipeDetailText}>
            {item.readyInMinutes || '?'} min | {item.servings || '?'} servings
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeFromFavorites(item.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>Loading your favorites...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFavorites}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Your Favorites</Text>
      
      <FlatList
        data={recipeDetails}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't saved any favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Explore recipes and tap the heart icon to save them here
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/recipes')}
            >
              <Text style={styles.exploreButtonText}>Explore Recipes</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      <View style={styles.customBottomNav}>
        <TouchableOpacity 
          style={[
            styles.customNavButton, 
            {backgroundColor: '#008080'} // Teal
          ]}
          onPress={() => router.push('/recipes')}
        >
          <Text style={styles.customNavButtonText}>Back to Recipes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.customNavButton, 
            {backgroundColor: '#5f9ea0'} // Cadet Blue
          ]}
          onPress={() => router.push('/grocery-list')}
        >
          <Text style={styles.customNavButtonText}>Grocery List</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
    minHeight: 300, // Ensure there's space for the empty state
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recipeImageContainer: {
    width: 120,
    height: 120,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeDetailText: {
    fontSize: 12,
    color: '#636e72',
  },
  removeButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  exploreButton: {
    backgroundColor: 'darkgray',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  exploreButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  customBottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    backgroundColor: 'white',
  },
  customNavButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  customNavButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FavoritesScreen;