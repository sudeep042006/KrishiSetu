import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, StyleSheet, Animated, Modal as RNModal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { DrawerActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useContext } from 'react';
import WeatherCard from '../../../CreatedComponents/weatherCard';
import { ThemeContext } from '../../../../context/ThemeContext';

import {
    Menu,
    Bell,
    Leaf,
    CloudSun,
    Sparkles,
    MessageCircleQuestion,
    Store,
    FlaskConical,
    Tractor,
    ChevronRight,
    TrendingUp,
    BadgePercent,
    ShoppingCart
} from 'lucide-react-native';
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { WEATHER_API } from '@env';
import { farmerService, CropService } from '../../service/api';

export default function Home() {
    const navigation = useNavigation();
    const [farmer, setFarmer] = useState(null);
    const [getProfilePhotobyId, setProfilePhoto] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [cropCount, setCropCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const [showFertilizerModal, setShowFertilizerModal] = useState(false);
    const scaleAnim = useState(new Animated.Value(0))[0];

    const toggleFertilizerModal = (show) => {
        if (show) {
            setShowFertilizerModal(true);
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
            }).start(() => setShowFertilizerModal(false));
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchFarmerData(),
            initializeWeather(),
            fetchCrops()
        ]);
        setRefreshing(false);
    }, []);


    useEffect(() => {
        fetchFarmerData();
        initializeWeather();
        fetchCrops();
    }, []);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'KrishiSetu Location Permission',
                        message: 'We need your location to show accurate farm weather and alerts.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
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
            }
        }
    };

    const loadLiveWeather = () => {
        let watchId = null;
        let settled = false;

        const finish = async (position) => {
            if (settled) return;
            settled = true;
            if (watchId !== null) Geolocation.clearWatch(watchId);

            const { latitude, longitude } = position.coords;
            try {
                const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API}&q=${latitude},${longitude}&days=1&aqi=yes&alerts=no`;
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
                        wind: {
                            speed: windKph / 3.6 // store as m/s for WeatherCard compatibility
                        },
                        cod: 200
                    };

                    setWeatherData(mappedData);
                    // Use v2 key to sync with Weather screen
                    await AsyncStorage.setItem('farm_weather_cache_v2', JSON.stringify({
                        current: mappedData,
                        cachedAt: Date.now()
                    }));
                }
            } catch (error) {
                console.error('Home Weather Fetch Error:', error);
            } finally {
                setLoadingWeather(false);
            }
        };

        const onError = (error) => {
            if (settled) return;
            settled = true;
            if (watchId !== null) Geolocation.clearWatch(watchId);
            console.warn('Home Location Error:', error.message);
            setLoadingWeather(false);
        };

        watchId = Geolocation.watchPosition(
            finish,
            onError,
            {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 60000,
            }
        );
    };

    const initializeWeather = async () => {
        setLoadingWeather(true);
        // Sync with v2 cache from Weather screen
        const cached = await AsyncStorage.getItem('farm_weather_cache_v2');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const ageMs = Date.now() - (parsed.cachedAt || 0);
                if (ageMs < 30 * 60 * 1000) {
                    if (parsed.current) setWeatherData(parsed.current);
                }
            } catch (e) {
                console.log('Error parsing weather cache in Home:', e);
            }
        }
        requestLocationPermission();
    };


    const fetchCrops = async () => {
        try {
            const res = await CropService.getProjects();
            setCropCount(res.projects?.length || 0);
        } catch (error) {
            console.log('Error fetching crops for home:', error);
        }
    };


    const fetchFarmerData = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('userData');
            console.log("Stored user data in Home:", userDataStr ? "Found" : "Not Found");

            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                setFarmer(userData);

                // Fetch profile photo using the ID
                if (userData._id) {
                    const photoData = await farmerService.getProfilePhotobyId(userData._id);
                    setProfilePhoto(photoData?.profilePhoto || '');
                }
            } else {
                console.log('No user data found in storage');
            }
        } catch (error) {
            console.log('Error fetching farmer data:', error);
        }
    };

    const { isDarkMode } = useContext(ThemeContext);

    return (
        <LinearGradient
            colors={isDarkMode
                ? ['#000000', '#0a0a0a', '#121212']
                : ['#031a05ff', '#020f04e9', '#031707ff', '#041407ff', '#042009ff', '#041a08ff', '#ffffffff', '#fdfffeff']
            }
            style={{ flex: 1 }}
        >

            <SafeAreaView edges={['top']} className="flex-1">
                {/* Custom Rich Header */}
                <View className="flex-row items-center justify-between px-5 pt-4 pb-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            className="mr-3"
                            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                        >
                            <Menu color="#ffffffff" size={24} />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: getProfilePhotobyId }}
                            className="w-10 h-10 rounded-full bg-white/20"
                        />
                        <View className="ml-3">
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                                <Text className="text-white/80 dark:text-gray-400 text-xs">Welcome back</Text>
                                <Text className="text-white dark:text-white text-base font-bold">
                                    {farmer?.name || 'Loading...'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity className="bg-white/10 p-2 rounded-full">
                        <Bell color="#ffffff" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Main Scrollable Content */}
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#ffffff"
                            colors={['#16a34a']}
                        />
                    }
                >
                    {/* Top Cards Row */}
                    <View className="flex-row justify-between px-5 mb-4">
                        <TouchableOpacity onPress={() => navigation.navigate('Crops')} className="flex-1">
                            <View className="bg-gray-800 rounded-3xl mr-2 overflow-hidden items-center justify-center border border-white/5 shadow-sm h-[160px]">
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop' }}
                                    style={StyleSheet.absoluteFillObject}
                                    className="opacity-40"
                                />
                                <View className="p-4 w-full h-full justify-between">
                                    <View>
                                        <Text className="text-white/80 text-xs mb-1">Crops to Harvest</Text>
                                        <Text className="text-white text-lg font-extrabold">{cropCount} Crops</Text>
                                    </View>
                                    <View className="flex-row justify-end">
                                        <Leaf color="#86efac" size={28} />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Weather')} activeOpacity={0.9} className="flex-[1.4]">
                            <WeatherCard
                                weather={weatherData}
                                loading={loadingWeather && !weatherData}
                                isCompact={true}
                                containerStyle={{ marginHorizontal: 0, marginVertical: 0, height: 160, marginLeft: 4 }}
                            />
                        </TouchableOpacity>
                    </View>



                    {/* AI Insight Card */}
                    <View className="px-5 mb-6">
                        <View className="bg-gradient-to-r bg-[#1e4a3b] p-4 rounded- flex-row items-center border border-[#2d6a54] shadow-sm">
                            <View className="bg-[#4ade80]/20 p-3 rounded-full mr-4">
                                <Sparkles color="#4ade80" size={24} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-sm mb-1">AI Insight: Your Crop Advisory</Text>
                                <Text className="text-white/70 text-xs">Get quick tips for your crop health cues</Text>
                            </View>
                            <ChevronRight color="#4ade80" size={20} />
                        </View>
                    </View>

                    {/* Lower White Section */}

                    <LinearGradient
                        colors={isDarkMode ? ['#1e1e1e', '#121212', '#121212'] : ['#ffffffff', '#ffffffff', '#ffffffff']}
                        style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50, borderTopWidth: 3, borderColor: isDarkMode ? '#333' : 'rgba(0, 0, 0, 1)' }}
                        className="flex-1 pt-6 px-5 min-h-screen shadow-lg shadow-black/20"
                    >

                        {/* Quick Actions */}
                        <Text className="text-[#1e4a3b] dark:text-[#4ade80] text-base font-bold mb-4">Quick Actions</Text>
                        <View className="flex-row justify-between mb-8">
                            <TouchableOpacity className="items-center">
                                <View className="bg-white dark:bg-[#2a2a2a] p-4 rounded-full shadow-sm shadow-gray-200 mb-2 border border-green-50 dark:border-gray-800">
                                    <MessageCircleQuestion color={isDarkMode ? "#4ade80" : "#16a34a"} size={26} />
                                </View>
                                <Text className="text-gray-600 dark:text-gray-300 text-xs font-semibold">Q&A</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('Marketplace')} className="items-center">
                                <View className="bg-white dark:bg-[#2a2a2a] p-4 rounded-full shadow-sm shadow-gray-200 mb-2 border border-green-50 dark:border-gray-800">
                                    <Store color={isDarkMode ? "#4ade80" : "#16a34a"} size={26} />
                                </View>
                                <Text className="text-gray-600 dark:text-gray-300 text-xs font-semibold">Sell Produce</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => toggleFertilizerModal(true)} className="items-center">
                                <View className="bg-white dark:bg-[#2a2a2a] p-4 rounded-full shadow-sm shadow-gray-200 mb-2 border border-green-50 dark:border-gray-800">
                                    <FlaskConical color={isDarkMode ? "#4ade80" : "#16a34a"} size={26} />
                                </View>
                                <Text className="text-gray-600 dark:text-gray-300 text-xs font-semibold">Fertilizer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('Weather')} className="items-center">
                                <View className="bg-white dark:bg-[#2a2a2a] p-4 rounded-full shadow-sm shadow-gray-200 mb-2 border border-green-50 dark:border-gray-800">
                                    <CloudSun color={isDarkMode ? "#4ade80" : "#16a34a"} size={26} />
                                </View>
                                <Text className="text-gray-600 dark:text-gray-300 text-xs font-semibold">Weather</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Ads Grid Section */}
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-[#1e4a3b] dark:text-[#4ade80] text-base font-bold">Agricultural Offers</Text>
                            <TouchableOpacity>
                                <Text className="text-gray-400 text-xs font-bold">View All</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
                            {/* Ad Card 1 */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#2a2a2a] rounded-[28px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-[#123524] px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">20% OFF</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-[#1e4a3b] dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Premium Hybrid Seeds</Text>
                                    <View className="flex-row items-center mt-1">
                                        <BadgePercent size={12} color="#16a34a" />
                                        <Text className="text-[#16a34a] text-[10px] font-bold ml-1">Kharif Special</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 2 */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#2a2a2a] rounded-[28px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2068&auto=format&fit=crop' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-amber-500 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">LATEST</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-[#1e4a3b] dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Nano Urea Liquid</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Sparkles size={12} color="#f59e0b" />
                                        <Text className="text-amber-600 text-[10px] font-bold ml-1">Higher Yield</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 3 */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#2a2a2a] rounded-[28px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?q=80&w=2070&auto=format&fit=crop' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-blue-600 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">RENTAL</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-[#1e4a3b] dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Modern Machinery</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Tractor size={12} color="#2563eb" />
                                        <Text className="text-blue-600 text-[10px] font-bold ml-1">Starting ₹499/hr</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 4 */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#2a2a2a] rounded-[28px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=2070&auto=format&fit=crop' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-emerald-600 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">BIO</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-[#1e4a3b] dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Organic Fertilizer</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Leaf size={12} color="#059669" />
                                        <Text className="text-emerald-600 text-[10px] font-bold ml-1">Soil Health</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {/* Ad Card 5: Solar Pumps */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#2a2a2a] rounded-[28px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2072&auto=format&fit=crop' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-orange-600 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">SUBSIDY</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-[#1e4a3b] dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Solar Water Pumps</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Sparkles size={12} color="#ea580c" />
                                        <Text className="text-orange-600 text-[10px] font-bold ml-1">PM-KUSUM Scheme</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 6: Agri Loans */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#2a2a2a] rounded-[28px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2022&auto=format&fit=crop' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-indigo-600 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">LOW ROI</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-[#1e4a3b] dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Kisan Credit Card</Text>
                                    <View className="flex-row items-center mt-1">
                                        <TrendingUp size={12} color="#4f46e5" />
                                        <Text className="text-indigo-600 text-[10px] font-bold ml-1">Instant Approval</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 7: Smart Irrigation */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#2a2a2a] rounded-[28px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=2071&auto=format&fit=crop' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-blue-500 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">IOT</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-[#1e4a3b] dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Smart Drip System</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-blue-600 text-[10px] font-bold ml-1">Save 40% Water</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Ad Card 8: Agri Drones */}
                            <TouchableOpacity
                                className="w-[48%] bg-white dark:bg-[#2a2a2a] rounded-[28px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
                                activeOpacity={0.9}
                            >
                                <View className="h-32 w-full relative">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=2070&auto=format&fit=crop' }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[9px] font-bold">NEW TECH</Text>
                                    </View>
                                </View>
                                <View className="p-3">
                                    <Text className="text-[#1e4a3b] dark:text-gray-100 font-bold text-xs" numberOfLines={1}>Drone Spraying</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Sparkles size={12} color="#dc2626" />
                                        <Text className="text-red-600 text-[10px] font-bold ml-1">Book a Service</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                </ScrollView>

                {/* Coming Soon Modal */}
                <RNModal
                    transparent
                    visible={showFertilizerModal}
                    animationType="none"
                    onRequestClose={() => toggleFertilizerModal(false)}
                >
                    <TouchableOpacity 
                        activeOpacity={1} 
                        onPress={() => toggleFertilizerModal(false)}
                        className="flex-1 bg-black/40 justify-center items-center px-10"
                    >
                        <Animated.View 
                            style={{ transform: [{ scale: scaleAnim }] }}
                            className="bg-white dark:bg-[#1e1e1e] w-full p-8 rounded-[40px] items-center border border-green-100 dark:border-green-900/30"
                        >
                            <View className="bg-green-50 dark:bg-green-900/20 w-24 h-24 rounded-full items-center justify-center mb-6 border border-green-100/50">
                                <FlaskConical color="#16a34a" size={40} />
                            </View>
                            <Text className="text-[#1e4a3b] dark:text-white text-2xl font-black text-center mb-3">Fertilizer Advisory</Text>
                            <View className="bg-green-600 px-4 py-1.5 rounded-full mb-4">
                                <Text className="text-white text-[10px] font-black uppercase tracking-widest">Coming Soon</Text>
                            </View>
                            <Text className="text-gray-500 dark:text-gray-400 text-center text-sm leading-6">
                                We're developing a smart soil testing and fertilizer recommendation engine. <Text className="text-green-600 font-bold">Stay tuned</Text> for personalized nutrient plans!
                            </Text>
                            
                            <TouchableOpacity 
                                onPress={() => toggleFertilizerModal(false)}
                                className="mt-8 bg-[#1e4a3b] dark:bg-green-600 px-10 py-4 rounded-2xl"
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

