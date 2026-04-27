import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Package, Users, Activity, Target, Clock } from 'lucide-react-native';
import Header from '../../../common/BHeader';
import { ThemeContext } from '../../../../context/ThemeContext';
import { farmerService, ProposalService } from '../../service/api';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 120; // Fixed visual height in px for the tallest bar
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function OfftakerDashboard() {
    const { isDarkMode } = useContext(ThemeContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [farmerCount, setFarmerCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [weeklyBars, setWeeklyBars] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [peakDay, setPeakDay] = useState(null);

    // ---------- Theme ----------
    const bg        = isDarkMode ? '#0a0f1e' : '#102a43';
    const bodyBg    = isDarkMode ? '#0d1117' : '#f8fafc';
    const cardBg    = isDarkMode ? '#0f172a' : '#ffffff';
    const cardBorder = isDarkMode ? '#1e293b' : '#f1f5f9';
    const title     = isDarkMode ? '#e2e8f0' : '#0f172a';
    const sub       = isDarkMode ? '#475569' : '#94a3b8';

    // ---------- Fetch ----------
    const fetchData = useCallback(async () => {
        try {
            const [farmersRes, proposalsRes] = await Promise.all([
                farmerService.getFarmers(),
                ProposalService.getOfftakerProposals(),
            ]);

            // Real farmers count
            const farmers = farmersRes?.farmers || farmersRes?.data || [];
            setFarmerCount(Array.isArray(farmers) ? farmers.length : 0);

            // Real proposals
            const proposals = proposalsRes?.proposals || proposalsRes?.data || [];
            const sorted = [...proposals].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setRecentOrders(sorted);

            // Build bar chart from last 7 days — normalized to CHART_HEIGHT
            const rawBars = [0, 0, 0, 0, 0, 0, 0]; // Sun–Sat order counts
            const cutoff  = Date.now() - 7 * 24 * 60 * 60 * 1000;
            proposals.forEach(p => {
                const d = new Date(p.createdAt);
                if (d.getTime() >= cutoff) {
                    rawBars[d.getDay()] += 1; // count orders per day
                }
            });

            // Find max so we can normalize
            const maxVal = Math.max(...rawBars, 1);
            const peak   = rawBars.indexOf(maxVal);
            setPeakDay(maxVal > 0 ? peak : null);

            // Normalize: tallest bar = CHART_HEIGHT px, min visible = 6px
            setWeeklyBars(rawBars.map(v => (v === 0 ? 6 : Math.max(6, (v / maxVal) * CHART_HEIGHT))));
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    // ---------- Status badge colour ----------
    const statusStyle = (status) => {
        if (!status) return { bg: '#f1f5f9', text: '#64748b' };
        const s = status.toLowerCase();
        if (s === 'accepted')  return { bg: '#ecfdf5', text: '#059669' };
        if (s === 'rejected')  return { bg: '#fef2f2', text: '#dc2626' };
        return { bg: '#fffbeb', text: '#d97706' }; // pending / default
    };

    // ---------- Render each order card ----------
    const renderOrderItem = ({ item, index }) => {
        const ss  = statusStyle(item.status);
        const date = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';

        return (
            <View style={[styles.orderCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                {/* Row 1 — crop name + status */}
                <View style={styles.cardRow}>
                    <View style={styles.cardLeft}>
                        <View style={styles.cropIcon}>
                            <Package size={18} color="#3b82f6" />
                        </View>
                        <View>
                            <Text style={[styles.cropName, { color: title }]}>
                                {item.cropName || item.crop || 'Commodity'}
                            </Text>
                            <Text style={[styles.orderId, { color: sub }]}>
                                #{String(item._id).slice(-6).toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                        <Text style={[styles.badgeText, { color: ss.text }]}>
                            {(item.status || 'pending').toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Row 2 — date + quantity */}
                <View style={[styles.cardRow, styles.cardBottom]}>
                    <View style={styles.cardLeft}>
                        <Clock size={12} color={sub} />
                        <Text style={[styles.dateText, { color: sub }]}>{date}</Text>
                    </View>
                    <Text style={[styles.qty, { color: title }]}>
                        {item.quantity != null ? `${item.quantity} ${item.unit || 'Tons'}` : '—'}
                    </Text>
                </View>
            </View>
        );
    };

    // ---------- Header (metrics + chart) ----------
    const ListHeader = () => (
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>

            {/* Title */}
            <Text style={[styles.screenTitle, { color: title }]}>Procurement Center</Text>

            {/* Metric cards */}
            <View style={styles.metricsRow}>
                {/* Orders */}
                <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                        <Package color="#3b82f6" size={22} />
                    </View>
                    <Text style={[styles.metricLabel, { color: sub }]}>Total Orders</Text>
                    <Text style={[styles.metricValue, { color: title }]}>{recentOrders.length}</Text>
                    <View style={styles.metricFooter}>
                        <TrendingUp size={11} color="#10b981" />
                        <Text style={styles.metricFooterText}>Real‑time</Text>
                    </View>
                </View>

                {/* Farmers */}
                <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
                        <Users color="#6366f1" size={22} />
                    </View>
                    <Text style={[styles.metricLabel, { color: sub }]}>Farmers Connected</Text>
                    <Text style={[styles.metricValue, { color: title }]}>{farmerCount}</Text>
                    <View style={styles.metricFooter}>
                        <Activity size={11} color="#6366f1" />
                        <Text style={[styles.metricFooterText, { color: '#6366f1' }]}>Active</Text>
                    </View>
                </View>
            </View>

            {/* Bar Chart */}
            <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <View style={styles.chartHeader}>
                    <View>
                        <Text style={[styles.chartTitle, { color: title }]}>Order Volume</Text>
                        <Text style={[styles.chartSub, { color: sub }]}>LAST 7 DAYS · BY DAY OF WEEK</Text>
                    </View>
                    <View style={styles.livePill}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </View>

                {/* Bars */}
                <View style={styles.chartArea}>
                    {weeklyBars.map((h, idx) => {
                        const isActive = h > 6; // has real data
                        const isPeak   = idx === peakDay && isActive;
                        return (
                            <View key={idx} style={styles.barCol}>
                                {/* Value label on top of bar */}
                                {/* The bar */}
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: h,
                                            backgroundColor: isPeak
                                                ? '#2563eb'
                                                : isActive
                                                ? '#93c5fd'
                                                : isDarkMode ? '#1e293b' : '#e2e8f0',
                                        },
                                    ]}
                                />
                                <Text style={[styles.dayLabel, { color: sub }]}>
                                    {DAY_LABELS[idx].charAt(0)}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Legend */}
                {peakDay !== null && (
                    <View style={styles.chartLegend}>
                        <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
                        <Text style={[styles.legendText, { color: title }]}>
                            Peak: {DAY_LABELS[peakDay]}
                        </Text>
                    </View>
                )}
            </View>

            {/* Procurement health */}
            <View style={styles.healthCard}>
                <View style={styles.cardRow}>
                    <Target size={18} color="#fff" />
                    <Text style={styles.healthTitle}>Procurement Health</Text>
                </View>
                <Text style={styles.healthBody}>
                    Supply chain linked with {farmerCount} active farmer{farmerCount !== 1 ? 's' : ''}.{' '}
                    {recentOrders.length} order{recentOrders.length !== 1 ? 's' : ''} placed so far.
                </Text>
            </View>

            {/* Section title */}
            {recentOrders.length > 0 && (
                <Text style={[styles.sectionTitle, { color: title }]}>Recent Orders</Text>
            )}
        </View>
    );

    // ---------- Loading ----------
    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: bg }]}>
                <ActivityIndicator size="large" color="#93c5fd" />
                <Text style={{ color: '#93c5fd', marginTop: 12, fontWeight: '600' }}>
                    Loading procurement data…
                </Text>
            </View>
        );
    }

    // ---------- Main render ----------
    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <Header title="Procurement Dashboard" />
                <View style={[styles.body, { backgroundColor: bodyBg }]}>
                    <FlatList
                        data={recentOrders}
                        keyExtractor={(item) => item._id}
                        renderItem={renderOrderItem}
                        ListHeaderComponent={ListHeader}
                        contentContainerStyle={{ paddingBottom: 48 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#3b82f6"
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Package size={44} color={sub} />
                                <Text style={[styles.emptyText, { color: sub }]}>No orders yet</Text>
                            </View>
                        }
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    body: {
        flex: 1,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        overflow: 'hidden',
    },

    // Header
    screenTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '900', marginTop: 8, marginBottom: 14 },

    // Metrics
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    metricCard: {
        width: '48%',
        padding: 18,
        borderRadius: 28,
        borderWidth: 1,
    },
    iconBox: { padding: 10, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 12 },
    metricLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
    metricValue: { fontSize: 26, fontWeight: '900', marginTop: 2, marginBottom: 6 },
    metricFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metricFooterText: { color: '#10b981', fontSize: 10, fontWeight: '700' },

    // Chart
    chartCard: {
        padding: 22,
        borderRadius: 32,
        borderWidth: 1,
        marginBottom: 18,
    },
    chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    chartTitle: { fontSize: 16, fontWeight: '900' },
    chartSub: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        gap: 5,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
    liveText: { fontSize: 9, fontWeight: '900', color: '#059669' },
    chartArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: CHART_HEIGHT + 24, // bar area + day label space
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    barCol: { alignItems: 'center', flex: 1 },
    bar: { width: 10, borderRadius: 6, minHeight: 6 },
    dayLabel: { fontSize: 9, fontWeight: '800', marginTop: 6 },
    chartLegend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 6,
    },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, fontWeight: '700' },

    // Health card
    healthCard: {
        backgroundColor: '#1e4e8c',
        padding: 22,
        borderRadius: 28,
        marginBottom: 22,
        gap: 8,
    },
    healthTitle: { color: '#fff', fontWeight: '900', fontSize: 15, marginLeft: 8 },
    healthBody: { color: '#bfdbfe', fontSize: 12, lineHeight: 19 },

    // Order cards
    orderCard: {
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 22,
        marginBottom: 10,
        borderWidth: 1,
        elevation: 1,
    },
    cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardBottom: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    cropIcon: { backgroundColor: '#eff6ff', padding: 8, borderRadius: 12 },
    cropName: { fontSize: 15, fontWeight: '800' },
    orderId: { fontSize: 10, fontWeight: '600', marginTop: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
    badgeText: { fontSize: 9, fontWeight: '900' },
    dateText: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
    qty: { fontSize: 13, fontWeight: '900' },

    // Empty
    empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
    emptyText: { fontWeight: '700', fontSize: 14 },
});
