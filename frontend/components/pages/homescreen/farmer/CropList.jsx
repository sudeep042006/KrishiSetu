import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, FlatList,
    Image, TextInput, Modal, Alert, ActivityIndicator,
    RefreshControl, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../../common/Header';
import { CropService } from '../../service/api';

const FILTERS = ['All', 'Active', 'Pending', 'Sold'];
const CAT_EMOJI = { Grain: '🌾', Vegetable: '🥦', Fruit: '🍋', Pulse: '🫘', Spice: '🌶️', Oilseed: '🌻', Cotton: '🌿', Other: '📦' };
const QUALITY_COLOR = { A: '#059669', B: '#D97706', C: '#DC2626' };
const STATUS_STYLE = {
    active:  { bg: 'bg-green-50',  text: 'text-green-700',  dot: '#059669', label: 'Active'  },
    pending: { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: '#D97706', label: 'Pending' },
    sold:    { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: '#9CA3AF', label: 'Sold'    },
};

const CATEGORIES = ['Grain', 'Vegetable', 'Fruit', 'Pulse', 'Spice', 'Oilseed', 'Cotton', 'Other'];
const QUALITY_OPTIONS = [
    { value: 'premium', label: 'Grade A — Premium' },
    { value: 'standard', label: 'Grade B — Standard' },
    { value: 'economy', label: 'Grade C — Economy' },
];
const UNIT_OPTIONS = ['kg', 'quintal', 'ton', 'litre', 'piece'];

const normalizeStatus = (status) => {
    if (!status) return 'pending';
    const s = status.toLowerCase().trim();
    if (s === 'active' || s === 'approved') return 'active';
    if (s === 'sold' || s === 'completed') return 'sold';
    return 'pending';
};

