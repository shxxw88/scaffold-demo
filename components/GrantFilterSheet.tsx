import { Theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type GrantSortId =
  | 'all'
  | 'amountHigh'
  | 'amountLow'
  | 'active'
  | 'newest'
  | 'oldest';

export interface GrantSortOption {
  id: GrantSortId;
  label: string;
}

export const GRANT_SORT_OPTIONS: GrantSortOption[] = [
  { id: 'all', label: 'All' },
  { id: 'amountHigh', label: 'Amount highest to lowest' },
  { id: 'amountLow', label: 'Amount lowest to highest' },
  { id: 'active', label: 'Active grants' },
  { id: 'newest', label: 'Newest to oldest' },
  { id: 'oldest', label: 'Oldest to newest' },
];

type Props = {
  visible: boolean;
  selectedId: GrantSortId;
  onSelect: (value: GrantSortId) => void;
  onClose: () => void;
};

export default function GrantFilterSheet({
  visible,
  selectedId,
  onSelect,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text
              style={[Theme.typography.subhead1, { color: Theme.colors.black }]}
            >
              Sort by
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={18} color={Theme.colors.grey} />
            </TouchableOpacity>
          </View>
          {GRANT_SORT_OPTIONS.map((option, idx) => {
            const active = option.id === selectedId;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.option,
                  idx < GRANT_SORT_OPTIONS.length - 1 && styles.optionBorder,
                ]}
                onPress={() => {
                  onSelect(option.id);
                  onClose();
                }}
              >
                <Text
                  style={[Theme.typography.body, { color: Theme.colors.black }]}
                >
                  {option.label}
                </Text>
                <View
                  style={[
                    styles.radioOuter,
                    active && { borderColor: Theme.colors.brightPurple },
                  ]}
                >
                  {active && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: Theme.radius.card,
    borderTopRightRadius: Theme.radius.card,
    paddingBottom: Theme.spacing.xl,
  },
  header: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  option: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Theme.colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.brightPurple,
  },
});
