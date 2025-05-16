// Full updated GroceryListScreen component with centered Export button
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExportModal from './ExportModal';

// Define styles OUTSIDE the component to avoid recreating them
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  headerActions: {
    flexDirection: 'row',
  },
  // New and updated styles for export button
  exportContainer: {
    alignItems: 'center', // Center horizontally
    marginVertical: 10, // Add spacing around the container
    width: '100%', // Take full width to allow centering
  },
  exportWrapper: {
    backgroundColor: 'white', // White background
    paddingVertical: 10, // Vertical padding
    paddingHorizontal: 20, // Horizontal padding
    borderRadius: 8, // Rounded corners
    elevation: 2, // Add shadow (Android)
    shadowColor: '#000', // Shadow color (iOS)
    shadowOffset: { width: 0, height: 1 }, // Shadow offset (iOS)
    shadowOpacity: 0.2, // Shadow opacity (iOS)
    shadowRadius: 1.5, // Shadow radius (iOS)
  },
  exportText: {
    color: '#5F9E8F', // Teal color
    fontWeight: 'bold',
    fontSize: 20, // Appropriate size
    textAlign: 'center', // Center text
  },
  clearText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  progressContainer: {
    padding: 16,
    paddingTop: 0,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6c5ce7',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#636e72',
    textAlign: 'right',
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#6c5ce7',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#2d3436',
  },
  completedItemText: {
    textDecorationLine: 'line-through',
    color: '#b2bec3',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#ff6b6b',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  browseRecipesButton: {
    backgroundColor: '#5F9EA0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  browseRecipesButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 60,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    color: '#636e72',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

const GroceryListScreen = () => {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Use a ref to always have access to the most current value of items
  const itemsRef = useRef([]);
  
  // Keep the ref updated whenever items changes
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    loadItems();
  }, []);
  
  const loadItems = async () => {
    try {
      setLoading(true);
      const storedItems = await AsyncStorage.getItem('groceryItems');
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        setItems(parsedItems);
      }
    } catch (error) {
      console.error('Error loading grocery items:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveItems = async (updatedItems) => {
    try {
      await AsyncStorage.setItem('groceryItems', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error saving grocery items:', error);
    }
  };

  const addItem = () => {
    if (newItem.trim().length === 0) {
      return;
    }

    const itemToAdd = {
      id: Date.now().toString(),
      name: newItem.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedItems = [...items, itemToAdd];
    setItems(updatedItems);
    saveItems(updatedItems);
    setNewItem('');
  };

  const toggleItemCompletion = (id) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    saveItems(updatedItems);
  };

  const deleteItem = (id) => {
    // Create the updated items list
    const updatedItems = items.filter(item => item.id !== id);
    
    // Update state first (this should trigger re-render)
    setItems(updatedItems);
    
    // Then persist to storage
    saveItems(updatedItems);
  };

  const clearCompletedItems = () => {
    // Check if there are completed items
    const completedItemsExist = items.some(item => item.completed);
    
    if (!completedItemsExist) {
      Alert.alert('No Completed Items', 'There are no completed items to clear.');
      return;
    }
    
    // Create the updated items list
    const updatedItems = items.filter(item => !item.completed);
    
    // Update state first (this should trigger re-render)
    setItems(updatedItems);
    
    // Then persist to storage
    saveItems(updatedItems);
  };
  
  const openExportModal = () => {
    if (items.length === 0) {
      Alert.alert('Empty List', 'Your grocery list is empty. Add some items before exporting.');
      return;
    }
    setShowExportModal(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => toggleItemCompletion(item.id)}
      >
        <View style={[styles.checkbox, item.completed && styles.checkedCheckbox]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
      
      <Text 
        style={[styles.itemText, item.completed && styles.completedItemText]}
      >
        {item.name}
      </Text>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteItem(item.id)}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  return (
    <ImageBackground
      source={require('../../src/assets/images/grocerylist.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}></Text>
        </View>

        {/* New centered export button with white background */}
        {totalCount > 0 && (
          <View style={styles.exportContainer}>
            <TouchableOpacity 
              style={styles.exportWrapper}
              onPress={openExportModal}
            >
              <Text style={styles.exportText}>Export Grocery List</Text>
            </TouchableOpacity>
          </View>
        )}

        {totalCount > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {completedCount} of {totalCount} items completed
            </Text>
          </View>
        )}
        
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          extraData={items} // Force re-render when items change
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Your grocery list is empty</Text>
              <Text style={styles.emptySubtext}>
                Add items to your grocery list
              </Text>
              <TouchableOpacity 
                style={styles.browseRecipesButton}
                onPress={() => router.push('/recipes')}
              >
                <Text style={styles.browseRecipesButtonText}>Browse Recipes</Text>
              </TouchableOpacity>
            </View>
          }
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add an item..."
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={addItem}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addItem}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.navButtonText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/recipes')}
          >
            <Text style={styles.navButtonText}>Recipes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/favorites')}
          >
            <Text style={styles.navButtonText}>Favorites</Text>
          </TouchableOpacity>
        </View>
        
        <ExportModal 
          visible={showExportModal}
          onClose={() => setShowExportModal(false)}
          groceryItems={items}
        />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default GroceryListScreen;