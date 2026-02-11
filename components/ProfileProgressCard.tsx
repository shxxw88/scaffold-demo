import Theme from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileProgressCardProps {
  percent: number;
}

export default function ProfileProgressCard({
  percent = 60,
}: ProfileProgressCardProps) {
  const pct = Math.max(0, Math.min(100, percent));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finish your profile!</Text>
      <Text style={styles.description}>
        Your profile is <Text style={styles.pctValue}>{pct}%</Text> complete.
        Fill out the rest of questions to save time on future applications.{' '}
      </Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${pct}%` }]}>
          <LinearGradient
            colors={[Theme.colors.lightOrange, Theme.colors.lightPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 14,
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.black,
    marginBottom: 8,
  },
  description: {
    ...Theme.typography.body,
    color: Theme.colors.black,
    marginBottom: 20,
  },
  pctValue: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.orange,
  },
  progressBarContainer: {
    width: '100%',
    height: 14,
    backgroundColor: Theme.colors.lightGrey,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});
