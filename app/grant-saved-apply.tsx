import BottomNavigation from '@/components/BottomNavigation';
import { getGrantById } from '@/constants/grants';
import { Theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const buildKey = (prefix: string, index: number) => `${prefix}-${index}`;

export default function GrantSavedApplyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const grant = getGrantById(params.id);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<{
    [key: string]: boolean;
  }>({
    step1: true,
    step2: false,
    step3: false,
    step4: false,
  });
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const eligibilityChecks = grant?.apply.eligibilityChecks ?? [];
  const requiredDocuments = grant?.apply.requiredDocuments ?? [];
  const tips = grant?.apply.tips ?? [];

  const isStep1Complete =
    eligibilityChecks.length > 0 &&
    eligibilityChecks.every(
      (_, index) => checkedItems[buildKey('eligibility', index)]
    );
  const isStep2Complete =
    requiredDocuments.length > 0 &&
    requiredDocuments.every(
      (_, index) => checkedItems[buildKey('document', index)]
    );

  const toggleStepExpansion = (stepKey: string) => {
    setExpandedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  const toggleCheckbox = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplicationResult = (
    result: 'approved' | 'pending' | 'rejected'
  ) => {
    console.log('Application result:', result);
  };

  const handlePortalPress = () => {
    const url = grant?.apply.portal.url;
    if (url) {
      Linking.openURL(url).catch(() => {
        console.log('Unable to open portal URL');
      });
    }
  };

  if (!grant) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 24,
            paddingTop: Theme.spacing.md,
          }}
        >
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back-outline" size={22} color="#000" />
              </TouchableOpacity>
            </View>
            <Text
              style={[
                Theme.typography.h2,
                { color: Theme.colors.black, marginBottom: 12 },
              ]}
            >
              Grant steps unavailable
            </Text>
            <Text style={Theme.typography.body}>
              We couldn’t find this grant. Please return to the grants tab and
              try again.
            </Text>
          </View>
        </ScrollView>
        <BottomNavigation activeTab="grants" />
      </SafeAreaView>
    );
  }

  const descriptionBody = isDescriptionExpanded
    ? grant.fullDescription
    : grant.description;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          paddingTop: Theme.spacing.md,
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="bookmark-outline" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View>
            <Text
              style={[
                Theme.typography.h2,
                { color: Theme.colors.black, marginBottom: 12 },
              ]}
            >
              {grant.title}
            </Text>
          </View>

          <View style={{ marginBottom: 30 }}>
            <View
              style={{
                backgroundColor: Theme.colors.lightPurple,
                borderRadius: Theme.radius.card,
                paddingTop: 30,
                paddingHorizontal: 19,
                paddingBottom: Theme.spacing.md,
              }}
            >
              <Text
                style={[Theme.typography.body, { color: Theme.colors.black }]}
              >
                {descriptionBody}
              </Text>
              <TouchableOpacity
                onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2"
              >
                <View className="flex-row items-center justify-end">
                  <Text
                    style={[
                      Theme.typography.label,
                      { color: Theme.colors.grey, marginRight: 5 },
                    ]}
                  >
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </Text>
                  <Ionicons
                    name={
                      isDescriptionExpanded
                        ? 'chevron-up-outline'
                        : 'chevron-down-outline'
                    }
                    size={16}
                    color={Theme.colors.grey}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 40 }}>
            <TouchableOpacity
              style={{
                backgroundColor: Theme.colors.orange,
                borderRadius: Theme.radius.button,
                ...Theme.padding.buttonLg,
              }}
              onPress={() =>
                router.push({
                  pathname: '/generated-application',
                  params: { id: grant.id },
                })
              }
            >
              <Text
                style={[
                  Theme.typography.button,
                  { color: Theme.colors.black, textAlign: 'center' },
                ]}
              >
                Generate my application
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 28 }}>
            <Text
              style={[
                Theme.typography.h2,
                { color: Theme.colors.black, marginBottom: Theme.spacing.md },
              ]}
            >
              Progress tracker
            </Text>

            <View style={{ marginBottom: Theme.spacing.md }}>
              <View style={styles.progressCard}>
                <TouchableOpacity
                  style={styles.progressCardItem}
                  onPress={() => toggleStepExpansion('step1')}
                >
                  <View style={styles.progressCardItemContent}>
                    <View
                      style={[
                        styles.checkIcon,
                        {
                          backgroundColor: isStep1Complete
                            ? Theme.colors.purple
                            : Theme.colors.grey,
                        },
                      ]}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                    <View style={styles.progressCardText}>
                      <Text style={styles.stepText}>Step 1</Text>
                      <Text style={styles.stepTitle}>Check eligibility</Text>
                    </View>
                  </View>
                  <View style={styles.chevronContainer}>
                    <Ionicons
                      name={
                        expandedSteps.step1
                          ? 'chevron-up-outline'
                          : 'chevron-down-outline'
                      }
                      size={16}
                      color={Theme.colors.black}
                    />
                  </View>
                </TouchableOpacity>

                {expandedSteps.step1 && (
                  <View>
                    <View style={styles.progressCheckContent}>
                      {eligibilityChecks.map((label, index) => {
                        const key = buildKey('eligibility', index);
                        return (
                          <TouchableOpacity
                            key={key}
                            style={styles.progressCheckItem}
                            onPress={() => toggleCheckbox(key)}
                          >
                            <View
                              className="w-[20px] h-[20px] border-[1px] mr-[20px] items-center justify-center"
                              style={{
                                backgroundColor: checkedItems[key]
                                  ? Theme.colors.purple
                                  : 'transparent',
                                borderColor: Theme.colors.purple,
                              }}
                            >
                              {checkedItems[key] && (
                                <Ionicons
                                  name="checkmark"
                                  size={14}
                                  color={Theme.colors.white}
                                />
                              )}
                            </View>
                            <View style={styles.progressCheckLabel}>
                              <Text style={styles.progressCheckText}>
                                {label}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                      {tips.length > 0 && (
                        <View style={{ marginTop: 4 }}>
                          {tips.map((tip, index) => (
                            <Text
                              key={`tip-${index}`}
                              style={[
                                Theme.typography.body,
                                { color: Theme.colors.grey },
                              ]}
                            >
                              • {tip}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={{ marginBottom: Theme.spacing.md }}>
              <View style={styles.progressCard}>
                <TouchableOpacity
                  style={styles.progressCardItem}
                  onPress={() => toggleStepExpansion('step2')}
                >
                  <View style={styles.progressCardItemContent}>
                    <View
                      style={[
                        styles.checkIcon,
                        {
                          backgroundColor: isStep2Complete
                            ? Theme.colors.purple
                            : Theme.colors.grey,
                        },
                      ]}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                    <View style={styles.progressCardText}>
                      <Text style={styles.stepText}>Step 2</Text>
                      <Text style={styles.stepTitle}>Gather documents</Text>
                    </View>
                  </View>
                  <View style={styles.chevronContainer}>
                    <Ionicons
                      name={
                        expandedSteps.step2
                          ? 'chevron-up-outline'
                          : 'chevron-down-outline'
                      }
                      size={16}
                      color={Theme.colors.black}
                    />
                  </View>
                </TouchableOpacity>

                {expandedSteps.step2 && (
                  <View>
                    <View style={styles.progressCheckContent}>
                      {requiredDocuments.map((label, index) => {
                        const key = buildKey('document', index);
                        return (
                          <TouchableOpacity
                            key={key}
                            style={styles.progressCheckItem}
                            onPress={() => toggleCheckbox(key)}
                          >
                            <View
                              className="w-[20px] h-[20px] border-[1px] mr-[20px] items-center justify-center"
                              style={{
                                backgroundColor: checkedItems[key]
                                  ? Theme.colors.purple
                                  : 'transparent',
                                borderColor: Theme.colors.purple,
                              }}
                            >
                              {checkedItems[key] && (
                                <Ionicons
                                  name="checkmark"
                                  size={14}
                                  color={Theme.colors.white}
                                />
                              )}
                            </View>
                            <View style={styles.progressCheckLabel}>
                              <Text style={styles.progressCheckText}>
                                {label}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={{ marginBottom: Theme.spacing.md }}>
              <View style={styles.progressCard}>
                <TouchableOpacity
                  style={styles.progressCardItem}
                  onPress={() => toggleStepExpansion('step3')}
                >
                  <View style={styles.progressCardItemContent}>
                    <View
                      style={{
                        backgroundColor: Theme.colors.grey,
                        borderRadius: 50,
                        width: 25,
                        height: 25,
                        marginRight: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                    <View style={styles.progressCardText}>
                      <Text style={styles.stepText}>Step 3</Text>
                      <Text style={styles.stepTitle}>Submit application</Text>
                    </View>
                  </View>
                  <View style={styles.chevronContainer}>
                    <Ionicons
                      name={
                        expandedSteps.step3
                          ? 'chevron-up-outline'
                          : 'chevron-down-outline'
                      }
                      size={16}
                      color={Theme.colors.black}
                    />
                  </View>
                </TouchableOpacity>

                {expandedSteps.step3 && (
                  <View>
                    <View style={styles.progressCheckContent}>
                      <Text style={styles.progressCheckText}>
                        {grant.apply.portal.instructions}
                      </Text>
                      <TouchableOpacity
                        style={{
                          backgroundColor: Theme.colors.green,
                          borderRadius: Theme.radius.card,
                          paddingTop: 25,
                          paddingBottom: 25,
                          paddingLeft: 16,
                          paddingRight: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 10,
                        }}
                        onPress={handlePortalPress}
                      >
                        <Text
                          style={[
                            Theme.typography.body,
                            { color: Theme.colors.black },
                          ]}
                        >
                          {grant.apply.portal.label || 'Apply here'}
                        </Text>
                        <Ionicons name="open-outline" size={20} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={{ marginBottom: Theme.spacing.md }}>
              <View style={styles.progressCard}>
                <TouchableOpacity
                  style={styles.progressCardItem}
                  onPress={() => toggleStepExpansion('step4')}
                >
                  <View style={styles.progressCardItemContent}>
                    <View
                      style={{
                        backgroundColor: Theme.colors.grey,
                        borderRadius: 50,
                        width: 25,
                        height: 25,
                        marginRight: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                    <View style={styles.progressCardText}>
                      <Text style={styles.stepText}>Step 4</Text>
                      <Text style={styles.stepTitle}>Wait for results</Text>
                    </View>
                  </View>
                  <View style={styles.chevronContainer}>
                    <Ionicons
                      name={
                        expandedSteps.step4
                          ? 'chevron-up-outline'
                          : 'chevron-down-outline'
                      }
                      size={16}
                      color={Theme.colors.black}
                    />
                  </View>
                </TouchableOpacity>

                {expandedSteps.step4 && (
                  <View>
                    <View style={styles.progressCheckContent}>
                      <Text style={styles.progressCheckText}>
                        Did your application get approved? Let us know!
                      </Text>
                      <View
                        style={{
                          flexDirection: 'column',
                          gap: Theme.spacing.md,
                          paddingLeft: 80,
                          paddingRight: 80,
                          marginTop: 5,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: Theme.colors.green,
                            borderRadius: Theme.radius.button,
                            flex: 1,
                            ...Theme.padding.buttonSm,
                          }}
                          onPress={() => handleApplicationResult('approved')}
                        >
                          <Text
                            style={[
                              Theme.typography.button,
                              {
                                color: Theme.colors.black,
                                textAlign: 'center',
                              },
                            ]}
                          >
                            Approved
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: Theme.colors.yellow,
                            borderRadius: Theme.radius.button,
                            flex: 1,
                            ...Theme.padding.buttonSm,
                          }}
                          onPress={() => handleApplicationResult('pending')}
                        >
                          <Text
                            style={[
                              Theme.typography.button,
                              {
                                color: Theme.colors.black,
                                textAlign: 'center',
                              },
                            ]}
                          >
                            Pending
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: Theme.colors.red,
                            borderRadius: Theme.radius.button,
                            flex: 1,
                            ...Theme.padding.buttonSm,
                          }}
                          onPress={() => handleApplicationResult('rejected')}
                        >
                          <Text
                            style={[
                              Theme.typography.button,
                              {
                                color: Theme.colors.black,
                                textAlign: 'center',
                              },
                            ]}
                          >
                            Rejected
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation activeTab="grants" />
    </SafeAreaView>
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
    marginBottom: 12,
  },
  progressCard: {
    borderColor: Theme.colors.purpleStroke,
    borderWidth: 0.5,
    borderRadius: Theme.radius.card,
    overflow: 'hidden',
    ...Theme.shadow.cardShadow,
  },
  progressCardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 15,
    paddingLeft: 21,
    paddingRight: 21,
    paddingBottom: 13,
  },
  progressCardItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  progressCardText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  checkIcon: {
    backgroundColor: Theme.colors.purple,
    borderRadius: 50,
    width: 25,
    height: 25,
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  stepText: {
    color: Theme.colors.black,
    ...Theme.typography.body,
    marginBottom: 4,
  },
  stepTitle: {
    color: Theme.colors.black,
    ...Theme.typography.subhead1,
    marginBottom: 6,
  },
  progressCheckContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    paddingTop: 13,
    paddingLeft: 24,
    paddingRight: 32,
    paddingBottom: 28,
  },
  progressCheckText: {
    color: Theme.colors.black,
    ...Theme.typography.body,
  },
  progressCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCheckLabel: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  chevronContainer: {
    alignSelf: 'center',
  },
});
