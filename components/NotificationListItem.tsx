import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Theme } from '@/constants/theme';
type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightAccessory?: ReactNode;
};

export default function NotificationListItem({
  eyebrow,
  title,
  subtitle,
  onPress,
  rightAccessory,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 25,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.grey,
      }}
    >
      <View className="flex-1 pr-4">
        <Text
          style={[
            Theme.typography.body,
            { color: Theme.colors.purple, fontSize: 13 },
          ]}
        >
          {eyebrow}
        </Text>
        <Text
          style={[
            Theme.typography.subhead1,
            { color: Theme.colors.black, marginTop: 5 },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              Theme.typography.label,
              { color: Theme.colors.black, marginTop: 5 },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 12,
        }}
      >
        {rightAccessory ?? (
          <Ionicons
            name="chevron-forward-outline"
            size={18}
            color={Theme.colors.black}
          />
        )}
      </View>
    </Pressable>
  );
}
