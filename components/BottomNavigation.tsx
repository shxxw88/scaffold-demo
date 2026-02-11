import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface BottomNavigationProps {
  activeTab: 'home' | 'grants' | 'profile';
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const router = useRouter();

  const tabs = [
    {
      id: 'home',
      icon: 'home-outline',
      label: 'home',
      route: '/(tabs)',
    },
    {
      id: 'grants',
      icon: 'compass',
      label: 'Grants',
      route: '/(tabs)/grants',
    },
    {
      id: 'profile',
      icon: 'person-outline',
      label: 'Profile',
      route: '/(tabs)/profile',
    },
  ];

  return (
    <View className="bg-white border-t border-gray-200 px-4 py-2">
      <View className="flex-row justify-around items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              className="items-center py-2"
              onPress={() => router.push(tab.route as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={24}
                color={isActive ? '#8B5CF6' : '#9CA3AF'}
              />
              <Text
                className={`text-xs mt-1 ${
                  isActive ? 'text-purple-600' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
