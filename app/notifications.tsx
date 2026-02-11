import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';

import { Theme } from '@/constants/theme';
import NotificationListItem from '../components/NotificationListItem';
import EyeIcon from '../components/icons/EyeIcon';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    eyebrow: 'Youth Work in Trades (WRK) Scholarship',
    title: 'View your status!',
    subtitle: 'You’ve heard back!',
  },
  {
    id: '2',
    eyebrow: 'StrongerBC Future Skills Grants',
    title: 'Application closes in 3 days!',
    subtitle: 'Finish applying now',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 30,
          paddingHorizontal: 20,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back-outline"
            size={20}
            color={Theme.colors.black}
          />
        </Pressable>
        <Text
          style={[
            Theme.typography.h1,
            { color: Theme.colors.black, marginLeft: 22 },
          ]}
        >
          Notifications
        </Text>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-0" />}
        renderItem={({ item, index }) => (
          <NotificationListItem
            eyebrow={item.eyebrow}
            title={item.title}
            subtitle={item.subtitle}
            onPress={() => {
              // TODO: hook up to detail screen
            }}
            rightAccessory={index === 0 ? <EyeIcon size={38} /> : undefined}
          />
        )}
      />
    </SafeAreaView>
  );
}
