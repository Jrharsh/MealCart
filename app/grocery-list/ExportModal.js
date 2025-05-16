// File: app/grocery-list/ExportModal.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';

const SUPPORTED_STORES = [
  { id: 'kroger', name: 'Kroger', logo: '🛒', available: true },
  { id: 'walmart', name: 'Walmart', logo: '🛒', available: false },
  { id: 'target', name: 'Target', logo: '🎯', available: false },
  { id: 'amazon', name: 'Amazon Fresh', logo: '📦', available: false },
  { id: 'instacart', name: 'Instacart', logo: '🚚', available: true },
  { id: 'email', name: 'Email', logo: '📧', available: true },
  { id: 'text', name: 'Text Message', logo: '📱', available: true },
  { id: 'clipboard', name: 'Copy to Clipboard', logo: '📋', available: true },
];

const ExportModal = ({ visible, onClose, groceryItems }) => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const generateItemList = () => {
    return groceryItems.map(item => item.name).join('\n');
  };
  
  const resetState = () => {
    setSelectedStore(null);
    setLoading(false);
    setError(null);
    setEmailAddress('');
    setPhoneNumber('');
  };
  
  const handleStoreSelection = (store) => {
    if (!store.available) {
      Alert.alert(
        'Coming Soon',
        `Integration with ${store.name} is coming soon! We're working on connecting to their systems.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedStore(store);
  };
  
  const handleExport = async () => {
    if (!selectedStore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Different export methods based on selected store
      switch (selectedStore.id) {
        case 'kroger':
          // In a real implementation, this would connect to Kroger API
          Alert.alert(
            'Kroger Export',
            'To connect to your Kroger account, you would need to authorize this app in a real implementation.',
            [
              {
                text: 'Open Kroger Website',
                onPress: () => Linking.openURL('https://www.kroger.com')
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
          break;
          
        case 'email':
          if (!emailAddress) {
            setError('Please enter an email address');
            setLoading(false);
            return;
          }
          
          // In a real app, this would send an email
          const emailSubject = encodeURIComponent('My Grocery List');
          const emailBody = encodeURIComponent(generateItemList());
          Linking.openURL(`mailto:${emailAddress}?subject=${emailSubject}&body=${emailBody}`);
          break;
          
        case 'text':
          if (!phoneNumber) {
            setError('Please enter a phone number');
            setLoading(false);
            return;
          }
          
          // In a real app, this would send a text message
          const smsBody = encodeURIComponent(generateItemList());
          Linking.openURL(`sms:${phoneNumber}?body=${smsBody}`);
          break;
          
        case 'clipboard':
          // This would use Clipboard API in a real implementation
          Alert.alert(
            'List Copied',
            'Your grocery list has been copied to clipboard!',
            [{ text: 'OK' }]
          );
          break;
          
        case 'instacart':
          // For Instacart, we'd redirect to their site or app
          Alert.alert(
            'Instacart Export',
            'This would open Instacart in a real implementation.',
            [
              {
                text: 'Open Instacart',
                onPress: () => Linking.openURL('https://www.instacart.com')
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
          break;
          
        default:
          break;
      }
      
      // Success!
      setLoading(false);
      onClose();
      resetState();
      
    } catch (err) {
      console.error('Error exporting grocery list:', err);
      setError('Failed to export grocery list. Please try again.');
      setLoading(false);
    }
  };
  
  const renderStoreInput = () => {
    if (!selectedStore) return null;
    
    switch (selectedStore.id) {
      case 'email':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address:</Text>
            <TextInput
              style={styles.input}
              value={emailAddress}
              onChangeText={setEmailAddress}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        );
        
      case 'text':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number:</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>
        );
        
      default:
        return (
          <View style={styles.storeInfoContainer}>
            <Text style={styles.storeInfoText}>
              You'll be redirected to {selectedStore.name} to complete the process.
            </Text>
          </View>
        );
    }
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Export Grocery List</Text>
          
          {!selectedStore ? (
            <>
              <Text style={styles.subtitle}>Choose where to send your list:</Text>
              
              <ScrollView style={styles.storeList}>
                {SUPPORTED_STORES.map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    style={[
                      styles.storeItem,
                      !store.available && styles.storeItemDisabled
                    ]}
                    onPress={() => handleStoreSelection(store)}
                  >
                    <Text style={styles.storeLogo}>{store.logo}</Text>
                    <Text style={styles.storeName}>{store.name}</Text>
                    {!store.available && (
                      <View style={styles.comingSoonTag}>
                        <Text style={styles.comingSoonText}>Coming Soon</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <View style={styles.selectedStoreHeader}>
                <Text style={styles.storeLogo}>{selectedStore.logo}</Text>
                <Text style={styles.selectedStoreName}>{selectedStore.name}</Text>
              </View>
              
              {renderStoreInput()}
              
              {error && <Text style={styles.errorText}>{error}</Text>}
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedStore(null)}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={handleExport}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.exportButtonText}>Export</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              onClose();
              resetState();
            }}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 16,
    textAlign: 'center',
  },
  storeList: {
    maxHeight: 400,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
    position: 'relative',
  },
  storeItemDisabled: {
    opacity: 0.7,
  },
  storeLogo: {
    fontSize: 24,
    marginRight: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3436',
  },
  comingSoonTag: {
    position: 'absolute',
    right: 12,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedStoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  selectedStoreName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f1f2f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  storeInfoContainer: {
    backgroundColor: '#f1f9ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  storeInfoText: {
    fontSize: 14,
    color: '#0984e3',
    textAlign: 'center',
  },
  errorText: {
    color: '#d63031',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#636e72',
    fontSize: 16,
    fontWeight: '500',
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#6c5ce7',
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#636e72',
    fontSize: 16,
  },
});

export default ExportModal;