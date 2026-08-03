import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, Calendar, ChevronRight, MessageSquare } from 'lucide-react-native';

export const AnnouncementsFeed = () => {
  const announcements = [
    {
      id: 1,
      title: 'End of Term Examinations',
      type: 'Event',
      date: 'Next Monday',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      id: 2,
      title: 'Parent-Teacher Meeting',
      type: 'Meeting',
      date: 'Oct 15, 2:00 PM',
      icon: MessageSquare,
      color: 'bg-purple-500',
    },
    {
      id: 3,
      title: 'School Fees Reminder',
      type: 'Alert',
      date: 'Due in 3 days',
      icon: Bell,
      color: 'bg-orange-500',
    },
  ];

  return (
    <View className="mb-6 px-4">
      <View className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center space-x-2">
            <View className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30 items-center justify-center border border-purple-100 dark:border-purple-800">
              <Bell size={16} color="#a855f7" />
            </View>
            <Text className="text-sm font-LexendBold text-slate-900 dark:text-white uppercase tracking-wider">
              School Activity
            </Text>
          </View>
          <TouchableOpacity>
            <Text className="text-[10px] font-LexendBold text-slate-500 dark:text-slate-400 uppercase tracking-widest">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-4">
          {announcements.map((item, index) => (
            <TouchableOpacity key={item.id} className="flex-row items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50 pb-3 mb-1">
              <View className="flex-row items-center space-x-3 flex-1 pr-4">
                <View className={`w-10 h-10 rounded-xl ${item.color} items-center justify-center`}>
                  <item.icon size={18} color="#ffffff" />
                </View>
                <View>
                  <Text className="text-xs font-LexendBold text-slate-900 dark:text-white mb-0.5" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-[10px] font-Lexend text-slate-500 dark:text-slate-400">{item.type}</Text>
                    <Text className="text-[10px] text-slate-300 dark:text-slate-600">•</Text>
                    <Text className="text-[10px] font-LexendBold text-primary dark:text-primary-container">{item.date}</Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={16} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
