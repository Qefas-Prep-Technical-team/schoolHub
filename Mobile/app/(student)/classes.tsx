import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClassesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center p-6">
      <Text className="font-lexend-bold text-2xl text-slate-900 dark:text-white">Classes</Text>
      <Text className="font-lexend text-slate-500 mt-2 text-center">Your enrolled classes and assignments will appear here.</Text>
    </SafeAreaView>
  );
}
