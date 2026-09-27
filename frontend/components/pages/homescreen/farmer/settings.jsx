import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Modal, Pressable } from 'react-native';
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
  Check
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Header from '../../../common/Header';
import { ThemeContext } from '../../../../context/ThemeContext';
import { AuthContext } from '../../../../App';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../../../context/LanguageContext';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const SettingItem = ({ icon: Icon, title, value, onPress, type = 'link', showBorder = true }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 ${showBorder ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
    >
      <View className="flex-row items-center flex-1">
        <View className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl mr-4">
          <Icon size={22} color={isDarkMode ? '#10b981' : '#1e4a3b'} />
        </View>
        <View>
          <Text className="text-gray-800 dark:text-gray-100 text-[16px] font-medium">{title}</Text>
          {value && <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{value}</Text>}
        </View>
      </View>

      {type === 'link' && (
        <ChevronRight size={20} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
      )}

      {type === 'toggle' && (
        <Switch
          trackColor={{ false: '#d1d5db', true: '#10b981' }}
          thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
          onValueChange={onPress}
          value={isDarkMode}
        />
      )}
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }) => (
    <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider px-4 mt-6 mb-2">
      {title}
    </Text>
  );

  const handleLogout = () => {
    Alert.alert(
      t('logout.title'),
      t('logout.message'),
      [
        { text: t('logout.cancel'), style: "cancel" },
        { text: t('logout.confirm'), style: "destructive", onPress: logout }
      ]
    );
  };

  const handleSelectLanguage = async (langCode) => {
    setShowLanguageModal(false);
    await changeLanguage(langCode);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
  const currentLangLabel = currentLangObj ? currentLangObj.nativeLabel : 'English';

  return (
    <View className="flex-1 bg-[#123524] dark:bg-[#0a0a0a]">
      <SafeAreaView edges={['top']} className="flex-1">
        <Header title={t('settings.title')} />

        <ScrollView
          className="flex-1 bg-white dark:bg-[#121212] rounded-t-3xl mt-2"
          showsVerticalScrollIndicator={false}
        >
          <View className="pb-10">

            <SectionTitle title={t('settings.sections.account')} />
            <View className="bg-white dark:bg-[#1e1e1e] mx-4 rounded-2xl shadow-sm overflow-hidden">
              <SettingItem
                icon={User}
                title={t('settings.items.profileInfo')}
                value={t('settings.items.profileInfoSub')}
                onPress={() => { }}
              />
              <SettingItem
                icon={Smartphone}
                title={t('settings.items.linkedDevices')}
                value={t('settings.items.linkedDevicesSub')}
                onPress={() => { }}
              />
              <SettingItem
                icon={ShieldCheck}
                title={t('settings.items.privacySettings')}
                value={t('settings.items.privacySettingsSub')}
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <SectionTitle title={t('settings.sections.preferences')} />
            <View className="bg-white dark:bg-[#1e1e1e] mx-4 rounded-2xl shadow-sm overflow-hidden">
              <SettingItem
                icon={Moon}
                title={t('settings.items.darkMode')}
                value={isDarkMode ? t('settings.items.darkModeOn') : t('settings.items.darkModeOff')}
                onPress={toggleTheme}
                type="toggle"
              />
              <SettingItem
                icon={Bell}
                title={t('settings.items.notifications')}
                value={t('settings.items.notificationsSub')}
                onPress={() => { }}
              />
              <SettingItem
                icon={Globe}
                title={t('settings.items.appLanguage')}
                value={currentLangLabel}
                onPress={() => setShowLanguageModal(true)}
                showBorder={false}
              />
            </View>

            <SectionTitle title={t('settings.sections.security')} />
            <View className="bg-white dark:bg-[#1e1e1e] mx-4 rounded-2xl shadow-sm overflow-hidden">
              <SettingItem
                icon={Lock}
                title={t('settings.items.changePassword')}
                onPress={() => { }}
              />
              <SettingItem
                icon={ShieldCheck}
                title={t('settings.items.twoFactor')}
                value={t('settings.items.twoFactorSub')}
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <SectionTitle title={t('settings.sections.support')} />
            <View className="bg-white dark:bg-[#1e1e1e] mx-4 rounded-2xl shadow-sm overflow-hidden">
              <SettingItem
                icon={HelpCircle}
                title={t('settings.items.helpCenter')}
                onPress={() => { }}
              />
              <SettingItem
                icon={Info}
                title={t('settings.items.about')}
                value={t('settings.items.version')}
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              className="mt-8 mx-4 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl flex-row items-center justify-center border border-red-100 dark:border-red-900/20"
            >
              <LogOut size={20} color="#ef4444" className="mr-2" />
              <Text className="text-red-500 font-bold text-lg">{t('settings.signOut')}</Text>
            </TouchableOpacity>

            <Text className="text-center text-gray-400 dark:text-gray-600 text-xs mt-6">
              {t('settings.footer')}
            </Text>

          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setShowLanguageModal(false)}
        >
          <Pressable
            style={{
              backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
              borderRadius: 20,
              width: '82%',
              paddingVertical: 8,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 8,
            }}
            onPress={() => {}}
          >
            <Text style={{
              fontSize: 17,
              fontWeight: '700',
              color: isDarkMode ? '#f3f4f6' : '#111827',
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? '#374151' : '#f3f4f6',
            }}>
              {t('settings.selectLanguage')}
            </Text>

            {SUPPORTED_LANGUAGES.map((lang, index) => {
              const isSelected = currentLanguage === lang.code;
              const isLast = index === SUPPORTED_LANGUAGES.length - 1;
              return (
                <TouchableOpacity
                  key={lang.code}
                  activeOpacity={0.7}
                  onPress={() => handleSelectLanguage(lang.code)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: isDarkMode ? '#374151' : '#f3f4f6',
                    backgroundColor: isSelected
                      ? (isDarkMode ? '#14532d20' : '#f0fdf4')
                      : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected
                      ? (isDarkMode ? '#4ade80' : '#1e4a3b')
                      : (isDarkMode ? '#d1d5db' : '#374151'),
                  }}>
                    {lang.nativeLabel}
                  </Text>
                  {isSelected && (
                    <Check size={18} color={isDarkMode ? '#4ade80' : '#1e4a3b'} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
