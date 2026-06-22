import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, Modal, ScrollView, Dimensions } from 'react-native';
import { Mail, Phone, User, ArrowRight } from 'lucide-react-native';

export interface TeacherInfo {
  name: string;
  title: string;
  avatar: string;
  email: string;
  phone: string;
}

interface ClassOverviewCardProps {
  title?: string;
  teachers: TeacherInfo[];
  description: string;
}

const CLASS_IMAGES = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800',
  'https://images.unsplash.com/photo-1513258496099-4816c02422eb?q=80&w=800',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800'
];

const getClassImage = (title?: string) => {
  if (!title) return CLASS_IMAGES[0];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CLASS_IMAGES[Math.abs(hash) % CLASS_IMAGES.length];
};

export function ClassOverviewCard({ title, teachers, description }: ClassOverviewCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherInfo | null>(null);

  const activeTeachers = teachers.length > 0 ? teachers : [{
    name: 'Unassigned Teacher',
    title: 'Class Teacher',
    avatar: 'https://ui-avatars.com/api/?name=T&background=6366f1&color=fff&size=128',
    email: '',
    phone: ''
  }];

  const handleTeacherPress = (teacher: TeacherInfo) => {
    setSelectedTeacher(teacher);
    setModalVisible(true);
  };

  const handleEmail = () => {
    if (selectedTeacher?.email) {
      Linking.openURL(`mailto:${selectedTeacher.email}`);
    }
  };

  const handlePhone = () => {
    if (selectedTeacher?.phone) {
      Linking.openURL(`tel:${selectedTeacher.phone}`);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  // Account for padding: screenWidth - containerPadding (24*2=48) - internalPadding (20*2=40)
  const cardWidth = screenWidth - 88; 

  return (
    <View 
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-6"
      style={{ elevation: 4, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }}
    >
      
      {/* Header Banner & Avatar */}
      <View className="relative mb-10">
        {/* Banner Image */}
        <View className="rounded-2xl overflow-hidden bg-indigo-50 dark:bg-indigo-900/20">
          <Image 
            source={{ uri: getClassImage(title) }}
            style={{ width: '100%', height: 120 }}
          />
        </View>
        
        {/* Overlapping Avatar */}
        <View 
          className="absolute -bottom-5 left-4 w-16 h-16 bg-white dark:bg-slate-900 rounded-full items-center justify-center border-4 border-white dark:border-slate-900"
          style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
        >
          <Text className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {title ? title.charAt(0).toUpperCase() : 'C'}
          </Text>
        </View>
      </View>
      
      {/* Description Section */}
      <View className="mb-6 px-2">
        <Text className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2">
          Course Description
        </Text>
        <Text className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {description || 'No description provided.'}
        </Text>
      </View>

      {/* Teachers Slider */}
      <View>
        <Text className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-3">
          Instructors ({activeTeachers.length})
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 12} // card width + margin right
          decelerationRate="fast"
        >
          {activeTeachers.map((teacher, index) => (
            <TouchableOpacity 
              key={index}
              activeOpacity={0.7}
              onPress={() => handleTeacherPress(teacher)}
              style={{ width: cardWidth }}
              className="flex-row items-center p-3 mr-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl"
            >
              <Image 
                source={{ uri: teacher.avatar }} 
                className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 mr-3" 
              />
              <View className="flex-1 justify-center">
                <Text className="text-base font-bold text-slate-900 dark:text-white mb-0.5" numberOfLines={1}>
                  {teacher.name}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400" numberOfLines={1}>
                  {teacher.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Teacher Details Modal */}
      {selectedTeacher && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <User size={20} className="text-indigo-500 mr-2" />
                  <Text className="text-xl font-bold text-slate-900 dark:text-white">Instructor Profile</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 -mr-2">
                  <Text className="text-2xl text-slate-400">&times;</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6">
                <Image source={{ uri: selectedTeacher.avatar }} className="w-16 h-16 rounded-full mr-4" />
                <View className="flex-1">
                  <Text className="text-lg font-bold text-slate-900 dark:text-white" numberOfLines={2}>
                    {selectedTeacher.name}
                  </Text>
                  <Text className="text-sm text-indigo-500 dark:text-indigo-400 mt-1" numberOfLines={1}>
                    {selectedTeacher.title}
                  </Text>
                </View>
              </View>

              <View className="space-y-3">
                {selectedTeacher.email ? (
                  <TouchableOpacity onPress={handleEmail} className="flex-row items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <View className="flex-row items-center">
                      <View className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl mr-3">
                        <Mail size={20} className="text-indigo-500" />
                      </View>
                      <View>
                        <Text className="font-bold text-slate-900 dark:text-white">Send Email</Text>
                        <Text className="text-xs text-slate-500 dark:text-slate-400">{selectedTeacher.email}</Text>
                      </View>
                    </View>
                    <ArrowRight size={16} className="text-slate-300" />
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity 
                  onPress={handlePhone}
                  disabled={!selectedTeacher.phone}
                  className={`flex-row items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-2xl ${!selectedTeacher.phone ? 'opacity-50' : ''}`}
                >
                  <View className="flex-row items-center">
                    <View className={`p-2 rounded-xl mr-3 ${selectedTeacher.phone ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <Phone size={20} className={selectedTeacher.phone ? 'text-emerald-500' : 'text-slate-400'} />
                    </View>
                    <View>
                      <Text className="font-bold text-slate-900 dark:text-white">Call / Phone</Text>
                      <Text className="text-xs text-slate-500 dark:text-slate-400">{selectedTeacher.phone || 'Not registered'}</Text>
                    </View>
                  </View>
                  {selectedTeacher.phone ? <ArrowRight size={16} className="text-slate-300" /> : null}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="mt-6 py-4 bg-slate-900 dark:bg-slate-100 rounded-2xl items-center"
              >
                <Text className="font-bold text-white dark:text-slate-900">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