export default function CropListScreen({ navigation }) {
    const [listings, setListings]   = useState([]);
    const [filtered, setFiltered]   = useState([]);
    const [search, setSearch]       = useState('');
    const [activeFilter, setFilter] = useState('All');
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefresh]  = useState(false);
    const [selected, setSelected]   = useState(null);
    const [editVisible, setEditVisible] = useState(false);
    const [editForm, setEditForm]   = useState({});
    const [saving, setSaving]       = useState(false);

    // ── Fetch ──────────────────────────────────────────────────────────
    const fetchListings = async () => {
        try {
            const res = await CropService.getProjects();
            const data = res.projects || [];

            const formattedData = data.map(item => {
                const price = parseFloat(item.expectedPrice) || 0;
                const qty   = parseFloat(item.quantityRequired) || 0;

                const locationParts = [];
                if (item.location?.village)  locationParts.push(item.location.village);
                if (item.location?.district) locationParts.push(item.location.district);
                if (item.location?.state)    locationParts.push(item.location.state);
                const locationStr = locationParts.length > 0 ? locationParts.join(', ') : 'N/A';

                let quality = 'C';
                const qg = (item.QualityGrade || '').toLowerCase();
                if (qg === 'premium' || qg === 'a')  quality = 'A';
                else if (qg === 'standard' || qg === 'b') quality = 'B';

                const rawImage = item.cropPhoto;
                const cropImage = rawImage && typeof rawImage === 'string' ? rawImage.trim() : null;

                return {
                    _id: item._id,
                    cropName: item.title || item.cropName || 'Unnamed Crop',
                    category: item.cropCategory || 'Other',
                    quantity: qty,
                    unit: item.quantityUnit || 'kg',
                    pricePerUnit: price,
                    location: locationStr,
                    quality,
                    organic: item.organicFarming === 'Yes' || item.organicFarming === true,
                    harvestDate: item.expectedHarvestDate
                        ? new Date(item.expectedHarvestDate).toLocaleDateString('en-IN')
                        : '',
                    status: normalizeStatus(item.status),
                    cropImage,
                    // Keep raw fields for edit form
                    _raw: item,
                };
            });

            setListings(formattedData);
            applyFilter(formattedData, search, activeFilter);
        } catch (e) {
            console.error('Error fetching projects:', e);
            setListings([]);
            applyFilter([], search, activeFilter);
        } finally {
            setLoading(false);
            setRefresh(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchListings();
        }, [])
    );

    const onRefresh = () => { setRefresh(true); fetchListings(); };

    // ── Filter logic ───────────────────────────────────────────────────
    const applyFilter = (data, q, f) => {
        let res = [...data];
        if (q.trim()) {
            const lower = q.toLowerCase();
            res = res.filter(i =>
                i.cropName.toLowerCase().includes(lower) ||
                i.location.toLowerCase().includes(lower)
            );
        }
        if (f !== 'All') res = res.filter(i => i.status === f.toLowerCase());
        setFiltered(res);
    };

    const handleSearch = (t) => { setSearch(t); applyFilter(listings, t, activeFilter); };
    const handleFilter = (f) => { setFilter(f); applyFilter(listings, search, f); };

    // ── Delete listing ─────────────────────────────────────────────────
    const handleDelete = (item) => {
        Alert.alert('Remove Listing', `Remove "${item.cropName}" from marketplace?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive', onPress: async () => {
                    try {
                        await CropService.deleteProject(item._id);
                        const updated = listings.filter(l => l._id !== item._id);
                        setListings(updated);
                        applyFilter(updated, search, activeFilter);
                        setSelected(null);
                        Alert.alert('Success', 'Listing removed successfully');
                    } catch (e) {
                        console.error('Error deleting project:', e);
                        Alert.alert('Error', 'Could not remove the listing.');
                    }
                },
            },
        ]);
    };

    // ── Open edit modal ────────────────────────────────────────────────
    const handleOpenEdit = (item) => {
        const raw = item._raw || {};
        setEditForm({
            cropName:     item.cropName,
            category:     item.category,
            quantity:     String(item.quantity),
            unit:         item.unit,
            pricePerUnit: String(item.pricePerUnit),
            location:     item.location,
            quality:      raw.QualityGrade || (item.quality === 'A' ? 'premium' : item.quality === 'B' ? 'standard' : 'economy'),
            organic:      item.organic,
            harvestDate:  raw.expectedHarvestDate ? raw.expectedHarvestDate.split('T')[0] : '',
        });
        setSelected(null);
        setEditVisible(true);
    };

    // ── Save edit ──────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!editForm.cropName?.trim()) {
            Alert.alert('Validation', 'Crop name is required.');
            return;
        }
        if (!editForm.pricePerUnit || isNaN(parseFloat(editForm.pricePerUnit))) {
            Alert.alert('Validation', 'Enter a valid price.');
            return;
        }
        if (!editForm.quantity || isNaN(parseFloat(editForm.quantity))) {
            Alert.alert('Validation', 'Enter a valid quantity.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title:                editForm.cropName,
                cropCategory:         editForm.category,
                quantityRequired:     parseFloat(editForm.quantity),
                quantityUnit:         editForm.unit,
                expectedPrice:        parseFloat(editForm.pricePerUnit),
                QualityGrade:         editForm.quality,
                organicFarming:       editForm.organic ? 'Yes' : 'No',
                expectedHarvestDate:  editForm.harvestDate || undefined,
            };

            await CropService.updateProject(selected?._id || editingId, payload);
            Alert.alert('Success', 'Listing updated successfully!');
            setEditVisible(false);
            fetchListings();
        } catch (e) {
            console.error('Error updating project:', e);
            Alert.alert('Error', 'Could not update the listing.');
        } finally {
            setSaving(false);
        }
    };

    // ── Stats ──────────────────────────────────────────────────────────
    const totalActive = listings.filter(l => l.status === 'active').length;
    const totalValue  = listings
        .filter(l => l.status === 'active')
        .reduce((sum, l) => sum + (l.quantity * l.pricePerUnit), 0)
        .toLocaleString('en-IN');

    // ── Crop image component with fallback ─────────────────────────────
    const CropImage = ({ item, width, height, style }) => {
        const [imgError, setImgError] = useState(false);
        const hasImage = !imgError && item.cropImage && item.cropImage.startsWith('http');
        if (hasImage) {
            return (
                <Image
                    source={{ uri: item.cropImage }}
                    style={[{ width, height }, style]}
                    resizeMode="cover"
                    onError={() => setImgError(true)}
                />
            );
        }
        return (
            <View style={{ width, height, backgroundColor: '#eaf3ec', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: Math.min(width, height) * 0.4 }}>
                    {CAT_EMOJI[item.category] || '📦'}
                </Text>
            </View>
        );
    };

    // keep track of which item we're editing (since selected gets cleared before edit opens)
    const [editingId, setEditingId] = useState(null);

    // ── Render card ────────────────────────────────────────────────────
    const renderItem = ({ item }) => {
        const ss = STATUS_STYLE[item.status] || STATUS_STYLE.pending;
        return (
            <TouchableOpacity
                onPress={() => setSelected(item)}
                activeOpacity={0.85}
                className="bg-white rounded-2xl mb-3 mx-4 overflow-hidden border border-gray-100"
            >
                <View className="flex-row">
                    <View style={{ width: 96, height: 96, overflow: 'hidden' }}>
                        <CropImage item={item} width={96} height={96} />
                    </View>
                    <View className="flex-1 px-4 py-3 justify-between">
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1 mr-2">
                                <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                    {item.cropName}
                                </Text>
                                <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
                                    📍 {item.location}
                                </Text>
                            </View>
                            <View className={`flex-row items-center px-2 py-1 rounded-full ${ss.bg}`}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ss.dot, marginRight: 4 }} />
                                <Text className={`text-xs font-semibold ${ss.text}`}>{ss.label}</Text>
                            </View>
                        </View>
                        <View className="flex-row justify-between items-end mt-2">
                            <View>
                                <Text className="text-lg font-black text-[#1e4a3b]">
                                    ₹{item.pricePerUnit.toLocaleString('en-IN')}
                                    <Text className="text-xs font-normal text-gray-400"> /{item.unit}</Text>
                                </Text>
                                <Text className="text-xs text-gray-400 mt-0.5">
                                    {item.quantity} {item.unit} · Grade {item.quality}
                                </Text>
                            </View>
                            {item.organic && (
                                <View className="bg-green-50 px-2 py-1 rounded-full">
                                    <Text className="text-green-700 text-xs font-semibold">🌿 Organic</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="My Crop Listings" />

                <View className="flex-1 bg-[#f8fafc]">

                    {/* ── Stats bar ──────────────────────────────────── */}
                    <View className="flex-row mx-4 mt-4 mb-3 gap-3">
                        <View className='flex items-center justify-center'>
                            <TouchableOpacity
                                className='bg-[#1e4a3b] w-14 h-14 rounded-full items-center justify-center'
                                onPress={() => navigation.navigate('Add Crops')}
                            >
                                <Text className='text-white text-3xl font-bold'>+</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-1 bg-white rounded-2xl px-4 py-3 border border-gray-100">
                            <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Active Listings</Text>
                            <Text className="text-2xl font-black text-[#1e4a3b] mt-1">{filtered.length}</Text>
                        </View>
                        <View className="flex-1 bg-white rounded-2xl px-4 py-3 border border-gray-100">
                            <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Value</Text>
                            <Text className="text-2xl font-black text-[#1e4a3b] mt-1">₹{totalValue}</Text>
                        </View>
                    </View>

                    {/* ── Search bar ─────────────────────────────────── */}
                    <View className="flex-row items-center bg-white mx-4 mb-3 rounded-xl border border-gray-200 px-4">
                        <Text style={{ fontSize: 16 }}>🔍</Text>
                        <TextInput
                            className="flex-1 text-sm text-gray-800 ml-2"
                            style={{ paddingVertical: 11 }}
                            placeholder="Search crop or location..."
                            placeholderTextColor="#9CA3AF"
                            value={search}
                            onChangeText={handleSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <Text className="text-gray-400 font-bold">✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── Status filter chips ────────────────────────── */}
                    <View style={{ height: 44 }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center', height: 44 }}
                        >
                            {FILTERS.map(f => (
                                <TouchableOpacity
                                    key={f}
                                    onPress={() => handleFilter(f)}
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        marginRight: 8,
                                        borderWidth: 1,
                                        backgroundColor: activeFilter === f ? '#1e4a3b' : '#fff',
                                        borderColor: activeFilter === f ? '#1e4a3b' : '#E5E7EB',
                                        alignSelf: 'center',
                                    }}
                                >
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: activeFilter === f ? '#fff' : '#6B7280' }}>
                                        {f}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ── Count label ────────────────────────────────── */}
                    <Text className="text-xs text-gray-400 px-4 mb-2">
                        {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
                    </Text>

                    {/* ── List ───────────────────────────────────────── */}
                    {loading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#1e4a3b" />
                            <Text className="text-gray-400 text-sm mt-3">Loading your listings...</Text>
                        </View>
                    ) : filtered.length === 0 ? (
                        <View className="flex-1 justify-center items-center px-8">
                            <Text style={{ fontSize: 40 }}>🌾</Text>
                            <Text className="text-lg font-bold text-gray-700 mt-3">No listings found</Text>
                            <Text className="text-sm text-gray-400 mt-1 text-center">
                                {search ? 'Try a different search term' : 'No listings in this category yet'}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filtered}
                            renderItem={renderItem}
                            keyExtractor={i => i._id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e4a3b" />
                            }
                        />
                    )}
                </View>
            </SafeAreaView>

            {/* ══════════════════════════════════════════════════════
                  DETAIL MODAL
            ══════════════════════════════════════════════════════ */}
            {selected && (
                <Modal
                    visible={!!selected}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setSelected(null)}
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '85%' }}>

                            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mt-3 mb-1" />

                            <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
                                <Text className="text-lg font-bold text-[#1e4a3b]">{selected.cropName}</Text>
                                <TouchableOpacity
                                    onPress={() => setSelected(null)}
                                    className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center"
                                >
                                    <Text className="text-gray-500 font-bold">✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Hero image */}
                                <View style={{ width: '100%', height: 160, borderRadius: 16, overflow: 'hidden', marginBottom: 20, backgroundColor: '#eaf3ec' }}>
                                    <ModalImage item={selected} />
                                </View>

                                {/* Price highlight */}
                                <View className="flex-row bg-[#eaf3ec] rounded-2xl px-5 py-4 mb-3">
                                    <View className="flex-1 items-center">
                                        <Text className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Price / {selected.unit}</Text>
                                        <Text className="text-2xl font-black text-[#1e4a3b] mt-1">₹{selected.pricePerUnit.toLocaleString('en-IN')}</Text>
                                    </View>
                                    <View className="w-px bg-[#c7ded0] mx-4" />
                                    <View className="flex-1 items-center">
                                        <Text className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Quantity</Text>
                                        <Text className="text-2xl font-black text-[#1e4a3b] mt-1">{selected.quantity}</Text>
                                        <Text className="text-xs text-gray-400">{selected.unit}</Text>
                                    </View>
                                </View>

                                {/* Total value */}
                                <View className="bg-[#1e4a3b] rounded-xl px-5 py-3 mb-5 flex-row justify-between items-center">
                                    <Text className="text-[#6ebd8a] text-xs font-semibold uppercase tracking-wider">Total Lot Value</Text>
                                    <Text className="text-white text-xl font-black">
                                        ₹{(selected.quantity * selected.pricePerUnit).toLocaleString('en-IN')}
                                    </Text>
                                </View>

                                {/* Detail rows */}
                                <View className="bg-gray-50 rounded-2xl overflow-hidden mb-5">
                                    <DetailRow icon="📍" label="Location"     value={selected.location} />
                                    <DetailRow icon="🏷️" label="Category"    value={selected.category} />
                                    <DetailRow icon="⭐" label="Quality"      value={`Grade ${selected.quality} — ${selected.quality === 'A' ? 'Premium' : selected.quality === 'B' ? 'Standard' : 'Economy'}`} />
                                    <DetailRow icon="📅" label="Harvest Date" value={selected.harvestDate || '—'} />
                                    <DetailRow icon="🌿" label="Farming"      value={selected.organic ? 'Organic / Natural' : 'Conventional'} />
                                    <DetailRow icon="📊" label="Status"       value={STATUS_STYLE[selected.status]?.label || selected.status} last />
                                </View>

                                {/* Actions */}
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        className="flex-1 border border-red-200 bg-red-50 rounded-xl py-3 items-center"
                                        onPress={() => handleDelete(selected)}
                                    >
                                        <Text className="text-red-600 font-bold text-sm">Remove</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="flex-1 bg-[#1e4a3b] rounded-xl py-3 items-center"
                                        onPress={() => {
                                            setEditingId(selected._id);
                                            handleOpenEdit(selected);
                                        }}
                                    >
                                        <Text className="text-white font-bold text-sm">Edit Listing</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            )}

            {/* ══════════════════════════════════════════════════════
                  EDIT MODAL
            ══════════════════════════════════════════════════════ */}
            <Modal
                visible={editVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setEditVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '92%' }}>

                            {/* Handle */}
                            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mt-3 mb-1" />

                            {/* Header */}
                            <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
                                <Text className="text-lg font-bold text-[#1e4a3b]">Edit Listing</Text>
                                <TouchableOpacity
                                    onPress={() => setEditVisible(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center"
                                >
                                    <Text className="text-gray-500 font-bold">✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >

                                {/* ── Crop Name ── */}
                                <EditLabel>Crop Name</EditLabel>
                                <TextInput
                                    value={editForm.cropName}
                                    onChangeText={v => setEditForm(f => ({ ...f, cropName: v }))}
                                    placeholder="e.g. Basmati Rice"
                                    placeholderTextColor="#9CA3AF"
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 mb-4"
                                />

                                {/* ── Category ── */}
                                <EditLabel>Category</EditLabel>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                    <View className="flex-row gap-2">
                                        {CATEGORIES.map(cat => (
                                            <TouchableOpacity
                                                key={cat}
                                                onPress={() => setEditForm(f => ({ ...f, category: cat }))}
                                                style={{
                                                    paddingHorizontal: 14,
                                                    paddingVertical: 8,
                                                    borderRadius: 20,
                                                    borderWidth: 1,
                                                    backgroundColor: editForm.category === cat ? '#1e4a3b' : '#f9fafb',
                                                    borderColor: editForm.category === cat ? '#1e4a3b' : '#E5E7EB',
                                                    marginRight: 8,
                                                }}
                                            >
                                                <Text style={{ color: editForm.category === cat ? '#fff' : '#374151', fontSize: 13, fontWeight: '600' }}>
                                                    {CAT_EMOJI[cat]} {cat}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>

                                {/* ── Price & Quantity side by side ── */}
                                <View className="flex-row gap-3 mb-4">
                                    <View className="flex-1">
                                        <EditLabel>Price (₹)</EditLabel>
                                        <TextInput
                                            value={editForm.pricePerUnit}
                                            onChangeText={v => setEditForm(f => ({ ...f, pricePerUnit: v }))}
                                            placeholder="0"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="numeric"
                                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <EditLabel>Quantity</EditLabel>
                                        <TextInput
                                            value={editForm.quantity}
                                            onChangeText={v => setEditForm(f => ({ ...f, quantity: v }))}
                                            placeholder="0"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="numeric"
                                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800"
                                        />
                                    </View>
                                </View>

                                {/* ── Unit ── */}
                                <EditLabel>Unit</EditLabel>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                    <View className="flex-row gap-2">
                                        {UNIT_OPTIONS.map(u => (
                                            <TouchableOpacity
                                                key={u}
                                                onPress={() => setEditForm(f => ({ ...f, unit: u }))}
                                                style={{
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 8,
                                                    borderRadius: 20,
                                                    borderWidth: 1,
                                                    backgroundColor: editForm.unit === u ? '#1e4a3b' : '#f9fafb',
                                                    borderColor: editForm.unit === u ? '#1e4a3b' : '#E5E7EB',
                                                    marginRight: 8,
                                                }}
                                            >
                                                <Text style={{ color: editForm.unit === u ? '#fff' : '#374151', fontSize: 13, fontWeight: '600' }}>
                                                    {u}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>

                                {/* ── Quality Grade ── */}
                                <EditLabel>Quality Grade</EditLabel>
                                <View className="flex-row gap-3 mb-4">
                                    {QUALITY_OPTIONS.map(q => (
                                        <TouchableOpacity
                                            key={q.value}
                                            onPress={() => setEditForm(f => ({ ...f, quality: q.value }))}
                                            style={{
                                                flex: 1,
                                                paddingVertical: 10,
                                                borderRadius: 12,
                                                borderWidth: 1.5,
                                                alignItems: 'center',
                                                backgroundColor: editForm.quality === q.value ? '#eaf3ec' : '#f9fafb',
                                                borderColor: editForm.quality === q.value ? '#1e4a3b' : '#E5E7EB',
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 12,
                                                fontWeight: '700',
                                                color: editForm.quality === q.value ? '#1e4a3b' : '#6B7280',
                                                textAlign: 'center',
                                            }}>
                                                {q.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* ── Harvest Date ── */}
                                <EditLabel>Expected Harvest Date (YYYY-MM-DD)</EditLabel>
                                <TextInput
                                    value={editForm.harvestDate}
                                    onChangeText={v => setEditForm(f => ({ ...f, harvestDate: v }))}
                                    placeholder="e.g. 2025-10-15"
                                    placeholderTextColor="#9CA3AF"
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 mb-4"
                                />

                                {/* ── Organic toggle ── */}
                                <EditLabel>Farming Type</EditLabel>
                                <View className="flex-row gap-3 mb-6">
                                    <TouchableOpacity
                                        onPress={() => setEditForm(f => ({ ...f, organic: true }))}
                                        style={{
                                            flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5,
                                            alignItems: 'center',
                                            backgroundColor: editForm.organic ? '#eaf3ec' : '#f9fafb',
                                            borderColor: editForm.organic ? '#1e4a3b' : '#E5E7EB',
                                        }}
                                    >
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: editForm.organic ? '#1e4a3b' : '#6B7280' }}>
                                            🌿 Organic
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setEditForm(f => ({ ...f, organic: false }))}
                                        style={{
                                            flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5,
                                            alignItems: 'center',
                                            backgroundColor: !editForm.organic ? '#eaf3ec' : '#f9fafb',
                                            borderColor: !editForm.organic ? '#1e4a3b' : '#E5E7EB',
                                        }}
                                    >
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: !editForm.organic ? '#1e4a3b' : '#6B7280' }}>
                                            🌱 Conventional
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* ── Live preview of total value ── */}
                                {editForm.pricePerUnit && editForm.quantity && (
                                    <View className="bg-[#1e4a3b] rounded-xl px-5 py-3 mb-6 flex-row justify-between items-center">
                                        <Text className="text-[#6ebd8a] text-xs font-semibold uppercase tracking-wider">Updated Lot Value</Text>
                                        <Text className="text-white text-lg font-black">
                                            ₹{(parseFloat(editForm.quantity || 0) * parseFloat(editForm.pricePerUnit || 0)).toLocaleString('en-IN')}
                                        </Text>
                                    </View>
                                )}

                                {/* ── Save button ── */}
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={saving}
                                    style={{
                                        backgroundColor: saving ? '#6B9E8A' : '#1e4a3b',
                                        borderRadius: 16,
                                        paddingVertical: 16,
                                        alignItems: 'center',
                                    }}
                                >
                                    {saving
                                        ? <ActivityIndicator color="#fff" />
                                        : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Save & Republish</Text>
                                    }
                                </TouchableOpacity>

                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

// ── Helper label component ─────────────────────────────────────────────
function EditLabel({ children }) {
    return (
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            {children}
        </Text>
    );
}

// ── Separate stateful image component for modal ────────────────────────
function ModalImage({ item }) {
    const [error, setError] = useState(false);
    const hasImage = !error && item.cropImage && item.cropImage.startsWith('http');
    if (hasImage) {
        return (
            <Image
                source={{ uri: item.cropImage }}
                style={{ width: '100%', height: 160 }}
                resizeMode="cover"
                onError={() => setError(true)}
            />
        );
    }
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 64 }}>{CAT_EMOJI[item.category] || '📦'}</Text>
        </View>
    );
}

function DetailRow({ icon, label, value, last }) {
    return (
        <View className={`flex-row items-center px-4 py-3 ${!last ? 'border-b border-gray-100' : ''}`}>
            <Text style={{ fontSize: 15, width: 24 }}>{icon}</Text>
            <Text className="text-gray-400 text-sm w-28 font-medium">{label}</Text>
            <Text className="flex-1 text-sm font-bold text-gray-800 text-right">{value}</Text>
        </View>
    );
}