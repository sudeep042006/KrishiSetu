import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, PermissionsAndroid, Platform,
    ActivityIndicator, Dimensions, ScrollView, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlashList } from '@shopify/flash-list';
import { WEATHER_API, API_BASE_URL } from '@env';
import { LineChart } from 'react-native-chart-kit';

import Header from '../../../common/Header';
import WeatherCard from '../../../CreatedComponents/weatherCard';

const screenWidth = Dimensions.get('window').width;

// ─── Helpers ────────────────────────────────────────────────────────────────

const AQI_LABELS = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
const AQI_COLORS = ['#4ade80', '#facc15', '#fb923c', '#ef4444', '#991b1b'];
const AQI_EMOJI  = ['🟢', '🟡', '🟠', '🔴', '🟣'];

const CROP_TIPS = (weather, aqi) => {
    const tips = [];
    if (!weather) return tips;
    const humidity = weather.main?.humidity || 0;
    const temp = weather.main?.temp || 0;
    const wind = (weather.wind?.speed || 0) * 3.6;
    const aqiVal = aqi?.list?.[0]?.main?.aqi || 1;

    tips.push({
        emoji: '💧',
        label: `Humidity ${humidity}%`,
        desc: humidity > 70
            ? 'High humidity — monitor for fungal diseases.'
            : humidity > 40
            ? 'Good humidity levels for most crops.'
            : 'Low humidity — consider irrigation.',
        color: '#1d4ed8',
        bg: '#eff6ff',
    });

    if (temp >= 38) {
        tips.push({
            emoji: '🌡️',
            label: `High Temp ${Math.round(temp)}°C`,
            desc: 'Risk of moisture loss. Irrigate crops early morning.',
            color: '#dc2626',
            bg: '#fef2f2',
        });
    } else if (temp >= 30) {
        tips.push({
            emoji: '☀️',
            label: `Warm ${Math.round(temp)}°C`,
            desc: 'Warm day — water crops in the morning to reduce evaporation.',
            color: '#d97706',
            bg: '#fffbeb',
        });
    }

    if (wind > 20) {
        tips.push({
            emoji: '💨',
            label: `Strong Wind ${Math.round(wind)} km/h`,
            desc: 'Wind may spread pests. Avoid spraying pesticides today.',
            color: '#7c3aed',
            bg: '#f5f3ff',
        });
    } else {
        tips.push({
            emoji: '🌬️',
            label: `Moderate Wind ${Math.round(wind)} km/h`,
            desc: 'Good for pollination. Monitor for early pest spread.',
            color: '#047857',
            bg: '#f0fdf4',
        });
    }

    return tips;
};

