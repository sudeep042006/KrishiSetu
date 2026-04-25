import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, StyleSheet, PermissionsAndroid } from 'react-native';
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
    Sprout
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import BuyerBottomTabs from '../../../navigation/BuyerBottomTabs';
import Header from '../../../common/BHeader';

export default function OfftakerHome() {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [procurementCount, setProcurementCount] = useState(0);

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
                >
                    {/* Procurement Stats Row */}
                    <View className="flex-row justify-between px-5 mb-5">
                        <TouchableOpacity className="flex-1">
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

                    {/* Quick Analytics Bar */}
                    <View className="px-5 mb-6">
                        <View className="bg-white/95 dark:bg-[#1e1e1e] p-4 rounded-[24px] flex-row items-center shadow-lg border border-slate-100 dark:border-gray-800">
                            <View className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-2xl mr-4">
                                <Target color={isDarkMode ? "#818cf8" : "#4f46e5"} size={24} />
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
                            <View className="flex-1">
                                <Text className="text-slate-900 dark:text-gray-100 font-bold text-sm">Target: Wheat Procurement</Text>
                                <View className="h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                                    <View className="h-full bg-indigo-500 w-[65%]" />
                                </View>
                                <Text className="text-slate-400 dark:text-gray-500 text-[10px] mt-1">65% of monthly goal achieved</Text>
                            </View>
                            <ChevronRight color={isDarkMode ? "#4b5563" : "#cbd5e1"} size={20} />
                            </TouchableOpacity>
                        </View>
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
                            <TouchableOpacity className="w-[48%] bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] mb-4 shadow-sm border border-slate-50 dark:border-gray-800 items-center">
                                <View className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-3xl mb-3">
                                    <PlusSquare color={isDarkMode ? "#fbbf24" : "#f59e0b"} size={28} />
                                </View>
                                <Text className="text-slate-900 dark:text-gray-200 font-bold text-sm">Post Req</Text>
                                <Text className="text-slate-400 dark:text-gray-500 text-[10px] mt-1 text-center">Buy newer crops</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="w-[48%] bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] mb-4 shadow-sm border border-slate-50 dark:border-gray-800 items-center">
                                <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-3xl mb-3">
                                    <MapPin color={isDarkMode ? "#60a5fa" : "#3b82f6"} size={28} />
                                </View>
                                <Text className="text-slate-900 dark:text-gray-200 font-bold text-sm">Nearby Farms</Text>
                                <Text className="text-slate-400 dark:text-gray-500 text-[10px] mt-1 text-center">Locate sellers</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="w-[48%] bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] mb-4 shadow-sm border border-slate-50 dark:border-gray-800 items-center">
                                <View className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-3xl mb-3">
                                    <BarChart2 color={isDarkMode ? "#34d399" : "#10b981"} size={28} />
                                </View>
                                <Text className="text-slate-900 dark:text-gray-200 font-bold text-sm">Market Rate</Text>
                                <Text className="text-slate-400 dark:text-gray-500 text-[10px] mt-1 text-center">Price analytics</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="w-[48%] bg-white dark:bg-[#1e1e1e] p-5 rounded-[32px] mb-4 shadow-sm border border-slate-50 dark:border-gray-800 items-center">
                                <View className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-3xl mb-3">
                                    <Truck color={isDarkMode ? "#a78bfa" : "#8b5cf6"} size={28} />
                                </View>
                                <Text className="text-slate-900 dark:text-gray-200 font-bold text-sm">Logistics</Text>
                                <Text className="text-slate-400 dark:text-gray-500 text-[10px] mt-1 text-center">Manage fleet</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Recent Contracts / Deliveries */}
                        <Text className="text-slate-900 dark:text-gray-100 text-lg font-black mb-4">Scheduled Pickups</Text>
                        <View className="bg-white dark:bg-[#1e1e1e] p-4 rounded-[28px] flex-row items-center shadow-sm border border-slate-50 dark:border-gray-800 mb-4">
                            <View className="bg-emerald-500/10 dark:bg-emerald-500/20 p-4 rounded-2xl mr-4">
                                <Truck color={isDarkMode ? "#34d399" : "#10b981"} size={26} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 dark:text-gray-200 font-bold text-sm">Wheat (Bulk) - Ahmednagar</Text>
                                <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-xs mt-0.5">EST: Today, 4:00 PM</Text>
                                <Text className="text-slate-400 dark:text-gray-500 text-[10px] mt-1">Farmer: Rajesh Kumar • 2.5 Tons</Text>
                            </View>
                            <View className="bg-slate-100 dark:bg-gray-800 rounded-full p-2">
                                <ChevronRight color={isDarkMode ? "#94a3b8" : "#64748b"} size={16} />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({});
