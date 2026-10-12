import { useTheme } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native';

export default function Index() {
  const { colors } = useTheme();
//<View style={[styles.container, { backgroundColor: colors.background }]} /
  return <Text>Hello</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
