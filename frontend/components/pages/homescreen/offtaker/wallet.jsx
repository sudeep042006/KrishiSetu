import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, CreditCard } from 'lucide-react-native';
import Header from '../../../common/BHeader';
import { ThemeContext } from '../../../../context/ThemeContext';
import RazorpayCheckout from 'react-native-razorpay';
import { paymentService } from '../../service/api';
import { useTranslation } from 'react-i18next';

export default function OfftakerWallet() {
    const { isDarkMode } = useContext(ThemeContext);
    const { t } = useTranslation();

    const bg = isDarkMode ? '#0a0f1e' : '#102a43';
    const bodyBg = isDarkMode ? '#0d1117' : '#f8fafc';
    const cardBg = isDarkMode ? '#0f172a' : '#ffffff';
    const cardBorder = isDarkMode ? '#1e293b' : '#f1f5f9';
    const titleColor = isDarkMode ? '#e2e8f0' : '#0f172a';
    const subTextColor = isDarkMode ? '#475569' : '#94a3b8';
    const txIconBg = isDarkMode ? '#1e293b' : '#f8fafc';
    const walletCardBg = isDarkMode ? '#0f1f3d' : '#0f172a';

    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const wRes = await paymentService.getWalletDetails();
            if (wRes.success) setWallet(wRes.wallet);
            const txRes = await paymentService.getTransactions();
            if (txRes.success) setTransactions(txRes.transactions);
        } catch (error) {
            console.error("Error fetching wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const handleDeposit = async () => {
        try {
            const amount = 5000;
            const orderRes = await paymentService.createOrder({
                amount: amount,
                type: 'deposit'
            });

            if (!orderRes.success) return Alert.alert(t('common.error'), "Could not create order");

            const options = {
                description: t('offtaker.wallet.addFunds'),
                image: 'https://cdn-icons-png.flaticon.com/512/10041/10041178.png',
                currency: 'INR',
                key: 'rzp_test_ShTlQNZMXMnxb6',
                amount: amount * 100,
                name: 'KrishiSetu',
                order_id: orderRes.order.id,
                prefill: {
                    email: 'buyer@krishisetu.com',
                    contact: '9876543210',
                    name: 'KrishiSetu Offtaker'
                },
                theme: { color: '#1e4e8c' }
            };

            RazorpayCheckout.open(options).then(async (data) => {
                await paymentService.verifyPayment({
                    ...data,
                    orderId: orderRes.paymentRecord._id
                });
                Alert.alert(t('common.success'), "Funds added successfully!");
                fetchWalletData();
            }).catch((error) => {
                console.log("Payment Error:", error);
                Alert.alert(t('common.error'), error.description || "Payment cancelled or failed");
            });
        } catch (error) {
            console.error("Deposit error:", error);
            Alert.alert(t('common.error'), "Could not initiate payment");
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <Header title={t('offtaker.wallet.title')} />

                <ScrollView style={{ flex: 1, backgroundColor: bodyBg }} showsVerticalScrollIndicator={false}>
                    {/* Wallet Card */}
                    <View style={[styles.walletCard, { backgroundColor: walletCardBg }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '700' }}>
                                {t('offtaker.wallet.balance')}
                            </Text>
                            <Wallet size={20} color="#60a5fa" />
                        </View>

                        <Text style={styles.balanceText}>
                            ₹{wallet ? wallet.balance?.toLocaleString('en-IN') : '0.00'}
                        </Text>

                        <View style={styles.actionRow}>
                            <TouchableOpacity onPress={handleDeposit} style={styles.actionBtn}>
                                <ArrowDownLeft size={18} color="#ffffff" />
                                <Text style={styles.actionBtnText}>{t('offtaker.wallet.addFunds')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Transactions Section */}
                    <View style={styles.txSection}>
                        <Text style={[styles.sectionTitle, { color: titleColor }]}>
                            {t('offtaker.wallet.transactions')}
                        </Text>

                        {loading ? (
                            <ActivityIndicator size="small" color="#3b82f6" style={{ marginTop: 20 }} />
                        ) : transactions.length === 0 ? (
                            <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                                <History size={36} color={subTextColor} />
                                <Text style={{ color: subTextColor, marginTop: 10, fontSize: 13, fontWeight: 'bold' }}>
                                    {t('offtaker.wallet.noTransactions')}
                                </Text>
                            </View>
                        ) : (
                            transactions.map((tx, idx) => (
                                <View key={tx._id || idx} style={[styles.txCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                                    <View style={[styles.txIcon, { backgroundColor: txIconBg }]}>
                                        {tx.type === 'deposit' ? (
                                            <ArrowDownLeft size={20} color="#10b981" />
                                        ) : (
                                            <ArrowUpRight size={20} color="#ef4444" />
                                        )}
                                    </View>

                                    <View style={{ flex: 1, marginLeft: 14 }}>
                                        <Text style={[styles.txTitle, { color: titleColor }]}>
                                            {tx.type === 'deposit' ? t('wallet.addedFunds') : t('wallet.transaction')}
                                        </Text>
                                        <Text style={{ color: subTextColor, fontSize: 11, marginTop: 2 }}>
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>

                                    <Text style={[styles.txAmount, { color: tx.type === 'deposit' ? '#10b981' : '#ef4444' }]}>
                                        {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    walletCard: {
        margin: 20,
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    balanceText: {
        color: '#ffffff',
        fontSize: 34,
        fontWeight: '900',
        marginTop: 12,
        marginBottom: 20,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        backgroundColor: '#2563eb',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtnText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    txSection: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 16,
    },
    emptyCard: {
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
    },
    txCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    txIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    txTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    txAmount: {
        fontSize: 16,
        fontWeight: '900',
    },
});
