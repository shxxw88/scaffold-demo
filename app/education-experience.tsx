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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EducationExperience() {
  const router = useRouter();
  const { mode, returnTo } = useLocalSearchParams<{
    mode?: string;
    returnTo?: string;
  }>();
  const editingMode = typeof mode === 'string' ? mode : undefined;
  const returnToPath =
    typeof returnTo === 'string' ? returnTo : '/(tabs)/profile';
  const isEditingEducation = editingMode === 'edit-education';
  const { profileData, updateProfileData } = useProfile();
  const [tradeSchoolName, setTradeSchoolName] = useState(
    profileData.tradeSchoolName || ''
  );
  const [tradeProgramName, setTradeProgramName] = useState(
    profileData.tradeProgramName || ''
  );
  const [graduationDate, setGraduationDate] = useState(
    profileData.tradeGraduationDate || ''
  );
  const [trade, setTrade] = useState(profileData.trade || '');
  const [apprenticeshipLevel, setApprenticeshipLevel] = useState(
    profileData.apprenticeshipLevel || ''
  );
  const [showApprenticeshipPicker, setShowApprenticeshipPicker] =
    useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const APPRENTICESHIP_LEVELS = [
    'First Year Apprentice',
    'Second Year Apprentice',
    'Third Year Apprentice',
    'Fourth Year Apprentice',
    'Journeyman',
  ];

  const handleVoiceResult = (text: string, extras?: VoiceResultExtras) => {
    const structured = extras?.structuredData;
    if (structured?.tradeSchoolName?.trim()) {
      setTradeSchoolName(structured.tradeSchoolName.trim());
      updateProfileData({ tradeSchoolName: structured.tradeSchoolName.trim() });
    } else if (!structured && text) {
      setTradeSchoolName(text);
      updateProfileData({ tradeSchoolName: text });
    }

    if (structured?.tradeProgramName?.trim()) {
      setTradeProgramName(structured.tradeProgramName.trim());
      updateProfileData({
        tradeProgramName: structured.tradeProgramName.trim(),
      });
    }

    if (structured?.graduationDate?.trim()) {
      setGraduationDate(structured.graduationDate.trim());
      updateProfileData({
        tradeGraduationDate: structured.graduationDate.trim(),
      });
    }

    if (structured?.trade?.trim()) {
      setTrade(structured.trade.trim());
      updateProfileData({ trade: structured.trade.trim() });
    }

    if (structured?.apprenticeshipLevel?.trim()) {
      const match = APPRENTICESHIP_LEVELS.find((l) =>
        structured.apprenticeshipLevel.toLowerCase().includes(l.toLowerCase())
      );
      if (match) {
        setApprenticeshipLevel(match);
        updateProfileData({ apprenticeshipLevel: match });
      }
    }

    setShowVoiceOverlay(false);
  };

  const handleNext = () => {
    updateProfileData({
      tradeSchoolName,
      tradeProgramName,
      tradeGraduationDate: graduationDate,
      trade,
      apprenticeshipLevel,
    });
    // Use a typed push object to avoid TypeScript route literal restrictions
    router.push({
      pathname: '/profile-picture',
      params: { source: 'onboarding' },
    } as any);
    if (isEditingEducation) {
      router.replace(returnToPath as any);
    } else {
      router.push('/(tabs)/profile');
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
        <Text style={styles.headerTitle}>Education/Experience</Text>
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '85%' }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Trade-Specific Education</Text>

          <TextInput
            style={styles.input}
            placeholder="Trade School / Vocational School Name..."
            placeholderTextColor="#9CA3AF"
            value={tradeSchoolName}
            onChangeText={(text) => {
              setTradeSchoolName(text);
              updateProfileData({ tradeSchoolName: text });
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Trade / Vocational Program Name..."
            placeholderTextColor="#9CA3AF"
            value={tradeProgramName}
            onChangeText={(text) => {
              setTradeProgramName(text);
              updateProfileData({ tradeProgramName: text });
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Graduation / Completion Date..."
            placeholderTextColor="#9CA3AF"
            value={graduationDate}
            onChangeText={(text) => {
              setGraduationDate(text);
              updateProfileData({ tradeGraduationDate: text });
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Trade..."
            placeholderTextColor="#9CA3AF"
            value={trade}
            onChangeText={(text) => {
              setTrade(text);
              updateProfileData({ trade: text });
            }}
          />

          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() =>
              setShowApprenticeshipPicker(!showApprenticeshipPicker)
            }
          >
            <Text
              style={
                apprenticeshipLevel ? styles.inputText : styles.placeholderText
              }
            >
              {apprenticeshipLevel || 'Apprenticeship Level / Year...'}
            </Text>
            <Ionicons
              name={showApprenticeshipPicker ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          {showApprenticeshipPicker && (
            <View style={styles.picker}>
              {APPRENTICESHIP_LEVELS.map((level, index) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.pickerOption,
                    index === APPRENTICESHIP_LEVELS.length - 1 &&
                      styles.pickerOptionLast,
                  ]}
                  onPress={() => {
                    setApprenticeshipLevel(level);
                    setShowApprenticeshipPicker(false);
                    updateProfileData({ apprenticeshipLevel: level });
                  }}
                >
                  <Text style={styles.pickerOptionText}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => setShowVoiceOverlay(true)}
        >
          <Ionicons name="mic" size={24} color={Theme.colors.purple} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isEditingEducation ? 'Save & Close' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      <VoiceInputOverlay
        visible={showVoiceOverlay}
        onClose={() => {
          setShowVoiceOverlay(false);
        }}
        contextFields={[
          'tradeSchoolName',
          'tradeProgramName',
          'graduationDate',
          'trade',
          'apprenticeshipLevel',
        ]}
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
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    ...Typography.h2,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.black,
    textAlign: 'center',
    marginBottom: 60,
  },
  content: {
    paddingHorizontal: 20,
  },
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.grey,
    borderRadius: Theme.radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    height: 60,
    ...Typography.body,
    color: Theme.colors.black,
    marginBottom: 10,
    alignSelf: 'center',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.grey,
    borderRadius: Theme.radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    height: 60,
    ...Typography.body,
    color: Theme.colors.black,
    marginBottom: 10,
    alignSelf: 'center',
  },
  inputText: {
    ...Typography.body,
    color: Theme.colors.black,
  },
  placeholderText: {
    ...Typography.body,
    color: Theme.colors.grey,
  },
  picker: {
    borderWidth: 1.2,
    borderColor: Theme.colors.grey,
    borderRadius: Theme.radius.card,
    backgroundColor: Theme.colors.white,
    marginBottom: 24,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  pickerOptionLast: {
    borderBottomWidth: 0,
  },
  pickerOptionText: {
    ...Typography.body,
    color: Theme.colors.black,
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
