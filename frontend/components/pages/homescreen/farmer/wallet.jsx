import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, TextInput, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/Header';
import { farmerService } from '../../service/api';
import { useTranslation } from 'react-i18next';

export default function WalletScreen() {
    const { t } = useTranslation();
    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [linkedBank, setLinkedBank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: ''
    });

    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = async () => {
        try {
            setLoading(true);
            const data = await farmerService.getWalletData();
            if (data?.success) {
                setWalletData(data.wallet);
                setTransactions(data.transactions || []);
                setLinkedBank(data.wallet?.bankDetails || null);
            }
        } catch (error) {
            console.error('Error loading wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            Alert.alert(t('wallet.invalidAmount'), t('wallet.invalidAmountMsg'));
            return;
        }
        if (!linkedBank) {
            Alert.alert(t('wallet.noBankAccount'), t('wallet.noBankFirst'));
            return;
        }
        if (amount > (walletData?.balance || 0)) {
            Alert.alert(t('wallet.insufficientBalance'), t('wallet.insufficientMsg'));
            return;
        }
        try {
            await farmerService.withdrawFunds({ amount });
            Alert.alert(t('wallet.withdrawalInitiated'), `₹${amount} `);
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            loadWalletData();
        } catch (error) {
            Alert.alert(t('common.error'), error?.response?.data?.message || t('common.error'));
        }
    };

    const handleLinkBank = async () => {
        const { accountHolderName, bankName, accountNumber, ifscCode } = bankDetails;
        if (!accountHolderName || !bankName || !accountNumber || !ifscCode) {
            Alert.alert(t('common.error'), t('wallet.allBankDetailsRequired'));
            return;
        }
        try {
            await farmerService.linkBankAccount(bankDetails);
            Alert.alert(t('common.success'), t('wallet.bankLinkedSuccess'));
            setShowBankModal(false);
            loadWalletData();
        } catch (error) {
            Alert.alert(t('common.error'), t('wallet.bankLinkError'));
        }
    };

    const getTransactionLabel = (type) => {
        if (type === 'sale') return t('wallet.cropSold');
        if (type === 'deposit') return t('wallet.addedFunds');
        if (type === 'withdrawal') return t('wallet.bankWithdrawal');
        return t('wallet.transaction');
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#123524]">
                <SafeAreaView edges={['top']} className="flex-1">
                    <Header title={t('wallet.title')} />
                    <View className="flex-1 bg-[#f8fafc] justify-center items-center">
                        <ActivityIndicator size="large" color="#1e4a3b" />
                        <Text className="text-gray-500 mt-3">{t('wallet.securingData')}</Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    const balance = walletData?.balance || 0;
    const pending = walletData?.pendingAmount || 0;
    const totalEarned = walletData?.totalEarned || 0;

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title={t('wallet.title')} />

                <ScrollView className="flex-1 bg-[#f8fafc]" showsVerticalScrollIndicator={false}>

                    {/* Balance Card */}
                    <View className="bg-[#1e4a3b] mx-4 mt-4 rounded-3xl p-6">
                        <Text className="text-white/70 text-sm mb-1">{t('wallet.availableBalance')}</Text>
                        <Text className="text-white text-4xl font-black mb-4">₹{balance.toLocaleString('en-IN')}</Text>

                        <View className="flex-row justify-between">
                            <View>
                                <Text className="text-white/60 text-xs">{t('wallet.pending')}</Text>
                                <Text className="text-orange-300 font-bold text-base">₹{pending.toLocaleString('en-IN')}</Text>
                            </View>
                            <View>
                                <Text className="text-white/60 text-xs">{t('wallet.totalEarned')}</Text>
                                <Text className="text-green-300 font-bold text-base">₹{totalEarned.toLocaleString('en-IN')}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row mx-4 mt-3 gap-3">
                        <TouchableOpacity
                            onPress={() => setShowWithdrawModal(true)}
                            className="flex-1 bg-[#1e4a3b] rounded-2xl py-4 items-center"
                        >
                            <Text className="text-white font-bold">{t('wallet.withdrawToBank')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => { }}
                            className="flex-1 bg-white border border-gray-200 rounded-2xl py-4 items-center"
                        >
                            <Text className="text-[#1e4a3b] font-bold">{t('wallet.monthlyGrowth')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bank Account */}
                    <TouchableOpacity
                        onPress={() => setShowBankModal(true)}
                        className="mx-4 mt-3 bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center justify-between"
                    >
                        <View>
                            <Text className="text-gray-500 text-xs mb-1">{t('wallet.linkedBankAccount')}</Text>
                            {linkedBank ? (
                                <Text className="text-[#1e4a3b] font-bold">{linkedBank.bankName} •••• {String(linkedBank.accountNumber).slice(-4)}</Text>
                            ) : (
                                <Text className="text-gray-400 text-sm">{t('wallet.noBankLinked')}</Text>
                            )}
                        </View>
                        <Text className="text-[#1e4a3b] font-bold text-sm">
                            {linkedBank ? t('wallet.updateBank') : t('wallet.addAccount')}
                        </Text>
                    </TouchableOpacity>

                    {/* Transactions */}
                    <View className="mx-4 mt-4 mb-8">
                        <Text className="text-gray-800 font-bold text-base mb-1">{t('wallet.transactions')}</Text>
                        <Text className="text-gray-400 text-xs mb-3">{t('wallet.recentActivities')}</Text>

                        {transactions.length === 0 ? (
                            <View className="bg-white rounded-2xl p-6 items-center border border-gray-100">
                                <Text className="text-gray-400">{t('wallet.noTransactions')}</Text>
                            </View>
                        ) : (
                            transactions.map((tx, idx) => (
                                <View key={idx} className="bg-white rounded-2xl p-4 mb-2 border border-gray-100 flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-gray-800 font-semibold">{getTransactionLabel(tx.type)}</Text>
                                        <Text className="text-gray-400 text-xs">{new Date(tx.date).toLocaleDateString('en-IN')}</Text>
                                        {tx.status === 'pending' && (
                                            <View className="mt-1 bg-orange-100 rounded-full px-2 py-0.5 self-start">
                                                <Text className="text-orange-600 text-[10px] font-bold">{t('wallet.pendingStatus')}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className={`font-black text-base ${tx.type === 'withdrawal' ? 'text-red-500' : 'text-green-600'}`}>
                                        {tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount?.toLocaleString('en-IN')}
                                    </Text>
                                </View>
                            ))
                        )}

                        {/* Tip card */}
                        <View className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mt-2">
                            <Text className="text-amber-800 text-sm leading-5">{t('wallet.pendingTip')}</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Withdraw Modal */}
            <Modal visible={showWithdrawModal} transparent animationType="slide" onRequestClose={() => setShowWithdrawModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <Text className="text-xl font-black text-[#1e4a3b] mb-1">{t('wallet.withdrawFunds')}</Text>
                        <Text className="text-gray-400 text-sm mb-5">{t('wallet.available')} ₹{balance.toLocaleString('en-IN')}</Text>

                        <Text className="text-gray-600 font-semibold mb-2">{t('wallet.amountToWithdraw')}</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-xl font-bold text-[#1e4a3b] mb-6"
                            placeholder="₹0"
                            keyboardType="numeric"
                            value={withdrawAmount}
                            onChangeText={setWithdrawAmount}
                        />

                        <TouchableOpacity onPress={handleWithdraw} className="bg-[#1e4a3b] rounded-2xl py-4 items-center mb-3">
                            <Text className="text-white font-black text-base">{t('wallet.confirmWithdrawal')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowWithdrawModal(false)} className="py-4 items-center">
                            <Text className="text-gray-400 font-semibold">{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Link Bank Modal */}
            <Modal visible={showBankModal} transparent animationType="slide" onRequestClose={() => setShowBankModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <ScrollView className="bg-white rounded-t-3xl">
                        <View className="p-6">
                            <Text className="text-xl font-black text-[#1e4a3b] mb-1">{t('wallet.linkBankAccount')}</Text>
                            <Text className="text-gray-400 text-sm mb-5">{t('wallet.enterDetails')}</Text>

                            <Text className="text-gray-600 font-semibold mb-1">{t('wallet.accountHolderName')}</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-800"
                                placeholder={t('wallet.enterFullName')}
                                value={bankDetails.accountHolderName}
                                onChangeText={(v) => setBankDetails(p => ({ ...p, accountHolderName: v }))}
                            />

                            <Text className="text-gray-600 font-semibold mb-1">{t('wallet.bankName')}</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-800"
                                placeholder={t('wallet.bankNamePlaceholder')}
                                value={bankDetails.bankName}
                                onChangeText={(v) => setBankDetails(p => ({ ...p, bankName: v }))}
                            />

                            <Text className="text-gray-600 font-semibold mb-1">{t('wallet.accountNumber')}</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-800"
                                placeholder={t('wallet.accountNumberPlaceholder')}
                                keyboardType="numeric"
                                value={bankDetails.accountNumber}
                                onChangeText={(v) => setBankDetails(p => ({ ...p, accountNumber: v }))}
                            />

                            <Text className="text-gray-600 font-semibold mb-1">{t('wallet.ifscCode')}</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-800"
                                placeholder={t('wallet.ifscPlaceholder')}
                                autoCapitalize="characters"
                                value={bankDetails.ifscCode}
                                onChangeText={(v) => setBankDetails(p => ({ ...p, ifscCode: v }))}
                            />

                            <Text className="text-gray-400 text-xs mb-5 leading-4">{t('wallet.verifyDetails')}</Text>

                            <TouchableOpacity onPress={handleLinkBank} className="bg-[#1e4a3b] rounded-2xl py-4 items-center mb-3">
                                <Text className="text-white font-black text-base">{t('wallet.saveLinkAccount')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowBankModal(false)} className="py-4 items-center mb-4">
                                <Text className="text-gray-400 font-semibold">{t('common.cancel')}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}
