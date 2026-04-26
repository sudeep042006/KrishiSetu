import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, Modal, TextInput,
    ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/BHeader';
import { ProposalService, farmerService } from '../../service/api';

const UNITS = ['Quintal', 'Kg', 'Ton', 'Bag (50kg)'];

export default function PostRequest({ navigation }) {
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
        if (!form.farmerId || !form.cropName.trim() || !form.quantity || !form.pricePerUnit || !form.deliveryDate.trim()) {
            Alert.alert('Missing Fields', 'Please fill in all required fields including Farmer selection.');
            return;
        }
        try {
            setSaving(true);
            const response = await ProposalService.createProposal(form);
            if (response.success) {
                Alert.alert('Success!', `Proposal sent to ${form.farmerName}.`, [
                    { text: 'OK', onPress: () => { 
                        setModalVisible(false); 
                        resetForm(); 
                        fetchProposals(); 
                    } },
                ]);
            }
        } catch (e) {
            Alert.alert('Error', 'Could not send proposal. Try again.');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setForm({ farmerId: '', farmerName: '', cropName: '', quantity: '', unit: 'Quintal', pricePerUnit: '', deliveryDate: '', message: '' });
    };

    return (
        <View className="flex-1 bg-[#0f172a]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Contract Proposals" />

                <View className="flex-1 bg-[#f8fafc]">
                    {loading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#1e40af" />
                        </View>
                    ) : proposals.length === 0 ? (
                        <View className="flex-1 justify-center items-center px-8">
                            <View className="w-20 h-20 rounded-full bg-[#eff6ff] justify-center items-center mb-5">
                                <Text style={{ fontSize: 36 }}>🤝</Text>
                            </View>
                            <Text className="text-xl font-bold text-[#1e3a8a] mb-2">No Proposals Sent</Text>
                            <Text className="text-gray-400 text-sm text-center mb-8 leading-5">
                                Initiate a direct contract with verified farmers by sending them a procurement proposal.
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                className="bg-[#1e40af] px-8 py-4 rounded-2xl"
                            >
                                <Text className="text-white font-bold text-base">+ New Proposal</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView className="flex-1 px-4 pt-4">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-gray-500 font-bold ml-1">Your Sent Proposals</Text>
                                <TouchableOpacity onPress={() => setModalVisible(true)}>
                                    <Text className="text-[#1e40af] font-bold">+ New</Text>
                                </TouchableOpacity>
                            </View>
                            {proposals.map(p => (
                                <View key={p._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3">
                                    <View className="flex-row justify-between items-start mb-2">
                                        <Text className="text-base font-bold text-[#1e3a8a]">{p.cropName}</Text>
                                        <View className={`px-2 py-1 rounded-full ${p.status === 'Accepted' ? 'bg-green-100' : p.status === 'Rejected' ? 'bg-red-100' : 'bg-orange-100'}`}>
                                            <Text className={`text-xs font-bold ${p.status === 'Accepted' ? 'text-green-700' : p.status === 'Rejected' ? 'text-red-700' : 'text-orange-700'}`}>{p.status}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-sm text-gray-600 mb-1">To: <Text className="font-semibold text-gray-800">{p.farmerId?.name}</Text></Text>
                                    <Text className="text-sm text-gray-600 mb-2">Quantity: {p.quantity} {p.unit} @ ₹{p.pricePerUnit}/{p.unit}</Text>
                                    <Text className="text-xs text-gray-400">Target Date: {new Date(p.deliveryDate).toDateString()}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </SafeAreaView>

            {/* ══════════════════════════════════════════════════════
                  CREATE PROPOSAL MODAL
            ══════════════════════════════════════════════════════ */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '94%' }}>
                            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mt-3 mb-1" />
                            <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
                                <View>
                                    <Text className="text-lg font-bold text-[#1e3a8a]">New Procurement Proposal</Text>
                                    <Text className="text-xs text-gray-400 mt-0.5">Send a direct offer to a farmer</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center"
                                >
                                    <Text className="text-gray-500 font-bold">✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <SectionLabel>Target Farmer</SectionLabel>
                                <Field label="Select Farmer *">
                                    <View className="z-50 relative">
                                        <TouchableOpacity
                                            onPress={() => { setFarmerDropdownOpen(!farmerDropdownOpen); setUnitOpen(false); }}
                                            className="flex-row justify-between items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                                        >
                                            <Text className={`text-sm ${form.farmerName ? 'text-gray-800 font-bold' : 'text-gray-400'}`}>
                                                {form.farmerName || 'Choose a verified farmer...'}
                                            </Text>
                                            <Text className="text-gray-400">▾</Text>
                                        </TouchableOpacity>
                                        {farmerDropdownOpen && (
                                            <View className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl max-h-48 shadow-lg z-50">
                                                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                                                    {farmers.map(f => (
                                                        <TouchableOpacity
                                                            key={f._id}
                                                            onPress={() => {
                                                                set('farmerId', f._id);
                                                                set('farmerName', f.name);
                                                                setFarmerDropdownOpen(false);
                                                            }}
                                                            className="px-4 py-3 border-b border-gray-50"
                                                        >
                                                            <Text className="text-sm text-gray-800 font-semibold">{f.name}</Text>
                                                            <Text className="text-xs text-gray-500">{f.address || 'Unknown Location'}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>
                                </Field>

                                <SectionLabel>Procurement Details</SectionLabel>
                                <Field label="Crop Name *">
                                    <StyledInput
                                        placeholder="e.g. Basmati Rice, Premium Wheat"
                                        value={form.cropName}
                                        onChangeText={v => set('cropName', v)}
                                    />
                                </Field>

                                <View className="flex-row gap-3 mb-4">
                                    <View className="flex-1">
                                        <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Quantity *</Text>
                                        <StyledInput
                                            placeholder="e.g. 50"
                                            value={form.quantity}
                                            onChangeText={v => set('quantity', v)}
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Unit</Text>
                                        <TouchableOpacity
                                            onPress={() => { setUnitOpen(!unitOpen); setFarmerDropdownOpen(false); }}
                                            className="flex-row justify-between items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 z-40 relative"
                                        >
                                            <Text className="text-sm text-gray-800 font-medium">{form.unit}</Text>
                                            <Text className="text-gray-400 text-xs">▾</Text>
                                        </TouchableOpacity>
                                        {unitOpen && (
                                            <View className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                                                {UNITS.map(u => (
                                                    <TouchableOpacity
                                                        key={u}
                                                        onPress={() => { set('unit', u); setUnitOpen(false); }}
                                                        className="px-4 py-3 border-b border-gray-50"
                                                    >
                                                        <Text className={`text-sm ${form.unit === u ? 'text-[#1e40af] font-bold' : 'text-gray-700'}`}>{u}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <Field label="Price per Unit (₹) *">
                                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4">
                                        <Text className="text-[#1e40af] font-bold text-base mr-2">₹</Text>
                                        <TextInput
                                            className="flex-1 text-sm text-gray-800 py-3"
                                            placeholder="e.g. 2500"
                                            placeholderTextColor="#9CA3AF"
                                            value={form.pricePerUnit}
                                            onChangeText={v => set('pricePerUnit', v)}
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                </Field>

                                {totalValue && (
                                    <View className="bg-[#1e40af] rounded-xl px-5 py-3 mb-4 flex-row justify-between items-center">
                                        <Text className="text-[#93c5fd] text-xs font-semibold uppercase tracking-wider">Total Contract Value</Text>
                                        <Text className="text-white text-xl font-black">₹ {totalValue}</Text>
                                    </View>
                                )}

                                <SectionLabel>Logistics</SectionLabel>
                                <Field label="Expected Delivery Date *">
                                    <DateBox 
                                        value={form.deliveryDate}
                                        onChange={(v) => set('deliveryDate', v)}
                                    />
                                </Field>

                                <SectionLabel>Additional Terms</SectionLabel>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 mb-2"
                                    style={{ minHeight: 90, textAlignVertical: 'top' }}
                                    placeholder="Add any specific quality requirements or pickup details..."
                                    placeholderTextColor="#9CA3AF"
                                    value={form.message}
                                    onChangeText={v => set('message', v)}
                                    multiline
                                />

                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={saving}
                                    className={`rounded-2xl py-4 items-center mt-3 ${saving ? 'bg-gray-300' : 'bg-[#1e40af]'}`}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Text className="text-white font-bold text-base">Send Proposal</Text>
                                            <Text className="text-[#93c5fd] text-xs mt-1">Farmer will be notified immediately</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

function SectionLabel({ children }) {
    return (
        <View className="flex-row items-center mb-3 mt-4">
            <Text className="text-xs font-bold text-[#1e3a8a] uppercase tracking-widest">{children}</Text>
            <View className="flex-1 h-px bg-gray-200 ml-2" />
        </View>
    );
}

function Field({ label, children }) {
    return (
        <View className="mb-4">
            {label && <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">{label}</Text>}
            {children}
        </View>
    );
}

function StyledInput({ placeholder, value, onChangeText, keyboardType }) {
    return (
        <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800"
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType || 'default'}
        />
    );
}

function DateBox({ value, onChange }) {
    const [dd, setDd] = useState('');
    const [mm, setMm] = useState('');
    const [yyyy, setYyyy] = useState('');

    const mmRef = React.useRef();
    const yyyyRef = React.useRef();

    const update = (d, m, y) => {
        if (d && m && y && y.length === 4) {
            onChange(`${d}/${m}/${y}`);
        }
    };

    return (
        <View className="flex-row gap-2">
            <View className="flex-1">
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center text-sm font-bold text-gray-800"
                    placeholder="DD"
                    keyboardType="numeric"
                    maxLength={2}
                    value={dd}
                    onChangeText={(v) => {
                        setDd(v);
                        if (v.length === 2) mmRef.current?.focus();
                        update(v, mm, yyyy);
                    }}
                />
            </View>
            <View className="flex-1">
                <TextInput
                    ref={mmRef}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center text-sm font-bold text-gray-800"
                    placeholder="MM"
                    keyboardType="numeric"
                    maxLength={2}
                    value={mm}
                    onChangeText={(v) => {
                        setMm(v);
                        if (v.length === 2) yyyyRef.current?.focus();
                        update(dd, v, yyyy);
                    }}
                />
            </View>
            <View className="flex-[1.5]">
                <TextInput
                    ref={yyyyRef}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center text-sm font-bold text-gray-800"
                    placeholder="YYYY"
                    keyboardType="numeric"
                    maxLength={4}
                    value={yyyy}
                    onChangeText={(v) => {
                        setYyyy(v);
                        update(dd, mm, v);
                    }}
                />
            </View>
        </View>
    );
}
