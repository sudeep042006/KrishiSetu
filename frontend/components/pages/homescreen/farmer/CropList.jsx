import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, FlatList,
    Image, TextInput, Modal, Alert, ActivityIndicator,
    RefreshControl,
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

export default function CropListScreen({ navigation }) {
    const [listings, setListings]   = useState([]);
    const [filtered, setFiltered]   = useState([]);
    const [search, setSearch]       = useState('');
    const [activeFilter, setFilter] = useState('All');
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefresh]  = useState(false);
    const [selected, setSelected]   = useState(null);
    const [projectImage, setProjectImage] = useState(null);

    // ── Fetch ──────────────────────────────────────────────────────────
    const fetchListings = async () => {
        try {
            const res = await CropService.getProjects();
            // Assuming res.projects is the array of projects
            const data = res.projects || [];
            console.log("Fetched projects count:", data.length);
            if (data.length > 0) {
                console.log("First project image URL:", data[0].cropPhoto);
            }
            
            // Map backend fields to frontend expected fields if necessary, 
            const formattedData = data.map(item => ({
                _id: item._id,
                cropName: item.title || item.cropName,
                category: item.cropCategory,
                quantity: item.quantityRequired,
                unit: item.quantityUnit,
                pricePerUnit: item.expectedPrice,
                location: item.location ? `${item.location.village ? item.location.village + ', ' : ''}${item.location.district ? item.location.district + ', ' : ''}${item.location.state}` : 'N/A',
                quality: item.QualityGrade === 'premium' ? 'A' : item.QualityGrade === 'standard' ? 'B' : 'C',
                organic: item.organicFarming === 'Yes',
                harvestDate: item.expectedHarvestDate ? new Date(item.expectedHarvestDate).toLocaleDateString() : '',
                status: item.status,
                cropImage: item.cropPhoto || null
            }));

            setListings(formattedData);
            
            // Prefetch all images to speed up loading and verify reachability
            formattedData.forEach(item => {
                if (item.cropImage && item.cropImage.startsWith('http')) {
                    Image.prefetch(item.cropImage)
                        .then(() => console.log(`🚀 Prefetched: ${item.cropName}`))
                        .catch(err => console.error(`❌ Prefetch ERR: ${item.cropName}`, err));
                }
            });

            applyFilter(formattedData, search, activeFilter);
        } catch (e) {
            console.error("Error fetching projects: ", e);
            // Fallback to empty array if fail, maybe to MOCK if you prefer, but empty is better for prod
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
        if (q.trim()) res = res.filter(i =>
            i.cropName.toLowerCase().includes(q.toLowerCase()) ||
            i.location.toLowerCase().includes(q.toLowerCase())
        );
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
                        Alert.alert("Success", "Listing removed successfully");
                    } catch (e) {
                        console.error("Error deleting project:", e);
                        Alert.alert("Error", "Could not remove the listing.");
                    }
                },
            },
        ]);
    };

    // ── Stats ──────────────────────────────────────────────────────────
    const totalActive = listings.filter(l => l.status === 'active').length;
    const totalValue  = listings
        .filter(l => l.status === 'active')
        .reduce((sum, l) => sum + l.quantity * l.pricePerUnit, 0)
        .toLocaleString('en-IN');

    // ── Render card ────────────────────────────────────────────────────
    const renderItem = ({ item }) => {
        const ss = STATUS_STYLE[item.status] || STATUS_STYLE.active;
        return (
            <TouchableOpacity
                onPress={() => setSelected(item)}
                activeOpacity={0.85}
                className="bg-white rounded-2xl mb-3 mx-4 overflow-hidden border border-gray-100"
            >
                <View className="flex-row">
                    {/* Left: image / emoji */}
                    <View style={{ width: 96, height: 96, backgroundColor: '#eaf3ec', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' }}>
                        {(() => {
                            const hasImage = item.cropImage && typeof item.cropImage === 'string' && item.cropImage.startsWith('http');
                            console.log(`Rendering ${item.cropName} - HasImage: ${hasImage}, URL length: ${item.cropImage?.length || 0}`);
                            
                            if (hasImage) {
                                return (
                                    <View>
                                        <Image 
                                            key={item.cropImage}
                                            source={{ uri: item.cropImage }} 
                                            style={{ width: 96, height: 96, backgroundColor: 'yellow', zIndex: 10, elevation: 5 }} 
                                            onLoadStart={() => {
                                                console.log(`🔄 Loading: ${item.cropName}`);
                                                Image.getSize(item.cropImage, (w,h) => console.log(`📏 SIZE for ${item.cropName}: ${w}x${h}`), (err) => console.error(`❌ SIZE ERR for ${item.cropName}:`, err));
                                            }}
                                            resizeMode="cover"
                                            onLoad={() => console.log(`✅ Success: ${item.cropName}`)}
                                            onError={(e) => console.error(`❌ Fail: ${item.cropName}`, e.nativeEvent.error)}
                                        />
                                        {/* TEST IMAGE: If you see a green leaf below, your Image component is working fine but Cloudinary is blocked */}
                                        <Image 
                                            source={{ uri: 'https://images.unsplash.com/photo-1599819177626-b50f968962a7?q=80&w=100&h=100&auto=format&fit=crop' }}
                                            style={{ width: 20, height: 20, position: 'absolute', bottom: 0, right: 0, zIndex: 20, borderRadius: 10 }}
                                        />
                                    </View>
                                );
                            }
                            return <Text style={{ fontSize: 36 }}>{CAT_EMOJI[item.category] || '📦'}</Text>;
                        })()}
                    </View>

                    {/* Right: details */}
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
                            {/* Status pill */}
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
                                <Text className="text-xs text-gray-400 mt-0.5">{item.quantity} {item.unit} · Grade {item.quality}</Text>
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
                            <Text className="text-2xl font-black text-[#1e4a3b] mt-1">{totalActive}</Text>
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
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: '600',
                                        color: activeFilter === f ? '#fff' : '#6B7280',
                                    }}>
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

                            {/* Handle */}
                            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mt-3 mb-1" />

                            {/* Header */}
                            <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
                                <Text className="text-lg font-bold text-[#1e4a3b]">{selected.cropName}</Text>
                                <TouchableOpacity
                                    onPress={() => setSelected(null)}
                                    className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center"
                                >
                                    <Text className="text-gray-500 font-bold">✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

                                {/* Hero */}
                                <View style={{ width: '100%', height: 160, backgroundColor: '#eaf3ec', borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 20 }}>
                                    {selected.cropImage && selected.cropImage.startsWith('http')
                                        ? <Image 
                                            key={selected.cropImage}
                                            source={{ uri: selected.cropImage }} 
                                            style={{ width: '100%', height: 160, backgroundColor: '#f1f5f9' }} 
                                            resizeMode="cover"
                                            onLoadStart={() => console.log(`🔄 Modal Loading started: ${selected.cropName}`)}
                                            onLoad={() => console.log(`✅ Modal Image rendered: ${selected.cropName}`)}
                                            onError={(e) => console.error(`❌ Modal Load error:`, e.nativeEvent.error)}
                                          />
                                        : <Text style={{ fontSize: 64 }}>{CAT_EMOJI[selected.category] || '📦'}</Text>
                                    }
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
                                    <DetailRow icon="📍" label="Location"      value={selected.location} />
                                    <DetailRow icon="🏷️" label="Category"     value={selected.category} />
                                    <DetailRow icon="⭐" label="Quality"       value={`Grade ${selected.quality} — ${selected.quality === 'A' ? 'Premium' : selected.quality === 'B' ? 'Standard' : 'Economy'}`} />
                                    <DetailRow icon="📅" label="Harvest Date"  value={selected.harvestDate || '—'} />
                                    <DetailRow icon="🌿" label="Farming"       value={selected.organic ? 'Organic / Natural' : 'Conventional'} />
                                    <DetailRow icon="📊" label="Status"        value={STATUS_STYLE[selected.status]?.label || selected.status} last />
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
                                            setSelected(null);
                                            // navigation.navigate('EditCropProject', { listing: selected });
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