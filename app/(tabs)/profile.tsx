import ProfileProgressCard from '@/components/ProfileProgressCard';
import ProfileSectionCard from '@/components/ProfileSectionCard';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  DevSettings,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { RetrieveResponse } from 'roughlyai';
const SMIGGS = require('@/assets/images/smiggs.png');
interface ProfileFieldProps {
  label: string;
  value: string;
}

function ProfileField({ label, value }: ProfileFieldProps) {
  const isEmpty = value === 'Empty...';
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text
        style={[
          styles.fieldValue,
          isEmpty ? styles.emptyValue : styles.filledValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profileData, updateProfileData } = useProfile();
  const [isProcessing, setIsProcessing] = useState(false);
  const dotOffsets = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(0))
  ).current;
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      dotOffsets.forEach((val) => val.setValue(0));
      return;
    }

    // Lightweight bounce animation for the three loading dots while uploads run.
    const animateDot = (index: number) => {
      Animated.sequence([
        Animated.timing(dotOffsets[index], {
          toValue: -6,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dotOffsets[index], {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    animateDot(0);
    const interval = setInterval(() => {
      setActiveDot((prev) => {
        const next = (prev + 1) % dotOffsets.length;
        animateDot(next);
        return next;
      });
    }, 420);

    return () => {
      clearInterval(interval);
    };
  }, [isProcessing, dotOffsets]);

  const displayValue = (value: string) => value || 'Empty...';
  const { width } = useWindowDimensions();
  const stackHeaderButtons = width < 480;

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // any file type
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('User canceled document picker');

        return;
      }

      const file = result.assets[0];
      setIsProcessing(true);

      // 1) Ask our Lambda for a presigned PUT URL
      console.log('Selected file:', file);
      const _resp = await fetch(
        'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'upload',
            project_name: 'Scaffold',
            filename: file.name.toLocaleLowerCase(),
          }),
        }
      );
      if (!_resp.ok) {
        throw new Error(`Failed to fetch presigned URL.`);
      }

      const uploadUrl: any = JSON.parse(await _resp.json());
      console.log('what is url', uploadUrl);
      if (!uploadUrl?.url[0]) {
        throw new Error(`Invalid presigned URL.`);
      }

      // 2) PUT the file blob to S3 with that URL
      const fileUri = file.uri ?? file.uri;

      const resp = await fetch(fileUri);
      const fileBlob = await resp.blob();

      console.log('what is happening', uploadUrl.url[0]);
      const uploadResponse = await fetch(uploadUrl.url[0], {
        method: 'PUT',
        headers: {
          'Content-Type':
            file.mimeType ||
            (file.mimeType as string) ||
            'application/octet-stream',
        },
        body: fileBlob,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload the file to S3.`);
      }

      // 3) Trigger training so the doc is indexed before extraction
      const _resp_train = await fetch(
        'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'train',
            project_name: 'Scaffold',
          }),
        }
      );

      if (!_resp_train.ok) {
        throw new Error(`Failed to fetch presigned URL.`);
      }

      const trainUrl: any = JSON.parse(await _resp_train.json());
      console.log('what is train url', trainUrl.url);
      if (!trainUrl?.url) {
        throw new Error(`Invalid presigned URL.`);
      }

      const _trained = await RetrieveResponse(trainUrl.url);

      if (!_trained) {
        throw new Error(`Training failed.`);
      }

      // 4) Prompt the trained doc to pull structured profile fields back into state
      const _prompt = await fetch(
        'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
        {
          method: 'POST',
          body: JSON.stringify({
            project_name: 'Scaffold',
            prompt: `From the document "${file.name}", extract every detail that can populate the profile. Respond ONLY with JSON (no prose) that matches {"first_name":string,"last_name":string,"email":string,"phone":string,"address":string,"postal_code":string,"province":string,"date_of_birth":string,"gender":string,"citizenship_status":string,"household_size":string,"family_composition":string,"annual_family_net_income":string,"guardian_name":string,"guardian_phone":string,"guardian_email":string,"highest_education":string,"school_name":string,"graduation_date":string,"trade_school_name":string,"trade_program_name":string,"trade_graduation_date":string,"trade":string,"apprenticeship_level":string}. When identifying apprenticeship_level, return the exact level label mentioned (e.g., "Level 1", "Level 2", "Level 3", "Level 4", or "Red Seal"). Use empty strings when a value cannot be found.`,
          }),
        }
      );

      if (!_prompt.ok) {
        throw new Error(`Failed to fetch presigned URL.`);
      }

      const _promptUrl: any = JSON.parse(await _prompt.json());
      console.log('what is prompt url', _promptUrl.url);

      if (!_promptUrl?.url) {
        throw new Error(`Invalid presigned URL.`);
      }

      const _prompt_response: any = await RetrieveResponse(_promptUrl.url);

      const answerRaw = _prompt_response?.answer;
      let parsedAnswer: Record<string, string> | null = null;
      try {
        if (typeof answerRaw === 'string') {
          parsedAnswer = JSON.parse(answerRaw);
        } else if (answerRaw && typeof answerRaw === 'object') {
          parsedAnswer = answerRaw;
        }
      } catch (parseError) {
        console.error('Failed to parse extracted profile info', parseError);
      }

      if (parsedAnswer) {
        const pickValue = (...values: unknown[]) => {
          for (const value of values) {
            if (value !== undefined && value !== null) {
              return typeof value === 'string'
                ? value.trim()
                : String(value).trim();
            }
          }
          return '';
        };
        const normalizeApprenticeshipLevel = (value: string) => {
          const lower = value.toLowerCase();
          if (!lower) return '';
          if (lower.includes('journeyman') || lower.includes('red seal')) {
            return 'Journeyman';
          }
          if (
            lower.includes('fourth') ||
            lower.includes('level 4') ||
            lower.includes('4th')
          ) {
            return 'Fourth Year Apprentice';
          }
          if (
            lower.includes('third') ||
            lower.includes('level 3') ||
            lower.includes('3rd')
          ) {
            return 'Third Year Apprentice';
          }
          if (
            lower.includes('second') ||
            lower.includes('level 2') ||
            lower.includes('2nd')
          ) {
            return 'Second Year Apprentice';
          }
          if (
            lower.includes('first') ||
            lower.includes('level 1') ||
            lower.includes('1st')
          ) {
            return 'First Year Apprentice';
          }
          return value;
        };

        const first = pickValue(
          parsedAnswer.first_name,
          parsedAnswer.firstName
        );
        const last = pickValue(parsedAnswer.last_name, parsedAnswer.lastName);
        const school = pickValue(
          parsedAnswer.school_name,
          parsedAnswer.schoolName,
          parsedAnswer.high_school_name,
          parsedAnswer.highSchoolName
        );
        const email = pickValue(parsedAnswer.email);
        const phone = pickValue(
          parsedAnswer.phone,
          parsedAnswer.phone_number,
          parsedAnswer.phoneNumber
        );
        const address = pickValue(
          parsedAnswer.address,
          parsedAnswer.residential_address
        );
        const postal = pickValue(
          parsedAnswer.postal_code,
          parsedAnswer.postalCode
        );
        const province = pickValue(
          parsedAnswer.province,
          parsedAnswer.state,
          parsedAnswer.province_state
        );
        const dateOfBirth = pickValue(
          parsedAnswer.date_of_birth,
          parsedAnswer.dateOfBirth,
          parsedAnswer.dob
        );
        const gender = pickValue(parsedAnswer.gender);
        const citizenshipStatus = pickValue(
          parsedAnswer.citizenship_status,
          parsedAnswer.citizenshipStatus,
          parsedAnswer.status
        );
        const householdSize = pickValue(
          parsedAnswer.household_size,
          parsedAnswer.householdSize
        );
        const familyComposition = pickValue(
          parsedAnswer.family_composition,
          parsedAnswer.familyComposition
        );
        const annualIncome = pickValue(
          parsedAnswer.annual_family_net_income,
          parsedAnswer.annualFamilyNetIncome,
          parsedAnswer.annual_income
        );
        const guardianName = pickValue(
          parsedAnswer.guardian_name,
          parsedAnswer.guardianName
        );
        const guardianPhone = pickValue(
          parsedAnswer.guardian_phone,
          parsedAnswer.guardianPhone
        );
        const guardianEmail = pickValue(
          parsedAnswer.guardian_email,
          parsedAnswer.guardianEmail
        );
        const highestEducation = pickValue(
          parsedAnswer.highest_education,
          parsedAnswer.highestEducation
        );
        const graduationDate = pickValue(
          parsedAnswer.graduation_date,
          parsedAnswer.graduationDate
        );
        const tradeSchoolName = pickValue(
          parsedAnswer.trade_school_name,
          parsedAnswer.tradeSchoolName
        );
        const tradeProgramName = pickValue(
          parsedAnswer.trade_program_name,
          parsedAnswer.tradeProgramName
        );
        const tradeGraduationDate = pickValue(
          parsedAnswer.trade_graduation_date,
          parsedAnswer.tradeGraduationDate
        );
        const tradeField = pickValue(parsedAnswer.trade);
        const apprenticeshipLevelRaw = pickValue(
          parsedAnswer.apprenticeship_level,
          parsedAnswer.apprenticeshipLevel
        );
        const apprenticeshipLevel = normalizeApprenticeshipLevel(
          apprenticeshipLevelRaw
        );

        const updates: Record<string, string> = {};
        const fullName = [first, last].filter(Boolean).join(' ').trim();
        if (fullName) updates.name = fullName;
        if (school) updates.highSchoolName = school;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (address) updates.address = address;
        if (postal) updates.postalCode = postal;
        if (province) updates.province = province;
        if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
        if (gender) updates.gender = gender;
        if (citizenshipStatus) updates.citizenshipStatus = citizenshipStatus;
        if (householdSize) updates.householdSize = householdSize;
        if (familyComposition) updates.familyComposition = familyComposition;
        if (annualIncome) updates.annualFamilyNetIncome = annualIncome;
        if (guardianName) updates.guardianName = guardianName;
        if (guardianPhone) updates.guardianPhone = guardianPhone;
        if (guardianEmail) updates.guardianEmail = guardianEmail;
        if (highestEducation) updates.highestEducation = highestEducation;
        if (graduationDate) updates.graduationDate = graduationDate;
        if (tradeSchoolName) updates.tradeSchoolName = tradeSchoolName;
        if (tradeProgramName) updates.tradeProgramName = tradeProgramName;
        if (tradeGraduationDate)
          updates.tradeGraduationDate = tradeGraduationDate;
        if (tradeField) updates.trade = tradeField;
        if (apprenticeshipLevel)
          updates.apprenticeshipLevel = apprenticeshipLevel;

        if (Object.keys(updates).length) {
          updateProfileData(updates);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(
        'Upload failed',
        "We couldn't process that document. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const startEditingField = (field: ProfileFieldKey) => {
    setEditingField(field);
    setDraftValue(profileData[field] ?? '');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setDraftValue('');
  };

  const saveEditingField = (field: ProfileFieldKey) => {
    const nextValue = draftValue.trim();
    updateProfileData({
      [field]: nextValue,
    } as Partial<typeof profileData>);
    cancelEditing();
  };

  // Calculate completion counts
  const basicProfileComplete = useMemo(() => {
    const fields = [
      profileData.name,
      profileData.dateOfBirth,
      profileData.gender,
      profileData.phone,
      profileData.email,
    ];
    const filled = fields.filter((f) => f).length;
    return { filled, total: 5, count: `${filled}/5` };
  }, [profileData]);

  const residenceComplete = useMemo(() => {
    const fields = [
      profileData.address,
      profileData.postalCode,
      profileData.province,
      profileData.citizenshipStatus,
    ];
    const filled = fields.filter((f) => f).length;
    return { filled, total: 4, count: `${filled}/4` };
  }, [profileData]);

  const householdComplete = useMemo(() => {
    const fields = [
      profileData.householdSize,
      profileData.familyComposition,
      profileData.annualFamilyNetIncome,
      profileData.guardianName,
      profileData.guardianPhone,
      profileData.guardianEmail,
    ];
    const filled = fields.filter((f) => f).length;
    return { filled, total: 6, count: `${filled}/6` };
  }, [profileData]);

  const educationComplete = useMemo(() => {
    const fields = [
      profileData.highestEducation,
      profileData.highSchoolName,
      profileData.graduationDate,
      profileData.tradeSchoolName,
      profileData.tradeProgramName,
      profileData.tradeGraduationDate,
      profileData.trade,
      profileData.apprenticeshipLevel,
    ];
    const filled = fields.filter((f) => f).length;
    return { filled, total: 8, count: `${filled}/8` };
  }, [profileData]);

  // Calculate overall progress percentage
  const overallProgress = useMemo(() => {
    const totalFields = 5 + 4 + 6 + 8; // 23 total fields
    const filledFields =
      basicProfileComplete.filled +
      residenceComplete.filled +
      householdComplete.filled +
      educationComplete.filled;
    return Math.round((filledFields / totalFields) * 100);
  }, [
    basicProfileComplete,
    residenceComplete,
    householdComplete,
    educationComplete,
  ]);

  const startSectionEdit = (
    section: 'basic' | 'residence' | 'household' | 'education'
  ) => {
    const sectionRoutes: Record<typeof section, string> = {
      basic: '/basic-profile-name',
      residence: '/residence-address',
      household: '/household-size',
      education: '/education-background',
    };
    router.push({
      pathname: sectionRoutes[section],
      params: { mode: `edit-${section}`, returnTo: '/(tabs)/profile' },
    });
  };

  const handleEditBasicProfile = () => startSectionEdit('basic');
  const handleEditResidence = () => startSectionEdit('residence');
  const handleEditHousehold = () => startSectionEdit('household');
  const handleEditEducation = () => startSectionEdit('education');

  const openProfilePicture = () => {
    router.push('/profile-picture?source=profile');
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      await signOut();
      if (DevSettings.reload) {
        DevSettings.reload();
      } else {
        router.replace('/sign-in');
      }
    } catch (error) {
      console.error('Logout failed to reload app', error);
      router.replace('/sign-in');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profilePictureWrapper}>
            <TouchableOpacity
              style={styles.profilePictureContainer}
              activeOpacity={0.85}
              onPress={openProfilePicture}
            >
              {profileData.profileImageUri ? (
                <Image
                  source={{ uri: profileData.profileImageUri }}
                  style={styles.profilePicture}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person" size={48} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraIcon}
              onPress={openProfilePicture}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.profileName,
              profileData.name && styles.profileNameFilled,
            ]}
          >
            {profileData.name || 'User Name'}
          </Text>

          {/* Buttons */}
          <View style={styles.documentsRow}>
            <TouchableOpacity
              style={[styles.documentsButton, styles.documentsButtonFullWidth]}
              onPress={() => router.push('/documents')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="folder-outline"
                size={20}
                color="#6E5BDE"
                style={styles.documentsButtonIcon}
              />
              <Text style={styles.documentsButtonText}>Documents</Text>
              <Ionicons name="chevron-forward" size={20} color="#6E5BDE" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Progress */}
        <View style={styles.progressSection}>
          <ProfileProgressCard percent={overallProgress} />
        </View>

        {/* Profile Sections */}
        <View style={styles.sectionsContainer}>
          {/* Basic Profile */}
          <ProfileSectionCard
            title="Basic Profile"
            completed={
              basicProfileComplete.filled === basicProfileComplete.total
            }
            completionCount={basicProfileComplete.count}
            onEdit={handleEditBasicProfile}
          >
            <ProfileField
              label="Name:"
              value={displayValue(profileData.name)}
            />
            <ProfileField
              label="Date of birth:"
              value={displayValue(profileData.dateOfBirth)}
            />
            <ProfileField
              label="Gender:"
              value={displayValue(profileData.gender)}
            />
            <ProfileField
              label="Phone:"
              value={displayValue(profileData.phone)}
            />
            <ProfileField
              label="Email:"
              value={displayValue(profileData.email)}
            />
          </ProfileSectionCard>

          {/* Residence Information */}
          <ProfileSectionCard
            title="Residence information"
            completed={residenceComplete.filled === residenceComplete.total}
            completionCount={residenceComplete.count}
            onEdit={handleEditResidence}
          >
            <ProfileField
              label="Address:"
              value={displayValue(profileData.address)}
            />
            <ProfileField
              label="Postal Code:"
              value={displayValue(profileData.postalCode)}
            />
            <ProfileField
              label="Province:"
              value={displayValue(profileData.province)}
            />
            <ProfileField
              label="Citizenship status:"
              value={displayValue(profileData.citizenshipStatus)}
            />
          </ProfileSectionCard>

          {/* Household Information */}
          <ProfileSectionCard
            title="Household information"
            completed={householdComplete.filled === householdComplete.total}
            completionCount={householdComplete.count}
            onEdit={handleEditHousehold}
          >
            <ProfileField
              label="Household size:"
              value={displayValue(profileData.householdSize)}
            />
            <ProfileField
              label="Family composition:"
              value={displayValue(profileData.familyComposition)}
            />
            <ProfileField
              label="Annual Family Net Income:"
              value={displayValue(profileData.annualFamilyNetIncome)}
            />
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>
                Family/Guardian information:
              </Text>
              <ProfileField
                label="Name:"
                value={displayValue(profileData.guardianName)}
              />
              <ProfileField
                label="Phone:"
                value={displayValue(profileData.guardianPhone)}
              />
              <ProfileField
                label="Email:"
                value={displayValue(profileData.guardianEmail)}
              />
            </View>
          </ProfileSectionCard>

          {/* Education/Experience */}
          <ProfileSectionCard
            title="Education/Experience"
            completed={educationComplete.filled === educationComplete.total}
            completionCount={educationComplete.count}
            onEdit={handleEditEducation}
          >
            <ProfileField
              label="Highest level of Education:"
              value={displayValue(profileData.highestEducation)}
            />
            <ProfileField
              label="High School Name:"
              value={displayValue(profileData.highSchoolName)}
            />
            <ProfileField
              label="Graduation Date:"
              value={displayValue(profileData.graduationDate)}
            />
            <ProfileField
              label="Trade School Name:"
              value={displayValue(profileData.tradeSchoolName)}
            />
            <ProfileField
              label="Trade Program Name:"
              value={displayValue(profileData.tradeProgramName)}
            />
            <ProfileField
              label="Graduation Date:"
              value={displayValue(profileData.tradeGraduationDate)}
            />
            <ProfileField
              label="Trade:"
              value={displayValue(profileData.trade)}
            />
            <ProfileField
              label="Apprenticeship Level/Year:"
              value={displayValue(profileData.apprenticeshipLevel)}
            />
          </ProfileSectionCard>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
      {isProcessing && (
        <View style={styles.processingOverlay} pointerEvents="auto">
          <Text style={styles.processingTitle}>
            Your document is processing
          </Text>
          <Image source={SMIGGS} style={styles.smiggs} contentFit="contain" />
          <View style={styles.smiggsShadow} />
          <View style={styles.dotsRow}>
            {dotOffsets.map((offset, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    transform: [{ translateY: offset }],
                    backgroundColor:
                      index === activeDot ? Theme.colors.orange : '#CFCBFF',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  profilePictureWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePictureContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.lightPurple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.white,
    overflow: 'hidden',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  cameraIcon: {
    position: 'absolute',
    top: 65,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.brightPurple,
    shadowColor: '#00000040',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  profileName: {
    ...Theme.typography.h2,
    color: Theme.colors.black,
    marginBottom: 30,
  },
  profileNameFilled: {
    color: Theme.colors.brightPurple,
  },
  documentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  documentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DAD2FF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 14,
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  documentsButtonFullWidth: {
    width: '100%',
    flexBasis: '100%',
  },
  documentsButtonIcon: {
    marginRight: 4,
  },
  documentsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27252F',
    flex: 1,
  },
  progressSection: {
    paddingHorizontal: 20,
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 16,
    lineHeight: 20,
    color: Theme.colors.black,
    marginBottom: 4,
  },
  fieldValue: { ...Theme.typography.bodyBold },
  emptyValue: {
    ...Theme.typography.label,
    fontStyle: 'italic',
    color: Theme.colors.grey,
  },
  filledValue: {
    color: Theme.colors.brightPurple,
  },
  subsection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.grey,
  },
  subsectionTitle: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.darkGrey,
    marginBottom: 15,
  },
  continueButton: {
    backgroundColor: Theme.colors.orange,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
    borderRadius: Theme.radius.button,
    ...Theme.padding.buttonLg,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: Theme.colors.orange,
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: Theme.radius.button,
    ...Theme.padding.buttonLg,
    alignItems: 'center',
  },
  continueButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
    textAlign: 'center',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 32,
  },
  loadingArt: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smiggsShadow: {
    width: 120,
    height: 12,
    backgroundColor: '#D1D5DB',
    borderRadius: 999,
    marginBottom: 24,
    shadowColor: '#00000030',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingCharacter: {
    position: 'absolute',
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
