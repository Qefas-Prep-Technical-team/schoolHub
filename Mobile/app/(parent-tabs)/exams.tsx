import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Calculator, Beaker, BookOpen, Globe, CalendarX, AlarmClock as Alarm, Calendar, CheckCircle, ClipboardList, BarChart2, Award, Clock } from 'lucide-react-native';

const iconMap = {
  calculate: Calculator,
  science: Beaker,
  book_2: BookOpen,
  public: Globe,
};

const ExamCard = ({ exam, index }: { exam: any, index: number }) => {
  const isCompleted = exam.status === 'completed';
  const IconComponent = iconMap[exam.icon as keyof typeof iconMap] || BookOpen;
  
  return (
    <View className={`bg-white dark:bg-slate-800 rounded-2xl border-l-4 ${isCompleted ? 'border-l-emerald-500' : 'border-l-orange-400'} border-t border-b border-r border-slate-200 dark:border-slate-700 p-4 mb-4 shadow-sm flex-col`}>
      <View className="flex-row items-center gap-3 w-full">
        <View className="w-6 items-center justify-center">
          <Text className="text-slate-400 dark:text-slate-500 font-LexendBold text-sm">{index}.</Text>
        </View>
        <View className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-2 shrink-0 border border-slate-100 dark:border-slate-700">
          <IconComponent size={20} color="#64748b" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-[10px] font-LexendBold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {exam.subject}
            </Text>
            <View className="w-1 h-1 bg-slate-300 rounded-full" />
            <Text className="text-[10px] text-slate-400">{exam.teacher}</Text>
          </View>
          <Text className="text-sm font-LexendBold text-slate-900 dark:text-white" numberOfLines={1}>
            {exam.title}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-3 pl-10">
        <View className={`flex-row items-center gap-1.5 px-2 py-1 rounded-md ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
          <Calendar size={14} className={isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'} />
          <Text className={`text-xs font-LexendMedium ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {exam.date}
          </Text>
        </View>

        <View className={`px-2 py-1 rounded-full border ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' : 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800'}`}>
          <Text className={`text-[10px] font-LexendBold ${isCompleted ? 'text-emerald-700 dark:text-emerald-300' : 'text-orange-700 dark:text-orange-300'}`}>
            {isCompleted ? 'Completed' : 'Upcoming'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-4 pl-10 pt-3 border-t border-slate-100 dark:border-slate-700/50">
        {isCompleted ? (
          <View className="flex-row items-end gap-3">
            <View>
              <Text className="text-[10px] text-slate-400 font-LexendMedium uppercase">Score</Text>
              <Text className="text-sm font-LexendBold text-slate-900 dark:text-white">{exam.score}/{exam.totalScore}</Text>
            </View>
            <View>
              <Text className="text-[10px] text-slate-400 font-LexendMedium uppercase">Grade</Text>
              <Text className="text-sm font-LexendBold text-emerald-600 dark:text-emerald-400">{exam.grade}</Text>
            </View>
          </View>
        ) : (
          <View>
             <Text className="text-[10px] text-slate-400 font-LexendMedium uppercase">Total Marks</Text>
             <Text className="text-sm font-LexendBold text-slate-900 dark:text-white">{exam.totalScore}</Text>
          </View>
        )}
        <TouchableOpacity className={`px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800`}>
          <Text className="text-xs font-LexendBold text-slate-700 dark:text-white">
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ParentExamsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const widgets = [
    {
      id: 1,
      title: 'Term Average',
      value: '84%',
      subtitle: 'Grade: A',
      icon: BarChart2,
      color: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-100 dark:border-orange-900/30',
        iconColor: '#f97316'
      },
    },
    {
      id: 2,
      title: 'Attendance',
      value: '96%',
      subtitle: 'Term Presence',
      icon: Calendar,
      color: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-100 dark:border-emerald-900/30',
        iconColor: '#10b981'
      },
    },
    {
      id: 3,
      title: 'Recent Grades',
      value: '4',
      subtitle: 'Latest Assessments',
      icon: Award,
      color: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-100 dark:border-blue-900/30',
        iconColor: '#2563eb'
      },
    },
  ];

  const mockExams = [
    {
      id: '1',
      subject: 'Mathematics',
      teacher: 'Mr. Smith',
      title: 'Mid-Term Assessment',
      status: 'completed',
      date: 'Oct 15',
      score: 88,
      totalScore: 100,
      grade: 'A',
      icon: 'calculate'
    },
    {
      id: '2',
      subject: 'Science',
      teacher: 'Mrs. Davis',
      title: 'Physics Practical Exam',
      status: 'completed',
      date: 'Oct 12',
      score: 92,
      totalScore: 100,
      grade: 'A+',
      icon: 'science'
    },
    {
      id: '3',
      subject: 'History',
      teacher: 'Mr. Wilson',
      title: 'Final Semester Exam',
      status: 'pending',
      date: 'Nov 10',
      totalScore: 100,
      icon: 'public'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
      >
        <View className="px-6 mb-6 mt-2">
          <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white tracking-tight">
            Exams & Results
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-Lexend">
            Monitor academic performance and grades
          </Text>
        </View>

        {/* Overview Widgets */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="pl-6 mb-8"
          contentContainerStyle={{ paddingRight: 32 }}
        >
          {widgets.map((widget) => {
            const Icon = widget.icon;
            return (
              <View 
                key={widget.id} 
                className={`w-48 bg-white dark:bg-slate-800 p-4 rounded-2xl border ${widget.color.border} mr-4 shadow-sm`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-LexendMedium uppercase">
                      {widget.title}
                    </Text>
                    <Text className="text-2xl font-LexendBlack text-slate-900 dark:text-white mt-1">
                      {widget.value}
                    </Text>
                  </View>
                  <View className={`p-2 rounded-xl ${widget.color.bg}`}>
                    <Icon size={18} color={widget.color.iconColor} />
                  </View>
                </View>
                <Text className="text-[10px] font-LexendMedium text-slate-400 mt-2 uppercase tracking-wider">
                  {widget.subtitle}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Exams List */}
        <View className="px-4">
          <Text className="text-lg font-LexendBold text-slate-900 dark:text-white mb-4 px-2">
            Recent & Upcoming Exams
          </Text>
          {mockExams.map((exam, index) => (
            <ExamCard key={exam.id} exam={exam} index={index + 1} />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
