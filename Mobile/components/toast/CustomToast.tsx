import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Appearance } from 'react-native';
import { ToastConfigParams } from 'react-native-toast-message';
import { CheckCircle, AlertTriangle, Info, AlertCircle, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

// ─── Types ─────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastBaseProps extends ToastConfigParams<any> {
  icon: React.ComponentType<{ color: string; size: number }>;
  accentColor: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
}

// ─── Progress Bar ───────────────────────────────────────────────────────────

const ProgressBar = ({ duration, color }: { duration: number; color: string }) => {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={{ height: 3, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 99, marginTop: 10 }}>
      <Animated.View
        style={{
          height: 3,
          borderRadius: 99,
          backgroundColor: color,
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
};

// ─── Base Toast Component ───────────────────────────────────────────────────

const ToastBase = ({
  text1,
  text2,
  icon: Icon,
  accentColor,
  bgLight,
  bgDark,
  borderLight,
  borderDark,
}: ToastBaseProps) => {
  const isDark = Appearance.getColorScheme() === 'dark';
  const bg = isDark ? bgDark : bgLight;
  const border = isDark ? borderDark : borderLight;
  const titleColor = isDark ? '#f1f5f9' : '#0f172a';
  const subtitleColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <View
      style={{
        width: '90%',
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 20,
        marginTop: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Left accent strip */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: accentColor,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 14, paddingLeft: 20 }}>
        {/* Icon */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: accentColor + '18',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            flexShrink: 0,
          }}
        >
          <Icon color={accentColor} size={20} />
        </View>

        {/* Text Content */}
        <View style={{ flex: 1 }}>
          {text1 ? (
            <Text
              style={{
                fontFamily: 'LexendBold',
                fontSize: 14,
                color: titleColor,
                lineHeight: 20,
              }}
              numberOfLines={1}
            >
              {text1}
            </Text>
          ) : null}
          {text2 ? (
            <Text
              style={{
                fontFamily: 'Lexend',
                fontSize: 12,
                color: subtitleColor,
                marginTop: 2,
                lineHeight: 17,
              }}
              numberOfLines={2}
            >
              {text2}
            </Text>
          ) : null}

          {/* Progress Bar */}
          <ProgressBar duration={4000} color={accentColor} />
        </View>

        {/* Dismiss Button */}
        <TouchableOpacity
          onPress={() => Toast.hide()}
          style={{
            padding: 4,
            marginLeft: 8,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={14} color={subtitleColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Toast Config Export ─────────────────────────────────────────────────────

export const toastConfig = {
  success: (props: ToastConfigParams<any>) => (
    <ToastBase
      {...props}
      icon={CheckCircle}
      accentColor="#10b981"
      bgLight="#f0fdf4"
      bgDark="#052e16"
      borderLight="#bbf7d0"
      borderDark="#166534"
    />
  ),
  error: (props: ToastConfigParams<any>) => (
    <ToastBase
      {...props}
      icon={AlertCircle}
      accentColor="#ef4444"
      bgLight="#fef2f2"
      bgDark="#450a0a"
      borderLight="#fecaca"
      borderDark="#7f1d1d"
    />
  ),
  warning: (props: ToastConfigParams<any>) => (
    <ToastBase
      {...props}
      icon={AlertTriangle}
      accentColor="#f59e0b"
      bgLight="#fffbeb"
      bgDark="#422006"
      borderLight="#fde68a"
      borderDark="#78350f"
    />
  ),
  info: (props: ToastConfigParams<any>) => (
    <ToastBase
      {...props}
      icon={Info}
      accentColor="#3b82f6"
      bgLight="#eff6ff"
      bgDark="#172554"
      borderLight="#bfdbfe"
      borderDark="#1e3a8a"
    />
  ),
};
