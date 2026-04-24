import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
    Platform,
    PermissionsAndroid,
    ActivityIndicator,
    FlatList,
    Modal,
    Linking,
    Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Mic, Filter, SlidersHorizontal, Users, Zap, Locate, Layers, Star, CheckCircle2, Sprout, ChevronDown, Maximize2, X, Phone, MessageSquare, ShieldCheck, TrendingUp, MapPin } from 'lucide-react-native';
import Header from '../../../common/BHeader';
import { offtakerService } from '../../service/api';

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const DUMMY_BUYERS = [
    {
        id: 'd1',
        name: 'Global Grain Traders',
        shortName: 'GG',
        avatarBg: '#e0f2fe',
        avatarText: '#0369a1',
        type: 'Wholesaler',
        verified: true,
        verifiedColor: '#0369a1',
        location: 'Mumbai, MH',
        region: 'Mumbai',
        lat: 19.0760,
        lng: 72.8777,
        rating: 4.9,
        reviews: 342,
        deals: 512,
        distance: '12.5 km',
        price: 2450,
        crops: ['Wheat', 'Basmati Rice', 'Pulses'],
        tags: [{ label: 'Bulk Buyer', highlight: true }, { label: 'Top Rated', highlight: true }],
        markerColor: '#0369a1',
        phone: '+919876543001',
        description: 'Leading wholesaler in the Mumbai region specializing in bulk procurement of premium grains.',
    },
    {
        id: 'd2',
        name: 'Freshly Processed Ltd.',
        shortName: 'FP',
        avatarBg: '#fef3c7',
        avatarText: '#92400e',
        type: 'Processor',
        verified: true,
        verifiedColor: '#92400e',
        location: 'Pune, MH',
        region: 'Pune',
        lat: 18.5204,
        lng: 73.8567,
        rating: 4.6,
        reviews: 156,
        deals: 210,
        distance: '5.2 km',
        price: 2100,
        crops: ['Tomato', 'Onion', 'Potato'],
        tags: [{ label: 'Fast Payment', highlight: true }],
        markerColor: '#92400e',
        phone: '+919876543002',
        description: 'State-of-the-art food processing unit looking for consistent supply of vegetables.',
    },
    {
        id: 'd3',
        name: 'Organic Roots India',
        shortName: 'OR',
        avatarBg: '#dcf0e3',
        avatarText: '#166534',
        type: 'Exporter',
        verified: true,
        verifiedColor: '#166534',
        location: 'Nashik, MH',
        region: 'Nashik',
        lat: 19.9975,
        lng: 73.7898,
        rating: 4.8,
        reviews: 89,
        deals: 124,
        distance: '8.1 km',
        price: 2800,
        crops: ['Grapes', 'Pomegranate', 'Banana'],
        tags: [{ label: 'Organic Only', highlight: true }, { label: 'Export Quality', highlight: false }],
        markerColor: '#166534',
        phone: '+919876543003',
        description: 'Boutique exporter focused on high-quality organic fruits for the European market.',
    },
    {
        id: 'd4',
        name: 'Reliance Retail Agri',
        shortName: 'RR',
        avatarBg: '#fee2e2',
        avatarText: '#b91c1c',
        type: 'Retailer',
        verified: true,
        verifiedColor: '#b91c1c',
        location: 'Ahmedabad, GJ',
        region: 'Ahmedabad',
        lat: 23.0225,
        lng: 72.5714,
        rating: 4.7,
        reviews: 1205,
        deals: 4500,
        distance: '25.0 km',
        price: 2350,
        crops: ['All Vegetables', 'Fruits', 'Grains'],
        tags: [{ label: 'Corporate', highlight: true }, { label: 'Daily Pickup', highlight: true }],
        markerColor: '#b91c1c',
        phone: '+919876543004',
        description: 'Large scale procurement for national retail chains. We offer reliable long-term contracts.',
    },
    {
        id: 'd5',
        name: 'AgroNova Startups',
        shortName: 'AN',
        avatarBg: '#f3e8ff',
        avatarText: '#7e22ce',
        type: 'Startup',
        verified: false,
        verifiedColor: '#7e22ce',
        location: 'Bangalore, KA',
        region: 'Bangalore',
        lat: 12.9716,
        lng: 77.5946,
        rating: 4.4,
        reviews: 45,
        deals: 67,
        distance: '150 km',
        price: 2600,
        crops: ['Quinoa', 'Millet', 'Dragon Fruit'],
        tags: [{ label: 'Tech Enabled', highlight: false }, { label: 'Premium Crops', highlight: true }],
        markerColor: '#7e22ce',
        phone: '+919876543005',
        description: 'New age agri-tech startup connecting farmers directly to urban consumers.',
    }
];

