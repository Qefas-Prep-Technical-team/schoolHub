import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, CheckCircle, FileText, Link as LinkIcon, Video, AlertCircle, ExternalLink } from 'lucide-react-native';
import { useChildAssignmentDetails } from '@/lib/api/hooks/useParentChildren';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Extracts a YouTube video ID from any known YouTube URL format. Returns null if not a YouTube URL. */
const extractYouTubeId = (url: string): string | null => {
    if (url.includes('youtube.com/watch')) {
        const match = url.match(/[?&]v=([^&]+)/);
        return match?.[1] ?? null;
    }
    if (url.includes('youtu.be/')) {
        const match = url.match(/youtu\.be\/([^?#]+)/);
        return match?.[1] ?? null;
    }
    if (url.includes('youtube.com/embed/')) {
        const match = url.match(/embed\/([^?#]+)/);
        return match?.[1] ?? null;
    }
    return null;
};

/** Builds the YouTube IFrame Player API HTML — works reliably in React Native WebView. */
const buildYouTubeHtml = (videoId: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    #player { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="player"></div>
  <script>
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    function onYouTubeIframeAPIReady() {
      new YT.Player('player', {
        videoId: '${videoId}',
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 1 },
        events: { onReady: function(e) { e.target.pauseVideo(); } }
      });
    }
  </script>
</body>
</html>`;

/** Builds an HTML page that plays a direct mp4/webm/mov URL. */
const buildDirectVideoHtml = (url: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #000; display: flex; justify-content: center; align-items: center; overflow: hidden; }
    video { width: 100%; height: 100%; object-fit: contain; }
  </style>
</head>
<body>
  <video src="${url}" controls playsinline webkit-playsinline preload="auto"></video>
</body>
</html>`;

type VideoSource =
    | { type: 'youtube'; videoId: string }
    | { type: 'direct'; url: string }
    | { type: 'link'; url: string };

const resolveVideoSource = (url: string | null | undefined): VideoSource | null => {
    if (!url) return null;
    const ytId = extractYouTubeId(url);
    if (ytId) return { type: 'youtube', videoId: ytId };
    if (url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('.mp4?')) return { type: 'direct', url };
    return { type: 'link', url };
};

interface VideoPlayerProps {
    url: string;
    isDark: boolean;
}

/** Renders the best possible player for the given video URL. */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, isDark }) => {
    const [webViewError, setWebViewError] = useState(false);
    const source = resolveVideoSource(url);

    if (!source) return null;

    if (source.type === 'link' || webViewError) {
        // Not embeddable — just show an "Open" button
        return (
            <TouchableOpacity
                onPress={() => Linking.openURL(url)}
                style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    padding: 16, borderRadius: 14,
                    backgroundColor: isDark ? '#1e1b4b' : '#ede9fe',
                    borderWidth: 1, borderColor: isDark ? '#4338ca' : '#c4b5fd',
                    gap: 10,
                }}
            >
                <ExternalLink size={18} color="#7c3aed" />
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#7c3aed' }}>Open Video Link</Text>
            </TouchableOpacity>
        );
    }

    const html = source.type === 'youtube'
        ? buildYouTubeHtml(source.videoId)
        : buildDirectVideoHtml(source.url);

    return (
        <View style={{ height: 220, width: '100%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
            <WebView
                source={{ html, baseUrl: source.type === 'youtube' ? 'https://www.youtube.com' : '' }}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                allowsFullscreenVideo={true}
                scrollEnabled={false}
                onError={() => setWebViewError(true)}
                onHttpError={() => setWebViewError(true)}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                        <ActivityIndicator color="#fff" />
                    </View>
                )}
            />
        </View>
    );
};

export default function ChildAssignmentDetailsScreen() {
    const router = useRouter();
    const { childId, assignmentId } = useLocalSearchParams();
    const cId = Array.isArray(childId) ? childId[0] : childId;
    const aId = Array.isArray(assignmentId) ? assignmentId[0] : assignmentId;
    
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const screenBg = isDark ? '#020617' : '#f8fafc';

    const { data: assignmentData, isLoading, error } = useChildAssignmentDetails(cId || '', aId || '');

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }} edges={['top']}>
                <View className="flex-row items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color={isDark ? '#fff' : '#0f172a'} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">Assignment Details</Text>
                </View>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !assignmentData) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }} edges={['top']}>
                <View className="flex-row items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color={isDark ? '#fff' : '#0f172a'} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">Error</Text>
                </View>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-rose-500 font-bold mb-4">Could not load assignment details.</Text>
                    <TouchableOpacity onPress={() => router.back()} className="bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-lg">
                        <Text className="text-slate-700 dark:text-slate-300">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const assignment = assignmentData;
    const submission = assignment?.submissions?.[0];
    
    // Check submission status
    const isSubmitted = submission && (submission.status === 'SUBMITTED' || submission.status === 'GRADED');
    const isGraded = submission && submission.status === 'GRADED';
    
    const formattedDate = assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Due Date';
    
    // For parents to view answers (Read Only)
    const quizAnswers: Record<string, string> = {};
    if (submission && Array.isArray(submission.answers)) {
        submission.answers.forEach((ans: any) => {
            quizAnswers[ans.questionId] = ans.answer;
        });
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }} edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ArrowLeft size={24} color={isDark ? '#fff' : '#0f172a'} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-900 dark:text-white truncate" numberOfLines={1}>
                        {assignment.title}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Meta Information */}
                <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-1 mr-4">
                            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">{assignment.title}</Text>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap gap-y-4">
                        <View className="w-1/2 flex-row items-center gap-2">
                            <View className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center">
                                <FileText size={14} color="#6366f1" />
                            </View>
                            <View>
                                <Text className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Marks</Text>
                                <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">{assignment.totalMarks}</Text>
                            </View>
                        </View>
                        
                        <View className="w-1/2 flex-row items-center gap-2">
                            <View className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/30 items-center justify-center">
                                <Clock size={14} color="#f43f5e" />
                            </View>
                            <View>
                                <Text className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Due Date</Text>
                                <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formattedDate}</Text>
                            </View>
                        </View>
                        
                        {isGraded && submission && (
                            <View className="w-full mt-2 pt-4 border-t border-slate-100 dark:border-slate-800 flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 items-center justify-center">
                                    <CheckCircle size={14} color="#10b981" />
                                </View>
                                <View>
                                    <Text className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Score</Text>
                                    <Text className="text-base font-bold text-emerald-600 dark:text-emerald-400">{submission.score} / {assignment.totalMarks}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Instructions */}
                {assignment.instructions ? (
                    <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 mb-6">
                        <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Instructions</Text>
                        <Text className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {assignment.instructions}
                        </Text>
                    </View>
                ) : null}
                
                {/* References */}
                {(assignment.videoUrl || assignment.referenceUrl) && (
                    <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 mb-6">
                        <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">References</Text>
                        
                        {assignment.videoUrl ? (
                            <View className="mb-4">
                                <Text className="text-sm font-bold text-slate-900 dark:text-white mb-2">Video Lesson</Text>
                                <VideoPlayer url={assignment.videoUrl} isDark={isDark} />
                                {/* Only show the "Open in App" fallback for YouTube links */}
                                {extractYouTubeId(assignment.videoUrl) && (
                                    <TouchableOpacity
                                        onPress={() => Linking.openURL(assignment.videoUrl!)}
                                        className="mt-3 flex-row items-center justify-center py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800"
                                    >
                                        <Video size={16} color={isDark ? '#cbd5e1' : '#64748b'} />
                                        <Text className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">
                                            Open in YouTube App
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : null}
                        
                        {assignment.referenceUrl ? (
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: isDark ? '#052e16' : '#f0fdf4', borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#166534' : '#bbf7d0' }}
                                onPress={() => Linking.openURL(assignment.referenceUrl!)}
                            >
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#166534' : '#dcfce7', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                    <LinkIcon size={18} color="#059669" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text className="text-sm font-bold text-slate-900 dark:text-white">Open Link</Text>
                                    <Text className="text-xs text-slate-500 dark:text-slate-400">Tap to open reference</Text>
                                </View>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                )}

                {/* Questions Preview (Restricted) */}
                {isSubmitted ? (
                    <View className="mb-6">
                        <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Quiz Questions & Answers</Text>
                        
                        {assignment.questions && assignment.questions.length > 0 ? (
                            assignment.questions.map((q: any, idx: number) => (
                                <View key={q.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
                                    <View className="flex-row items-start justify-between mb-4">
                                        <Text className="flex-1 text-sm font-semibold text-slate-900 dark:text-white leading-relaxed pr-3">
                                            {idx + 1}. {q.question}
                                        </Text>
                                        <View className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{q.marks} Marks</Text>
                                        </View>
                                    </View>

                                    {q.type === 'MULTIPLE_CHOICE' ? (
                                        <View style={{ gap: 8 }}>
                                            {['optionA', 'optionB', 'optionC', 'optionD'].map((optKey) => {
                                                const optionVal = q[optKey];
                                                if (!optionVal) return null;
                                                const optionLetter = optKey.replace('option', '');
                                                const isSelected = quizAnswers[q.id] === optionLetter;
                                                const isCorrectAnswer = isGraded && q.correctAnswer === optionLetter;

                                                let labelClass = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800';
                                                
                                                if (isGraded) {
                                                    if (isCorrectAnswer) labelClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950';
                                                    else if (isSelected && !isCorrectAnswer) labelClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950';
                                                    else labelClass = 'border-slate-200 dark:border-slate-800 opacity-50';
                                                } else if (isSelected) {
                                                    labelClass = 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950';
                                                }

                                                return (
                                                    <View
                                                        key={optKey}
                                                        className={`flex-row items-center p-4 rounded-xl border ${labelClass}`}
                                                    >
                                                        <View className={`w-5 h-5 rounded-full border items-center justify-center mr-3 ${isSelected ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'} ${isGraded && isCorrectAnswer ? 'border-emerald-500 bg-emerald-500' : ''} ${isGraded && isSelected && !isCorrectAnswer ? 'border-rose-500 bg-rose-500' : ''} ${!isGraded && isSelected ? 'bg-indigo-500' : ''}`}>
                                                            {(isSelected || (isGraded && isCorrectAnswer)) && (
                                                                <View className="w-2 h-2 rounded-full bg-white" />
                                                            )}
                                                        </View>
                                                        <Text className={`flex-1 text-sm ${isSelected ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                            {optionVal}
                                                        </Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    ) : (
                                        <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[100px]">
                                            <Text className="text-sm text-slate-700 dark:text-slate-300">
                                                {quizAnswers[q.id] || "No answer provided"}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))
                        ) : (
                            <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                                <Text className="text-sm text-slate-500 dark:text-slate-400 italic">No questions associated with this assignment.</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="bg-blue-50 dark:bg-blue-900/30 rounded-3xl p-6 border border-blue-100 dark:border-blue-800/50 flex-row items-start mt-2">
                        <AlertCircle size={20} color="#3b82f6" style={{ marginTop: 2 }} />
                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
                                Content Hidden
                            </Text>
                            <Text className="text-xs text-blue-700 dark:text-blue-400/80 leading-relaxed">
                                The questions and answers will be visible after your child completes and submits this assignment.
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
