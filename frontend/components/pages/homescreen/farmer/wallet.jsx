import React, { useState, useEffect } from 'react';
import { paymentService } from '../../service/api';
import { Alert } from 'react-native';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
    Modal,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft, 
    TrendingUp, 
    Clock, 
    ChevronRight, 
    Banknote, 
    Plus,
    Download,
    Filter,
    ShieldCheck,
    AlertCircle
} from 'lucide-react-native';
import Header from '../../../common/Header';

const { width } = Dimensions.get('window');

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const DUMMY_TRANSACTIONS = [
    {
        id: 't1',
        type: 'income',
        source: 'Crop Sale: Organic Wheat',
        amount: 45000,
        date: '24 Apr, 2026',
        status: 'completed',
        buyer: 'GreenFood Exports'
    },
    {
        id: 't2',
        type: 'withdrawal',
        source: 'Transfer to HDFC Bank',
        amount: 20000,
        date: '22 Apr, 2026',
        status: 'completed',
        account: '**** 8823'
    },
    {
        id: 't3',
        type: 'income',
        source: 'Contract Advance: Soybean',
        amount: 15000,
        date: '20 Apr, 2026',
        status: 'pending',
        buyer: 'Patel Foods & Oils'
    },
    {
        id: 't4',
        type: 'income',
        source: 'Incentive: Quality Bonus',
        amount: 2500,
        date: '18 Apr, 2026',
        status: 'completed',
        buyer: 'KrishiSetu Govt. Subsidy'
    },
    {
        id: 't5',
        type: 'income',
        source: 'Crop Sale: Maize',
        amount: 32000,
        date: '15 Apr, 2026',
        status: 'completed',
        buyer: 'Sharma Agro Traders'
    }
];

