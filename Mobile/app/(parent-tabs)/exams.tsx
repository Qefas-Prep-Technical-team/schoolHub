import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, SectionList, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FileText, PenTool, BookOpen, Calendar, ChevronDown, CheckCircle, Search, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { useInfiniteExams } from '@/lib/api/hooks/useExams';
import { useSessions } from '@/lib/api/hooks/useSchool';
import { useRouter } from 'expo-router';

const DropdownModal = ({ visible, onClose, options, selectedValue, onSelect, title }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity 
      className="flex-1 bg-black/50 justify-end" 
      activeOpacity={1} 
      onPress={onClose}
    >
      <View className="bg-white dark:bg-slate-900 rounded-t-3xl max-h-[70%]">
        <View className="p-4 border-b border-slate-200 dark:border-slate-800 flex-row justify-between items-center">
          <Text className="text-lg font-LexendBold text-slate-900 dark:text-white">{title}</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Text className="text-indigo-600 dark:text-indigo-400 font-LexendBold">Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView className="p-4 mb-8">
          {options.map((opt: any) => (
            <TouchableOpacity
              key={opt.value}
              className={`py-4 px-4 rounded-xl mb-2 flex-row justify-between items-center ${selectedValue === opt.value ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
              onPress={() => {
                onSelect(opt.value);
                onClose();
              }}
            >
              <Text className={`font-LexendMedium ${selectedValue === opt.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {opt.label}
              </Text>
              {selectedValue === opt.value && (
                <CheckCircle size={20} color="#4f46e5" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);

const AssessmentCard = ({ assessment, childId }: { assessment: any, childId?: string }) => {
  const router = useRouter();
  
  const isQuiz = assessment.category === 'QUIZ';
  const isCA = assessment.category === 'CA';
  const isExam = !isQuiz && !isCA;

  const theme = isQuiz ? {
    border: 'border-orange-200 dark:border-orange-900/50',
    bg: 'bg-orange-50/50 dark:bg-orange-950/20',
    iconBg: 'bg-orange-500',
    statusBg: 'bg-orange-100 dark:bg-orange-900/40',
    statusText: 'text-orange-700 dark:text-orange-300',
    icon: PenTool,
  } : isCA ? {
    border: 'border-emerald-200 dark:border-emerald-900/50',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    iconBg: 'bg-emerald-500',
    statusBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    statusText: 'text-emerald-700 dark:text-emerald-300',
    icon: BookOpen,
  } : {
    border: 'border-blue-200 dark:border-blue-900/50',
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    iconBg: 'bg-blue-600',
    statusBg: 'bg-blue-100 dark:bg-blue-900/40',
    statusText: 'text-blue-700 dark:text-blue-300',
    icon: FileText,
  };

  const Icon = theme.icon;
  const isPublished = assessment.status === 'PUBLISHED';
  
  // Calculate total marks and papers
  const rawPapers = assessment.subjectExamPapers || assessment.subjectPapers || [];
  const safePapers = rawPapers.map((p: any) => p.subjectPaper || p);
  const totalPapers = safePapers.length;
  const totalMarks = assessment.totalMarks > 0 ? assessment.totalMarks : safePapers.reduce((sum: number, p: any) => sum + (p.totalMarks || 0), 0) || 0;

  const attempt = assessment.examAttempts?.[0];
  const isTaken = !!attempt;
  const displayStatus = isTaken ? 'COMPLETED' : assessment.status;
  
  let scoreDisplay = `${totalMarks} pts`;
  let gradeBadge = null;
  let topBarColor = theme.iconBg;
  let statusBadgeColor = theme.statusBg;
  let statusTextColor = theme.statusText;

  if (isTaken && attempt.score !== null) {
    scoreDisplay = `${attempt.score}/${totalMarks} pts`;
    const percentage = totalMarks > 0 ? (attempt.score / totalMarks) * 100 : 0;
    
    let grade = 'F';
    let colorClass = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    topBarColor = 'bg-red-500';
    statusBadgeColor = 'bg-red-100 dark:bg-red-900/40';
    statusTextColor = 'text-red-700 dark:text-red-300';
    
    if (percentage >= 70) {
      grade = 'A';
      colorClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
      topBarColor = 'bg-emerald-500';
      statusBadgeColor = 'bg-emerald-100 dark:bg-emerald-900/40';
      statusTextColor = 'text-emerald-700 dark:text-emerald-300';
    } else if (percentage >= 60) {
      grade = 'B';
      colorClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      topBarColor = 'bg-blue-500';
      statusBadgeColor = 'bg-blue-100 dark:bg-blue-900/40';
      statusTextColor = 'text-blue-700 dark:text-blue-300';
    } else if (percentage >= 50) {
      grade = 'C';
      colorClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
      topBarColor = 'bg-yellow-500';
      statusBadgeColor = 'bg-yellow-100 dark:bg-yellow-900/40';
      statusTextColor = 'text-yellow-700 dark:text-yellow-300';
    } else if (percentage >= 45) {
      grade = 'D';
      colorClass = 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
      topBarColor = 'bg-orange-500';
      statusBadgeColor = 'bg-orange-100 dark:bg-orange-900/40';
      statusTextColor = 'text-orange-700 dark:text-orange-300';
    }

    gradeBadge = (
      <View className={`px-2 py-0.5 rounded-md ml-2 ${colorClass.split(' ').filter(c => c.startsWith('bg-')).join(' ')}`}>
        <Text className={`text-[10px] font-LexendBold ${colorClass.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
          {grade}
        </Text>
      </View>
    );
  } else if (isTaken) {
    statusBadgeColor = 'bg-emerald-100 dark:bg-emerald-900/40';
    statusTextColor = 'text-emerald-700 dark:text-emerald-300';
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/exams/[id]', params: { id: assessment.id, studentId: childId } })}
      className={`rounded-3xl border ${theme.border} ${theme.bg} overflow-hidden mb-5`}
    >
      <View className={`h-1.5 w-full ${topBarColor}`} />
      <View className="p-5">
        <View className="flex-row justify-between items-start mb-4">
          <View className={`p-3 rounded-2xl shadow-sm ${theme.iconBg}`}>
            <Icon size={20} color="#ffffff" strokeWidth={2.5} />
          </View>
          <View className={`px-3 py-1 rounded-full ${statusBadgeColor}`}>
            <Text className={`text-[10px] font-LexendBold uppercase tracking-widest ${statusTextColor}`}>
              {displayStatus}
            </Text>
          </View>
        </View>

        <Text className="text-lg font-LexendBold text-slate-900 dark:text-white mb-1" numberOfLines={1}>
          {assessment.title}
        </Text>
        {assessment.subject && (
          <Text className="text-sm font-LexendMedium text-slate-500 dark:text-slate-400 mb-4" numberOfLines={1}>
            {assessment.subject.name || 'General'}
          </Text>
        )}

        <View className="flex-row items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <View className="flex-row items-center gap-2">
            <Calendar size={14} color="#64748b" />
            <Text className="text-xs font-LexendMedium text-slate-500 dark:text-slate-400">
              {new Date(assessment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            {totalPapers > 0 && (
              <View className="flex-row items-center gap-1.5">
                <FileText size={14} color="#64748b" />
                <Text className="text-xs font-LexendMedium text-slate-500 dark:text-slate-400">{totalPapers}</Text>
              </View>
            )}
            {totalMarks > 0 && (
              <View className="flex-row items-center gap-1.5">
                <CheckCircle size={14} color="#64748b" />
                <View className="flex-row items-center">
                  <Text className="text-xs font-LexendMedium text-slate-500 dark:text-slate-400">{scoreDisplay}</Text>
                  {gradeBadge}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ParentExamsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const gradientColors = isDark 
    ? (['#431407', '#1e293b', '#0f172a'] as const)
    : (['#ffedd5', '#fff7ed', '#ffffff'] as const);

  const [activeChildId, setActiveChildId] = useState<string | undefined>();
  const [hasLoadedDefault, setHasLoadedDefault] = useState(false);
  const { data: children, isLoading: isLoadingChildren } = useParentChildren();

  useEffect(() => {
    AsyncStorage.getItem('defaultChildId').then(id => {
      if (id) setActiveChildId(id);
      setHasLoadedDefault(true);
    });
  }, []);

  useEffect(() => {
    if (hasLoadedDefault && children && children.length > 0 && !activeChildId) {
      setActiveChildId(children[0].id);
    }
  }, [hasLoadedDefault, children, activeChildId]);

  const child = children?.find(c => c.id === activeChildId);
  const schoolId = child?.school?.id;

  const [category, setCategory] = useState<'EXAM' | 'QUIZ' | 'CA'>('EXAM');
  const [sessionId, setSessionId] = useState('all');
  const [term, setTerm] = useState('all');

  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [termModalVisible, setTermModalVisible] = useState(false);

  const { data: sessions = [] } = useSessions(schoolId);

  const { 
    data: examsData, 
    isLoading: isLoadingExams, 
    refetch, 
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteExams({
    availableForStudentId: activeChildId,
    category,
    sessionId: sessionId === 'all' ? undefined : sessionId,
    term: term === 'all' ? undefined : term,
  }, {
    enabled: !!activeChildId
  });

  const isLoading = isLoadingChildren || (isLoadingExams && !!activeChildId);

  const onRefresh = React.useCallback(() => {
    if (activeChildId) {
      refetch();
    }
  }, [refetch, activeChildId]);

  const sessionOptions = [
    { value: 'all', label: 'All Sessions' },
    ...sessions.map((s: any) => ({ value: s.id, label: s.name })),
  ];

  const termOptions = [
    { value: 'all', label: 'All Terms' },
    { value: 'FIRST', label: 'First Term' },
    { value: 'SECOND', label: 'Second Term' },
    { value: 'THIRD', label: 'Third Term' },
  ];

  const groupedAssessments = React.useMemo(() => {
    if (!examsData?.pages) return [];
    const allExams = examsData.pages.flatMap((page: any) => page.data || page);
    
    const groups: { [key: string]: any[] } = {};
    allExams.forEach((exam: any) => {
      const date = new Date(exam.createdAt);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(exam);
    });

    return Object.keys(groups).map(key => ({
      title: key,
      data: groups[key]
    }));
  }, [examsData]);

  const renderHeader = () => (
    <View className="pb-4 pt-4 px-6 z-20 bg-transparent">
      {/* Tabs */}
      <View className="flex-row bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl mb-5">
        {[
          { id: 'EXAM', label: 'Exams' },
          { id: 'QUIZ', label: 'Quizzes' },
          { id: 'CA', label: 'CAs' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setCategory(tab.id as any)}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${category === tab.id ? 'bg-white dark:bg-slate-900 shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-LexendBold ${category === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filters Row */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          className="flex-1 flex-row items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800"
          onPress={() => setSessionModalVisible(true)}
        >
          <View>
            <Text className="text-[10px] font-LexendBold text-slate-400 uppercase tracking-widest mb-0.5">Session</Text>
            <Text className="text-xs font-LexendMedium text-slate-900 dark:text-white" numberOfLines={1}>
              {sessionOptions.find(o => o.value === sessionId)?.label}
            </Text>
          </View>
          <ChevronDown size={16} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-1 flex-row items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800"
          onPress={() => setTermModalVisible(true)}
        >
          <View>
            <Text className="text-[10px] font-LexendBold text-slate-400 uppercase tracking-widest mb-0.5">Term</Text>
            <Text className="text-xs font-LexendMedium text-slate-900 dark:text-white" numberOfLines={1}>
              {termOptions.find(o => o.value === term)?.label}
            </Text>
          </View>
          <ChevronDown size={16} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      );
    }
    return (
      <View className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 items-center justify-center mx-6 mt-4">
        <View className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
          <Search size={24} color="#94a3b8" />
        </View>
        <Text className="text-lg font-LexendBold text-slate-900 dark:text-white mb-2">No Assessments Found</Text>
        <Text className="text-sm font-Lexend text-slate-500 dark:text-slate-400 text-center">
          There are no {category.toLowerCase()}s assigned to this child for the selected filters.
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={gradientColors}
      locations={[0, 0.4, 1]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1" edges={['top']}>
      {/* Header & Child Selector */}
      <View className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm bg-transparent">
        <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white">Exams & Results</Text>
        {child && (
          <Text className="text-sm font-LexendMedium text-slate-500 dark:text-slate-400 mt-1">
            Viewing results for {child.name}
          </Text>
        )}
      </View>

      <SectionList
        className="flex-1"
        sections={groupedAssessments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#4f46e5" />
        }
        renderSectionHeader={({ section: { title } }) => (
          <Text className="text-sm font-LexendBold text-slate-500 dark:text-slate-400 px-6 py-2">
            {title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View className="px-6">
            <AssessmentCard assessment={item} childId={activeChildId} />
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="#4f46e5" />
            </View>
          ) : null
        }
      />

      {/* Modals */}
      <DropdownModal
        visible={sessionModalVisible}
        onClose={() => setSessionModalVisible(false)}
        options={sessionOptions}
        selectedValue={sessionId}
        onSelect={setSessionId}
        title="Select Session"
      />
      <DropdownModal
        visible={termModalVisible}
        onClose={() => setTermModalVisible(false)}
        options={termOptions}
        selectedValue={term}
        onSelect={setTerm}
        title="Select Term"
      />
      </SafeAreaView>
    </LinearGradient>
  );
}
