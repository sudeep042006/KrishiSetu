import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart2, TrendingUp, Package, Users } from 'lucide-react-native';
import Header from '../../../common/BHeader';
import { ThemeContext } from '../../../../context/ThemeContext';

export default function OfftakerDashboard() {
    const { isDarkMode } = useContext(ThemeContext);

    const bg = isDarkMode ? '#0a0f1e' : '#102a43';
    const bodyBg = isDarkMode ? '#0d1117' : '#f8fafc';
    const cardBg = isDarkMode ? '#0f172a' : '#ffffff';
    const cardBorder = isDarkMode ? '#1e293b' : '#f1f5f9';
    const titleColor = isDarkMode ? '#e2e8f0' : '#0f172a';
    const labelColor = isDarkMode ? '#475569' : '#94a3b8';
    const iconBgBlue = isDarkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff';
    const iconBgIndigo = isDarkMode ? 'rgba(99,102,241,0.15)' : '#eef2ff';
    const analyticsBg = isDarkMode ? '#1e293b' : '#f8fafc';

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <Header title="Procurement Insights" />
                <View style={{ flex: 1, backgroundColor: bodyBg, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' }}>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 20 }}>
                        <Text style={{ color: titleColor, fontWeight: '900', fontSize: 20, marginBottom: 24 }}>Market Trends</Text>

                        {/* Top Metrics Grid */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }}>
                            <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                                <View style={[styles.iconBox, { backgroundColor: iconBgBlue }]}>
                                    <Package color="#3b82f6" size={24} />
                                </View>
                                <Text style={[styles.metricLabel, { color: labelColor }]}>Total Sourced</Text>
                                <Text style={[styles.metricValue, { color: titleColor }]}>1.2k Tons</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
                                    <TrendingUp size={12} color="#10b981" />
                                    <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 10 }}>+12% vs LY</Text>
                                </View>
                            </View>

                            <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                                <View style={[styles.iconBox, { backgroundColor: iconBgIndigo }]}>
                                    <Users color="#6366f1" size={24} />
                                </View>
                                <Text style={[styles.metricLabel, { color: labelColor }]}>Active Farmers</Text>
                                <Text style={[styles.metricValue, { color: titleColor }]}>84 Active</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
                                    <TrendingUp size={12} color="#10b981" />
                                    <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 10 }}>+5 this week</Text>
                                </View>
                            </View>
                        </View>

                        {/* Analytics Placeholder */}
                        <View style={[styles.analyticsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                            <View style={[styles.analyticsIcon, { backgroundColor: analyticsBg }]}>
                                <BarChart2 size={48} color={isDarkMode ? '#334155' : '#94a3b8'} />
                            </View>
                            <Text style={{ color: titleColor, fontWeight: '700', fontSize: 17, marginBottom: 8 }}>Price Predictor</Text>
                            <Text style={{ color: labelColor, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>
                                Your procurement cost is optimized. Price for Wheat is expected to dip next month.
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    metricCard: {
        width: '48%',
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
    },
    iconBox: {
        padding: 12,
        borderRadius: 16,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    metricLabel: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '900',
        marginTop: 4,
    },
    analyticsCard: {
        padding: 24,
        borderRadius: 32,
        marginBottom: 32,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyticsIcon: {
        padding: 40,
        borderRadius: 9999,
        marginBottom: 16,
    },
});
