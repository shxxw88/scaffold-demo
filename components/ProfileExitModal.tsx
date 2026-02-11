import { Theme } from '@/constants/theme';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileExitModalProps {
  visible: boolean;
  onCancel: () => void;
  onExit: () => void;
}

export default function ProfileExitModal({
  visible,
  onCancel,
  onExit,
}: ProfileExitModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            Do you want to stop profile creation?
          </Text>
          <Text style={styles.subtitle}>
            The profile helps you to create the eligibility check and
            application form.
          </Text>
          <Text style={styles.highlight}>
            But you can come back anytime to continue it.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancel} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exit} onPress={onExit}>
              <Text style={styles.exitText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: Theme.radius.card,
    paddingVertical: 25,
    paddingHorizontal: 23,
    width: '100%',
  },
  title: {
    ...Theme.typography.h3,
    color: Theme.colors.black,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.darkGrey,
    textAlign: 'center',
    marginBottom: 10,
  },
  highlight: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.brightPurple,
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
  },
  cancel: {
    flex: 1,
    borderWidth: 2,
    borderColor: Theme.colors.green,
    borderRadius: Theme.radius.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    ...Theme.typography.button,
    color: Theme.colors.green,
  },
  exit: {
    flex: 1,
    backgroundColor: Theme.colors.orange,
    borderRadius: Theme.radius.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exitText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
  },
});
