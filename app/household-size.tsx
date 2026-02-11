import ProfileExitModal from '@/components/ProfileExitModal';
import { Theme, Typography } from '@/constants/theme';
import { useProfile } from '@/contexts/ProfileContext';
import VoiceInputOverlay, {
  VoiceResultExtras,
} from '@/utilities/useVoiceToText';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HouseholdSize() {
  const router = useRouter();
  const { mode, returnTo } = useLocalSearchParams<{
    mode?: string;
    returnTo?: string;
  }>();
  const editingMode = typeof mode === 'string' ? mode : undefined;
  const returnToPath =
    typeof returnTo === 'string' ? returnTo : '/(tabs)/profile';
  const isEditingHousehold = editingMode === 'edit-household';
  const { profileData, updateProfileData } = useProfile();
  const [householdSize, setHouseholdSize] = useState(
    profileData.householdSize || ''
  );
  const [member1, setMember1] = useState('');
  const [member2, setMember2] = useState('');
  const [member3, setMember3] = useState('');
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const handleVoiceResult = (text: string, extras?: VoiceResultExtras) => {
    const structured = extras?.structuredData;
    let nextHousehold = householdSize;
    let nextMember1 = member1;
    let nextMember2 = member2;
    let nextMember3 = member3;

    if (structured) {
      if (structured.householdSize?.trim()) {
        nextHousehold = structured.householdSize.trim();
        setHouseholdSize(nextHousehold);
        updateProfileData({ householdSize: nextHousehold });
      }
      if (structured.member1?.trim()) {
        nextMember1 = structured.member1.trim();
        setMember1(nextMember1);
      }
      if (structured.member2?.trim()) {
        nextMember2 = structured.member2.trim();
        setMember2(nextMember2);
      }
      if (structured.member3?.trim()) {
        nextMember3 = structured.member3.trim();
        setMember3(nextMember3);
      }
    } else if (text) {
      nextHousehold = text;
      setHouseholdSize(text);
      updateProfileData({ householdSize: text });
    }

    const composition = [nextMember1, nextMember2, nextMember3]
      .filter(Boolean)
      .join(', ');
    updateProfileData({ familyComposition: composition });
    setShowVoiceOverlay(false);
  };

  const handleNext = () => {
    const composition = [member1, member2, member3].filter(Boolean).join(', ');
    updateProfileData({ householdSize, familyComposition: composition });
    if (isEditingHousehold && editingMode) {
      router.push({
        pathname: '/household-income',
        params: { mode: editingMode, returnTo: returnToPath },
      });
    } else {
      router.push('/household-income');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Household information</Text>
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Household size /{'\n'}Family Composition
        </Text>

        <TextInput
          style={styles.input}
          placeholder="# Number of household..."
          placeholderTextColor="#9CA3AF"
          value={householdSize}
          onChangeText={(text) => {
            setHouseholdSize(text);
            updateProfileData({ householdSize: text });
          }}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Composition Member 1"
          placeholderTextColor="#9CA3AF"
          value={member1}
          onChangeText={(text) => {
            setMember1(text);
            const composition = [text, member2, member3]
              .filter(Boolean)
              .join(', ');
            updateProfileData({ familyComposition: composition });
          }}
        />

        <TextInput
          style={styles.input}
          placeholder="Composition Member 2"
          placeholderTextColor="#9CA3AF"
          value={member2}
          onChangeText={(text) => {
            setMember2(text);
            const composition = [member1, text, member3]
              .filter(Boolean)
              .join(', ');
            updateProfileData({ familyComposition: composition });
          }}
        />

        <TextInput
          style={styles.input}
          placeholder="Composition Member 3"
          placeholderTextColor="#9CA3AF"
          value={member3}
          onChangeText={(text) => {
            setMember3(text);
            const composition = [member1, member2, text]
              .filter(Boolean)
              .join(', ');
            updateProfileData({ familyComposition: composition });
          }}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => setShowVoiceOverlay(true)}
        >
          <Ionicons name="mic" size={24} color={Theme.colors.purple} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <VoiceInputOverlay
        visible={showVoiceOverlay}
        onClose={() => {
          setShowVoiceOverlay(false);
        }}
        contextFields={['householdSize', 'member1', 'member2', 'member3']}
        onResult={handleVoiceResult}
      />

      <ProfileExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onExit={() => {
          setShowExitModal(false);
          router.replace(returnToPath as any);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.black,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: Theme.colors.lightGrey,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.purple,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sectionTitle: {
    ...Typography.h2,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.black,
    textAlign: 'center',
    marginBottom: 60,
  },
  input: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.grey,
    borderRadius: Theme.radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: 330,
    height: 60,
    ...Typography.body,
    color: Theme.colors.black,
    marginBottom: 10,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 52,
    paddingBottom: 120,
    gap: 10,
  },
  voiceButton: {
    width: 52,
    height: 52,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Theme.colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
  },
  nextButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Theme.colors.orange,
    borderRadius: Theme.radius.button,
    ...Theme.padding.buttonLg,
    width: 234,
    height: 48,
    alignSelf: 'center',
  },
  nextButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
    textAlign: 'center',
  },
});
