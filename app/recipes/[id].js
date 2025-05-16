// File: app/recipes/[id].js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  Alert,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// In any component that uses favorites
// In app/recipes/[id].js
import { useFavorites } from '../context/FavoritesContext';

function MyComponent() {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  
  // Rest of your component
}

// Spoonacular API configuration
const API_URL = 'https://api.spoonacular.com/recipes';
const API_KEY = '97fb1a3b54ff43339fbb8fc58bb28619'; // Replace with your Spoonacular API key

// Mock recipe data for fallback
const MOCK_RECIPE_DETAILS = {
  id: 1,
  title: 'Mock Recipe',
  ingredients: ['1 cup flour', '2 eggs'],
  instructions: 'Mix ingredients and bake.',
};

const RecipeDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  
  // Use favorites context
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    console.log('Recipe ID:', id);
    fetchRecipeDetails();
  }, [id]);

  // Update favorite status when recipe changes
  useEffect(() => {
    if (recipe) {
      const isCurrentlyFavorited = isFavorite(parseInt(recipe.id));
      setIsFavorited(isCurrentlyFavorited);
      
      // Initialize selected ingredients
      if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
        const initialSelection = {};
        recipe.extendedIngredients.forEach((ingredient, index) => {
          initialSelection[index] = true; // Select all ingredients by default
        });
        setSelectedIngredients(initialSelection);
      }
    }
  }, [recipe, favorites]);

  const fetchRecipeDetails = async () => {
    try {
      setLoading(false);
      setError(null);

      console.log(`Fetching recipe details for ID: ${id}`);

      const response = await axios.get(`${API_URL}/${id}/information`, {
        params: {
          apiKey: API_KEY,
          includeNutrition: true,
        },
      });

      if (response.data) {
        console.log('Successfully loaded recipe details:', response.data);
        setRecipe(response.data);

        // Check if this recipe is in favorites
        const isFav = isFavorite(parseInt(response.data.id));
        setIsFavorited(isFav);
      } else {
        throw new Error('No recipe details in response');
      }
    } catch (err) {
      console.error('Error fetching recipe details:', err.message);

      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('API Key Error. Check your Spoonacular API key.');
      } else {
        setError('Failed to load recipe details. Please try again later.');
      }

      // Fall back to mock data
      console.log('Using mock recipe data as fallback');
      setRecipe(MOCK_RECIPE_DETAILS);

      // Check if mock recipe is in favorites
      const isFav = isFavorite(716429); // Mock recipe ID
      setIsFavorited(isFav);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!recipe) return;
    
    try {
      const recipeId = parseInt(recipe.id);
      
      if (isFavorited) {
        // Remove from favorites
        removeFavorite(recipeId);
        setIsFavorited(false);
        Alert.alert('Removed from Favorites', `${recipe.title} has been removed from your favorites`);
      } else {
        // Add to favorites
        const recipeToSave = {
          id: recipeId,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          healthScore: recipe.healthScore || 0
        };
        
        addFavorite(recipeToSave);
        setIsFavorited(true);
        Alert.alert('Added to Favorites', `${recipe.title} has been added to your favorites`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const toggleIngredientSelection = (index) => {
    setSelectedIngredients({
      ...selectedIngredients,
      [index]: !selectedIngredients[index]
    });
  };

  const selectAllIngredients = () => {
    const allSelected = {};
    recipe.extendedIngredients.forEach((_, index) => {
      allSelected[index] = true;
    });
    setSelectedIngredients(allSelected);
  };

  const deselectAllIngredients = () => {
    const allDeselected = {};
    recipe.extendedIngredients.forEach((_, index) => {
      allDeselected[index] = false;
    });
    setSelectedIngredients(allDeselected);
  };

  const addToGroceryList = async () => {
    try {
      if (!recipe || !recipe.extendedIngredients) {
        Alert.alert('Error', 'No ingredients found for this recipe');
        return;
      }

      // Get current grocery list
      let groceryItems = [];
      try {
        const storedItems = await AsyncStorage.getItem('groceryItems');
        if (storedItems) {
          groceryItems = JSON.parse(storedItems);
        }
      } catch (error) {
        console.error('Error loading grocery items:', error);
      }

      // Filter selected ingredients
      const selectedIngredientsArray = recipe.extendedIngredients.filter((_, index) => 
        selectedIngredients[index]
      );

      if (selectedIngredientsArray.length === 0) {
        Alert.alert('No Ingredients Selected', 'Please select at least one ingredient to add to your grocery list');
        return;
      }

      // Add selected ingredients to grocery list
      const newItems = selectedIngredientsArray.map(ingredient => ({
        id: Date.now() + Math.random().toString(),
        name: ingredient.original || `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`,
        completed: false,
        recipeId: recipe.id,
        recipeName: recipe.title
      }));

      const updatedGroceryItems = [...groceryItems, ...newItems];

      // Save updated grocery list
      await AsyncStorage.setItem('groceryItems', JSON.stringify(updatedGroceryItems));

      Alert.alert(
        'Added to Grocery List', 
        `Added ${newItems.length} ingredient${newItems.length > 1 ? 's' : ''} to your grocery list`,
        [
          {
            text: 'View List',
            onPress: () => router.push('/grocery-list')
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );

      setShowIngredientsModal(false);
    } catch (error) {
      console.error('Error adding to grocery list:', error);
      Alert.alert('Error', 'Failed to add ingredients to grocery list');
    }
  };

  const openAddToGroceryList = () => {
    if (!recipe || !recipe.extendedIngredients || recipe.extendedIngredients.length === 0) {
      Alert.alert('No Ingredients', 'This recipe does not have any ingredients to add to your grocery list');
      return;
    }

    // Select all ingredients by default
    selectAllIngredients();
    setShowIngredientsModal(true);
  };

  const goBack = () => {
    router.back();
  };

  const goToGroceryList = () => {
    router.push('/grocery-list');
  };

  const goToFavorites = () => {
    router.push('/favorites');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>Loading recipe details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRecipeDetails}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Recipe not found</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Recipe Image */}
        {recipe.image && (
          <Image 
            source={{ uri: recipe.image }} 
            style={styles.recipeImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.recipeInfo}>
          {/* Title & Favorite Button */}
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[
                styles.favoriteButton, 
                isFavorited ? styles.favoriteButtonActive : {}
              ]}
              onPress={toggleFavorite}
            >
              <Text style={styles.favoriteButtonText}>
                {isFavorited ? '❤️ Favorited' : '♡ Add to Favorites'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.groceryButton}
              onPress={openAddToGroceryList}
            >
              <Text style={styles.groceryButtonText}>
                🛒 Add to Grocery List
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Recipe Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ready in</Text>
              <Text style={styles.statValue}>{recipe.readyInMinutes} min</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Servings</Text>
              <Text style={styles.statValue}>{recipe.servings}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Health Score</Text>
              <Text style={styles.statValue}>{recipe.healthScore || 'N/A'}</Text>
            </View>
          </View>
          
          {/* Diet Tags */}
          <View style={styles.tagsContainer}>
            {recipe.vegetarian && <View style={styles.tag}><Text style={styles.tagText}>Vegetarian</Text></View>}
            {recipe.vegan && <View style={styles.tag}><Text style={styles.tagText}>Vegan</Text></View>}
            {recipe.glutenFree && <View style={styles.tag}><Text style={styles.tagText}>Gluten-Free</Text></View>}
            {recipe.dairyFree && <View style={styles.tag}><Text style={styles.tagText}>Dairy-Free</Text></View>}
          </View>
          
          <View style={styles.divider} />
          
          {/* Summary */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.summaryText}>
            {recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '') : 'No summary available.'}
          </Text>
          
          {/* Ingredients - if available */}
          {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
              </View>
              {recipe.extendedIngredients.map((ingredient, index) => (
                <View key={`${ingredient.id || index}-${index}`} style={styles.ingredientItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.ingredientText}>{ingredient.original}</Text>
                </View>
              ))}
            </>
          )}
          
          {/* Instructions - if available */}
          {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && recipe.analyzedInstructions[0].steps && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Instructions</Text>
              {recipe.analyzedInstructions[0].steps.map((step) => (
                <View key={step.number} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{step.number}</Text>
                  </View>
                  <Text style={styles.instructionText}>{step.step}</Text>
                </View>
              ))}
            </>
          )}
          
          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
              <Text style={styles.goBackButtonText}>Back to Recipes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.viewGroceryButton} onPress={goToGroceryList}>
              <Text style={styles.viewGroceryButtonText}>Grocery List</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.viewFavoritesButton} onPress={goToFavorites}>
              <Text style={styles.viewFavoritesButtonText}>Favorites</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Ingredients Selection Modal */}
      <Modal
        visible={showIngredientsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowIngredientsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Ingredients to Grocery List</Text>
            <Text style={styles.modalSubtitle}>Select ingredients you want to add:</Text>
            
            <View style={styles.selectAllContainer}>
              <TouchableOpacity style={styles.selectAllButton} onPress={selectAllIngredients}>
                <Text style={styles.selectAllText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectAllButton} onPress={deselectAllIngredients}>
                <Text style={styles.selectAllText}>Deselect All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.ingredientsList}>
              {recipe.extendedIngredients.map((ingredient, index) => (
                <TouchableOpacity 
                  key={`modal-${ingredient.id || index}-${index}`} 
                  style={[
                    styles.modalIngredientItem,
                    selectedIngredients[index] ? styles.modalIngredientSelected : {}
                  ]}
                  onPress={() => toggleIngredientSelection(index)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedIngredients[index] ? styles.checkboxSelected : {}
                  ]}>
                    {selectedIngredients[index] && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.modalIngredientText}>{ingredient.original}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowIngredientsModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addToGroceryList}
              >
                <Text style={styles.addButtonText}>Add to Grocery List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  recipeImage: {
    width: '100%',
    height: 250,
  },
  recipeInfo: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  favoriteButton: {
    flex: 1,
    backgroundColor: 'lightgray',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  favoriteButtonActive: {
    backgroundColor: '#ffebee',
    borderColor: '#ff6b6b',
  },
  favoriteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  groceryButton: {
    flex: 1,
    backgroundColor: '#lightgray',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b8e994',
    marginLeft: 8,
  },
  groceryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f1f2f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#636e72',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#e1ffc7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#2d3436',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  addToGroceryText: {
    fontSize: 14,
    color: '#6c5ce7',
    fontWeight: 'bold',
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#636e72',
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: '#2d3436',
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionNumber: {
    backgroundColor: '#ff6b6b',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2d3436',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 24,
  },
  goBackButton: {
    flex: 1,
    backgroundColor: '#00827f', // Bright red
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 4,
  },
  goBackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewGroceryButton: {
    flex: 1,
    backgroundColor:'#48d1cc', // Bright blue
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  viewGroceryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewFavoritesButton: {
    flex: 1,
    backgroundColor: '#367588', // Bright green
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 4,
  },
  viewFavoritesButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#636e72',
  },
  errorText: {
    fontSize: 16,
    color: '#d63031',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 16,
  },
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f2f6',
    borderRadius: 6,
  },
  selectAllText: {
    fontSize: 14,
    color: '#2d3436',
    fontWeight: 'bold',
  },
  ingredientsList: {
    maxHeight: 300,
  },
  modalIngredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  modalIngredientSelected: {
    backgroundColor: '#f1f9ff',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#dfe6e9',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalIngredientText: {
    fontSize: 16,
    color: '#2d3436',
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#636e72',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    flex: 2,
    backgroundColor: '#264348',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RecipeDetailScreen;