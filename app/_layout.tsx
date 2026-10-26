import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Slot } from 'expo-router';
import { useMentorStore } from '@/store/mentorStore';
import { AppNavBar } from '@/components/AppNavBar';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';

function RootLayoutContent() {
  const { fetchProfile } = useMentorStore();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.content}>
          <Slot />
        </View>
        <AppNavBar />
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
