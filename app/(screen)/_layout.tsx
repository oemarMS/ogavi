import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="four"
        options={{
          title: 'Template 4 - Dual'
        }}
      />
      <Stack.Screen
        name="five"
        options={{
          title: 'Template 5 - Dual Caption'
        }}
      />
      <Stack.Screen
        name="six"
        options={{
          title: 'Template 6 - Dual Caption 2'
        }}
      />
      <Stack.Screen
        name="seven"
        options={{
          title: 'Template 7 - Quad Caption'
        }}
      />
    </Stack>
  );
}
