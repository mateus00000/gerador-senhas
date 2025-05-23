import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const PasswordDisplay = ({ password }) => {
  console.log('PasswordDisplay recebeu:', password);
  const displayPassword = String(password || '').trim();
  console.log('PasswordDisplay vai exibir:', displayPassword);

  return (
    <View style={styles.passwordContainer}>
      <Text style={styles.passwordText}>{displayPassword}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  passwordContainer: {
    backgroundColor: '#F0F6FF',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordText: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#4A86E8',
    letterSpacing: 2,
  },
});

export default PasswordDisplay; 