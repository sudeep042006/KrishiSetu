import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, Modal, TextInput,
    ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/BHeader';
import { ProposalService, farmerService } from '../../service/api';
import { useTranslation } from 'react-i18next';

const UNITS = ['Quintal', 'Kg', 'Ton', 'Bag (50kg)'];

export default function PostRequest({ navigation }) {
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [proposals, setProposals] = useState([]);

    // For farmer selection
    const [farmers, setFarmers] = useState([]);
    const [farmerDropdownOpen, setFarmerDropdownOpen] = useState(false);
    const [unitOpen, setUnitOpen] = useState(false);

    const [form, setForm] = useState({
        farmerId: '', farmerName: '',
        cropName: '', quantity: '', unit: 'Quintal',
        pricePerUnit: '', deliveryDate: '', message: ''
    });

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const totalValue = form.quantity && form.pricePerUnit
        ? (parseFloat(form.quantity) * parseFloat(form.pricePerUnit)).toLocaleString('en-IN')
        : null;

    useEffect(() => {
        fetchProposals();
        fetchFarmers();
    }, []);

    const fetchProposals = async () => {
        try {
            const data = await ProposalService.getOfftakerProposals();
            if (data.success) setProposals(data.proposals);
        } catch (error) {
            console.error('Error fetching sent proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFarmers = async () => {
        try {
            const data = await farmerService.getFarmers();
            if (data.farmer) setFarmers(data.farmer);
        } catch (error) {
            console.error('Error fetching farmers for dropdown:', error);
        }
    };

    const handleSave = async () => {
        if (!form.farmerId) {
            Alert.alert(t('common.required'), t('offtaker.postRequest.selectFarmer'));
            return;
        }
        if (!form.cropName.trim() || !form.quantity || !form.pricePerUnit || !form.deliveryDate) {
            Alert.alert(t('cropProject.missingFields'), t('cropProject.missingFieldsMsg'));
            return;
        }

        setSaving(true);
        try {
            const payload = {
                farmerId: form.farmerId,
                cropName: form.cropName.trim(),
                quantity: parseFloat(form.quantity),
                unit: form.unit,
                pricePerUnit: parseFloat(form.pricePerUnit),
                deliveryDate: form.deliveryDate,
                message: form.message.trim()
            };

            const res = await ProposalService.sendProposal(payload);
            if (res.success) {
                Alert.alert(t('common.success'), "Procurement demand sent successfully!");
                setModalVisible(false);
                setForm({
                    farmerId: '', farmerName: '',
                    cropName: '', quantity: '', unit: 'Quintal',
                    pricePerUnit: '', deliveryDate: '', message: ''
                });
                fetchProposals();
            }
        } catch (error) {
            console.error('Error posting demand:', error);
            Alert.alert(t('common.error'), error.response?.data?.message || t('cropProject.errorMsg'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <View className="flex-1 bg-[#102a43]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title={t('offtaker.postRequest.title')} />

                <View className="flex-1 bg-[#f8fafc]">
                    <View className="p-4 flex-row justify-between items-center bg-white border-b border-gray-100">
                        <View>
                            <Text className="text-xl font-bold text-gray-800">{t('offtaker.postRequest.sentRequests')}</Text>
                            <Text className="text-xs text-gray-400 mt-0.5">{proposals.length} active demands</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => setModalVisible(true)}
                            className="bg-[#1e4e8c] px-4 py-2.5 rounded-xl shadow-sm"
                        >
                            <Text className="text-white font-bold text-xs">+ {t('offtaker.postRequest.newRequest')}</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#1e4e8c" />
                        </View>
                    ) : (
                        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                            {proposals.length === 0 ? (
                                <View className="items-center justify-center py-20">
                                    <Text className="text-4xl">📄</Text>
                                    <Text className="text-gray-400 mt-3 font-semibold">{t('offtaker.postRequest.noSent')}</Text>
                                </View>
                            ) : (
                                proposals.map(p => (
                                    <View key={p._id} className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm">
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-lg font-bold text-gray-800">{p.cropName}</Text>
                                            <View className={`px-2.5 py-1 rounded-full ${
                                                p.status === 'Accepted' ? 'bg-emerald-50' : p.status === 'Rejected' ? 'bg-red-50' : 'bg-amber-50'
                                            }`}>
                                                <Text className={`text-xs font-bold ${
                                                    p.status === 'Accepted' ? 'text-emerald-600' : p.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'
                                                }`}>
                                                    {t(`status.${(p.status || 'pending').toLowerCase()}`)}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-xs text-gray-500 mb-2">Farmer: {p.farmerId?.name || 'Assigned Farmer'}</Text>
                                        <View className="flex-row justify-between items-center pt-2 border-t border-gray-50">
                                            <Text className="text-xs text-gray-400">{p.quantity} {p.unit} @ ₹{p.pricePerUnit}/{p.unit}</Text>
                                            <Text className="text-sm font-black text-[#1e4e8c]">₹{(p.quantity * p.pricePerUnit).toLocaleString('en-IN')}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    )}
                </View>
            </SafeAreaView>

            {/* Create Proposal Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                    <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-white rounded-t-3xl max-h-[90%] p-6">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-xl font-bold text-gray-800">{t('offtaker.postRequest.newRequest')}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Text className="text-gray-400 font-bold text-lg">✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text className="text-xs font-bold text-gray-500 mb-1">{t('offtaker.postRequest.cropName')}</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm text-gray-800"
                                    placeholder="e.g. Wheat, Basmati Rice"
                                    value={form.cropName}
                                    onChangeText={v => set('cropName', v)}
                                />

                                <View className="flex-row gap-3 mb-3">
                                    <View className="flex-1">
                                        <Text className="text-xs font-bold text-gray-500 mb-1">{t('offtaker.postRequest.quantity')}</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800"
                                            placeholder="100"
                                            keyboardType="numeric"
                                            value={form.quantity}
                                            onChangeText={v => set('quantity', v)}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs font-bold text-gray-500 mb-1">{t('cropProject.unit')}</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800"
                                            placeholder="Quintal"
                                            value={form.unit}
                                            onChangeText={v => set('unit', v)}
                                        />
                                    </View>
                                </View>

                                <Text className="text-xs font-bold text-gray-500 mb-1">{t('offtaker.postRequest.pricePerUnit')}</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm text-gray-800"
                                    placeholder="2200"
                                    keyboardType="numeric"
                                    value={form.pricePerUnit}
                                    onChangeText={v => set('pricePerUnit', v)}
                                />

                                <Text className="text-xs font-bold text-gray-500 mb-1">{t('offtaker.postRequest.deliveryDate')} (YYYY-MM-DD)</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm text-gray-800"
                                    placeholder="2026-11-30"
                                    value={form.deliveryDate}
                                    onChangeText={v => set('deliveryDate', v)}
                                />

                                <Text className="text-xs font-bold text-gray-500 mb-1">{t('offtaker.postRequest.message')}</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm text-gray-800"
                                    placeholder="Moisture < 12%, organic preference..."
                                    multiline
                                    numberOfLines={3}
                                    value={form.message}
                                    onChangeText={v => set('message', v)}
                                />

                                <TouchableOpacity 
                                    onPress={handleSave} 
                                    disabled={saving}
                                    className="bg-[#1e4e8c] py-4 rounded-2xl items-center shadow-lg mb-6"
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text className="text-white font-bold text-base">{t('offtaker.postRequest.submit')}</Text>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
