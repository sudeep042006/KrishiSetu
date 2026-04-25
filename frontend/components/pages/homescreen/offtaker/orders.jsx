import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Truck, Package, Calendar, ChevronRight } from 'lucide-react-native';
import Header from '../../../common/BHeader';
import { ThemeContext } from '../../../../context/ThemeContext';
import { paymentService } from '../../service/api';

export default function OfftakerOrders({ navigation }) {
    const { isDarkMode } = useContext(ThemeContext);
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
                    // Filter only purchases
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

        if (diffDays <= 2) return { text: 'Processing', color: '#f59e0b', estimated: 5 - diffDays };
        if (diffDays <= 4) return { text: 'In Transit', color: '#3b82f6', estimated: 5 - diffDays };
        return { text: 'Delivered', color: '#10b981', estimated: 0 };
    };

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <Header title="My Procurement Orders" showBack={true} onBackPress={() => navigation.goBack()} />
                
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <Text style={{ color: titleColor, fontSize: 24, fontWeight: '900', marginBottom: 20 }}>Order History</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
                    ) : orders.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Package size={64} color={subTextColor} opacity={0.5} />
                            <Text style={{ color: subTextColor, fontSize: 16, marginTop: 16, fontWeight: '600' }}>No crops procured yet.</Text>
                        </View>
                    ) : (
                        orders.map((order) => {
                            const status = getDeliveryStatus(order.createdAt);
                            return (
                                <View key={order._id} style={[styles.orderCard, { backgroundColor: cardBg, borderColor }]}>
                                    <View style={[styles.orderHeader, { borderBottomColor: borderColor }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Package size={20} color="#3b82f6" />
                                            <Text style={{ color: titleColor, fontWeight: '800', fontSize: 16 }}>
                                                {order.notes?.replace('Crop Sale: ', '') || 'Crop Purchase'}
                                            </Text>
                                        </View>
                                        <Text style={{ color: '#3b82f6', fontWeight: '900', fontSize: 16 }}>
                                            ₹{order.amount.toLocaleString('en-IN')}
                                        </Text>
                                    </View>

                                    <View style={styles.orderBody}>
                                        <View style={styles.detailRow}>
                                            <Calendar size={16} color={subTextColor} />
                                            <Text style={{ color: subTextColor, fontSize: 13, marginLeft: 8 }}>
                                                Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                                            </Text>
                                        </View>

                                        <View style={styles.detailRow}>
                                            <Truck size={16} color={status.color} />
                                            <Text style={{ color: titleColor, fontSize: 14, marginLeft: 8, fontWeight: '700' }}>
                                                Status: <Text style={{ color: status.color }}>{status.text}</Text>
                                            </Text>
                                        </View>
                                        
                                        {status.estimated > 0 && (
                                            <Text style={{ color: subTextColor, fontSize: 12, marginTop: 4, marginLeft: 24 }}>
                                                Estimated delivery in {status.estimated} days
                                            </Text>
                                        )}
                                    </View>
                                    
                                    <View style={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', padding: 12, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: subTextColor, fontSize: 12, fontWeight: '600' }}>Order ID: {order.orderId.substring(0, 15)}...</Text>
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
        borderWidth: 1,
        borderRadius: 20,
        marginBottom: 16,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    orderBody: {
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    }
});
