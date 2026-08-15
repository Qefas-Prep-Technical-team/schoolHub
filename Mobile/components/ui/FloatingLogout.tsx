import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LogOut, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { clearTokens, clearUserRole } from '@/lib/auth/secure-store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQueryClient } from '@tanstack/react-query';

/**
 * A floating logout button that renders as a small pill in the corner.
 * It always stays on top of skeleton loaders via absolute positioning.
 * Wrap this inside a `position: relative` parent View.
 *
 * Shows a confirmation modal before logging out.
 */
export function FloatingLogout() {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const queryClient = useQueryClient();

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await clearTokens();
      await clearUserRole();
      queryClient.clear();
      router.replace('/role-picker');
    } catch (e) {
      console.error('Logout error:', e);
      setIsLoggingOut(false);
      setConfirmVisible(false);
    }
  };

  return (
    <>
      {/* Floating logout pill — always visible above skeleton loaders */}
      <TouchableOpacity
        style={styles.pill}
        onPress={() => setConfirmVisible(true)}
        activeOpacity={0.85}
      >
        <LogOut size={14} color="#ef4444" />
        <Text style={styles.pillText}>Logout</Text>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: isDark ? '#0f172a' : '#ffffff' }]}>
            {/* Close */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setConfirmVisible(false)}
            >
              <X size={18} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconWrap}>
              <LogOut size={28} color="#ef4444" />
            </View>

            <Text style={[styles.title, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
              Log out?
            </Text>
            <Text style={[styles.body, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              You will be redirected to the sign-in screen. Any unsaved changes will be lost.
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: isDark ? '#334155' : '#e2e8f0' }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={[styles.cancelText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={performLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.logoutText}>Log Out</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 100,
  },
  pillText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: 'LexendBold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'LexendBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    fontFamily: 'Lexend',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'LexendBold',
    fontSize: 14,
  },
  logoutBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    fontFamily: 'LexendBold',
    fontSize: 14,
  },
});
