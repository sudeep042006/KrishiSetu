import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    LayoutDashboard,
    TrendingUp,
    Users,
    ShoppingBag,
    Wallet,
    ChevronRight,
    Sprout,
    CloudSun,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../../common/Header';
import { paymentService, CropService } from '../../service/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [walletData, setWalletData] = useState(null);
    const [dashboardStats, setDashboardStats] = useState({
        activeCrops: 0,
        totalEarnings: 0,
        buyersReach: 0,
        salesDone: 0
    });

    const fetchData = async () => {
        try {
            // Get user data
            const userDataStr = await AsyncStorage.getItem('userData');
            if (userDataStr) {
                setUser(JSON.parse(userDataStr));
            }

            // Fetch wallet details
            const walletRes = await paymentService.getWalletDetails();
            if (walletRes.success) {
                setWalletData(walletRes.wallet);
            }

            // Fetch transactions for sales and reach
            const transRes = await paymentService.getTransactions();
            let salesCount = 0;
            let totalSalesAmount = 0;
            
            if (transRes.success && transRes.transactions) {
                const sales = transRes.transactions.filter(t => t.type === 'sale' || t.type === 'income');
                salesCount = sales.length;
                totalSalesAmount = sales.reduce((acc, curr) => acc + curr.amount, 0);
            }

            // Fetch active crops
            const cropRes = await CropService.getProjects();
            const activeCropsCount = cropRes.projects ? cropRes.projects.length : 0;

            setDashboardStats({
                activeCrops: activeCropsCount,
                totalEarnings: totalSalesAmount,
                buyersReach: salesCount, // Assuming buyers reach is equal to transactions done
                salesDone: salesCount
            });

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)}L`;
        }
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const stats = [
        { id: 1, label: 'Active Crops', value: dashboardStats.activeCrops.toString(), icon: Sprout, color: '#16a34a', bg: '#f0fdf4' },
        { id: 2, label: 'Total Sales', value: formatCurrency(dashboardStats.totalEarnings), icon: Wallet, color: '#0891b2', bg: '#ecfeff' },
        { id: 3, label: 'Buyers Reach', value: dashboardStats.buyersReach.toString(), icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
        { id: 4, label: 'Sales Done', value: dashboardStats.salesDone.toString(), icon: ShoppingBag, color: '#ea580c', bg: '#fff7ed' },
    ];

    if (loading && !refreshing) {
        return (
            <View className="flex-1 bg-[#123524] justify-center items-center">
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Dashboard" showNotification={true} />

                <View className="flex-1 bg-[#f8fafc] rounded-t-[40px] overflow-hidden">
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        {/* ── Welcome Section ── */}
                        <View className="p-6">
                            <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Welcome Back,</Text>
                            <Text className="text-slate-900 text-3xl font-black mt-1">Namaste, {user?.name || 'Farmer'}! 👋</Text>
                        </View>

                        {/* ── Stats Grid ── */}
                        <View className="px-5 flex-row flex-wrap" style={{ gap: 12 }}>
                            {stats.map((stat) => (
                                <View
                                    key={stat.id}
                                    style={{ width: (width - 52) / 2 }}
                                    className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm"
                                >
                                    <View style={{ backgroundColor: stat.bg }} className="w-10 h-10 rounded-2xl items-center justify-center mb-3">
                                        <stat.icon size={20} color={stat.color} />
                                    </View>
                                    <Text className="text-slate-400 text-[11px] font-bold uppercase">{stat.label}</Text>
                                    <Text className="text-slate-900 text-xl font-black mt-1">{stat.value}</Text>
                                </View>
                            ))}
                        </View>

                        {/* ── Wallet Quick Access ── */}
                        <View className="p-5">
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Wallet')}
                                className="bg-[#123524] rounded-[32px] p-6 flex-row items-center shadow-lg shadow-green-900/20"
                            >
                                <View className="bg-white/10 p-4 rounded-2xl">
                                    <Wallet size={32} color="#fff" />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="text-green-200/80 text-xs font-bold uppercase tracking-widest">Farm Wallet</Text>
                                    <Text className="text-white text-2xl font-black">
                                        ₹{walletData ? walletData.availableBalance.toLocaleString('en-IN') : '0.00'}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <ArrowUpRight size={14} color="#4ade80" />
                                        <Text className="text-green-400 text-xs font-bold ml-1">+Real-time sync</Text>
                                    </View>
                                </View>
                                <ChevronRight size={24} color="#ffffff80" />
                            </TouchableOpacity>
                        </View>

                        {/* ── Active Listings Section ── */}
                        <View className="px-5 flex-row justify-between items-center mb-4 mt-2">
                            <Text className="text-slate-900 text-xl font-black">Active Listings</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Crops')}>
                                <Text className="text-[#123524] font-bold">View All</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}
                        >
                            {/* Static dummy listings as requested */}
                            <View className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm w-64">
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="bg-orange-50 px-3 py-1 rounded-full">
                                        <Text className="text-orange-600 text-[10px] font-black uppercase">Premium Wheat</Text>
                                    </View>
                                    <Text className="text-slate-400 text-[10px] font-bold">Ref: #8821</Text>
                                </View>
                                <Text className="text-slate-900 text-lg font-bold">Sharbati Wheat (Grade A)</Text>
                                <View className="flex-row items-center mt-2 justify-between">
                                    <View>
                                        <Text className="text-slate-400 text-[10px] font-bold uppercase">Quantity</Text>
                                        <Text className="text-slate-900 font-bold">250 Quintals</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-slate-400 text-[10px] font-bold uppercase">Exp. Price</Text>
                                        <Text className="text-green-600 font-black text-lg">₹2,450/q</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm w-64">
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="bg-blue-50 px-3 py-1 rounded-full">
                                        <Text className="text-blue-600 text-[10px] font-black uppercase">Soybean</Text>
                                    </View>
                                    <Text className="text-slate-400 text-[10px] font-bold">Ref: #8822</Text>
                                </View>
                                <Text className="text-slate-900 text-lg font-bold">Yellow Soybean (Moist 12%)</Text>
                                <View className="flex-row items-center mt-2 justify-between">
                                    <View>
                                        <Text className="text-slate-400 text-[10px] font-bold uppercase">Quantity</Text>
                                        <Text className="text-slate-900 font-bold">120 Quintals</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-slate-400 text-[10px] font-bold uppercase">Exp. Price</Text>
                                        <Text className="text-green-600 font-black text-lg">₹4,200/q</Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        {/* ── Weather & Alerts Section ── */}
                        <View className="p-5 mt-4">
                            <View className="bg-white rounded-[32px] p-5 border border-slate-100 shadow-sm flex-row items-center">
                                <View className="bg-blue-50 p-4 rounded-2xl">
                                    <CloudSun size={32} color="#3b82f6" />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="text-slate-900 font-black text-lg">Weather Sync</Text>
                                    <Text className="text-slate-400 text-xs font-medium">Check the weather screen for detailed farm-level alerts.</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => navigation.navigate('Weather')}
                                    className="bg-slate-50 p-3 rounded-full"
                                >
                                    <Calendar size={20} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}
