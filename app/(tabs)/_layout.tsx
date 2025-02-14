import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const commonOptions = {
    headerTitle: 'Ogavi', // Menetapkan "Ogavi" sebagai judul header untuk semua tab
    tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="angle-up" color={color} />,
    headerRight: () => (
      <Link href="/modal" asChild>
        <Pressable>
          {({ pressed }) => (
            <FontAwesome
              name="info-circle"
              size={25}
              color={Colors[colorScheme ?? 'light'].text}
              style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
      </Link>
    ),
  };

  return (
    <><StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} /><Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          ...commonOptions,
          title: 'Template 1',
        }} />
      <Tabs.Screen
        name="two"
        options={{
          ...commonOptions,
          title: 'Template 2',
        }} />
      <Tabs.Screen
        name="three"
        options={{
          ...commonOptions,
          title: 'Template 3',
        }} />
    </Tabs></>
  );
}
