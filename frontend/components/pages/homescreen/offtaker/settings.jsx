import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, StatusBar, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Lock,
  Globe,
  Moon,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Target,
  FileText,
  Check,
  X
} from 'lucide-react-native';
import Header from '../../../common/BHeader';
import { ThemeContext } from '../../../../context/ThemeContext';
import { AuthContext } from '../../../../App';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../../../context/LanguageContext';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  const { currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const SettingItem = ({ icon: Icon, title, value, onPress, type = 'link', showBorder = true }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 ${showBorder ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
    >
      <View className="flex-row items-center flex-1">
        <View className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-2xl mr-4">
          <Icon size={22} color={isDarkMode ? '#60a5fa' : '#1e4e8c'} />
        </View>
        <View>
          <Text className="text-slate-800 dark:text-slate-100 text-[16px] font-bold">{title}</Text>
          {value && <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{value}</Text>}
        </View>
      </View>

      {type === 'link' && (
        <ChevronRight size={20} color={isDarkMode ? '#334155' : '#94a3b8'} />
      )}

      {type === 'toggle' && (
        <Switch
          trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
          thumbColor="#ffffff"
          onValueChange={onPress}
          value={isDarkMode}
        />
      )}
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }) => (
    <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[2px] px-6 mt-8 mb-3">
      {title}
    </Text>
  );

  const handleLogout = () => {
    Alert.alert(
      t('offtaker.settings.signOutTitle'),
      t('offtaker.settings.signOutMessage'),
      [
        { text: t('common.cancel'), style: "cancel" },
        { text: t('offtaker.settings.logOut'), style: "destructive", onPress: logout }
      ]
    );
  };

  const currentLangLabel = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.nativeName || 'English';

  return (
    <View className="flex-1 bg-[#1e4e8c] dark:bg-[#05070a]">
      <StatusBar barStyle="light-content" backgroundColor="#1e4e8c" />
      <SafeAreaView edges={['top']} className="flex-1">
        <Header title={t('offtaker.settings.title')} />

        <ScrollView
          className="flex-1 bg-[#f8fafc] dark:bg-[#080a0f] rounded-t-[40px] mt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          <View className="pt-2 px-2">

            <SectionTitle title={t('offtaker.settings.procurementAccount')} />
            <View className="bg-white dark:bg-[#0f1218] mx-4 rounded-[32px] shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800/50">
              <SettingItem
                icon={User}
                title={t('offtaker.settings.businessProfile')}
                value={t('offtaker.settings.businessProfileSub')}
                onPress={() => { }}
              />
              <SettingItem
                icon={Target}
                title={t('offtaker.settings.procurementZones')}
                value={t('offtaker.settings.procurementZonesSub')}
                onPress={() => { }}
              />
              <SettingItem
                icon={CreditCard}
                title={t('offtaker.settings.paymentMethods')}
                value={t('offtaker.settings.paymentMethodsSub')}
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <SectionTitle title={t('offtaker.settings.appPreferences')} />
            <View className="bg-white dark:bg-[#0f1218] mx-4 rounded-[32px] shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800/50">
              <SettingItem
                icon={Moon}
                title={t('offtaker.settings.darkTheme')}
                value={isDarkMode ? t('offtaker.settings.darkThemeOn') : t('offtaker.settings.darkThemeOff')}
                onPress={toggleTheme}
                type="toggle"
              />
              <SettingItem
                icon={Bell}
                title={t('offtaker.settings.notifications')}
                value={t('offtaker.settings.notificationsSub')}
                onPress={() => { }}
              />
              <SettingItem
                icon={Globe}
                title={t('offtaker.settings.marketLanguage')}
                value={currentLangLabel}
                onPress={() => setLanguageModalVisible(true)}
                showBorder={false}
              />
            </View>

            <SectionTitle title={t('offtaker.settings.securityCompliance')} />
            <View className="bg-white dark:bg-[#0f1218] mx-4 rounded-[32px] shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800/50">
              <SettingItem
                icon={Lock}
                title={t('offtaker.settings.accessControl')}
                value={t('offtaker.settings.accessControlSub')}
                onPress={() => { }}
              />
              <SettingItem
                icon={ShieldCheck}
                title={t('offtaker.settings.kycVerification')}
                value={t('offtaker.settings.kycSub')}
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <SectionTitle title={t('offtaker.settings.information')} />
            <View className="bg-white dark:bg-[#0f1218] mx-4 rounded-[32px] shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800/50">
              <SettingItem
                icon={FileText}
                title={t('offtaker.settings.tradeTerms')}
                onPress={() => { }}
              />
              <SettingItem
                icon={Info}
                title={t('offtaker.settings.core')}
                value="Enterprise v2.8.5"
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.8}
              className="mt-10 mx-6 bg-red-50 dark:bg-red-900/10 h-16 rounded-[24px] flex-row items-center justify-center border border-red-100 dark:border-red-900/20"
            >
              <LogOut size={20} color="#ef4444" />
              <Text className="text-red-500 font-black text-lg ml-3">{t('offtaker.settings.logOut')}</Text>
            </TouchableOpacity>

            <Text className="text-center text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-8">
              {t('offtaker.settings.securedBy')}
            </Text>

          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <View style={[modalStyles.modalContainer, { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }]}>
            <View style={modalStyles.modalHeader}>
              <Text style={[modalStyles.modalTitle, { color: isDarkMode ? '#f8fafc' : '#0f172a' }]}>
                {t('settings.selectLanguage')}
              </Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <X size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            </View>

            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    modalStyles.languageOption,
                    isSelected && { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' }
                  ]}
                  onPress={async () => {
                    await changeLanguage(lang.code);
                    setLanguageModalVisible(false);
                  }}
                >
                  <View>
                    <Text style={[modalStyles.langNative, { color: isDarkMode ? '#f8fafc' : '#0f172a' }]}>
                      {lang.nativeName}
                    </Text>
                    <Text style={[modalStyles.langEnglish, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                      {lang.name}
                    </Text>
                  </View>
                  {isSelected && <Check size={20} color="#3b82f6" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  langNative: {
    fontSize: 16,
    fontWeight: '700',
  },
  langEnglish: {
    fontSize: 12,
    marginTop: 2,
  },
});
