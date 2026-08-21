import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Home, BookOpen, Users, FileCheck2, Settings } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');
const TAB_BAR_MARGIN = 24 * 2;
const TAB_BAR_WIDTH = width - TAB_BAR_MARGIN;
const TAB_WIDTH = TAB_BAR_WIDTH / 5;
const INDICATOR_SIZE = 48; // w-12 is 48px
const INDICATOR_OFFSET = (TAB_WIDTH - INDICATOR_SIZE) / 2;

function CustomTabBar({ state, descriptors, navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const animatedValue = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: state.index,
      useNativeDriver: true,
      bounciness: 12,
      speed: 14,
    }).start();
  }, [state.index]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [
      0 * TAB_WIDTH,
      1 * TAB_WIDTH,
      2 * TAB_WIDTH,
      3 * TAB_WIDTH,
      4 * TAB_WIDTH,
    ],
  });

  return (
    <View
      style={{
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 16 : 12,
        left: 24,
        right: 24,
        height: 72,
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderRadius: 40,
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Animated Indicator */}
      <Animated.View
        style={{
          position: 'absolute',
          width: INDICATOR_SIZE,
          height: INDICATOR_SIZE,
          borderRadius: INDICATOR_SIZE / 2,
          backgroundColor: isDark ? '#064e3b' : '#dcfce7',
          left: INDICATOR_OFFSET,
          transform: [{ translateX }],
        }}
      />

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        let IconComponent = Home;
        if (route.name === 'classes') IconComponent = BookOpen;
        if (route.name === 'students') IconComponent = Users;
        if (route.name === 'exams') IconComponent = FileCheck2;
        if (route.name === 'settings') IconComponent = Settings;

        const iconColor = isFocused 
          ? (isDark ? '#ffffff' : '#064e3b') 
          : (isDark ? '#94a3b8' : '#64748b');

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{ width: TAB_WIDTH, alignItems: 'center', justifyContent: 'center', height: 72 }}
            activeOpacity={0.8}
          >
            <View style={{ width: INDICATOR_SIZE, height: INDICATOR_SIZE, alignItems: 'center', justifyContent: 'center' }}>
              <IconComponent size={24} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TeacherTabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }} />
  );
}
