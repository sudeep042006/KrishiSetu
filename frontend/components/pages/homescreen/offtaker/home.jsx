import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, StyleSheet, PermissionsAndroid, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { WEATHER_API } from '@env';

// Removed WeatherCard import
import { ThemeContext } from '../../../../context/ThemeContext';
import {
    Menu,
    Bell,
    Package,
    Truck,
    PlusSquare,
    BarChart2,
    MapPin,
    ChevronRight,
    TrendingUp,
    Search,
    Target,
    Sprout,
    BadgePercent,
    Warehouse,
    ThermometerSnowflake,
    Factory,
    ShieldCheck,
    FlaskConical,
    Box
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import BuyerBottomTabs from '../../../navigation/BuyerBottomTabs';
import Header from '../../../common/BHeader';
import { Animated, Modal as RNModal } from 'react-native';

export default function OfftakerHome() {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [procurementCount, setProcurementCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const [showLogisticsModal, setShowLogisticsModal] = useState(false);
    const scaleAnim = useState(new Animated.Value(0))[0];

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchUserData(),
            initializeWeather()
        ]);
        setRefreshing(false);
    }, []);

    const toggleLogisticsModal = (show) => {
        if (show) {
            setShowLogisticsModal(true);
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 7
            }).start();
        } else {
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start(() => setShowLogisticsModal(false));
        }
    };

    useEffect(() => {
        fetchUserData();
        initializeWeather();
        // Simulate procurement data for now
        setProcurementCount(12);
    }, []);

    const fetchUserData = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('userData');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                setUser(userData);
                // In a real app, offtaker profile photos would come from a service
                setProfilePhoto(userData.profilePhoto || '');
            }
        } catch (error) {
            console.log('Error fetching user data:', error);
        }
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'KrishiSetu needs your location to provide logistics-grade weather updates.',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    loadLiveWeather();
                } else {
                    setLoadingWeather(false);
                }
            } catch (err) {
                console.warn(err);
                setLoadingWeather(false);
            }
        }
    };

    const loadLiveWeather = () => {
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API}&q=${latitude},${longitude}&days=1&aqi=yes`;
                    const response = await fetch(url);
                    const data = await response.json();

                    if (data && !data.error) {
                        const windKph = data.current.wind_kph ?? 0;
                        const mappedData = {
                            name: data.location.name,
                            sys: { country: data.location.country },
                            weather: [{
                                main: data.current.condition.text,
                                description: data.current.condition.text,
                                icon: data.current.is_day ? '01d' : '01n'
                            }],
                            main: {
                                temp: data.current.temp_c,
                                temp_max: data.forecast.forecastday[0].day.maxtemp_c,
                                temp_min: data.forecast.forecastday[0].day.mintemp_c,
                                humidity: data.current.humidity,
                                feels_like: data.current.feelslike_c,
                            },
                            wind: { speed: windKph / 3.6 },
                            cod: 200
                        };
                        setWeatherData(mappedData);
                    }
                } catch (error) {
                    console.error('Offtaker Weather Error:', error);
                } finally {
                    setLoadingWeather(false);
                }
            },
            (error) => {
                console.warn('Geolocation Error:', error);
                setLoadingWeather(false);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
        );
    };

    const initializeWeather = async () => {
        setLoadingWeather(true);
        const cached = await AsyncStorage.getItem('farm_weather_cache_v2');
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.cachedAt < 30 * 60 * 1000) {
                setWeatherData(parsed.current);
                setLoadingWeather(false);
                return;
            }
        }
        requestLocationPermission();
    };

    const { isDarkMode } = useContext(ThemeContext);

    return (
        <LinearGradient
            colors={isDarkMode ? ['#000000', '#0a0a0a', '#121212'] : ['#102a43', '#1e4e8c', '#ffffff', '#ffffff']}
            style={{ flex: 1 }}
        >
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Modern Procurement Header */}
                <View className="flex-row items-center justify-between px-5 pt-4 pb-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            className="mr-3"
                            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                        >
                            <Menu color="#ffffff" size={24} />
                        </TouchableOpacity>


                        <View className="bg-white/20 p-0.5 rounded-full">
                            <Image
                                source={profilePhoto ? { uri: profilePhoto } : null}
                                className="w-10 h-10 rounded-full bg-white/20"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <View className="ml-3">
                                <Text className="text-white/70 text-xs font-medium uppercase tracking-wider">Offtaker Portal</Text>
                                <Text className="text-white text-base font-bold">
                                    {user?.name || 'Authorized Buyer'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row" style={{ gap: 12 }}>
                        <TouchableOpacity className="bg-white/10 p-2 rounded-full border border-white/5">
                            <Search color="#ffffff" size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white/10 p-2 rounded-full border border-white/5">
                            <Bell color="#ffffff" size={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#ffffff"
                            colors={['#1e4e8c']}
                        />
                    }
                >
                    {/* Procurement Stats Row */}
                    <View className="flex-row justify-between px-5 mb-5">
                        <TouchableOpacity onPress={() => navigation.navigate('OfftakerOrders')} className="flex-1">
                            <View className="bg-slate-900 rounded-[28px] mr-2 overflow-hidden border border-white/10 shadow-2xl h-[170px]">
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070' }}
                                    style={StyleSheet.absoluteFillObject}
                                    className="opacity-30"
                                />
                                <View className="p-5 w-full h-full justify-between">
                                    <View>
                                        <View className="bg-blue-500/20 self-start px-2 py-1 rounded-md mb-2">
                                            <Text className="text-blue-300 text-[10px] font-bold tracking-widest">PROCUREMENT</Text>
                                        </View>
                                        <Text className="text-white text-2xl font-black">1,240 <Text className="text-xs font-normal">Tons</Text></Text>
                                        <Text className="text-white/50 text-xs mt-1">Sourced this quarter</Text>
                                    </View>
                                    <View className="flex-row items-center justify-between">
                                        <Package color="#60a5fa" size={28} />
                                        <TrendingUp color="#4ade80" size={16} />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            className="flex-[1.2] ml-2"
                            onPress={() => navigation.navigate('CropsPage')}
                        >
                            <View className="bg-emerald-600 dark:bg-emerald-800 rounded-[28px] overflow-hidden shadow-2xl h-[170px] border border-white/10">
                                <View className="p-5 w-full h-full justify-between">
                                    <View>
                                        <View className="bg-white/20 self-start px-2 py-1 rounded-md mb-2">
                                            <Text className="text-emerald-50 text-[10px] font-bold tracking-widest">MARKETPLACE</Text>
                                        </View>
                                        <Text className="text-white text-2xl font-black mt-1">Crops</Text>
                                        <Text className="text-white/80 text-[11px] mt-1 leading-4 pr-4">Browse real listings from verified farmers</Text>
                                    </View>
                                    <View className="flex-row items-center justify-between">
                                        <Sprout color="#ffffff" size={28} />
                                        <ChevronRight color="#ffffff" size={20} />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>



                    {/* Operations Center */}
                    <View className="bg-[#f8fafc] dark:bg-[#121212] flex-1 pt-8 px-5 rounded-t-[48px] min-h-screen">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-slate-900 dark:text-gray-100 text-lg font-black tracking-tight">Operations Center</Text>
                            <TouchableOpacity>
                                <Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">Customize</Text>
                            </TouchableOpacity>
                        </View>


                        {/* Action Grid */}
                        <View className="flex-row flex-wrap justify-between mb-8">
                            <TouchableOpacity onPress={() => navigation.navigate('PostRequest')} className="w-[48%] bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] mb-4 shadow-sm border border-slate-50 dark:border-gray-800 items-center">
                                <View className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-3xl mb-3">
                                    <PlusSquare color={isDarkMode ? "#fbbf24" : "#f59e0b"} size={28} />
                                </View>
                                <Text className="text-slate-900 dark:text-gray-200 font-bold text-sm">Post Req</Text>
                                <Text className="text-slate-400 dark:text-gray-500 text-[10px] mt-1 text-center">Buy newer crops</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('Marketplace')} className="w-[48%] bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] mb-4 shadow-sm border border-slate-50 dark:border-gray-800 items-center">
                                <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-3xl mb-3">
                                    <MapPin color={isDarkMode ? "#60a5fa" : "#3b82f6"} size={28} />
                                </View>
                                <Text className="text-slate-900 dark:text-gray-200 font-bold text-sm">Nearby Farms</Text>
                                <Text className="text-slate-400 dark:text-gray-500 text-[10px] mt-1 text-center">Locate sellers</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('CropPriceScreen')} className="w-[48%] bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] mb-4 shadow-sm border border-slate-50 dark:border-gray-800 items-center">
                                <View className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-3xl mb-3">
                                    <BarChart2 color={isDarkMode ? "#34d399" : "#10b981"} size={28} />
                                </View>
                                <Text className="text-slate-900 dark:text-gray-200 font-bold text-sm">Market Rate</Text>
                                <Text className="text-slate-400 dark:text-gray-500 text-[10px] mt-1 text-center">Price analytics</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={() => toggleLogisticsModal(true)}
                                className="w-[48%] bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] mb-4 shadow-sm border border-slate-50 dark:border-gray-800 items-center"
                            >
                                <View className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-3xl mb-3">
                                    <Truck color={isDarkMode ? "#a78bfa" : "#8b5cf6"} size={28} />
                                </View>
                                <Text className="text-slate-900 dark:text-gray-200 font-bold text-sm">Logistics</Text>
                                <Text className="text-slate-400 dark:text-gray-500 text-[10px] mt-1 text-center">Manage fleet</Text>
                            </TouchableOpacity>
                        </View>


                        {/* Industrial Ads Grid */}
                        <View className="flex-row items-center justify-between mb-4 mt-4">
                            <Text className="text-slate-900 dark:text-gray-100 text-lg font-black tracking-tight">Industrial & Logistics</Text>
                            <TouchableOpacity>
                                <Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">View All</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row flex-wrap justify-between pb-20" style={{ gap: 12 }}>
                            {/* Ad Card 1: Cold Storage */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#1e1e1e] rounded-[28px] overflow-hidden shadow-sm border border-slate-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-blue-600 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">COLD CHAIN</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-slate-900 dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Premium Cold Storage</Text>
                                    <View className="flex-row items-center mt-1">
                                        <ThermometerSnowflake size={12} color="#2563eb" />
                                        <Text className="text-blue-600 text-[10px] font-bold ml-1">Across Maharashtra</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 2: Logistics */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#1e1e1e] rounded-[28px] overflow-hidden shadow-sm border border-slate-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-slate-800 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">LOGISTICS</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-slate-900 dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Bulk Transport Fleet</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Truck size={12} color="#475569" />
                                        <Text className="text-slate-600 text-[10px] font-bold ml-1">Real-time Tracking</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 3: Quality Testing */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#1e1e1e] rounded-[28px] overflow-hidden shadow-sm border border-slate-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1579152276503-03b293c66f77?q=80&w=2070' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-emerald-600 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">LAB TESTED</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-slate-900 dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Crop Quality Lab</Text>
                                    <View className="flex-row items-center mt-1">
                                        <FlaskConical size={12} color="#059669" />
                                        <Text className="text-emerald-600 text-[10px] font-bold ml-1">Instant Reports</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 4: Warehouse */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#1e1e1e] rounded-[28px] overflow-hidden shadow-sm border border-slate-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=2072' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-indigo-600 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">STORAGE</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-slate-900 dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Modern Warehousing</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Warehouse size={12} color="#4f46e5" />
                                        <Text className="text-indigo-600 text-[10px] font-bold ml-1">Secure & Insured</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 5: Processing */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#1e1e1e] rounded-[28px] overflow-hidden shadow-sm border border-slate-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=2070' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-orange-600 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">UNITS</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-slate-900 dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Food Processing Units</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Factory size={12} color="#ea580c" />
                                        <Text className="text-orange-600 text-[10px] font-bold ml-1">Available for Rent</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 6: Packaging */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#1e1e1e] rounded-[28px] overflow-hidden shadow-sm border border-slate-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-purple-600 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">PACKAGING</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-slate-900 dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Eco-friendly Packaging</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Box size={12} color="#9333ea" />
                                        <Text className="text-purple-600 text-[10px] font-bold ml-1">Retail & Bulk</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 7: Business Loans */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#1e1e1e] rounded-[28px] overflow-hidden shadow-sm border border-slate-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-blue-700 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">FINANCE</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-slate-900 dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Working Capital Loans</Text>
                                    <View className="flex-row items-center mt-1">
                                        <TrendingUp size={12} color="#1d4ed8" />
                                        <Text className="text-blue-700 text-[10px] font-bold ml-1">For Offtakers</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 8: Certifications */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#1e1e1e] rounded-[28px] overflow-hidden shadow-sm border border-slate-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1454165833767-027ffea9e7a7?q=80&w=2070' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-yellow-600 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">QUALITY</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-slate-900 dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Export Certifications</Text>
                                    <View className="flex-row items-center mt-1">
                                        <ShieldCheck size={12} color="#ca8a04" />
                                        <Text className="text-yellow-700 text-[10px] font-bold ml-1">Global Standard</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Coming Soon Modal */}
                <RNModal
                    transparent
                    visible={showLogisticsModal}
                    animationType="none"
                    onRequestClose={() => toggleLogisticsModal(false)}
                >
                    <TouchableOpacity 
                        activeOpacity={1} 
                        onPress={() => toggleLogisticsModal(false)}
                        className="flex-1 bg-black/40 justify-center items-center px-10"
                    >
                        <Animated.View 
                            style={{ transform: [{ scale: scaleAnim }] }}
                            className="bg-white dark:bg-[#1e1e1e] w-full p-8 rounded-[40px] items-center border border-blue-100 dark:border-blue-900/30"
                        >
                            <View className="bg-blue-50 dark:bg-blue-900/20 w-24 h-24 rounded-full items-center justify-center mb-6 border border-blue-100/50">
                                <Truck color="#2563eb" size={40} />
                            </View>
                            <Text className="text-slate-900 dark:text-white text-2xl font-black text-center mb-3">Logistics Center</Text>
                            <View className="bg-blue-600 px-4 py-1.5 rounded-full mb-4">
                                <Text className="text-white text-[10px] font-black uppercase tracking-widest">Coming Soon</Text>
                            </View>
                            <Text className="text-slate-500 dark:text-gray-400 text-center text-sm leading-6">
                                We're building a world-class fleet management system. <Text className="text-blue-600 font-bold">Stay tuned</Text> for real-time tracking and delivery automation!
                            </Text>
                            
                            <TouchableOpacity 
                                onPress={() => toggleLogisticsModal(false)}
                                className="mt-8 bg-slate-900 dark:bg-blue-600 px-10 py-4 rounded-2xl"
                            >
                                <Text className="text-white font-bold">Got it!</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableOpacity>
                </RNModal>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({});
