import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
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
  Smartphone
} from 'lucide-react-native';
import Header from '../../../common/Header';
import { ThemeContext } from '../../../../context/ThemeContext';
import { AuthContext } from '../../../../App';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);

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
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout }
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#123524] dark:bg-[#0a0a0a]">
      <SafeAreaView edges={['top']} className="flex-1">
        <Header title="Settings" />

        <ScrollView
          className="flex-1 bg-white dark:bg-[#121212] rounded-t-3xl mt-2"
          showsVerticalScrollIndicator={false}
        >
          <View className="pb-10">

            <SectionTitle title="Account" />
            <View className="bg-white dark:bg-[#1e1e1e] mx-4 rounded-2xl shadow-sm overflow-hidden">
              <SettingItem
                icon={User}
                title="Profile Information"
                value="Update your personal details"
                onPress={() => { }}
              />
              <SettingItem
                icon={Smartphone}
                title="Linked Devices"
                value="Manage your active sessions"
                onPress={() => { }}
              />
              <SettingItem
                icon={ShieldCheck}
                title="Privacy Settings"
                value="Control your data visibility"
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <SectionTitle title="Preferences" />
            <View className="bg-white dark:bg-[#1e1e1e] mx-4 rounded-2xl shadow-sm overflow-hidden">
              <SettingItem
                icon={Moon}
                title="Dark Mode"
                value={isDarkMode ? "Currently Dark" : "Currently Light"}
                onPress={toggleTheme}
                type="toggle"
              />
              <SettingItem
                icon={Bell}
                title="Notifications"
                value="Push, Email & SMS"
                onPress={() => { }}
              />
              <SettingItem
                icon={Globe}
                title="App Language"
                value="English (US)"
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <SectionTitle title="Security" />
            <View className="bg-white dark:bg-[#1e1e1e] mx-4 rounded-2xl shadow-sm overflow-hidden">
              <SettingItem
                icon={Lock}
                title="Change Password"
                onPress={() => { }}
              />
              <SettingItem
                icon={ShieldCheck}
                title="Two-Factor Auth"
                value="Highly Recommended"
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <SectionTitle title="Support" />
            <View className="bg-white dark:bg-[#1e1e1e] mx-4 rounded-2xl shadow-sm overflow-hidden">
              <SettingItem
                icon={HelpCircle}
                title="Help Center"
                onPress={() => { }}
              />
              <SettingItem
                icon={Info}
                title="About KrishiSetu"
                value="Version 2.4.1"
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              className="mt-8 mx-4 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl flex-row items-center justify-center border border-red-100 dark:border-red-900/20"
            >
              <LogOut size={20} color="#ef4444" className="mr-2" />
              <Text className="text-red-500 font-bold text-lg">Sign Out</Text>
            </TouchableOpacity>

            <Text className="text-center text-gray-400 dark:text-gray-600 text-xs mt-6">
              © 2026 KrishiSetu. All rights reserved.
            </Text>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
