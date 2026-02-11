import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

const ACTIVE = '#7B6CF6';
const INACTIVE = '#B6B6BC';
const BAR_BG = '#F8F8F8';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: {
          fontSize: 8,
          marginTop: 0,
          fontFamily: 'montserrat-medium',
        },
        tabBarStyle: {
          backgroundColor: BAR_BG,
          height: 84,
          paddingTop: 12,
          paddingBottom: Platform.select({ ios: 24, android: 16, default: 16 }),
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIcon: ({ focused, color }) => {
          const s = 28;
          const name =
            route.name === 'index'
              ? focused
                ? 'home'
                : 'home-outline'
              : route.name === 'grants'
                ? focused
                  ? 'compass'
                  : 'compass-outline'
                : route.name === 'profile'
                  ? focused
                    ? 'person'
                    : 'person-outline'
                  : 'ellipse-outline';
          return <Ionicons name={name as any} size={s} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="grants" options={{ title: 'Grants' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
