import React, { useState, useMemo } from 'react';
import { View, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { ClassHeader } from '@/components/classes/ClassHeader';
import { ClassStats } from '@/components/classes/ClassStats';
import { ClassCard, ClassItemData } from '@/components/classes/ClassCard';
import { ClassGridCard } from '@/components/classes/ClassGridCard';
import { ClassSkeleton } from '@/components/classes/ClassSkeleton';
import { BookX } from 'lucide-react-native';

export default function ClassesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { data: enrollments, isLoading, refetch, isRefetching } = useClasses();

  const classesList: ClassItemData[] = useMemo(() => {
    if (!enrollments || !Array.isArray(enrollments)) return [];
    
    // Premium color palette for class icons
    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4'];
    
    return enrollments.map((en: any, index: number) => {
      const cls = en.class;
      return {
        id: cls.id,
        title: cls.name,
        subject: cls.subjects?.[0]?.subject?.name || 'General Subject',
        teacher: cls.teachers?.[0]?.teacher?.name || 'Unassigned Teacher',
        room: cls.section || 'General Classroom',
        color: colors[index % colors.length],
      };
    });
  }, [enrollments]);

  const filteredClasses = useMemo(() => {
    return classesList.filter(c =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, classesList]);

  // Handle class selection routing
  const handlePressClass = (id: string) => {
    router.push(`/classes/${id}`);
  };

  const renderEmptyState = () => {
    if (isLoading && !isRefetching) {
      return (
        <View className={`py-4 ${viewMode === 'grid' ? 'flex-row flex-wrap' : ''}`}>
          {[1, 2, 3, 4].map((key) => (
            <ClassSkeleton key={key} viewMode={viewMode} />
          ))}
        </View>
      );
    }

    if (filteredClasses.length === 0) {
      return (
        <View className="py-16 items-center justify-center">
          <View className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full items-center justify-center mb-4 border border-slate-200 dark:border-slate-800">
            <BookX size={32} className="text-slate-400 dark:text-slate-500" />
          </View>
          <Text className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            No Classes Found
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-[250px]">
            {searchQuery 
              ? "We couldn't find any classes matching your search." 
              : "You are not enrolled in any classes yet."}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 px-6 pt-6">
      <FlatList
        key={viewMode} // Force re-render when changing between list/grid for numColumns
        data={(isLoading && !isRefetching) ? [] : filteredClasses}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListHeaderComponent={
          <View>
            <ClassHeader 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
            <ClassStats totalClasses={classesList.length} />
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item, index }) => (
          viewMode === 'list' 
            ? <ClassCard item={item} index={index} onPress={() => handlePressClass(item.id)} />
            : <ClassGridCard item={item} index={index} onPress={() => handlePressClass(item.id)} />
        )}
        contentContainerStyle={{ paddingBottom: 100 }} // Extra padding for bottom tab bar
      />
    </SafeAreaView>
  );
}
