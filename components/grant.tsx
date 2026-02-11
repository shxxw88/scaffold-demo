import { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface GrantProps {
  id: string;
  title: string;
  organization: string;
  amount: string;
  deadline: string;
  category: string;
  description: string;
  eligible?: boolean;
  saved?: boolean;
  applied?: boolean;
  active?: boolean;
  onPress?: () => void;
  onView?: () => void;
  onSave?: () => void;
  onNavigateToApply?: () => void;
  imageUrl?: ImageSourcePropType;
}

export default function Grant({
  title,
  organization,
  amount,
  deadline,
  eligible = false,
  saved = false,
  onPress,
  onSave,
  onNavigateToApply,
  imageUrl,
}: GrantProps) {
  const amountValue = amount.replace(/^Up to\s*/i, "");
  const hasUpTo = /^up to/i.test(amount);
  const [logoFailed, setLogoFailed] = useState(false);
  const fallbackInitials = useMemo(() => {
    const source = organization || title;
    if (!source) return "?";
    const parts = source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "");
    return parts.join("") || "?";
  }, [organization, title]);
  const showFallback = !imageUrl || logoFailed;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        Theme.shadow.cardShadow,
        !eligible && { opacity: 0.75 },
      ]}
    >
      {/* Top: logo + bookmark */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.logo,
            {
              borderColor: showFallback ? "transparent" : Theme.colors.lightGrey,
              backgroundColor: !showFallback
                ? Theme.colors.white
                : eligible
                ? Theme.colors.orange
                : Theme.colors.lightGrey,
            },
          ]}
        >
          {!showFallback ? (
            <Image
              source={imageUrl}
              style={styles.logoImage}
              resizeMode="contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <Text style={styles.logoInitials}>{fallbackInitials}</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onSave?.();
          }}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={saved ? Theme.colors.brightPurple : Theme.colors.grey}
          />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text
        style={[
          Theme.typography.subhead1,
          { color: eligible ? Theme.colors.black : Theme.colors.grey },
          styles.title,
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>

      {/* Amount + Deadline */}
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <Ionicons name="calendar-outline" size={16} color={Theme.colors.darkGrey} />
            <Text style={[Theme.typography.label, styles.metaText]}>{deadline}</Text>

            <View style={styles.metaSep} />

            <Text style={Theme.typography.label}>
              {hasUpTo && (
                <Text style={{ color: Theme.colors.black }}>Up to </Text>
              )}
              <Text
                style={{
                  color: Theme.colors.brightPurple,
                  fontFamily: Theme.fonts.bold,
                  fontSize: 15,
                }}
              >
                {amountValue}
              </Text>
            </Text>
          </View>
        </View>

      {/* thin divider under meta row */}
        <View style={styles.metaDivider} />

      {/* Bottom: eligibility + view */}
      <View style={styles.bottomRow}>
        <View style={styles.eligibility}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: eligible ? Theme.colors.green : Theme.colors.red },
            ]}
          >
            <Ionicons
              name={eligible ? "checkmark" : "close"}
              size={12}
              color={Theme.colors.white}
            />
          </View>
          <Text
            style={[
              Theme.typography.label,
              { color: eligible ? Theme.colors.black: Theme.colors.red },
            ]}
          >
            {eligible
              ? "You're eligible for this grant!"
              : "You're not eligible for this grant"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            if (eligible) onNavigateToApply?.();
          }}
          activeOpacity={eligible ? 0.85 : 1}
          disabled={!eligible}
          style={[
            styles.viewBtn,
            {
              backgroundColor: eligible
                ? Theme.colors.orange
                : Theme.colors.lightGrey,
            },
          ]}
        >
          <Text style={Theme.typography.button}>View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    borderWidth: 0.5,
    borderColor: Theme.colors.purpleStroke,
    borderRadius: Theme.radius.card,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    alignSelf: "center",

    // use layout from theme
    width: Theme.layout.width,
    ...Theme.shadow.cardShadow,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Theme.spacing.md,
  },

  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: '#EFEFFF',
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoInitials: {
    color: Theme.colors.white,
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
  },

  title: {
    marginBottom: Theme.spacing.sm,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },

  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  metaText: {
    marginLeft: 4,
  },

  metaSep: {
    width: 1,
    height: 14,
    backgroundColor: Theme.colors.grey,
    marginHorizontal: 8,
  },

  metaDivider: {
    height: 0.7,
    backgroundColor: Theme.colors.grey,
    marginTop: Theme.spacing.lg,
    marginBottom: 10,
  },

  amountPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.button,
  },

  deadline: {
    flexDirection: "row",
    alignItems: "center",
  },

  deadlineText: {
    marginLeft: 6,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  eligibility: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Theme.spacing.md,
  },

  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  viewBtn: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.card,
  },
} as const);
