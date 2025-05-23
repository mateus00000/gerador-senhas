import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PasswordNavigationLinks = ({ onHistoryPress, onSavedPasswordsPress }) => {
  return (
    <View style={styles.linksContainer}>
      {/* <TouchableOpacity
        style={styles.linkButton}
        onPress={onHistoryPress}
      >
        <Text style={styles.linkText}>Ver Histórico</Text>
      </TouchableOpacity> */}
      
      <TouchableOpacity
        style={styles.linkButton}
        onPress={onSavedPasswordsPress}
      >
        <Text style={styles.linkText}>Ver Senhas Salvas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: '#4A86E8',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PasswordNavigationLinks; 