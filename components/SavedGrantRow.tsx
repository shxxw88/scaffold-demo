import { Theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type Props = {
  label: string; // e.g., "Apply to your saved grant"
  onPress?: () => void;
};

export default function SavedGrantRow({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        height: 60,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Theme.colors.purple,
        borderRadius: Theme.radius.card,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={[Theme.typography.subhead1, { color: Theme.colors.white }]}
          numberOfLines={1}
        >
          {label}
        </Text>

        {/* Right chevron, centered and consistent size */}
        <View
          style={{
            width: 30,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Theme.colors.lightPurple,
            borderRadius: 50,
          }}
        >
          <Ionicons
            name="arrow-forward-outline"
            size={22}
            color={Theme.colors.purple}
          />
        </View>
      </View>
    </Pressable>
  );
}