export default function WalletScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const wRes = await paymentService.getWalletDetails();
            if (wRes.success) setWalletData(wRes.wallet);
            
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

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchWalletData();
        setRefreshing(false);
    }, []);

    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const handleWithdraw = async () => {
        if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid withdrawal amount.");
            return;
        }

        if (walletData && Number(withdrawAmount) > walletData.availableBalance) {
            Alert.alert("Insufficient Balance", "You cannot withdraw more than your available balance.");
            return;
        }

        // Logic for withdrawal (Test Mode Simulation)
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        Alert.alert("Withdrawal Initiated", `₹${withdrawAmount} has been sent to your bank account.`);
    };

    const renderTransaction = (tx) => (
        <TouchableOpacity 
            key={tx._id}
            className="flex-row items-center p-4 bg-white mb-3 rounded-2xl border border-gray-100"
            style={{ elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8 }}
        >
            <View className={`w-12 h-12 rounded-full items-center justify-center ${tx.type === 'sale' || tx.type === 'deposit' ? 'bg-green-50' : 'bg-red-50'}`}>
                {tx.type === 'sale' || tx.type === 'deposit' ? (
                    <ArrowDownLeft size={22} color="#16a34a" />
                ) : (
                    <ArrowUpRight size={22} color="#dc2626" />
                )}
            </View>
            <View className="flex-1 ml-4">
                <Text className="text-[15px] font-bold text-gray-900" numberOfLines={1}>
                    {tx.type === 'sale' ? 'Crop Sold' : tx.type === 'deposit' ? 'Added Funds' : tx.type === 'withdrawal' ? 'Bank Withdrawal' : 'Transaction'}
                </Text>
                <View className="flex-row items-center mt-1">
                    <Clock size={12} color="#94a3b8" />
                    <Text className="text-[12px] text-gray-400 ml-1">{new Date(tx.createdAt).toLocaleDateString()}</Text>
                    {tx.status === 'pending' && (
                        <View className="bg-amber-50 px-2 py-0.5 rounded-full ml-2">
                            <Text className="text-[10px] text-amber-600 font-bold uppercase">Pending</Text>
                        </View>
                    )}
                </View>
            </View>
            <View className="items-end">
                <Text className={`text-[16px] font-black ${tx.type === 'deposit' || tx.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'deposit' || tx.type === 'sale' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                </Text>
                <ChevronRight size={16} color="#cbd5e1" className="mt-1" />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="flex-1 bg-[#123524] justify-center items-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white mt-4 font-medium">Securing Wallet Data...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Farm Wallet" showNotification={true} />
                
                <View className="flex-1 bg-[#f8fafc] rounded-t-[40px] overflow-hidden">
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    >
                        {/* ── Main Balance Card ── */}
                        <View className="p-5">
                            <View 
                                className="bg-[#123524] rounded-[32px] p-6 shadow-xl"
                                style={{ elevation: 15, shadowColor: '#123524', shadowOpacity: 0.3, shadowRadius: 20 }}
                            >
                                <View className="flex-row justify-between items-start mb-6">
                                    <View>
                                        <Text className="text-green-200 text-xs font-bold uppercase tracking-widest">Available Balance</Text>
                                        <Text className="text-white text-4xl font-black mt-1">
                                            ₹{walletData ? walletData.availableBalance.toLocaleString('en-IN') : '0'}
                                        </Text>
                                    </View>
                                    <View className="bg-white/10 p-2 rounded-xl">
                                        <Wallet color="#fff" size={24} />
                                    </View>
                                </View>

                                <View className="flex-row items-center bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
                                    <View className="flex-1 border-r border-white/10">
                                        <Text className="text-green-200/60 text-[10px] font-bold uppercase">Pending</Text>
                                        <Text className="text-white font-bold text-lg">₹{walletData ? walletData.pendingBalance.toLocaleString('en-IN') : '0'}</Text>
                                    </View>
                                    <View className="flex-1 pl-4">
                                        <Text className="text-green-200/60 text-[10px] font-bold uppercase">Total Earned</Text>
                                        <Text className="text-white font-bold text-lg">₹{walletData ? walletData.totalEarnings.toLocaleString('en-IN') : '0'}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    className="bg-white rounded-2xl py-4 items-center flex-row justify-center"
                                    style={{ gap: 8 }}
                                    onPress={() => setShowWithdrawModal(true)}
                                >
                                    <ArrowUpRight size={20} color="#123524" />
                                    <Text className="text-[#123524] font-black text-lg">Withdraw to Bank</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ── Quick Stats Grid ── */}
                        <View className="px-5 flex-row" style={{ gap: 12 }}>
                            <View className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mb-3">
                                    <TrendingUp size={20} color="#3b82f6" />
                                </View>
                                <Text className="text-slate-400 text-[10px] font-bold uppercase">Monthly Growth</Text>
                                <Text className="text-slate-900 font-bold text-xl mt-1">+12.4%</Text>
                            </View>
                            <TouchableOpacity className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm items-center justify-center border-dashed">
                                <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mb-3">
                                    <Plus size={20} color="#64748b" />
                                </View>
                                <Text className="text-slate-900 font-bold">Add Account</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── Linked Account Section ── */}
                        <View className="p-5">
                            <View className="bg-blue-50/50 rounded-3xl p-4 flex-row items-center border border-blue-100">
                                <View className="bg-white p-3 rounded-2xl border border-blue-100">
                                    <Banknote size={24} color="#1e40af" />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="text-blue-900 font-bold text-sm">Linked Bank Account</Text>
                                    <Text className="text-blue-600 text-xs mt-0.5">HDFC Bank • • • • 8823</Text>
                                </View>
                                <ShieldCheck size={20} color="#16a34a" />
                            </View>
                        </View>

                        {/* ── Transactions Header ── */}
                        <View className="px-5 flex-row justify-between items-end mb-4">
                            <View>
                                <Text className="text-slate-900 font-black text-2xl">Transactions</Text>
                                <Text className="text-slate-400 text-xs font-medium">Your recent financial activities</Text>
                            </View>
                            <TouchableOpacity className="bg-slate-100 p-2 rounded-xl">
                                <Filter size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {/* ── Transactions List ── */}
                        <View className="px-5">
                            {transactions.length === 0 ? (
                                <Text className="text-center text-gray-500 my-4">No transactions yet.</Text>
                            ) : (
                                transactions.map(renderTransaction)
                            )}
                        </View>

                        {/* ── Tip Card ── */}
                        <View className="m-5 p-4 bg-amber-50 rounded-3xl border border-amber-100 flex-row items-center" style={{ gap: 12 }}>
                            <AlertCircle size={24} color="#d97706" />
                            <Text className="flex-1 text-[12px] text-amber-800 font-semibold leading-5">
                                Pending payments are usually cleared within 24-48 hours of quality verification.
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>

            {/* ── Withdrawal Modal ── */}
            <Modal visible={showWithdrawModal} animationType="slide" transparent onRequestClose={() => setShowWithdrawModal(false)}>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[40px] p-8 h-[60%]">
                        <View className="items-center mb-8">
                            <View className="w-12 h-1.5 bg-gray-200 rounded-full mb-6" />
                            <Text className="text-2xl font-black text-gray-900">Withdraw Funds</Text>
                            <Text className="text-gray-400 mt-2">Available: ₹{walletData ? walletData.availableBalance.toLocaleString('en-IN') : '0'}</Text>
                        </View>

                        <Text className="text-gray-900 font-bold mb-2">Amount to Withdraw</Text>
                        <View className="bg-gray-100 rounded-2xl flex-row items-center px-4 mb-8">
                            <Text className="text-2xl font-bold text-gray-400 mr-2">₹</Text>
                            <TextInput 
                                className="flex-1 py-4 text-2xl font-bold text-gray-900"
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={withdrawAmount}
                                onChangeText={setWithdrawAmount}
                            />
                        </View>

                        <View className="bg-blue-50 p-4 rounded-2xl flex-row items-center mb-8">
                            <Banknote size={20} color="#1e40af" />
                            <View className="ml-3">
                                <Text className="text-blue-900 font-bold text-sm">HDFC Bank</Text>
                                <Text className="text-blue-600 text-xs">A/C: **** 8823</Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            className="bg-[#123524] rounded-2xl py-4 items-center"
                            onPress={handleWithdraw}
                        >
                            <Text className="text-white font-bold text-lg">Confirm Withdrawal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            className="mt-4 items-center"
                            onPress={() => setShowWithdrawModal(false)}
                        >
                            <Text className="text-gray-400 font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
