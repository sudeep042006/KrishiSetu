import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, StatusBar } from 'react-native';
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
  FileText
} from 'lucide-react-native';
import Header from '../../../common/BHeader';
import { ThemeContext } from '../../../../context/ThemeContext';
import { AuthContext } from '../../../../App';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);

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
      "Sign Out",
      "Are you sure you want to exit the application?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: logout }
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#1e4e8c] dark:bg-[#05070a]">
      <StatusBar barStyle="light-content" backgroundColor="#1e4e8c" />
      <SafeAreaView edges={['top']} className="flex-1">
        <Header title="Offtaker Settings" />

        <ScrollView
          className="flex-1 bg-[#f8fafc] dark:bg-[#080a0f] rounded-t-[40px] mt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          <View className="pt-2 px-2">

            <SectionTitle title="Procurement Account" />
            <View className="bg-white dark:bg-[#0f1218] mx-4 rounded-[32px] shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800/50">
              <SettingItem
                icon={User}
                title="Business Profile"
                value="Manage organization details"
                onPress={() => { }}
              />
              <SettingItem
                icon={Target}
                title="Procurement Zones"
                value="Set active buying locations"
                onPress={() => { }}
              />
              <SettingItem
                icon={CreditCard}
                title="Payment Methods"
                value="Razorpay & Bank Settings"
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <SectionTitle title="App Preferences" />
            <View className="bg-white dark:bg-[#0f1218] mx-4 rounded-[32px] shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800/50">
              <SettingItem
                icon={Moon}
                title="Dark Theme"
                value={isDarkMode ? "Optimized for night" : "Optimized for day"}
                onPress={toggleTheme}
                type="toggle"
              />
              <SettingItem
                icon={Bell}
                title="Notifications"
                value="Trade alerts & messages"
                onPress={() => { }}
              />
              <SettingItem
                icon={Globe}
                title="Market Language"
                value="English (India)"
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <SectionTitle title="Security & Compliance" />
            <View className="bg-white dark:bg-[#0f1218] mx-4 rounded-[32px] shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800/50">
              <SettingItem
                icon={Lock}
                title="Access Control"
                value="Change PIN & Passwords"
                onPress={() => { }}
              />
              <SettingItem
                icon={ShieldCheck}
                title="KYC Verification"
                value="Verified Business Tier"
                onPress={() => { }}
                showBorder={false}
              />
            </View>

            <SectionTitle title="Information" />
            <View className="bg-white dark:bg-[#0f1218] mx-4 rounded-[32px] shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800/50">
              <SettingItem
                icon={FileText}
                title="Trade Terms"
                onPress={() => { }}
              />
              <SettingItem
                icon={Info}
                title="KrishiSetu Core"
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
              <Text className="text-red-500 font-black text-lg ml-3">Log Out</Text>
            </TouchableOpacity>

            <Text className="text-center text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-8">
              Secured by KrishiSetu Infrastructure
            </Text>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
