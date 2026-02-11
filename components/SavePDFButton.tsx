import { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SavePDFButtonProps = {
    onSavePDF?: () => void;
};

export default function SavePDFButton({ onSavePDF }: SavePDFButtonProps) {
    return (
        <View style={styles.container}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                ]}
                onPress={onSavePDF}
            >
                <Text style={styles.buttonText}>Save PDF</Text>
                <Ionicons
                    name="download-outline"
                    size={20}
                    color={Theme.colors.black}
                    style={styles.iconSavePDF}
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
        paddingBottom: 0,
        paddingTop: 0,
        alignSelf: "center",
    },
    button: {
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Theme.colors.grey,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        ...Theme.typography.button,
        color: Theme.colors.black,
    },
    iconSavePDF: {
        marginLeft: 100,
        marginRight: 0,
    },
});
