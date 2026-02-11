import { Theme } from "@/constants/theme";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DEFAULT_PROCESSING_IMAGE = require("@/assets/images/smiggs.png");
const DEFAULT_COMPLETE_IMAGE = require("@/assets/images/smiggs-done.png");

type Props = {
  showProcessing: boolean;
  showComplete: boolean;
  processingTitle?: string;
  completeTitle?: string;
  completeButtonLabel?: string;
  onCompletePress?: () => void;
  processingImageSource?: ImageSourcePropType;
  completeImageSource?: ImageSourcePropType;
};

/**
 * Reusable overlay for document processing/completion with animated dots and SMIGGS artwork.
 */
export default function DocumentStatusOverlay({
  showProcessing,
  showComplete,
  processingTitle = "We are building your profile",
  completeTitle = "Complete!",
  completeButtonLabel = "Continue",
  onCompletePress,
  processingImageSource = DEFAULT_PROCESSING_IMAGE,
  completeImageSource = DEFAULT_COMPLETE_IMAGE,
}: Props) {
  const dotOffsets = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(0))
  ).current;
  const [activeDot, setActiveDot] = useState(0);

  // Only run the animation while visible
  useEffect(() => {
    if (!showProcessing) {
      dotOffsets.forEach((val) => val.setValue(0));
      return;
    }

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

    return () => clearInterval(interval);
  }, [dotOffsets, showProcessing]);

  const processingOverlay = useMemo(() => {
    if (!showProcessing) return null;
    return (
      <View style={styles.processingOverlay} pointerEvents="auto">
        <Text style={styles.processingTitle}>{processingTitle}</Text>
        <Image
          source={processingImageSource}
          style={styles.processingImage}
          contentFit="contain"
        />
        <View style={styles.dotsRow}>
          {dotOffsets.map((offset, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  transform: [{ translateY: offset }],
                  backgroundColor:
                    index === activeDot ? Theme.colors.orange : "#CFCBFF",
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  }, [
    activeDot,
    dotOffsets,
    processingImageSource,
    processingTitle,
    showProcessing,
  ]);

  const completeOverlay = useMemo(() => {
    if (!showComplete || showProcessing) return null;
    return (
      <View style={styles.completeOverlay} pointerEvents="auto">
        <Text style={styles.completeTitle}>{completeTitle}</Text>
        <Image
          source={completeImageSource}
          style={styles.completeImage}
          contentFit="contain"
        />
        <TouchableOpacity
          style={styles.completeButton}
          activeOpacity={0.85}
          onPress={onCompletePress}
        >
          <Text style={styles.completeButtonText}>{completeButtonLabel}</Text>
        </TouchableOpacity>
      </View>
    );
  }, [
    completeButtonLabel,
    completeImageSource,
    completeTitle,
    onCompletePress,
    showComplete,
    showProcessing,
  ]);

  return (
    <>
      {processingOverlay}
      {completeOverlay}
    </>
  );
}

const styles = StyleSheet.create({
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.93)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.orange,
    textAlign: "center",
    marginBottom: 24,
  },
  processingImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#CFCBFF",
  },
  completeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  completeTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.purple,
    marginBottom: 28,
  },
  completeImage: {
    width: 220,
    height: 260,
    marginBottom: 36,
  },
  completeButton: {
    backgroundColor: Theme.colors.orange,
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: "80%",
    alignItems: "center",
  },
  completeButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
  },
});
