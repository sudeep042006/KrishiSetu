import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, View as AnimatedView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Search, Filter, Star, CheckCircle2, ChevronRight, TrendingUp } from 'lucide-react-native';
import Header from '../../../common/BHeader';

export default function OfftakerMarketplace() {
    return (
        <View className="flex-1 bg-[#102a43]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Find Sellers" />
                <View className="flex-1 bg-[#f8fafc] rounded-t-[40px] overflow-hidden">
                    <ScrollView showsVerticalScrollIndicator={false} className="p-5">
                        {/* Search & Filter */}
                        <View className="flex-row items-center mb-6" style={{ gap: 10 }}>
                            <View className="flex-1 bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-sm border border-slate-100">
                                <Search size={18} color="#94a3b8" />
                                <Text className="ml-2 text-slate-400">Search farmers, crops...</Text>
                            </View>
                            <TouchableOpacity className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                                <Filter size={20} color="#1e4e8c" />
                            </TouchableOpacity>
                        </View>

                        {/* Recent Harvest Alerts */}
                        <Text className="text-slate-900 font-black text-lg mb-4">Nearby Harvests</Text>
                        {[1, 2, 3].map((i) => (
                            <TouchableOpacity key={i} className="bg-white rounded-[28px] p-4 mb-4 shadow-sm border border-slate-50 flex-row">
                                <View className="bg-indigo-50 w-20 h-20 rounded-2xl items-center justify-center mr-4">
                                    <Text className="text-2xl">🌾</Text>
                                </View>
                                <View className="flex-1 justify-center">
                                    <View className="flex-row items-center" style={{ gap: 5 }}>
                                        <Text className="text-slate-900 font-bold">Patil Farm - Organic Wheat</Text>
                                        <CheckCircle2 size={14} color="#3b82f6" fill="#eff6ff" />
                                    </View>
                                    <Text className="text-slate-400 text-xs mt-1">Nashik • 8.4 km away</Text>
                                    <View className="flex-row items-center mt-2" style={{ gap: 4 }}>
                                        <TrendingUp size={12} color="#10b981" />
                                        <Text className="text-emerald-600 font-bold text-xs">₹2,350/qtl • Ready in 2 days</Text>
                                    </View>
                                </View>
                                <View className="justify-center">
                                    <ChevronRight size={20} color="#cbd5e1" />
                                </View>
                            </TouchableOpacity>
                        ))}

                        {/* Map View Toggle */}
                        <TouchableOpacity className="bg-[#1e4e8c] rounded-3xl p-5 flex-row items-center justify-center my-4 shadow-lg shadow-blue-900/20">
                            <MapPin size={22} color="#fff" />
                            <Text className="text-white font-bold ml-2">Show Local Sellers on Map</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}
