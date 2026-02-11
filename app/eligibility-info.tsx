import { Theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EligibilityInfo() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/sign-in')}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Image
            source={require('../assets/images/Ai-icon.png')}
            style={styles.sparkle}
            contentFit="contain"
            accessibilityLabel="AI icon"
          />
          <Text style={styles.title}>
            Scaffold will filter eligibility of the grants based on your
            profile!
          </Text>
          <Image
            source={require('../assets/images/scaffy1.png')}
            style={styles.illustration}
            contentFit="contain"
            accessibilityLabel="Scaffy illustration"
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/upload-resume')}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 50,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 24,
  },
  sparkle: {
    width: 72,
    height: 72,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.black,
    paddingHorizontal: 24,
  },
  illustration: {
    width: 236,
    height: 236,
    marginTop: 40,
  },
  primaryButton: {
    backgroundColor: Theme.colors.orange,
    borderRadius: Theme.radius.button,
    ...Theme.padding.buttonLg,
    width: 234,
    alignSelf: 'center',
  },
  primaryButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
    textAlign: 'center',
  },
});