const RECOMMENDED_ACTIONS = (weather) => {
    if (!weather) return [];
    const temp = weather.main?.temp || 0;
    const humidity = weather.main?.humidity || 0;
    const actions = [
        { emoji: '💧', text: 'Irrigate crops in early morning' },
        { emoji: '🌿', text: 'Use mulch to retain soil moisture' },
    ];
    if (temp > 35) actions.push({ emoji: '🌳', text: 'Provide shade to young seedlings' });
    if (humidity > 65) actions.push({ emoji: '🐛', text: 'Monitor fields for pest & fungal activity' });
    else actions.push({ emoji: '🐛', text: 'Check for pests in warm weather' });
    return actions;
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function WeatherScreen() {
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState([]);
    const [hourlyData, setHourlyData] = useState([]);
    const [aqiData, setAqiData] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasLocationPermission, setHasLocationPermission] = useState(true);

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
                    setHasLocationPermission(true);
                    loadLiveWeather();
                } else {
                    setHasLocationPermission(false);
                    setLoading(false);
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    const fetchWeatherAPIs = async (lat, lon) => {
        try {
            const [weatherRes, forecastRes, aqiRes] = await Promise.all([
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API}`),
                fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API}`),
                fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API}`),
            ]);

            const current = await weatherRes.json();
            const forecastJson = await forecastRes.json();
            const aqiJson = await aqiRes.json();

            // Daily forecast: 1 entry per day at ~noon
            const daily = forecastJson.list.filter(item => item.dt_txt.includes('12:00:00'));
            // Hourly: next 6 slots (every 3 hrs)
            const hourly = forecastJson.list.slice(0, 6);

            return { current, forecast: daily, hourly, aqi: aqiJson };
        } catch (error) {
            console.error('API Fetch Error:', error);
            return null;
        }
    };

    const fetchDeepseekInsights = async () => {
        if (!weatherData || !aqiData) return;
        setLoadingInsights(true);
        try {
            const url = API_BASE_URL?.includes('localhost') && Platform.OS === 'android'
                ? API_BASE_URL.replace('localhost', '10.0.2.2')
                : API_BASE_URL;

            const res = await fetch(`${url}/weather/insights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weatherData, aqiData }),
            });
            const data = await res.json();
            setInsights(data.success
                ? data.suggestion
                : 'Could not load smart suggestions. Check backend API key configuration.');
        } catch (error) {
            console.error('Insights Error:', error);
            setInsights('Could not connect to smart suggestions server.');
        } finally {
            setLoadingInsights(false);
        }
    };

    const loadLiveWeather = () => {
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const result = await fetchWeatherAPIs(latitude, longitude);
                if (result && result.current?.cod === 200) {
                    setWeatherData(result.current);
                    setForecastData(result.forecast);
                    setHourlyData(result.hourly);
                    setAqiData(result.aqi);
                    await AsyncStorage.setItem('farm_weather_cache', JSON.stringify(result));
                }
                setLoading(false);
                setRefreshing(false);
            },
            (error) => {
                console.log(error);
                setHasLocationPermission(false);
                setLoading(false);
                setRefreshing(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
    };

    const initializeWeather = async () => {
        setLoading(true);
        const cached = await AsyncStorage.getItem('farm_weather_cache');
        if (cached) {
            const parsed = JSON.parse(cached);
            setWeatherData(parsed.current);
            setForecastData(parsed.forecast || []);
            setHourlyData(parsed.hourly || []);
            setAqiData(parsed.aqi);
        }
        requestLocationPermission();
    };

    useEffect(() => { initializeWeather(); }, []);

    const onRefresh = () => { setRefreshing(true); loadLiveWeather(); };

    // ── Sub-components ────────────────────────────────────────────────────────

    const renderHourlyItem = (item, index) => {
        const date = new Date(item.dt * 1000);
        const hour = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        const temp = Math.round(item.main.temp);
        const isHot = temp >= 38;
        const emoji = item.weather[0].icon?.includes('d') ? (isHot ? '☀️' : '⛅') : '🌙';

        return (
            <View key={index} style={[
                styles.hourlyItem,
                index === 0 && styles.hourlyItemActive,
            ]}>
                <Text style={[styles.hourlyTime, index === 0 && styles.hourlyTimeActive]}>
                    {index === 0 ? 'Now' : hour}
                </Text>
                <Text style={styles.hourlyEmoji}>{emoji}</Text>
                <Text style={[styles.hourlyTemp, index === 0 && styles.hourlyTempActive]}>{temp}°C</Text>
            </View>
        );
    };

    const renderAQI = () => {
        if (!aqiData?.list?.length) return null;
        const aqi = aqiData.list[0].main.aqi;
        const idx = Math.min(Math.max(aqi - 1, 0), 4);

        return (
            <View style={[styles.card, styles.aqiRow]}>
                <View style={[styles.aqiBubble, { backgroundColor: AQI_COLORS[idx] + '22' }]}>
                    <Text style={styles.aqiEmoji}>{AQI_EMOJI[idx]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardLabel}>Air Quality Index</Text>
                    <Text style={[styles.aqiLabel, { color: AQI_COLORS[idx] }]}>{AQI_LABELS[idx]}</Text>
                    <View style={styles.aqiBar}>
                        <View style={[styles.aqiBarFill, {
                            width: `${(aqi / 5) * 100}%`,
                            backgroundColor: AQI_COLORS[idx],
                        }]} />
                    </View>
                    <View style={styles.aqiScale}>
                        {['0', '50', '100', '150', '200', '300+'].map(v => (
                            <Text key={v} style={styles.aqiScaleText}>{v}</Text>
                        ))}
                    </View>
                </View>
                <View style={[styles.aqiBadge, { backgroundColor: AQI_COLORS[idx] }]}>
                    <Text style={styles.aqiBadgeText}>{aqi}</Text>
                </View>
            </View>
        );
    };

    const renderCropMeaning = () => {
        const tips = CROP_TIPS(weatherData, aqiData);
        if (!tips.length) return null;
        return (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>🌾 What It Means for Your Crops</Text>
                {tips.map((tip, i) => (
                    <View key={i} style={[styles.tipRow, { backgroundColor: tip.bg }]}>
                        <View style={[styles.tipIcon, { backgroundColor: tip.color + '22' }]}>
                            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.tipLabel, { color: tip.color }]}>{tip.label}</Text>
                            <Text style={styles.tipDesc}>{tip.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const renderCropAdvisory = () => {
        if (!weatherData) return null;
        const temp = weatherData.main?.temp || 0;
        const isHot = temp >= 35;
        return (
            <View style={[styles.card, styles.advisoryCard]}>
                <View style={styles.advisoryHeader}>
                    <Text style={styles.advisoryIcon}>💡</Text>
                    <Text style={styles.advisoryTitle}>Today's Crop Advisory</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>View All →</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.advisoryBody}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.advisoryMain}>
                            {isHot
                                ? 'Good day for irrigation in the morning.'
                                : 'Favourable conditions for fieldwork today.'}
                        </Text>
                        <Text style={styles.advisoryDesc}>
                            {isHot
                                ? 'High temperature expected. Water your crops early to reduce evaporation.'
                                : 'Mild weather. Ideal for sowing, spraying and inspection.'}
                        </Text>
                    </View>
                    <Text style={styles.advisoryPlant}>🌱</Text>
                </View>
            </View>
        );
    };

    const renderRecommendedActions = () => {
        const actions = RECOMMENDED_ACTIONS(weatherData);
        if (!actions.length) return null;
        return (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>✅ Recommended Actions</Text>
                {actions.map((a, i) => (
                    <View key={i} style={styles.actionRow}>
                        <View style={styles.actionNum}>
                            <Text style={styles.actionNumText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.actionText}>{a.text}</Text>
                        <Text style={styles.actionEmoji}>{a.emoji}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderForecastItem = ({ item }) => {
        const dateObj = new Date(item.dt * 1000);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const isDay = item.weather[0].icon?.includes('d') ?? true;
        const emoji = item.weather[0].icon?.includes('d') ? '☀️' : '🌙';

        return (
            <View style={styles.forecastItem}>
                <View style={styles.forecastLeft}>
                    <View style={styles.forecastDayBubble}>
                        <Text style={styles.forecastDayText}>{dayName}</Text>
                    </View>
                    <Text style={styles.forecastEmoji}>{emoji}</Text>
                </View>
                <View style={styles.forecastRight}>
                    <Text style={styles.forecastDesc} numberOfLines={1}>
                        {item.weather[0].description}
                    </Text>
                    <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
                </View>
            </View>
        );
    };

    const renderChart = () => {
        if (!forecastData.length) return null;
        const labels = forecastData.map(f => new Date(f.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }));
        const data = forecastData.map(f => Math.round(f.main.temp));
        return (
            <View style={[styles.card, { paddingHorizontal: 12 }]}>
                <Text style={styles.sectionTitle}>📈 Temperature Trend (°C)</Text>
                <LineChart
                    data={{ labels, datasets: [{ data }] }}
                    width={screenWidth - 60}
                    height={180}
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#f0fdf4',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(18, 53, 36, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                        propsForDots: { r: '5', strokeWidth: '2', stroke: '#123524' },
                    }}
                    bezier
                    style={{ marginVertical: 4, borderRadius: 16 }}
                />
            </View>
        );
    };

    const renderAIInsights = () => (
        <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
                <Text style={styles.aiEmoji}>🧠</Text>
                <Text style={styles.aiTitle}>DeepSeek Agro AI</Text>
            </View>
            {loadingInsights ? (
                <ActivityIndicator size="small" color="#047857" style={{ marginVertical: 8 }} />
            ) : insights ? (
                <Text style={styles.aiText}>{insights}</Text>
            ) : (
                <>
                    <Text style={styles.aiPlaceholder}>
                        Get AI-powered farming tips based on your local weather and air quality.
                    </Text>
                    <TouchableOpacity style={styles.aiButton} onPress={fetchDeepseekInsights}>
                        <Text style={styles.aiButtonText}>Ask AI for Suggestions</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

    // ── No Permission Screen ──────────────────────────────────────────────────
    if (!hasLocationPermission && !weatherData) {
        return (
            <View className="flex-1 bg-[#123524]">
                <SafeAreaView edges={['top']} className="flex-1">
                    <Header title="Weather" />
                    <View className="flex-1 bg-[#f8fafc] justify-center items-center px-6">
                        <Text style={{ fontSize: 64 }}>📍</Text>
                        <Text style={styles.permTitle}>Location Required</Text>
                        <Text style={styles.permDesc}>
                            KrishiSetu needs your location to provide accurate agricultural weather insights.
                        </Text>
                        <TouchableOpacity style={styles.permButton} onPress={requestLocationPermission}>
                            <Text style={styles.permButtonText}>Enable Location</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    // ── Main Render ───────────────────────────────────────────────────────────
    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Weather & Crop Advisory" />

                <View className="flex-1 bg-[#f8fafc]">
                    <FlashList
                        data={forecastData}
                        renderItem={renderForecastItem}
                        estimatedItemSize={72}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        ListHeaderComponent={
                            <View>
                                {/* Weather Card */}
                                <WeatherCard weather={weatherData} loading={loading && !weatherData} />

                                {/* Hourly Forecast */}
                                {hourlyData.length > 0 && (
                                    <View style={[styles.card, { paddingHorizontal: 4 }]}>
                                        <View style={styles.rowBetween}>
                                            <Text style={styles.sectionTitle}>⏱ Hourly Forecast</Text>
                                            <Text style={styles.seeDetails}>See Details →</Text>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={{ paddingHorizontal: 8, gap: 10 }}>
                                            {hourlyData.map((item, i) => renderHourlyItem(item, i))}
                                        </ScrollView>
                                    </View>
                                )}

                                {/* AQI */}
                                {renderAQI()}

                                {/* Crop Advisory */}
                                {renderCropAdvisory()}

                                {/* What It Means */}
                                {renderCropMeaning()}

                                {/* Chart */}
                                {renderChart()}

                                {/* AI Insights */}
                                {renderAIInsights()}

                                {/* Recommended Actions */}
                                {renderRecommendedActions()}

                                {/* 5-Day Forecast Header */}
                                {forecastData.length > 0 && (
                                    <View style={styles.rowBetween2}>
                                        <Text style={styles.sectionTitle2}>📅 5-Day Forecast</Text>
                                        <Text style={styles.seeDetails}>See Full Forecast →</Text>
                                    </View>
                                )}
                            </View>
                        }
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // Cards
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
    },
    cardLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        marginBottom: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#123524',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    rowBetween2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 8,
        marginTop: 4,
    },
    sectionTitle2: {
        fontSize: 16,
        fontWeight: '700',
        color: '#123524',
    },
    seeDetails: {
        fontSize: 13,
        color: '#16a34a',
        fontWeight: '600',
    },
    viewAll: {
        fontSize: 13,
        color: '#16a34a',
        fontWeight: '600',
    },

    // Hourly
    hourlyItem: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: '#f1fdf4',
        minWidth: 70,
        gap: 4,
    },
    hourlyItemActive: {
        backgroundColor: '#123524',
    },
    hourlyTime: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    hourlyTimeActive: { color: '#86efac' },
    hourlyEmoji: { fontSize: 22 },
    hourlyTemp: {
        fontSize: 14,
        fontWeight: '700',
        color: '#123524',
    },
    hourlyTempActive: { color: '#fff' },

    // AQI
    aqiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    aqiBubble: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aqiEmoji: { fontSize: 24 },
    aqiLabel: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    aqiBar: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 2,
    },
    aqiBarFill: {
        height: 8,
        borderRadius: 4,
    },
    aqiScale: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    aqiScaleText: {
        fontSize: 9,
        color: '#94a3b8',
    },
    aqiBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aqiBadgeText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
    },

    // Advisory
    advisoryCard: {
        backgroundColor: '#f0fdf4',
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    advisoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 6,
    },
    advisoryIcon: { fontSize: 18 },
    advisoryTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#123524',
        flex: 1,
    },
    advisoryBody: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    advisoryMain: {
        fontSize: 16,
        fontWeight: '700',
        color: '#123524',
        marginBottom: 4,
    },
    advisoryDesc: {
        fontSize: 13,
        color: '#4b5563',
        lineHeight: 18,
    },
    advisoryPlant: { fontSize: 40 },

    // Tips
    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
        gap: 10,
    },
    tipIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tipEmoji: { fontSize: 20 },
    tipLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    tipDesc: {
        fontSize: 12,
        color: '#6b7280',
        lineHeight: 17,
    },

    // Chart — no extra styles needed beyond card

    // AI
    aiCard: {
        backgroundColor: '#f0fdf4',
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#bbf7d0',
        elevation: 2,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    aiEmoji: { fontSize: 22 },
    aiTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#047857',
    },
    aiText: {
        fontSize: 14,
        color: '#1f2937',
        lineHeight: 22,
    },
    aiPlaceholder: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 12,
    },
    aiButton: {
        backgroundColor: '#047857',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 14,
        alignItems: 'center',
    },
    aiButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },

    // Actions
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 12,
    },
    actionNum: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#dcfce7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionNumText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#123524',
    },
    actionText: {
        flex: 1,
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '500',
    },
    actionEmoji: { fontSize: 20 },

    // Forecast item
    forecastItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    forecastLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    forecastDayBubble: {
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    forecastDayText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#123524',
    },
    forecastEmoji: { fontSize: 24 },
    forecastRight: {
        alignItems: 'flex-end',
    },
    forecastDesc: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
        textTransform: 'capitalize',
        maxWidth: 120,
    },
    forecastTemp: {
        fontSize: 20,
        fontWeight: '800',
        color: '#123524',
    },

    // Permission screen
    permTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#123524',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    permDesc: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    permButton: {
        backgroundColor: '#123524',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        width: '100%',
    },
    permButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center',
    },
});