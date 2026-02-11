import { Theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileSectionCardProps {
  title: string;
  completed: boolean;
  completionCount: string;
  children: React.ReactNode;
  showEditButton?: boolean;
  onEdit?: () => void;
}

export default function ProfileSectionCard({
  title,
  completed,
  completionCount,
  children,
  showEditButton = true,
  onEdit,
}: ProfileSectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons
            name={completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={30}
            color={completed ? Theme.colors.purple : Theme.colors.grey}
          />
          <Text style={styles.title}>{title}</Text>
          <Text
            style={[
              styles.completionCount,
              { color: completed ? Theme.colors.purple : Theme.colors.grey },
            ]}
          >
            {completionCount}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
          color={Theme.colors.grey}
          style={styles.iconArrow}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {children}
          {showEditButton && onEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    marginBottom: 12,
    ...Theme.shadow.cardShadow,
    borderColor: Theme.colors.purpleStroke,
    borderWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  title: {
    ...Theme.typography.subhead1,
    color: Theme.colors.black,
    flex: 1,
  },
  completionCount: {
    ...Theme.typography.body,
    color: Theme.colors.darkGrey,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  editButton: {
    borderWidth: 1,
    borderColor: Theme.colors.green,
    borderRadius: Theme.radius.button,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    height: 48,
  },
  editButtonText: {
    color: Theme.colors.green,
    ...Theme.typography.button,
  },
  iconArrow: {
    marginLeft: 10,
  },
});
