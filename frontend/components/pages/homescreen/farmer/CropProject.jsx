import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, Modal, TextInput,
    ScrollView, Image, Alert, ActivityIndicator,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/Header';
import { launchImageLibrary } from 'react-native-image-picker';
import { CropService } from '../../service/api';

const CATEGORIES = ['Grain', 'Vegetable', 'Fruit', 'Pulse', 'Spice', 'Oilseed', 'Cotton', 'Other'];
const UNITS = ['Quintal', 'Kg', 'Ton', 'Bag (50kg)'];
const GRADES = [
    { key: 'A', label: 'Grade A', sub: 'Premium' },
    { key: 'B', label: 'Grade B', sub: 'Standard' },
    { key: 'C', label: 'Grade C', sub: 'Economy' },
];

export default function CropProjectScreen({ navigation }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [cropImage, setCropImage] = useState(null);
    const [unitOpen, setUnitOpen] = useState(false);

    const [form, setForm] = useState({
        cropName: '', category: '', quantity: '',
        unit: 'Quintal', pricePerUnit: '',
        harvestDate: '', location: '', description: '',
        quality: 'A', organic: false,
    });

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const totalValue = form.quantity && form.pricePerUnit
        ? (parseFloat(form.quantity) * parseFloat(form.pricePerUnit)).toLocaleString('en-IN')
        : null;

    const HandlepickImage = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
            if (!res.didCancel && res.assets?.[0]) setCropImage(res.assets[0].uri);
        });
    };

    const handleSave = async () => {
        if (!form.cropName.trim() || !form.quantity || !form.pricePerUnit || !form.location.trim() || !form.description.trim()) {
            Alert.alert('Missing Fields', 'Crop name, description, location, quantity and price are required.');
            return;
        }

        // Phone number blocking logic
        const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/;
        const simplePhoneRegex = /\d{10}/;
        const combinedText = `${form.cropName} ${form.description} ${form.location}`;
        
        if (phoneRegex.test(combinedText) || simplePhoneRegex.test(combinedText.replace(/[-\s]/g, ''))) {
            Alert.alert(
                "Security Policy", 
                "Sharing phone numbers or direct contact information in listings is not allowed for security reasons. Please use our secure chat for all communications.",
                [{ text: "I Understand", style: "cancel" }]
            );
            return;
        }
        try {
            setSaving(true);
            const payload = {
                ...form,
            };
            const response = await CropService.createProject(payload);

            if (cropImage && !cropImage.startsWith('http') && response?.project?._id) {
                await CropService.uploadProjectPhoto(response.project._id, cropImage);
            }

            console.log('Payload:', payload);
            Alert.alert('Listed!', `${form.cropName} is now live for buyers.`, [
                {
                    text: 'OK', onPress: () => {
                        setModalVisible(false);
                        resetForm();
                        if (navigation) navigation.navigate('Crops');
                    }
                },
            ]);
        } catch (e) {
            console.error("Project Create Error: ", e);
            Alert.alert('Error', 'Could not publish. Try again. ' + (e.message || ""));
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setForm({ cropName: '', category: '', quantity: '', unit: 'Quintal', pricePerUnit: '', harvestDate: '', location: '', description: '', quality: 'A', organic: false });
        setCropImage(null);
    };

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Crop Project" />

                {/* ── Body ───────────────────────────────────────────── */}
                <View className="flex-1 bg-[#f8fafc]">

                    {/* Empty state */}
                    <View className="flex-1 justify-center items-center px-8">
                        <View className="w-20 h-20 rounded-full bg-[#eaf3ec] justify-center items-center mb-5">
                            <Text style={{ fontSize: 36 }}>🌾</Text>
                        </View>
                        <Text className="text-xl font-bold text-[#1e4a3b] mb-2">No projects yet</Text>
                        <Text className="text-gray-400 text-sm text-center mb-8 leading-5">
                            Create a crop listing so buyers across India can discover and purchase your harvest.
                        </Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="bg-[#1e4a3b] px-8 py-4 rounded-2xl"
                        >
                            <Text className="text-white font-bold text-base">+ Create Project</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* ══════════════════════════════════════════════════════
                  CREATE PROJECT MODAL
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

                            {/* Drag handle */}
                            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mt-3 mb-1" />

                            {/* Modal header */}
                            <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
                                <View>
                                    <Text className="text-lg font-bold text-[#1e4a3b]">New Crop Listing</Text>
                                    <Text className="text-xs text-gray-400 mt-0.5">Buyers will see this on marketplace</Text>
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

                                {/* ── Photo Upload ──────────────────────── */}
                                <TouchableOpacity
                                    onPress={HandlepickImage}
                                    className="rounded-2xl overflow-hidden mb-5 border border-dashed border-[#c7ded0] bg-[#f7faf8]"
                                    style={{ height: 150 }}
                                >
                                    {cropImage ? (
                                        <>
                                            <Image source={{ uri: cropImage }} style={{ width: '100%', height: 150 }} />
                                            <View className="absolute bottom-2 right-2 bg-black/50 px-3 py-1 rounded-full">
                                                <Text className="text-white text-xs font-semibold">Change Photo</Text>
                                            </View>
                                        </>
                                    ) : (
                                        <View className="flex-1 justify-center items-center">
                                            <Text style={{ fontSize: 28 }} className="mb-1">📸</Text>
                                            <Text className="text-sm font-semibold text-[#1e4a3b]">Add Crop Photo</Text>
                                            <Text className="text-xs text-gray-400 mt-1">Clear photo builds buyer trust</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* ── Section: Crop Info ────────────────── */}
                                <SectionLabel>Crop Details</SectionLabel>

                                <Field label="Crop Name *">
                                    <StyledInput
                                        placeholder="e.g. Basmati Rice, Wheat"
                                        value={form.cropName}
                                        onChangeText={v => set('cropName', v)}
                                    />
                                </Field>

                                <Field label="Category">
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View className="flex-row gap-2 pb-1">
                                            {CATEGORIES.map(c => (
                                                <TouchableOpacity
                                                    key={c}
                                                    onPress={() => set('category', c)}
                                                    className={`px-4 py-2 rounded-full border ${form.category === c
                                                            ? 'bg-[#1e4a3b] border-[#1e4a3b]'
                                                            : 'bg-white border-gray-200'
                                                        }`}
                                                >
                                                    <Text className={`text-sm font-semibold ${form.category === c ? 'text-white' : 'text-gray-600'}`}>
                                                        {c}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </Field>

                                {/* Organic toggle */}
                                <View className="flex-row justify-between items-center bg-[#eaf3ec] rounded-xl px-4 py-3 mb-4">
                                    <View>
                                        <Text className="text-sm font-bold text-[#1e4a3b]">Organic / Natural Farming</Text>
                                        <Text className="text-xs text-gray-500 mt-0.5">Attracts premium buyers</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => set('organic', !form.organic)}
                                        style={{
                                            width: 46, height: 26, borderRadius: 13,
                                            backgroundColor: form.organic ? '#1e4a3b' : '#D1D5DB',
                                            justifyContent: 'center', paddingHorizontal: 3,
                                        }}
                                    >
                                        <View style={{
                                            width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
                                            alignSelf: form.organic ? 'flex-end' : 'flex-start',
                                        }} />
                                    </TouchableOpacity>
                                </View>

                                {/* ── Section: Quantity & Price ─────────── */}
                                <SectionLabel>Quantity & Price</SectionLabel>

                                {/* Quantity + Unit row */}
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
                                            onPress={() => setUnitOpen(!unitOpen)}
                                            className="flex-row justify-between items-center bg-gray-50 border border-gray-200 rounded-xl px-4"
                                            style={{ paddingVertical: 13 }}
                                        >
                                            <Text className="text-sm text-gray-800 font-medium">{form.unit}</Text>
                                            <Text className="text-gray-400 text-xs">▾</Text>
                                        </TouchableOpacity>
                                        {unitOpen && (
                                            <View className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-xl z-50 overflow-hidden"
                                                style={{ elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}
                                            >
                                                {UNITS.map(u => (
                                                    <TouchableOpacity
                                                        key={u}
                                                        onPress={() => { set('unit', u); setUnitOpen(false); }}
                                                        className={`px-4 py-3 border-b border-gray-100 ${form.unit === u ? 'bg-[#eaf3ec]' : ''}`}
                                                    >
                                                        <Text className={`text-sm ${form.unit === u ? 'text-[#1e4a3b] font-bold' : 'text-gray-700'}`}>{u}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <Field label="Price per Unit (₹) *">
                                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4">
                                        <Text className="text-[#1e4a3b] font-bold text-base mr-2">₹</Text>
                                        <TextInput
                                            className="flex-1 text-sm text-gray-800"
                                            style={{ paddingVertical: 13 }}
                                            placeholder="e.g. 2500"
                                            placeholderTextColor="#9CA3AF"
                                            value={form.pricePerUnit}
                                            onChangeText={v => set('pricePerUnit', v)}
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                </Field>

                                {/* Total value pill */}
                                {totalValue && (
                                    <View className="bg-[#1e4a3b] rounded-xl px-5 py-3 mb-4 flex-row justify-between items-center">
                                        <Text className="text-[#6ebd8a] text-xs font-semibold uppercase tracking-wider">Estimated Total</Text>
                                        <Text className="text-white text-xl font-black">₹ {totalValue}</Text>
                                    </View>
                                )}

                                {/* Grade selector */}
                                <Field label="Quality Grade">
                                    <View className="flex-row gap-2">
                                        {GRADES.map(g => (
                                            <TouchableOpacity
                                                key={g.key}
                                                onPress={() => set('quality', g.key)}
                                                className={`flex-1 py-3 rounded-xl border items-center ${form.quality === g.key
                                                        ? 'bg-[#1e4a3b] border-[#1e4a3b]'
                                                        : 'bg-gray-50 border-gray-200'
                                                    }`}
                                            >
                                                <Text className={`text-sm font-bold ${form.quality === g.key ? 'text-white' : 'text-gray-700'}`}>{g.label}</Text>
                                                <Text className={`text-xs mt-0.5 ${form.quality === g.key ? 'text-[#6ebd8a]' : 'text-gray-400'}`}>{g.sub}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </Field>

                                {/* ── Section: Harvest & Location ────────── */}
                                <SectionLabel>Harvest & Location</SectionLabel>

                                <Field label="Expected Harvest Date">
                                    <DateBox
                                        value={form.harvestDate}
                                        onChange={(v) => set('harvestDate', v)}
                                    />
                                </Field>

                                <Field label="Farm Location">
                                    <StyledInput
                                        placeholder="Village, District, State"
                                        value={form.location}
                                        onChangeText={v => set('location', v)}
                                    />
                                </Field>

                                {/* ── Section: Description ──────────────── */}
                                <SectionLabel>Description</SectionLabel>

                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 mb-2"
                                    style={{ minHeight: 90, textAlignVertical: 'top' }}
                                    placeholder="Describe quality, storage, transport availability..."
                                    placeholderTextColor="#9CA3AF"
                                    value={form.description}
                                    onChangeText={v => set('description', v)}
                                    multiline
                                />

                                {/* ── Publish Button ────────────────────── */}
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={saving}
                                    className={`rounded-2xl py-4 items-center mt-3 ${saving ? 'bg-gray-300' : 'bg-[#1e4a3b]'}`}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Text className="text-white font-bold text-base">Publish Listing</Text>
                                            <Text className="text-[#6ebd8a] text-xs mt-1">Visible to buyers instantly</Text>
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

// ── Small helpers ──────────────────────────────────────────────────────────

function SectionLabel({ children }) {
    return (
        <View className="flex-row items-center mb-3 mt-1">
            <Text className="text-xs font-bold text-[#1e4a3b] uppercase tracking-widest">{children}</Text>
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

function StyledInput({ placeholder, value, onChangeText, keyboardType, maxLength }) {
    return (
        <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800"
            style={{ paddingVertical: 13 }}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType || 'default'}
            maxLength={maxLength}
        />
    );
}

function DateBox({ value, onChange }) {
    // Parse value (expected format: YYYY-MM-DD or DD/MM/YYYY)
    // For simplicity, we'll handle DD, MM, YYYY separately in local state
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