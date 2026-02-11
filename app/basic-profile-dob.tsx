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

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const buildDateOfBirth = (month: string, day: string, year: string) => {
  const hasMonth = Boolean(month);
  const hasDay = Boolean(day);
  let datePart = '';

  if (hasMonth && hasDay) {
    datePart = `${month} ${day}`;
  } else if (hasMonth) {
    datePart = month;
  } else if (hasDay) {
    datePart = day;
  }

  if (year) {
    return datePart ? `${datePart}, ${year}` : year;
  }

  return datePart;
};

export default function BasicProfileDOB() {
  const router = useRouter();
  const { mode, returnTo } = useLocalSearchParams<{
    mode?: string;
    returnTo?: string;
  }>();
  const editingMode = typeof mode === 'string' ? mode : undefined;
  const returnToPath =
    typeof returnTo === 'string' ? returnTo : '/(tabs)/profile';
  const isEditingBasic = editingMode === 'edit-basic';
  const { updateProfileData } = useProfile();
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const applyDateParts = (value: string) => {
    const cleanValue = value.trim();
    let nextMonth = month;
    let nextDay = day;
    let nextYear = year;

    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(cleanValue)) {
      const [y, m, d] = cleanValue.split('-');
      const monthIndex = Math.max(
        0,
        Math.min(MONTHS.length - 1, Number(m) - 1)
      );
      nextMonth = MONTHS[monthIndex];
      nextDay = String(Number(d));
      nextYear = y;
    } else {
      const parts = cleanValue.replace(/,/g, ' ').split(/\s+/);
      if (parts.length >= 3) {
        const [m, d, y] = parts;
        if (MONTHS.includes(m)) {
          nextMonth = m;
        }
        if (!Number.isNaN(Number(d))) {
          nextDay = String(Number(d));
        }
        if (!Number.isNaN(Number(y))) {
          nextYear = y;
        }
      }
    }

    setMonth(nextMonth);
    setDay(nextDay);
    setYear(nextYear);
    updateProfileData({
      dateOfBirth: buildDateOfBirth(nextMonth, nextDay, nextYear),
    });
  };

  const handleVoiceResult = (text: string, extras?: VoiceResultExtras) => {
    const structuredValue = extras?.structuredData?.dateOfBirth?.trim();
    const value = structuredValue || text;
    if (value) {
      applyDateParts(value);
    }
    setShowVoiceOverlay(false);
  };

  const navigateForward = (path: string) => {
    if (isEditingBasic && editingMode) {
      router.push({
        pathname: path as any,
        params: { mode: editingMode, returnTo: returnToPath },
      });
    } else {
      router.push(path as any);
    }
  };

  const handleNext = () => {
    updateProfileData({ dateOfBirth: buildDateOfBirth(month, day, year) });
    navigateForward('/basic-profile-gender');
  };

  const handleExit = () => {
    setShowExitModal(false);
    router.replace(returnToPath as any);
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
        <Text style={styles.headerTitle}>Basic Profile</Text>
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '20%' }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>Enter Your Date of Birth</Text>

        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowMonthPicker(!showMonthPicker)}
          >
            <Text style={styles.dateLabel}>Month</Text>
            <View style={styles.dateValueContainer}>
              <Text style={styles.dateValue}>{month}</Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <View style={styles.dateInput}>
            <Text style={styles.dateLabel}>day</Text>
            <TextInput
              style={styles.dateValueInput}
              value={day}
              onChangeText={(text) => {
                setDay(text);
                updateProfileData({
                  dateOfBirth: buildDateOfBirth(month, text, year),
                });
              }}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={styles.dateInput}>
            <Text style={styles.dateLabel}>year</Text>
            <TextInput
              style={styles.dateValueInput}
              value={year}
              onChangeText={(text) => {
                setYear(text);
                updateProfileData({
                  dateOfBirth: buildDateOfBirth(month, day, text),
                });
              }}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>

        {showMonthPicker && (
          <View style={styles.monthPicker}>
            <ScrollView>
              <View style={styles.monthGrid}>
                {MONTHS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={styles.monthOption}
                    onPress={() => {
                      setMonth(m);
                      setShowMonthPicker(false);
                      updateProfileData({
                        dateOfBirth: buildDateOfBirth(m, day, year),
                      });
                    }}
                  >
                    <Text style={styles.monthOptionText}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
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
        onClose={() => setShowVoiceOverlay(false)}
        contextFields={['dateOfBirth']}
        onResult={handleVoiceResult}
      />

      <ProfileExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onExit={handleExit}
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
    ...Typography.h3,
    fontFamily: Theme.fonts.bold,
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
  instruction: {
    ...Theme.typography.h2,
    color: Theme.colors.black,
    textAlign: 'center',
    marginBottom: 60,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    ...Typography.body,
    color: Theme.colors.grey,
    marginBottom: 5,
  },
  dateValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Theme.colors.grey,
    borderRadius: Theme.radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Theme.colors.white,
  },
  dateValue: {
    fontSize: 16,
    color: Theme.colors.black,
  },
  dateValueInput: {
    borderWidth: 1,
    borderColor: Theme.colors.grey,
    borderRadius: Theme.radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Theme.colors.black,
    backgroundColor: Theme.colors.white,
    height: 48,
  },
  monthPicker: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: Theme.colors.grey,
    borderRadius: Theme.radius.card,
    maxHeight: 220,
    backgroundColor: Theme.colors.white,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthOption: {
    width: '50%',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.grey,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.grey,
  },
  monthOptionText: {
    ...Typography.body,
    color: Theme.colors.darkGrey,
    textAlign: 'center',
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
    alignItems: 'center',
    backgroundColor: Theme.colors.orange,
    borderRadius: Theme.radius.button,
    ...Theme.padding.buttonLg,
    width: 234,
    height: 48,
  },
  nextButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
    textAlign: 'center',
  },
});
