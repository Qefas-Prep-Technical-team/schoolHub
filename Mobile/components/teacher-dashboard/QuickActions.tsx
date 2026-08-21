import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Plus, Share2, FileText, CheckCircle2, ChevronRight, BarChart3, Users, MessageSquare, X, Filter, BookOpen, ClipboardList, GraduationCap, LayoutGrid, Gem } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTeacherDashboardStats } from '@/lib/api/hooks/useTeacherDashboard';
import { generateReportCardPDF } from '@/lib/utils/pdfGenerator';
import { useAuthUser } from '@/lib/api/hooks/useAuth';
import { useSchoolSettings, useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage';

export function QuickActions() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

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
  
  // Filter States
  const [activeSelector, setActiveSelector] = useState<'class' | 'term' | 'assessment' | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('Select Class');
  const [selectedTerm, setSelectedTerm] = useState<string>('Select Term');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('Select Assessment');

  const { data: dashboardData } = useTeacherDashboardStats();
  const recentExams = dashboardData?.recentExams || [];
  const distributionData = dashboardData?.performanceMetrics?.distribution || { A: 0, B: 0, C: 0, D: 0, F: 0 };
  
  const todaySchedule = dashboardData?.todaySchedule || [];
  
  const classNames = dashboardData?.stats?.classNames || [];
  
  const classOptions = classNames.length > 0 ? (classNames as string[]) : ['Grade 10 Science', 'Grade 9 Math'];
  const termOptions = ['First Term', 'Second Term', 'Third Term'];
  
  // Dynamically populate assessment options based on selected class, with fallback
  let assessmentOptions: string[] = recentExams
    .filter((e: any) => e.className === selectedClass)
    .map((e: any) => e.title);
  if (assessmentOptions.length === 0) {
    assessmentOptions = ['Mid-Term Exam', 'Final Exam', 'CA 1', 'CA 2'];
  }

  const totalGrades = Object.values(distributionData).reduce((sum, val) => sum + (val as number), 0);
  const getPct = (val: number) => totalGrades > 0 ? Math.round((val / totalGrades) * 100) : 0;

  const distribution = [
    { grade: 'A', pct: getPct(distributionData.A), color: 'bg-emerald-500' },
    { grade: 'B', pct: getPct(distributionData.B), color: 'bg-blue-500' },
    { grade: 'C', pct: getPct(distributionData.C), color: 'bg-amber-500' },
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
            <View key={item.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className={`h-12 w-12 rounded-2xl items-center justify-center ${item.status === 'PUBLISHED' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  <FileText size={20} color={item.status === 'PUBLISHED' ? '#10b981' : '#f59e0b'} />
                </View>
                <View>
                  <Text className="font-LexendBold text-slate-900 dark:text-white mb-0.5">{item.title}</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[10px] font-LexendBold text-slate-500 uppercase tracking-widest">{item.className}</Text>
                    <View className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
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
        <View className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          {announcements.map((msg, idx) => (
            <TouchableOpacity key={msg.id} className={`p-4 flex-row items-center ${idx !== announcements.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
              <View className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-900/20 items-center justify-center border border-sky-100 dark:border-sky-800/30 mr-4">
                <MessageSquare size={20} color="#0ea5e9" />
              </View>
              <View className="flex-1">
                <Text className={`font-LexendBold text-base ${msg.unread ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{msg.title}</Text>
                <Text className="text-xs font-Lexend text-slate-500 mt-0.5">{msg.sender}</Text>
              </View>
              {msg.unread && (
                <View className="h-3 w-3 bg-sky-500 rounded-full" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Reports Modal */}
      <Modal
        visible={reportsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReportsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-slate-900/60">
          <View className="bg-white dark:bg-slate-950 w-full rounded-t-[2.5rem] p-6 pb-12 shadow-2xl border-t border-slate-200/50 dark:border-slate-800/50">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row items-center gap-3">
                <TouchableOpacity 
                  onPress={() => {
                    if (activeSelector) {
                      setActiveSelector(null);
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

            {/* Step 1: Type Selection (2x2 Grid) */}
            {reportStep === 'type' && !activeSelector && (
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
            )}

            {/* Step 2: Filters Selection */}
            {reportStep === 'filters' && !activeSelector && (
              <View className="flex-col gap-4">
                <TouchableOpacity 
                  onPress={() => setActiveSelector('class')}
                  className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex-row items-center justify-between active:opacity-80"
                >
                  <View>
                    <Text className="text-[10px] font-LexendBold text-slate-500 uppercase tracking-widest mb-1">Class</Text>
                    <Text className="font-LexendBold text-slate-900 dark:text-white text-base">{selectedClass}</Text>
                  </View>
                  <ChevronRight size={20} color={isDark ? '#475569' : '#cbd5e1'} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setActiveSelector('term')}
                  className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex-row items-center justify-between active:opacity-80"
                >
                  <View>
                    <Text className="text-[10px] font-LexendBold text-slate-500 uppercase tracking-widest mb-1">Term</Text>
                    <Text className="font-LexendBold text-slate-900 dark:text-white text-base">{selectedTerm}</Text>
                  </View>
                  <ChevronRight size={20} color={isDark ? '#475569' : '#cbd5e1'} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setActiveSelector('assessment')}
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
              <ScrollView className="max-h-[300px]" showsVerticalScrollIndicator={false}>
                <View className="flex-col gap-3 pb-4">
                  {(activeSelector === 'class' ? classOptions : activeSelector === 'term' ? termOptions : assessmentOptions).map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => {
                        if (activeSelector === 'class') setSelectedClass(opt);
                        if (activeSelector === 'term') setSelectedTerm(opt);
                        if (activeSelector === 'assessment') setSelectedAssessment(opt);
                        setActiveSelector(null);
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
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
