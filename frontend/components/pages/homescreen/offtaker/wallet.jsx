import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, CreditCard } from 'lucide-react-native';
import Header from '../../../common/BHeader';
import { ThemeContext } from '../../../../context/ThemeContext';

export default function OfftakerWallet() {
    const { isDarkMode } = useContext(ThemeContext);

    const bg = isDarkMode ? '#0a0f1e' : '#102a43';
    const bodyBg = isDarkMode ? '#0d1117' : '#f8fafc';
    const cardBg = isDarkMode ? '#0f172a' : '#ffffff';
    const cardBorder = isDarkMode ? '#1e293b' : '#f1f5f9';
    const titleColor = isDarkMode ? '#e2e8f0' : '#0f172a';
    const subTextColor = isDarkMode ? '#475569' : '#94a3b8';
    const txIconBg = isDarkMode ? '#1e293b' : '#f8fafc';
    const walletCardBg = isDarkMode ? '#0f1f3d' : '#0f172a';

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <Header title="Finance" />
                <View style={{ flex: 1, backgroundColor: bodyBg, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' }}>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 20 }}>

                        {/* Balance Card */}
                        <View style={[styles.balanceCard, { backgroundColor: walletCardBg }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                                <View>
                                    <Text style={styles.balanceLabel}>Available Balance</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                                        <Text style={styles.balanceAmount}>₹4,85,250</Text>
                                        <Text style={styles.balanceDecimal}>.00</Text>
                                    </View>
                                </View>
                                <View style={styles.walletIconBox}>
                                    <Wallet color="#60a5fa" size={28} />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity style={styles.walletAction}>
                                    <ArrowUpRight color="#4ade80" size={18} />
                                    <Text style={styles.walletActionText}>Deposit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.walletAction}>
                                    <ArrowDownLeft color="#f87171" size={18} />
                                    <Text style={styles.walletActionText}>Payout</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={{ color: titleColor, fontWeight: '900', fontSize: 18, marginBottom: 16 }}>Recent Transactions</Text>
                        {[1, 2, 3].map((i) => (
                            <View key={i} style={[styles.txCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                                <View style={[styles.txIcon, { backgroundColor: txIconBg }]}>
                                    <History size={20} color={isDarkMode ? '#475569' : '#64748b'} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: titleColor, fontWeight: '700', fontSize: 14 }}>Payment to Patil Farms</Text>
                                    <Text style={{ color: subTextColor, fontSize: 10, marginTop: 4 }}>Today, 2:45 PM • Settlement</Text>
                                </View>
                                <Text style={{ color: '#f87171', fontWeight: '700' }}>-₹1,24,500</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    balanceCard: {
        borderRadius: 32,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balanceAmount: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: '900',
    },
    balanceDecimal: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
    },
    walletIconBox: {
        backgroundColor: 'rgba(96,165,250,0.15)',
        padding: 12,
        borderRadius: 18,
    },
    walletAction: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    walletActionText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },
    txCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    txIcon: {
        padding: 12,
        borderRadius: 12,
        marginRight: 16,
    },
});
