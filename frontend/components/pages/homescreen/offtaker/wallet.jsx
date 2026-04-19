import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, CreditCard } from 'lucide-react-native';
import Header from '../../../common/BHeader';

export default function OfftakerWallet() {
    return (
        <View className="flex-1 bg-[#102a43]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Finance" />
                <View className="flex-1 bg-[#f8fafc] rounded-t-[40px] overflow-hidden">
                    <ScrollView showsVerticalScrollIndicator={false} className="p-5">
                        {/* Balance Card */}
                        <View className="bg-slate-900 rounded-[32px] p-6 mb-8 shadow-2xl overflow-hidden border border-white/10">
                            <View className="flex-row items-center justify-between mb-8">
                                <View>
                                    <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Available Balance</Text>
                                    <View className="flex-row items-baseline mt-1" style={{ gap: 4 }}>
                                        <Text className="text-white text-3xl font-black">₹4,85,250</Text>
                                        <Text className="text-white/50 text-sm">.00</Text>
                                    </View>
                                </View>
                                <View className="bg-blue-500/20 p-3 rounded-2xl">
                                    <Wallet color="#60a5fa" size={28} />
                                </View>
                            </View>
                            
                            <View className="flex-row justify-between" style={{ gap: 12 }}>
                                <TouchableOpacity className="flex-1 bg-white/10 p-4 rounded-2xl items-center flex-row justify-center" style={{ gap: 8 }}>
                                    <ArrowUpRight color="#4ade80" size={18} />
                                    <Text className="text-white font-bold text-sm">Deposit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 bg-white/10 p-4 rounded-2xl items-center flex-row justify-center" style={{ gap: 8 }}>
                                    <ArrowDownLeft color="#f87171" size={18} />
                                    <Text className="text-white font-bold text-sm">Payout</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text className="text-slate-900 font-black text-lg mb-4">Recent Transactions</Text>
                        {[1, 2, 3].map((i) => (
                            <View key={i} className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-50 flex-row items-center">
                                <View className="bg-slate-50 p-3 rounded-xl mr-4">
                                    <History size={20} color="#64748b" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-900 font-bold text-sm">Payment to Patil Farms</Text>
                                    <Text className="text-slate-400 text-[10px] mt-1">Today, 2:45 PM • Settlement</Text>
                                </View>
                                <Text className="text-red-500 font-bold">-₹1,24,500</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}
