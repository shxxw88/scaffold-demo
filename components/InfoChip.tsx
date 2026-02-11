// components/InfoChip.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type InfoChipProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string; // background of the icon circle
  label: string;
  onPress?: () => void;
};

export default function InfoChip({
  iconName,
  iconColor = "#FFB980",
  label,
  onPress,
}: InfoChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {/* Icon */}
      <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
        <Ionicons name={iconName} size={18} color="#fff" />
      </View>

      <View style={styles.labelWrap}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>

      <View style={styles.chevWrap}>
        <Ionicons name="chevron-forward-outline" size={16} color="#111" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    // PILL
    backgroundColor: "#F6F6F6",
    borderRadius: 18,
    minHeight: 56,
    paddingHorizontal: 12,

    // ROW that NEVER wraps
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    overflow: "hidden",
    width: "100%",
  },
  pressed: { opacity: 0.95 },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexShrink: 0,
  },

  // Magic trio so text truncates and chevron stays on same row
  labelWrap: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0, // allow Text to actually shrink
    marginRight: 6,
  },
  label: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "700",
    color: "#111",
  },

  // Reserve space for chevron so it never drops
  chevWrap: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
