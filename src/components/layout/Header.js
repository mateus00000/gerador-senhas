import React from 'react';
import { View, StyleSheet } from 'react-native';
import UserProfileIcon from '../icons/UserProfileIcon';

const Header = ({ navigation }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.spacer} />
        <UserProfileIcon navigation={navigation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 50,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  spacer: {
    width: 30,
  },
});

export default Header; 