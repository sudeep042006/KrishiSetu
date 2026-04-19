import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart2, TrendingUp, Package, Users } from 'lucide-react-native';
import Header from '../../../common/BHeader';

export default function OfftakerDashboard() {
    return (
        <View className="flex-1 bg-[#102a43]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Procurement Insights" />
                <View className="flex-1 bg-[#f8fafc] rounded-t-[40px] overflow-hidden">
                    <ScrollView showsVerticalScrollIndicator={false} className="p-5">
                        <Text className="text-slate-900 font-black text-xl mb-6">Market Trends</Text>

                        {/* Top Metrics Grid */}
                        <View className="flex-row flex-wrap justify-between mb-6">
                            <View className="w-[48%] bg-white p-5 rounded-3xl mb-4 shadow-sm border border-slate-50">
                                <View className="bg-blue-50 p-3 rounded-2xl self-start mb-3">
                                    <Package color="#478dfdff" size={24} />
                                </View>
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Sourced</Text>
                                <Text className="text-slate-900 text-xl font-black mt-1">1.2k Tons</Text>
                                <View className="flex-row items-center mt-2" style={{ gap: 4 }}>
                                    <TrendingUp size={12} color="#10b981" />
                                    <Text className="text-emerald-500 font-bold text-[10px]">+12% vs LY</Text>
                                </View>
                            </View>

                            <View className="w-[48%] bg-white p-5 rounded-3xl mb-4 shadow-sm border border-slate-50">
                                <View className="bg-indigo-50 p-3 rounded-2xl self-start mb-3">
                                    <Users color="#6366f1" size={24} />
                                </View>
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Active Farmers</Text>
                                <Text className="text-slate-900 text-xl font-black mt-1">84 Active</Text>
                                <View className="flex-row items-center mt-2" style={{ gap: 4 }}>
                                    <TrendingUp size={12} color="#10b981" />
                                    <Text className="text-emerald-500 font-bold text-[10px]">+5 this week</Text>
                                </View>
                            </View>
                        </View>

                        {/* Analytics Placeholder */}
                        <View className="bg-white p-6 rounded-[32px] mb-8 shadow-sm border border-slate-50 items-center justify-center">
                            <View className="bg-slate-50 p-10 rounded-full mb-4">
                                <BarChart2 size={48} color="#94a3b8" />
                            </View>
                            <Text className="text-slate-900 font-bold text-lg">Price Predictor</Text>
                            <Text className="text-slate-400 text-center text-xs mt-2 leading-5">
                                Your procurement cost is optimized. Price for Wheat is expected to dip next month.
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}
