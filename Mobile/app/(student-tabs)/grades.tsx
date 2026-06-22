import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GradesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
      <Text className="text-xl font-bold text-slate-900 dark:text-white">Grades & Results</Text>
    </SafeAreaView>
  );
}
