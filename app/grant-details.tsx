import BottomNavigation from "@/components/BottomNavigation";
import ModalPopover from "@/components/ModalPopover";
import { evaluateGrantEligibility, getGrantById } from "@/constants/grants";
import { Theme } from "@/constants/theme";
import { useProfile } from "@/contexts/ProfileContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

type ChipProps = {
  label: string;
  iconName: IconName;
  iconBg: string;
  onPress?: () => void;
};

function Chip({ label, iconName, iconBg, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        chipStyles.container,
        pressed && chipStyles.pressed,
      ]}
    >
      <View style={chipStyles.content}>
        <View style={[chipStyles.iconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={16} color="#fff" />
        </View>

        <View style={chipStyles.labelWrap}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={chipStyles.label}>
            {label}
          </Text>
        </View>
        <View style={chipStyles.chevWrap}>
          <Ionicons
            name="chevron-forward-outline"
            size={12}
            color={Theme.colors.black}
          />
        </View>
      </View>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.lightGrey,
    borderRadius: Theme.radius.card,
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    width: "100%",
    overflow: "hidden",
    flexShrink: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    width: "100%",
    backgroundColor: Theme.colors.lightGrey,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 14,
  },
  pressed: { opacity: 0.95 },
  iconCircle: {
    width: 25,
    height: 25,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  chevWrap: {
    width: 18,
    height: 45,
    alignItems: "flex-end",
    justifyContent: "center",
    flexShrink: 0,
  },

  labelWrap: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    marginRight: 6,
  },
  label: {
    ...Theme.typography.body,
    color: Theme.colors.black,
  },
  
});

type ChipItem = {
  key: string;
  label: string;
  icon: IconName;
  bg: string;
};

export default function GrantDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; saved?: string }>();
  const { profileData } = useProfile();
  const grant = getGrantById(params.id);
  const [open, setOpen] = useState<string | null>(null);
  const close = () => setOpen(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(params.saved === "true");

  const eligibility = useMemo(
    () => (grant ? evaluateGrantEligibility(grant, profileData) : undefined),
    [grant, profileData]
  );

  const chipItems: ChipItem[] = useMemo(() => {
    if (!grant) return [];
    const chips: ChipItem[] = [
      {
        key: "eligible",
        label: eligibility?.eligible ? "You’re eligible" : "See requirements",
        icon: eligibility?.eligible
          ? "checkmark-circle-outline"
          : "alert-circle-outline",
        bg: eligibility?.eligible ? Theme.colors.blue : Theme.colors.orange,
      },
    ];
    grant.detailFacts.forEach((fact) => {
      chips.push({
        key: fact.id,
        label: fact.label,
        icon: (fact.icon as IconName) ?? "information-circle-outline",
        bg: fact.bg,
      });
    });
    return chips;
  }, [grant, eligibility]);

  const renderItem = ({ item }: ListRenderItemInfo<ChipItem>) => (
    <View style={styles.gridItem}>
      <Chip
        label={item.label}
        iconName={item.icon}
        iconBg={item.bg}
        onPress={() => setOpen(item.key)}
      />
    </View>
  );

  if (!grant) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
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
            <Text style={styles.title}>Grant details unavailable</Text>
            <Text style={Theme.typography.body}>
              We couldn’t find this grant. Please head back to the grants tab
              and try again.
            </Text>
          </View>
        </ScrollView>
        <BottomNavigation activeTab="grants" />
      </SafeAreaView>
    );
  }

  const missingRequirements = eligibility?.unmetRequirements ?? [];
  const modalFact = grant.detailFacts.find((fact) => fact.id === open);
  const modalTitle =
    open === "eligible"
      ? eligibility?.eligible
        ? "You’re eligible"
        : "Requirements to review"
      : modalFact?.label ?? "Grant details";
  const modalLines =
    open === "eligible"
      ? eligibility?.eligible
        ? [
            "Your profile matches the requirements we track. Confirm everything in the grant portal before submitting.",
          ]
        : [
            "Add the following to your profile:",
            ...missingRequirements.map((req) => `• ${req.label}`),
          ]
      : modalFact?.details ?? grant.notes;
  const modalIconName =
    open === "eligible"
      ? eligibility?.eligible
        ? "checkmark-circle"
        : "alert-circle-outline"
      : (modalFact?.icon as IconName) ?? "information-circle-outline";
  const modalIconBg =
    open === "eligible"
      ? eligibility?.eligible
        ? Theme.colors.blue
        : Theme.colors.orange
      : modalFact?.bg ?? Theme.colors.purple;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
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
            <TouchableOpacity
              onPress={() => setIsSaved((prev) => !prev)}
              hitSlop={10}
              accessibilityRole="button"
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={isSaved ? Theme.colors.brightPurple : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{grant.title}</Text>

          <FlatList
            data={chipItems}
            keyExtractor={(it) => it.key}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
              gap: 6,
              marginBottom: 8,
            }}
            scrollEnabled={false}
          />

          <View style={{ marginBottom: 28, marginTop: 19 }}>
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
                {isDescriptionExpanded
                  ? grant.fullDescription
                  : grant.description}
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
                    {isDescriptionExpanded ? "Show less" : "Show more"}
                  </Text>
                  <Ionicons
                    name={
                      isDescriptionExpanded
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                    size={16}
                    color={Theme.colors.grey}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={styles.strong}>
              {eligibility?.eligible
                ? "You are a strong candidate."
                : "Complete your profile to qualify."}
            </Text>
            <Text style={styles.sub}>
              {eligibility?.eligible
                ? "Everything we track looks good. Double-check the portal for any grant-specific forms."
                : missingRequirements.length > 0
                ? `Add: ${missingRequirements
                    .map((req) => req.label)
                    .join(", ")}`
                : "Update your profile to unlock a tailored eligibility check."}
            </Text>
          </View>

          <Pressable
            style={styles.cta}
            onPress={() =>
              router.push({
                pathname: "/grant-saved-apply",
                params: { id: grant.id },
              })
            }
          >
            <Text style={styles.ctaText}>Get started</Text>
          </Pressable>
        </View>
      </ScrollView>

      <ModalPopover
        visible={!!open}
        onClose={close}
        title={modalTitle}
        titleIconName={modalIconName}
        titleIconBg={modalIconBg}
        titleIconColor="#FFFFFF"
        lines={modalLines}
      />

      <BottomNavigation activeTab="grants" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.black,
    marginBottom: 22,
  },
  gridItem: {
    flex: 1,
  },
  strong: {
    textAlign: "center",
    ...Theme.typography.subhead1,
    color: Theme.colors.purple,
    marginBottom: 10,
  },
  sub: {
    textAlign: "center",
    ...Theme.typography.body,
    color: Theme.colors.lightOrange,
    marginBottom: 10,
  },
  cta: {
    backgroundColor: Theme.colors.orange,
    borderRadius: Theme.radius.button,
    ...Theme.padding.buttonLg,
      marginTop: 10,
  },
  ctaText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
    textAlign: "center",
  },
});
