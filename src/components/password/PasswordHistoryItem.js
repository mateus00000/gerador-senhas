import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const PasswordHistoryItem = ({ 
  password, 
  isVisible, 
  onToggleVisibility, 
  onCopy 
}) => {
  return (
    <View style={styles.passwordItemContainer}>
      <Text style={styles.passwordItem}>
        {isVisible ? password : '••••••••'}
      </Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          onPress={onToggleVisibility} 
          style={styles.iconButton}
        >
          <FontAwesome5 
            name={isVisible ? "eye-slash" : "eye"} 
            size={16} 
            color="#00ACC1"
            style={styles.icon} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onCopy} 
          style={styles.iconButton}
        >
          <FontAwesome5 
            name="copy" 
            size={16} 
            color="#1A237E"
            style={styles.copyIcon} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  passwordItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  passwordItem: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#212121',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  icon: {
    // marginRight: 5,
  },
  copyIcon: {
    // marginLeft: 5,
  },
});

export default PasswordHistoryItem; 