import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { Shield, Trash2, LogOut, ChevronRight, X, Bell } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';
import { useHealthStore } from '../../../store/useHealthStore';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onDeleteData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onLogout,
  onDeleteData,
}) => {
  const profile = useHealthStore((state) => state.profile);
  const updateProfile = useHealthStore((state) => state.updateProfile);

  const togglePref = async (key: string) => {
    if (!profile) return;
    const newPrefs = {
      ...profile.notification_prefs,
      [key]: !profile.notification_prefs[key]
    };
    await updateProfile({ notification_prefs: newPrefs });
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Permanently Delete Data?",
      "This action cannot be undone. All your cycle history, symptoms, and profile data will be permanently removed from our servers and this device.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Everything", 
          style: "destructive",
          onPress: onDeleteData
        }
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => togglePref('period_reminder')}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.period + '15' }]}>
                  <Bell size={18} color={Colors.period} />
                </View>
                <Text style={styles.menuLabel}>Period Reminders</Text>
                <View style={[styles.toggle, profile?.notification_prefs?.period_reminder && styles.toggleActive]}>
                  <View style={[styles.toggleCircle, profile?.notification_prefs?.period_reminder && styles.toggleCircleActive]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => togglePref('fertility_reminder')}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.fertility + '15' }]}>
                  <Bell size={18} color={Colors.fertility} />
                </View>
                <Text style={styles.menuLabel}>Fertility Window</Text>
                <View style={[styles.toggle, profile?.notification_prefs?.fertility_reminder && styles.toggleActive]}>
                  <View style={[styles.toggleCircle, profile?.notification_prefs?.fertility_reminder && styles.toggleCircleActive]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => togglePref('daily_reminder')}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.follicular + '15' }]}>
                  <Bell size={18} color={Colors.follicular} />
                </View>
                <Text style={styles.menuLabel}>Daily Log Reminder</Text>
                <View style={[styles.toggle, profile?.notification_prefs?.daily_reminder && styles.toggleActive]}>
                  <View style={[styles.toggleCircle, profile?.notification_prefs?.daily_reminder && styles.toggleCircleActive]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => togglePref('water_reminder')}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.ovulation + '15' }]}>
                  <Bell size={18} color={Colors.ovulation} />
                </View>
                <Text style={styles.menuLabel}>Hydration Reminder</Text>
                <View style={[styles.toggle, profile?.notification_prefs?.water_reminder && styles.toggleActive]}>
                  <View style={[styles.toggleCircle, profile?.notification_prefs?.water_reminder && styles.toggleCircleActive]} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account & Privacy</Text>
              
              <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.border }]}>
                  <LogOut size={18} color={Colors.text} />
                </View>
                <Text style={styles.menuLabel}>Log Out</Text>
                <ChevronRight size={18} color={Colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleDeletePress}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFE5E5' }]}>
                  <Trash2 size={18} color="#FF4D4D" />
                </View>
                <Text style={[styles.menuLabel, { color: '#FF4D4D' }]}>Delete My Data</Text>
                <ChevronRight size={18} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.privacyInfo}>
              <Shield size={16} color={Colors.fertility} />
              <Text style={styles.privacyText}>
                Your data is encrypted and stored securely. We never sell your personal health information.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.versionText}>Gaia Wellness v1.0.0</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    minHeight: '50%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  privacyInfo: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'flex-start',
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 12,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  toggle: {
    width: 44,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: Colors.fertility,
  },
  toggleCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.card,
  },
  toggleCircleActive: {
    transform: [{ translateX: 22 }],
  },
});
