import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';

export default function MoreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const menuItems = [
    { title: 'Template 4 - Dual', route: '/(screen)/four' as const },
    { title: 'Template 5 - Dual Caption', route: '/(screen)/five' as const },
    { title: 'Template 6 - Dual Caption 2', route: '/(screen)/six' as const },
    { title: 'Template 7 - Quad Caption', route: '/(screen)/seven' as const },
    { title: 'Template 8 - Template Video', route: '/(screen)/eight' as const },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => router.push(item.route)}
        >
          <Text style={styles.menuText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  menuText: {
    fontSize: 16,
  },
});