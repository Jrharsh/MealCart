// File: app/recipes/index.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  ImageBackground,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Spoonacular API configuration
const API_URL = 'https://api.spoonacular.com/recipes';
const API_KEY = 'Your_API_Key'; // Replace with your Spoonacular API key

const RecipesScreen = () => {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Favorites state with ref for persistence
  const [favorites, setFavorites] = useState([]);
  const favoritesRef = useRef([]); // Use ref to avoid stale closure issues
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);

  // Load favorites when component mounts
  useEffect(() => {
    loadFavorites();
    fetchRecipes();
  }, []);

  // Update favorites ref and save to storage when favorites change
  useEffect(() => {
    favoritesRef.current = favorites;
    saveFavorites();
  }, [favorites]);

  // Load favorites from AsyncStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favoriteRecipes');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(parsedFavorites);
        console.log('Loaded favorites:', parsedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Save favorites to AsyncStorage
  const saveFavorites = async () => {
    try {
      await AsyncStorage.setItem('favoriteRecipes', JSON.stringify(favoritesRef.current));
      console.log('Saved favorites:', favoritesRef.current);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // Filter recipes when search query or recipes change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(query)
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/random`, {
        params: {
          apiKey: API_KEY,
          number: 20, // Number of random recipes to fetch
        }
      });
      
      // Process the data to match the expected format
      const formattedRecipes = response.data.recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image || 'https://spoonacular.com/recipeImages/default-image.jpg', // Fallback image
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        summary: recipe.summary,
        instructions: recipe.instructions,
      }));
      
      setRecipes(formattedRecipes);
      setFilteredRecipes(formattedRecipes);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please check your internet connection or API key.');
    } finally {
      setLoading(false);
    }
  };

  const searchRecipes = async () => {
    if (searchQuery.trim() === '') {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/complexSearch`, {
        params: {
          apiKey: API_KEY,
          query: searchQuery,
          number: 20,
          addRecipeInformation: true,
        }
      });
      
      if (response.data.results.length === 0) {
        setRecipes([]);
        setFilteredRecipes([]);
      } else {
        const formattedRecipes = response.data.results.map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image || 'https://spoonacular.com/recipeImages/default-image.jpg',
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          summary: recipe.summary,
        }));
        
        setRecipes(formattedRecipes);
        setFilteredRecipes(formattedRecipes);
      }
    } catch (err) {
      console.error('Error searching recipes:', err);
      setError('Failed to search recipes. Please check your internet connection or API key.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchRecipes();
  };

  const navigateToRecipe = (recipeId) => {
    router.push(`/recipes/${recipeId}`);
  };

  // Toggle favorite with feedback
  const toggleFavorite = (recipeId) => {
    setFavorites(prevFavorites => {
      let updatedFavorites;
      
      if (prevFavorites.includes(recipeId)) {
        // Remove from favorites
        updatedFavorites = prevFavorites.filter(id => id !== recipeId);
        Alert.alert('Removed', 'Recipe removed from favorites');
      } else {
        // Add to favorites
        updatedFavorites = [...prevFavorites, recipeId];
        Alert.alert('Added', 'Recipe added to favorites');
      }
      
      return updatedFavorites;
    });
  };

  // Check if a recipe is favorited
  const isFavorite = (recipeId) => {
    return favorites.includes(recipeId);
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeCard} 
      onPress={() => navigateToRecipe(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={() => toggleFavorite(item.id)}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorite(item.id) ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ImageBackground 
        source={require('../../src/assets/images/recipes.png')}
        style={styles.backgroundImage}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Loading delicious recipes...</Text>
        </View>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground 
        source={require('../../src/assets/images/recipes.png')}
        style={styles.backgroundImage}
      >
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRecipes}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground 
      source={require('../../src/assets/images/recipes.png')}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerTitle}>Discover Recipes</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchRecipes}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.searchButton} onPress={searchRecipes}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
        
        {/* Mock Data button removed */}
        
        <FlatList
          data={filteredRecipes.length > 0 ? filteredRecipes : recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecipeItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery ? 'No recipes found for your search. Try something else.' : 'No recipes found. Try refreshing.'}
            </Text>
          }
          onRefresh={fetchRecipes}
          refreshing={loading}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(248, 249, 250, 0.85)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginVertical: 16,
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  clearButton: {
    position: 'absolute',
    right: 20, // was 70, try 20 for about 1 inch from the right edge
    top: 8,
    zIndex: 1,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#95a5a6',
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#5F9EA0',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // mockDataButton style removed
  listContent: {
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  recipeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  recipeTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginRight: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#ff6b6b',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 40,
    paddingHorizontal: 20,
  }
});

export default RecipesScreen;
