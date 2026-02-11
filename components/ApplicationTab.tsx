import { Theme } from "@/constants/theme";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type ApplicationTabProps = {
    title: string;
    isSelected: boolean;
    onPress: () => void;
};

export default function ApplicationTab({
    title,
    isSelected,
    onPress,
}: ApplicationTabProps) {
    return (
        <Pressable
            style={[styles.container, isSelected && styles.selectedContainer]}
            onPress={onPress}
        >
            <Text style={[styles.title, isSelected && styles.selectedTitle]}>
                {title}
            </Text>
            <Text style={styles.arrow}>→</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 4,
        borderRadius: 4,
    },
    selectedContainer: {
        backgroundColor: Theme.colors.lightPurple,
    },
    title: {
        ...Theme.typography.body,
        color: Theme.colors.black,
        flex: 1,
    },
    selectedTitle: {
        ...Theme.typography.bodyBold,
        color: Theme.colors.purple,
    },
    arrow: {
        fontSize: 16,
        color: Theme.colors.black,
        marginLeft: 8,
    },
});
