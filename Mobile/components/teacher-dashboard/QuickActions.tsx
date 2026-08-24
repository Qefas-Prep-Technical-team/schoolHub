import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Platform, ActivityIndicator, Alert, TextInput, TouchableWithoutFeedback, LayoutAnimation, UIManager, KeyboardAvoidingView, useWindowDimensions } from 'react-native';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Plus, Share2, FileText, CheckCircle2, ChevronRight, BarChart3, Users, MessageSquare, X, Filter, BookOpen, ClipboardList, GraduationCap, LayoutGrid, Gem, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTeacherDashboardStats } from '@/lib/api/hooks/useTeacherDashboard';
import { generateReportCardPDF } from '@/lib/utils/pdfGenerator';
import { useAuthUser } from '@/lib/api/hooks/useAuth';
import { useSchoolSettings, useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage';
import { useExams } from '@/lib/api/hooks/useExams';
export function QuickActions() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { height } = useWindowDimensions();

  // Premium Gating Logic
  const { data: user } = useAuthUser();
  const schoolId = user?.primarySchoolId || user?.activeSchoolId || "";
  
  const { data: usageData, isLoading: usageLoading } = useSubscriptionUsage();
  const { data: settings, isLoading: settingsLoading } = useSchoolSettings(schoolId);
  const { data: schoolProfile, isLoading: profileLoading } = useSchoolProfile(schoolId);

  const isEnforced = settings?.sub_enforced_teachers !== "false";
  const isTeacherPaying = usageData?.subscriptionStatus?.toLowerCase() === 'active' || usageData?.isTrial;
  const isSchoolPaying = schoolProfile?.subscriptionStatus?.toLowerCase() === 'active' || schoolProfile?.isTrialActive;
  
  const hasAccess = isEnforced ? isTeacherPaying : isSchoolPaying;
  const isLoadingPremium = usageLoading || settingsLoading || profileLoading;
  
  // Modal State
  const [reportsModalVisible, setReportsModalVisible] = useState(false);
  const [reportStep, setReportStep] = useState<'type' | 'filters'>('type');
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeSelector, setActiveSelector] = useState<'class' | 'term' | 'assessment' | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('Select Class');
  const [selectedTerm, setSelectedTerm] = useState<string>('Select Term');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('Select Assessment');

  const { data: dashboardData } = useTeacherDashboardStats();
  const recentExams = dashboardData?.recentExams || [];
  const recentAssignments = dashboardData?.recentAssignments || [];
  const distributionData = dashboardData?.performanceMetrics?.distribution || { A: 0, B: 0, C: 0, D: 0, F: 0 };
  
  // Custom hooks for full list of assessments
  const categoryFilter = selectedReportType === 'Exam' ? 'EXAM' : selectedReportType === 'Quizzes' ? 'QUIZ' : selectedReportType === 'CA' ? 'CA' : selectedReportType === 'Assignment' ? 'ASSIGNMENT' : null;
  const { data: examsData } = useExams(
    { category: categoryFilter || undefined, limit: 100 }, 
    { enabled: reportsModalVisible && !!selectedReportType }
  );
  
  const todaySchedule = dashboardData?.todaySchedule || [];
  
  const classNames = dashboardData?.stats?.classNames || [];
  
  const classOptions = ['Whole School', ...(classNames.length > 0 ? (classNames as string[]) : [])];
  const termOptions = ['All Terms', 'First Term', 'Second Term', 'Third Term'];
  
  let assessmentOptions: string[] = [];

  const examsArray = Array.isArray(examsData) ? examsData : (examsData?.data || []);

  if (examsArray.length === 0) {
    const fallbackList = selectedReportType === 'Assignment' ? recentAssignments : recentExams;
    assessmentOptions = (fallbackList || [])
      .filter((a: any) => {
        const classMatch = selectedClass === 'Select Class' || selectedClass === 'Whole School' || (a.class?.name === selectedClass || a.className === selectedClass);
        const termMapped = a.term === 'FIRST' ? 'First Term' : a.term === 'SECOND' ? 'Second Term' : a.term === 'THIRD' ? 'Third Term' : a.term;
        const termMatch = selectedTerm === 'Select Term' || selectedTerm === 'All Terms' || termMapped === selectedTerm;
        const catMatch = selectedReportType === 'Assignment' ? true : (a.category === categoryFilter);
        return classMatch && termMatch && catMatch;
      })
      .map((a: any) => a.title);
  } else {
    // For Exams, Quizzes, CAs, Assignments, filter the existing exams based on type
    assessmentOptions = examsArray
      .filter((e: any) => {
        const classMatch = selectedClass === 'Select Class' || selectedClass === 'Whole School' || (e.class?.name === selectedClass || e.className === selectedClass);
        const termMapped = e.term === 'FIRST' ? 'First Term' : e.term === 'SECOND' ? 'Second Term' : e.term === 'THIRD' ? 'Third Term' : e.term;
        const termMatch = selectedTerm === 'Select Term' || selectedTerm === 'All Terms' || termMapped === selectedTerm;
        return classMatch && termMatch;
      })
      .map((e: any) => e.title);
  }

  const totalGrades = Object.values(distributionData).reduce<number>((sum, val) => sum + (val as number), 0);
  const getPct = (val: number) => totalGrades > 0 ? Math.round((val / totalGrades) * 100) : 0;

  const distribution = [
    { grade: 'A', pct: getPct(distributionData.A), color: 'bg-emerald-500' },
    { grade: 'B', pct: getPct(distributionData.B), color: 'bg-blue-500' },
    { grade: 'C', pct: getPct(distributionData.C), color: 'bg-amber-500' },
    { grade: 'D', pct: getPct(distributionData.D), color: 'bg-orange-500' },
    { grade: 'E', pct: getPct(distributionData.E), color: 'bg-rose-400' },
    { grade: 'F', pct: getPct(distributionData.F), color: 'bg-red-600' },
  ];

  const announcements = [
    { id: 1, title: 'Staff Meeting at 3 PM', sender: 'Principal', unread: true },
    { id: 2, title: 'Submission Deadline', sender: 'Admin', unread: false },
  ];

  return (
    <View className="mb-20">
      
      {/* Quick Tools */}
      <View className="flex-row gap-4 mb-8 mt-4">
        <TouchableOpacity 
          onPress={() => router.push('/(teacher-tabs)/exams')}
          className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-3xl items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm active:opacity-80"
        >
          <View className="h-12 w-12 bg-emerald-500 rounded-full items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
            <Plus size={24} color="#ffffff" />
          </View>
          <Text className="text-xs font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight">Grade</Text>
          <Text className="text-[9px] font-LexendBold text-slate-400 uppercase tracking-widest mt-0.5">New Entry</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => {
            setReportStep('type');
            setReportsModalVisible(true);
          }}
          className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-3xl items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm active:opacity-80"
        >
          <View className="h-12 w-12 bg-blue-500 rounded-full items-center justify-center mb-2 shadow-lg shadow-blue-500/30">
            <Share2 size={24} color="#ffffff" />
          </View>
          <Text className="text-xs font-LexendBlack text-slate-900 dark:text-white uppercase tracking-tight">Reports</Text>
          <Text className="text-[9px] font-LexendBold text-slate-400 uppercase tracking-widest mt-0.5">Export Data</Text>
        </TouchableOpacity>
      </View>

      {/* Assessments & Grading */}
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4 ml-2">
          <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Assessments</Text>
          <TouchableOpacity>
            <Text className="text-[10px] font-LexendBold text-pink-600 dark:text-pink-400 uppercase tracking-widest">View All</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-white dark:bg-slate-950 rounded-[2.5rem] p-4 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          {recentExams.length === 0 ? (
            <Text className="text-slate-500 font-Lexend text-center p-4">No recent assessments</Text>
          ) : recentExams.map((item: any) => (
            <View key={item.id} className="bg-slate-50 dark:bg-slate-900 p-4 my-2 rounded-3xl border border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center gap-4 mr-2">
                <View className={`h-12 w-12 rounded-2xl items-center justify-center ${item.status === 'PUBLISHED' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  <FileText size={20} color={item.status === 'PUBLISHED' ? '#10b981' : '#f59e0b'} />
                </View>
                <View className="flex-1">
                  <Text className="font-LexendBold text-slate-900 dark:text-white mb-1 text-sm" numberOfLines={1}>{item.title}</Text>
                  <View className="flex-row items-center flex-wrap gap-y-1">
                    <Text className="text-[10px] font-Lexend text-slate-500 uppercase tracking-widest" numberOfLines={1} style={{ flexShrink: 1 }}>{item.className}</Text>
                    <View className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-2" />
                    <Text className={`text-[10px] font-LexendBold uppercase tracking-widest ${item.status === 'PUBLISHED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{item.status}</Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={20} color={isDark ? '#475569' : '#cbd5e1'} />
            </View>
          ))}
        </View>
      </View>

      {/* Analytics & Top Performers */}
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4 ml-2">
          <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Analytics</Text>
        </View>
        <View className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <View className="flex-row items-center gap-3 mb-6">
            <View className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl items-center justify-center border border-indigo-100 dark:border-indigo-800">
              <BarChart3 size={18} color="#4f46e5" />
            </View>
            <Text className="text-sm font-LexendBold text-slate-900 dark:text-white">Grade Distribution</Text>
          </View>
          
          <View className="space-y-4 mb-6">
            {distribution.map((stat) => (
              <View key={stat.grade} className="flex-row items-center gap-4">
                <Text className="font-LexendBlack w-4 text-slate-700 dark:text-slate-300">{stat.grade}</Text>
                <View className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <View className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.pct}%` }} />
                </View>
                <Text className="font-Lexend text-xs text-slate-500 w-8">{stat.pct}%</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Announcements */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-4 ml-2">
          <Text className="text-lg font-LexendBlack text-slate-900 dark:text-white uppercase italic tracking-tight">Inbox</Text>
        </View>
        <View className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 items-center justify-center">
          <View className="h-16 w-16 rounded-3xl bg-sky-50 dark:bg-sky-900/20 items-center justify-center border border-sky-100 dark:border-sky-800/30 mb-4">
            <MessageSquare size={28} color="#0ea5e9" opacity={0.5} />
          </View>
          <Text className="font-LexendBlack text-slate-900 dark:text-white text-lg tracking-tight mb-1 text-opacity-80">Coming Soon</Text>
          <Text className="font-Lexend text-slate-500 text-xs text-center px-4">Messaging and announcements will be available in a future update.</Text>
        </View>
      </View>
      
      {/* Reports Modal */}
      <Modal
        visible={reportsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReportsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={() => setReportsModalVisible(false)}>
            <View className="flex-1 justify-end bg-slate-900/60">
              <TouchableWithoutFeedback onPress={() => {}}>
                <View 
                  className="bg-white dark:bg-slate-950 w-full rounded-t-[2.5rem] p-6 pb-12 shadow-2xl border-t border-slate-200/50 dark:border-slate-800/50"
                  style={activeSelector ? { height: height * 0.85 } : undefined}
                >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row items-center gap-3">
                <TouchableOpacity 
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    if (activeSelector) {
                      setActiveSelector(null);
                      setSearchQuery('');
                    } else if (reportStep === 'filters') {
                      setReportStep('type');
                    } else {
                      setReportsModalVisible(false);
                    }
                  }}
                  className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center"
                >
                  {(reportStep === 'filters' || activeSelector) ? (
                    <ChevronRight size={20} color={isDark ? '#cbd5e1' : '#475569'} className="rotate-180" />
                  ) : (
                    <X size={20} color={isDark ? '#cbd5e1' : '#475569'} />
                  )}
                </TouchableOpacity>
                <View>
                  <Text className="text-xl font-LexendBlack text-slate-900 dark:text-white tracking-tight">
                    {activeSelector 
                      ? `Select ${activeSelector.charAt(0).toUpperCase() + activeSelector.slice(1)}` 
                      : reportStep === 'type' ? 'Select Report' : 'Report Filters'}
                  </Text>
                  <Text className="text-xs font-Lexend text-slate-500">
                    {activeSelector 
                      ? 'Choose an option below' 
                      : reportStep === 'type' ? 'Choose what you want to export' : selectedReportType}
                  </Text>
                </View>
              </View>
            </View>

            {/* Step 1: Type Selection (2x2 Grid + Horizontal Button) */}
            {reportStep === 'type' && !activeSelector && (
              <View className="flex-col gap-y-4">
                <View className="flex-row flex-wrap justify-between gap-y-4">
                  {[
                    { id: 'Exam', icon: FileText, color: 'bg-indigo-500', shadow: 'shadow-indigo-500/30' },
                    { id: 'CA', icon: LayoutGrid, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
                    { id: 'Assignment', icon: ClipboardList, color: 'bg-amber-500', shadow: 'shadow-amber-500/30' },
                    { id: 'Quizzes', icon: CheckCircle2, color: 'bg-pink-500', shadow: 'shadow-pink-500/30' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => {
                        setSelectedReportType(item.id);
                        setReportStep('filters');
                      }}
                      className="w-[48%] bg-slate-50 dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 items-center shadow-sm active:opacity-80"
                    >
                      <View className={`h-14 w-14 ${item.color} rounded-2xl items-center justify-center mb-3 shadow-lg ${item.shadow}`}>
                        <item.icon size={28} color="#ffffff" />
                      </View>
                      <Text className="font-LexendBold text-slate-900 dark:text-white text-base tracking-tight">{item.id}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Subject Paper Horizontal Button */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedReportType('Subject Paper');
                    setReportStep('filters');
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex-row items-center shadow-sm active:opacity-80 gap-4"
                >
                  <View className="h-14 w-14 bg-cyan-500 rounded-2xl items-center justify-center shadow-lg shadow-cyan-500/30">
                    <BookOpen size={28} color="#ffffff" />
                  </View>
                  <Text className="font-LexendBold text-slate-900 dark:text-white text-base tracking-tight flex-1">Subject Paper</Text>
                  <ChevronRight size={20} color={isDark ? '#475569' : '#cbd5e1'} />
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Filters Selection */}
            {reportStep === 'filters' && !activeSelector && (
              <View className="flex-col gap-4">
                <TouchableOpacity 
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setActiveSelector('class');
                  }}
                  className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex-row items-center justify-between active:opacity-80"
                >
                  <View>
                    <Text className="text-[10px] font-LexendBold text-slate-500 uppercase tracking-widest mb-1">Class</Text>
                    <Text className="font-LexendBold text-slate-900 dark:text-white text-base">{selectedClass}</Text>
                  </View>
                  <ChevronRight size={20} color={isDark ? '#475569' : '#cbd5e1'} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setActiveSelector('term');
                  }}
                  className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex-row items-center justify-between active:opacity-80"
                >
                  <View>
                    <Text className="text-[10px] font-LexendBold text-slate-500 uppercase tracking-widest mb-1">Term</Text>
                    <Text className="font-LexendBold text-slate-900 dark:text-white text-base">{selectedTerm}</Text>
                  </View>
                  <ChevronRight size={20} color={isDark ? '#475569' : '#cbd5e1'} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setActiveSelector('assessment');
                  }}
                  className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex-row items-center justify-between mb-4 active:opacity-80"
                >
                  <View>
                    <Text className="text-[10px] font-LexendBold text-slate-500 uppercase tracking-widest mb-1">Assessment</Text>
                    <Text className="font-LexendBold text-slate-900 dark:text-white text-base">{selectedAssessment}</Text>
                  </View>
                  <ChevronRight size={20} color={isDark ? '#475569' : '#cbd5e1'} />
                </TouchableOpacity>

                <TouchableOpacity 
                  disabled={isGenerating || !hasAccess || isLoadingPremium}
                  onPress={async () => {
                    if (selectedClass === 'Select Class' || selectedTerm === 'Select Term' || selectedAssessment === 'Select Assessment') {
                      Alert.alert('Missing Information', 'Please select a Class, Term, and Assessment to generate the report.');
                      return;
                    }

                    setIsGenerating(true);
                    try {
                      await generateReportCardPDF({
                        className: selectedClass,
                        term: selectedTerm,
                        assessmentName: selectedAssessment,
                        reportType: selectedReportType || 'Exam',
                        schoolName: schoolProfile?.name || schoolProfile?.schoolName,
                        schoolAddress: schoolProfile?.address || schoolProfile?.location || 'Lagos State, Nigeria',
                        schoolLogo: schoolProfile?.logo
                      });
                      setReportsModalVisible(false);
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  className={`w-full rounded-full py-4 items-center justify-center shadow-lg active:opacity-80 flex-row gap-2 ${
                    !hasAccess 
                      ? 'bg-amber-100 shadow-amber-500/20 opacity-90' 
                      : 'bg-blue-600 shadow-blue-500/30'
                  } ${isGenerating ? 'opacity-80' : ''}`}
                >
                  {!hasAccess ? (
                    <>
                      <Gem color="#d97706" size={20} />
                      <Text className="font-LexendBold text-amber-600 text-lg tracking-tight ml-2">Premium Feature</Text>
                    </>
                  ) : isGenerating ? (
                    <>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text className="font-LexendBold text-white text-lg tracking-tight ml-2">Generating...</Text>
                    </>
                  ) : (
                    <Text className="font-LexendBold text-white text-lg tracking-tight">Generate Report</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Dynamic Selector Options List */}
            {activeSelector && (
              <View className="flex-1" style={{ flexShrink: 1 }}>
                <View className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex-row items-center mb-4">
                  <Search size={20} color={isDark ? '#cbd5e1' : '#64748b'} className="mr-2" />
                  <TextInput
                    placeholder={`Search ${activeSelector}...`}
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 font-Lexend text-slate-900 dark:text-white h-8"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <X size={16} color={isDark ? '#94a3b8' : '#cbd5e1'} />
                    </TouchableOpacity>
                  )}
                </View>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
                  <View className="flex-col gap-3 pb-4">
                    {(activeSelector === 'class' ? classOptions : activeSelector === 'term' ? termOptions : assessmentOptions)
                      .filter((opt) => opt && String(opt).toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((opt, index) => (
                      <TouchableOpacity
                        key={`${opt}-${index}`}
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          if (activeSelector === 'class') setSelectedClass(opt);
                          if (activeSelector === 'term') setSelectedTerm(opt);
                          if (activeSelector === 'assessment') setSelectedAssessment(opt);
                          setActiveSelector(null);
                          setSearchQuery('');
                        }}
                        className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex-row items-center justify-between active:opacity-80"
                      >
                        <Text className="font-LexendBold text-slate-900 dark:text-white text-base">{opt}</Text>
                        {((activeSelector === 'class' && selectedClass === opt) || 
                          (activeSelector === 'term' && selectedTerm === opt) ||
                          (activeSelector === 'assessment' && selectedAssessment === opt)) && (
                          <CheckCircle2 size={20} color="#10b981" />
                        )}
                      </TouchableOpacity>
                    ))}
                    {(activeSelector === 'class' ? classOptions : activeSelector === 'term' ? termOptions : assessmentOptions)
                      .filter((opt) => opt && String(opt).toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <Text className="text-center font-Lexend text-slate-500 mt-4">No results found</Text>
                    )}
                  </View>
                </ScrollView>
              </View>
            )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
