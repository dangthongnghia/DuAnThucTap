import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import TopNavigation from '../components/Navigation/TopNavigation';

export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <TopNavigation
        variant="notification"
        title="Notification"
        onBackPress={() => console.log('Back')}
        onMorePress={() => console.log('More')}
      />
      <ScrollView style={styles.content}>
        {/* Notification list here */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
});