// ─── BUYER CARD ───────────────────────────────────────────────────────────────
const BuyerCard = memo(({ item, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 60 }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 60 }).start();

    return (
        <Animated.View style={{ transform: [{ scale }] }} className="mx-4 mb-3">
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() => onPress(item)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
            >
                <View className="flex-row items-start">
                    <View className="w-14 h-14 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: item.avatarBg }}>
                        <Text className="text-xl font-bold" style={{ color: item.avatarText }}>{item.shortName}</Text>
                    </View>

                    <View className="flex-1 mr-2">
                        <View className="flex-row items-center" style={{ gap: 5 }}>
                            <Text className="text-[14px] font-bold text-slate-900 flex-shrink" numberOfLines={1}>{item.name}</Text>
                            {item.verified && (
                                <CheckCircle2 size={15} color={item.verifiedColor} fill={item.verifiedColor} />
                            )}
                        </View>
                        <Text className="text-[12px] text-slate-400 mt-0.5">{item.location} • {item.distance}</Text>

                        <View className="flex-row items-center mt-1" style={{ gap: 2 }}>
                            <Star size={12} color="#f59e0b" fill="#f59e0b" />
                            <Text className="text-[12px] font-bold text-amber-500">{item.rating}</Text>
                            <Text className="text-[12px] text-slate-400"> ({item.reviews})</Text>
                        </View>

                        <View className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
                            {item.tags.map((tag, idx) => (
                                <View key={idx} className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: tag.highlight ? '#e0f2fe' : '#f1f5f9' }}>
                                    <Text className="text-[11px] font-semibold" style={{ color: tag.highlight ? '#0369a1' : '#64748b' }}>{tag.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View className="items-end" style={{ minWidth: 82 }}>
                        <Text className="text-[18px] font-extrabold text-[#1e4e8c]">₹{item.price.toLocaleString('en-IN')}</Text>
                        <Text className="text-[10px] text-slate-400 -mt-0.5">per unit</Text>
                        <TouchableOpacity className="mt-3 bg-[#1e4e8c] rounded-xl px-3 py-2" onPress={() => onPress(item)}>
                            <Text className="text-white text-[12px] font-bold">Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
const BuyerDetailModal = memo(({ item, onClose }) => {
    if (!item) return null;

    return (
        <Modal visible={!!item} animationType="slide" transparent onRequestClose={onClose}>
            <TouchableOpacity
                className="flex-1 bg-black/50 justify-end"
                activeOpacity={1}
                onPress={onClose}
            >
                <Pressable className="bg-white rounded-t-[40px] h-[80%] overflow-hidden">
                    <View className="flex-row items-center justify-between px-6 pt-4">
                        <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
                        <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="px-6">
                        <View className="flex-row items-center mb-6">
                            <View className="w-20 h-20 rounded-3xl items-center justify-center" style={{ backgroundColor: item.avatarBg }}>
                                <Text className="text-3xl font-black" style={{ color: item.avatarText }}>{item.shortName}</Text>
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-2xl font-bold text-slate-900">{item.name}</Text>
                                <Text className="text-slate-400 font-medium">{item.type} • {item.location}</Text>
                            </View>
                        </View>

                        <View className="flex-row mb-6" style={{ gap: 12 }}>
                            <View className="flex-1 bg-slate-50 p-4 rounded-2xl items-center">
                                <Star size={20} color="#f59e0b" fill="#f59e0b" />
                                <Text className="text-slate-900 font-bold mt-1">{item.rating}</Text>
                                <Text className="text-[10px] text-slate-400">Rating</Text>
                            </View>
                            <View className="flex-1 bg-slate-50 p-4 rounded-2xl items-center">
                                <TrendingUp size={20} color="#10b981" />
                                <Text className="text-slate-900 font-bold mt-1">{item.deals}</Text>
                                <Text className="text-[10px] text-slate-400">Deals</Text>
                            </View>
                        </View>

                        <Text className="text-lg font-bold text-slate-900 mb-2">About</Text>
                        <Text className="text-slate-600 leading-6 mb-6">{item.description}</Text>

                        <Text className="text-lg font-bold text-slate-900 mb-2">Primary Commodities</Text>
                        <View className="flex-row flex-wrap mb-8" style={{ gap: 8 }}>
                            {item.crops.map((c, i) => (
                                <View key={i} className="bg-blue-50 px-4 py-2 rounded-xl flex-row items-center" style={{ gap: 6 }}>
                                    <Sprout size={14} color="#1e4e8c" />
                                    <Text className="text-[#1e4e8c] font-bold">{c}</Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    <View className="p-6 pb-10 bg-white border-t border-slate-100 flex-row" style={{ gap: 12 }}>
                        <TouchableOpacity className="w-14 h-14 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
                            <MessageSquare size={24} color="#1e4e8c" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => Linking.openURL(`tel:${item.phone}`)}
                            className="flex-1 h-14 bg-[#1e4e8c] rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-900/20"
                            style={{ gap: 8 }}
                        >
                            <Phone size={20} color="#fff" />
                            <Text className="text-white font-bold text-lg">Contact Now</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </TouchableOpacity>
        </Modal>
    );
});

export default function OfftakerMarketplace() {
    const [realBuyers, setRealBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBuyer, setSelectedBuyer] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadRealBuyers();
    }, []);

    const loadRealBuyers = async () => {
        try {
            setLoading(true);
            const res = await offtakerService.getAllOfftakers();
            if (res.success && res.offtakers) {
                const mapped = res.offtakers.map(off => ({
                    id: off._id,
                    name: off.companyName || off.userId?.name || 'Premium Buyer',
                    shortName: (off.companyName || off.userId?.name || 'B').slice(0, 2).toUpperCase(),
                    avatarBg: '#e0f2fe',
                    avatarText: '#0369a1',
                    type: off.businessType || 'Buyer',
                    verified: off.isBusinessVerified || false,
                    verifiedColor: '#0369a1',
                    location: off.headquarters?.city || 'India',
                    lat: off.headquarters?.coordinates?.lat || 19.07,
                    lng: off.headquarters?.coordinates?.lng || 72.87,
                    rating: off.ratingAverage || 4.5,
                    reviews: off.totalReviews || 0,
                    deals: off.totalContractsCompleted || 0,
                    distance: 'Nearby',
                    price: 2500,
                    crops: off.preferredCrops || ['Crops'],
                    tags: [{ label: off.businessType || 'Verified', highlight: true }],
                    markerColor: '#0369a1',
                    phone: off.companyPhone || off.userId?.phone || '',
                    description: off.companyDescription || 'No description provided.',
                }));
                setRealBuyers(mapped);
            }
        } catch (error) {
            console.error("Error loading buyers:", error);
        } finally {
            setLoading(false);
        }
    };

    const allBuyers = [...realBuyers, ...DUMMY_BUYERS].filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View className="flex-1 bg-[#102a43]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header title="Buyer Marketplace" />
                <View className="flex-1 bg-[#f8fafc] rounded-t-[40px] overflow-hidden">
                    <View className="p-5 flex-1">
                        {/* Search */}
                        <View className="flex-row items-center mb-6" style={{ gap: 10 }}>
                            <View className="flex-1 bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-sm border border-slate-100">
                                <Search size={18} color="#94a3b8" />
                                <TextInput
                                    className="ml-2 flex-1 text-slate-900"
                                    placeholder="Search buyers..."
                                    value={search}
                                    onChangeText={setSearch}
                                />
                            </View>
                            <TouchableOpacity className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                                <Filter size={20} color="#1e4e8c" />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color="#1e4e8c" />
                                <Text className="mt-4 text-slate-400 font-medium">Fetching Real Buyers...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={allBuyers}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => <BuyerCard item={item} onPress={setSelectedBuyer} />}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                ListHeaderComponent={() => (
                                    <Text className="text-slate-900 font-black text-lg mb-4">
                                        {search ? `Search Results (${allBuyers.length})` : 'Featured Buyers'}
                                    </Text>
                                )}
                            />
                        )}
                    </View>
                </View>
            </SafeAreaView>

            <BuyerDetailModal item={selectedBuyer} onClose={() => setSelectedBuyer(null)} />
        </View>
    );
}
