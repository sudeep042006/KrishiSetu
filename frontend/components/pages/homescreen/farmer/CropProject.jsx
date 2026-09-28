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
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['Grain', 'Vegetable', 'Fruit', 'Pulse', 'Spice', 'Oilseed', 'Cotton', 'Other'];
const UNITS = ['Quintal', 'Kg', 'Ton', 'Bag (50kg)'];

export default function CropProjectScreen({ navigation }) {
    const { t } = useTranslation();
    const GRADES = [
        { key: 'A', label: t('crops.gradeA') },
        { key: 'B', label: t('crops.gradeB') },
        { key: 'C', label: t('crops.gradeC') },
    ];

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
            Alert.alert(t('cropProject.missingFields'), t('cropProject.missingFieldsMsg'));
            return;
        }

        const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?[\d\s]{7,10}/;
        const simplePhoneRegex = /\d{10}/;
        const combinedText = `${form.cropName} ${form.description} ${form.location}`;
        
        if (phoneRegex.test(combinedText) || simplePhoneRegex.test(combinedText.replace(/[-\s]/g, ''))) {
            Alert.alert(
                t('cropProject.securityPolicy'), 
                t('cropProject.securityPolicyMsg'),
                [{ text: t('cropProject.iUnderstand'), style: "cancel" }]
            );
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: form.cropName.trim(),
                cropCategory: form.category || 'Other',
                quantityRequired: parseFloat(form.quantity),
                quantityUnit: form.unit,
                expectedPrice: parseFloat(form.pricePerUnit),
                QualityGrade: form.quality,
                organicFarming: form.organic ? 'Yes' : 'No',
                expectedHarvestDate: form.harvestDate || undefined,
                location: { village: form.location.trim() },
                cropDescription: form.description.trim(),
            };

            await CropService.createProject(payload);
            Alert.alert(t('common.success'), t('cropProject.successMsg'), [
                { text: t('common.ok'), onPress: () => navigation.navigate('Crops') }
            ]);
        } catch (error) {
            console.error('Error creating crop project:', error);
            Alert.alert(t('common.error'), t('cropProject.errorMsg'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title={t('cropProject.title')} />

                <ScrollView className="flex-1 bg-[#f8fafc] px-4 pt-4" showsVerticalScrollIndicator={false}>
                    <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-gray-100">
                        {/* Crop Name */}
                        <Text className="text-xs font-bold text-gray-500 mb-1">{t('cropProject.cropName')}</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm text-gray-800"
                            placeholder="e.g. Sharbati Wheat"
                            placeholderTextColor="#9ca3af"
                            value={form.cropName}
                            onChangeText={v => set('cropName', v)}
                        />

                        {/* Category */}
                        <Text className="text-xs font-bold text-gray-500 mb-1">{t('cropProject.category')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                            <View className="flex-row gap-2">
                                {CATEGORIES.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        onPress={() => set('category', c)}
                                        className={`px-4 py-2 rounded-xl border ${form.category === c ? 'bg-[#1e4a3b] border-[#1e4a3b]' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        <Text className={`text-xs font-bold ${form.category === c ? 'text-white' : 'text-gray-600'}`}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Quantity & Unit */}
                        <View className="flex-row gap-3 mb-4">
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-gray-500 mb-1">{t('cropProject.quantity')}</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800"
                                    placeholder="50"
                                    placeholderTextColor="#9ca3af"
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
                                    placeholderTextColor="#9ca3af"
                                    value={form.unit}
                                    onChangeText={v => set('unit', v)}
                                />
                            </View>
                        </View>

                        {/* Price per unit */}
                        <Text className="text-xs font-bold text-gray-500 mb-1">{t('cropProject.price')}</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm text-gray-800"
                            placeholder="2400"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            value={form.pricePerUnit}
                            onChangeText={v => set('pricePerUnit', v)}
                        />

                        {/* Location */}
                        <Text className="text-xs font-bold text-gray-500 mb-1">{t('cropProject.location')}</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm text-gray-800"
                            placeholder="Village Rampur, Rewa"
                            placeholderTextColor="#9ca3af"
                            value={form.location}
                            onChangeText={v => set('location', v)}
                        />

                        {/* Description */}
                        <Text className="text-xs font-bold text-gray-500 mb-1">{t('cropProject.description')}</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm text-gray-800"
                            placeholder="High quality grain, ready for delivery..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={3}
                            value={form.description}
                            onChangeText={v => set('description', v)}
                        />

                        {/* Quality Grades */}
                        <Text className="text-xs font-bold text-gray-500 mb-1">{t('cropProject.qualityGrade')}</Text>
                        <View className="flex-row gap-2 mb-4">
                            {GRADES.map(g => (
                                <TouchableOpacity
                                    key={g.key}
                                    onPress={() => set('quality', g.key)}
                                    className={`flex-1 py-3 rounded-xl border items-center ${form.quality === g.key ? 'bg-emerald-50 border-[#1e4a3b]' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <Text className={`font-bold text-xs ${form.quality === g.key ? 'text-[#1e4a3b]' : 'text-gray-600'}`}>{g.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Organic Toggle */}
                        <TouchableOpacity
                            onPress={() => set('organic', !form.organic)}
                            className={`flex-row items-center justify-between p-4 rounded-xl border mb-6 ${form.organic ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <Text className="font-bold text-sm text-gray-800">{t('crops.organicNatural')}</Text>
                            <Text className="font-bold text-base">{form.organic ? '🌿' : '⚪'}</Text>
                        </TouchableOpacity>

                        {/* Total lot value banner */}
                        {totalValue && (
                            <View className="bg-[#1e4a3b] p-4 rounded-2xl mb-6 flex-row justify-between items-center">
                                <Text className="text-white/80 font-bold text-xs">{t('cropProject.lotValue')}</Text>
                                <Text className="text-white font-black text-xl">₹{totalValue}</Text>
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            className="bg-[#1e4a3b] py-4 rounded-2xl items-center shadow-md mb-6"
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-black text-base">{t('cropProject.publishListing')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
