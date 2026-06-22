import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Shield, Trash2, LogOut, ChevronRight, X, Bell, Download, Upload, FileJson } from 'lucide-react-native';
import { Colors as StaticColors, Spacing, BorderRadius, useTheme } from '../../../theme/theme';
import { useHealthStore } from '../../../store/useHealthStore';
import { healthApi } from '../../../services/api';
import { showToast } from '../../../utils/toast';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

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
  const { colors: Colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(Colors, isDark), [Colors, isDark]);
  const profile = useHealthStore((state) => state.profile);
  const updateProfile = useHealthStore((state) => state.updateProfile);
  const fetchPredictions = useHealthStore((state) => state.fetchPredictions);
  const fetchCycleLogs = useHealthStore((state) => state.fetchCycleLogs);
  const fetchHistory = useHealthStore((state) => state.fetchHistory);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const togglePref = async (key: string) => {
    if (!profile) return;
    const newPrefs = {
      ...profile.notification_prefs,
      [key]: !profile.notification_prefs[key]
    };
    await updateProfile({ notification_prefs: newPrefs });
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await healthApi.exportData();
      const filename = `gaia_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        showToast.success('Export Complete', `Saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast.error('Export Failed', 'Could not export your data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      
      Alert.alert(
        "Import Data?",
        "This will overwrite all your current cycle and symptom history with the data from the file. This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Import & Overwrite", 
            onPress: async () => {
              try {
                setIsImporting(true);
                const content = await FileSystem.readAsStringAsync(file.uri);
                const jsonData = JSON.parse(content);
                
                await healthApi.importData(jsonData);
                
                // Refresh all store data
                await Promise.all([
                  useHealthStore.getState().fetchProfile(),
                  fetchPredictions(),
                  fetchCycleLogs(),
                  fetchHistory(
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    new Date().toISOString().split('T')[0]
                  )
                ]);

                showToast.success('Import Successful', 'Your data has been restored.');
              } catch (e) {
                showToast.error('Import Failed', 'Invalid backup file format.');
              } finally {
                setIsImporting(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      showToast.error('Import Error', 'Could not open file picker.');
    }
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
              <Text style={styles.sectionTitle}>Data Portability</Text>
              
              <TouchableOpacity style={styles.menuItem} onPress={handleExportData} disabled={isExporting}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '15' }]}>
                  {isExporting ? <ActivityIndicator size="small" color={Colors.primary} /> : <Download size={18} color={Colors.primary} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>Backup Data (JSON)</Text>
                  <Text style={styles.menuSubtitle}>Download your entire history</Text>
                </View>
                <ChevronRight size={18} color={Colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleImportData} disabled={isImporting}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.fertility + '15' }]}>
                  {isImporting ? <ActivityIndicator size="small" color={Colors.fertility} /> : <Upload size={18} color={Colors.fertility} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>Restore Data</Text>
                  <Text style={styles.menuSubtitle}>Import from a backup file</Text>
                </View>
                <ChevronRight size={18} color={Colors.textLight} />
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

const createStyles = (Colors: any, isDark: boolean) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    minHeight: '70%',
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  privacyInfo: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#2A2A2A' : Colors.background,
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
