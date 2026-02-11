import { Theme } from "@/constants/theme";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GrantSubFiltersProps {
  selectedFilter: "Applied" | "Saved";
  onFilterChange: (filter: "Applied" | "Saved") => void;
}

const screenWidth = Dimensions.get("window").width;
const HALF = screenWidth / 2;

export default function GrantSubFilters({
  selectedFilter,
  onFilterChange,
}: GrantSubFiltersProps) {
  const isApplied = selectedFilter === "Applied";

  // Animated underline position
  const translateX = useRef(new Animated.Value(isApplied ? 0 : HALF)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isApplied ? 0 : HALF,
      duration: 200,
      useNativeDriver: true, 
    }).start();
  }, [isApplied, translateX]);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => onFilterChange("Applied")}
          style={styles.tab}
          activeOpacity={0.7}
        >
          <Text
            style={[
              Theme.typography.body,
              {
                color: isApplied ? Theme.colors.brightPurple : Theme.colors.grey,
                fontFamily: isApplied ? Theme.fonts.bold : Theme.fonts.medium,
              },
            ]}
          >
            Applied
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onFilterChange("Saved")}
          style={styles.tab}
          activeOpacity={0.7}
        >
          <Text
            style={[
              Theme.typography.body,
              {
                color: !isApplied ? Theme.colors.brightPurple : Theme.colors.grey,
                fontFamily: !isApplied ? Theme.fonts.bold : Theme.fonts.medium,
              },
            ]}
          >
            Saved
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full-width baseline */}
      <View style={styles.baseline} />

      {/* Animated indicator (separate underline) */}
      <Animated.View
        style={[
          styles.indicator,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth, // full device width
    alignSelf: "center",
    marginBottom: Theme.spacing.md,
  },
  tabsRow: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Theme.spacing.sm,
  },
  baseline: {
    width: "100%",
    height: 2,
    backgroundColor: Theme.colors.lightGrey,
    borderRadius: 1,
    marginTop: 4,
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: HALF, // two tabs -> half width
    backgroundColor: Theme.colors.purple,
    borderRadius: 1,
  },
});
