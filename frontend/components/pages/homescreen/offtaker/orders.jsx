import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Truck, Package, Calendar, ChevronRight } from 'lucide-react-native';
import Header from '../../../common/BHeader';
import { ThemeContext } from '../../../../context/ThemeContext';
import { paymentService } from '../../service/api';
import { useTranslation } from 'react-i18next';

export default function OfftakerOrders({ navigation }) {
    const { isDarkMode } = useContext(ThemeContext);
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const bg = isDarkMode ? '#0d1117' : '#f8fafc';
    const cardBg = isDarkMode ? '#161b22' : '#ffffff';
    const titleColor = isDarkMode ? '#ffffff' : '#0f172a';
    const subTextColor = isDarkMode ? '#8b949e' : '#64748b';
    const borderColor = isDarkMode ? '#30363d' : '#e2e8f0';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await paymentService.getTransactions();
                if (res.success) {
                    const purchaseOrders = res.transactions.filter(tx => tx.type === 'purchase' && tx.status === 'success');
                    setOrders(purchaseOrders);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getDeliveryStatus = (date) => {
        const orderDate = new Date(date);
        const today = new Date();
        const diffTime = Math.abs(today - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays <= 2) return { text: t('offtaker.orders.delivery.processing'), color: '#f59e0b', estimated: 5 - diffDays };
        if (diffDays <= 4) return { text: t('offtaker.orders.delivery.inTransit'), color: '#3b82f6', estimated: 5 - diffDays };
        return { text: t('offtaker.orders.delivery.delivered'), color: '#10b981', estimated: 0 };
    };

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <Header title={t('offtaker.orders.title')} showBack={true} onBackPress={() => navigation.goBack()} />
                
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <Text style={{ color: titleColor, fontSize: 24, fontWeight: '900', marginBottom: 20 }}>
                        {t('offtaker.orders.orderHistory')}
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
                    ) : orders.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 80, paddingHorizontal: 20 }}>
                            <Package size={56} color={subTextColor} />
                            <Text style={{ color: titleColor, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>
                                {t('offtaker.orders.noOrders')}
                            </Text>
                            <Text style={{ color: subTextColor, textAlign: 'center', marginTop: 8, fontSize: 13 }}>
                                {t('offtaker.orders.noOrdersSub')}
                            </Text>
                        </View>
                    ) : (
                        orders.map((order, idx) => {
                            const status = getDeliveryStatus(order.createdAt);
                            const cropName = order.relatedItem?.cropName || order.relatedItem?.title || 'Agri Commodity';
                            return (
                                <View key={order._id || idx} style={[styles.orderCard, { backgroundColor: cardBg, borderColor }]}>
                                    <View style={styles.cardHeader}>
                                        <View>
                                            <Text style={[styles.cropTitle, { color: titleColor }]}>{cropName}</Text>
                                            <Text style={{ color: subTextColor, fontSize: 11, marginTop: 2 }}>
                                                ID: #{String(order._id).slice(-8).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={[styles.badge, { backgroundColor: status.color + '20' }]}>
                                            <Text style={{ color: status.color, fontSize: 11, fontWeight: '800' }}>
                                                {status.text}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.cardBody}>
                                        <View style={styles.infoRow}>
                                            <Calendar size={14} color={subTextColor} />
                                            <Text style={[styles.infoText, { color: subTextColor }]}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </Text>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Truck size={14} color={subTextColor} />
                                            <Text style={[styles.infoText, { color: subTextColor }]}>
                                                {status.estimated > 0 
                                                    ? t('offtaker.orders.estArrival', { days: status.estimated }) 
                                                    : t('offtaker.orders.deliveredOn')}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[styles.cardFooter, { borderColor }]}>
                                        <Text style={{ color: subTextColor, fontSize: 13, fontWeight: 'bold' }}>
                                            {t('crops.totalLotValue')}
                                        </Text>
                                        <Text style={{ color: '#10b981', fontSize: 18, fontWeight: '900' }}>
                                            ₹{order.amount?.toLocaleString('en-IN')}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    orderCard: {
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cropTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f020',
        marginVertical: 14,
    },
    cardBody: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
    }
});
