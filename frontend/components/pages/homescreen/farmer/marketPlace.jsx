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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Mic, SlidersHorizontal, Users, Zap, Locate, Layers, Star, CheckCircle2, Sprout, ChevronDown, Maximize2, X, Phone, MessageSquare, ShieldCheck, TrendingUp, MapPin } from 'lucide-react-native';
import { Linking } from 'react-native';
import Header from '../../../common/Header';
import Geolocation from 'react-native-geolocation-service';

// ─── MapLibre: use named imports (the lib has NO default export) ──────────────
import {
    Map,
    Camera,
    GeoJSONSource,
    Layer,
} from '@maplibre/maplibre-react-native';



// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const BUYERS = [
    {
        id: '1',
        name: 'GreenFood Exports Pvt. Ltd.',
        shortName: 'GF',
        avatarBg: '#dcf0e3',
        avatarText: '#1e4a3b',
        type: 'Exporter',
        verified: true,
        verifiedColor: '#1e4a3b',
        location: 'Ahmednagar, MH',
        region: 'Ahmednagar',
        lat: 19.2183,
        lng: 74.7378,
        rating: 4.8,
        reviews: 124,
        deals: 156,
        distance: '2.3 km',
        price: 2280,
        crops: ['Wheat', 'Soybean', 'Maize'],
        tags: [{ label: 'ISO Certified', highlight: true }, { label: 'Bulk Buyer', highlight: true }, { label: 'Cash Payment', highlight: false }],
        markerColor: '#1e4a3b',
        phone: '+919876543210',
        description: 'Primary exporter of premium quality grains across Maharashtra. We offer competitive rates and immediate spot payments for bulk quantities.',
    },
    {
        id: '2',
        name: 'Sharma Agro Traders',
        shortName: 'SA',
        avatarBg: '#ede9fe',
        avatarText: '#5b21b6',
        type: 'Trader',
        verified: true,
        verifiedColor: '#3b82f6',
        location: 'Pune, MH',
        region: 'Pune',
        lat: 18.5204,
        lng: 73.8567,
        rating: 4.5,
        reviews: 89,
        deals: 98,
        distance: '4.1 km',
        price: 2150,
        crops: ['Rice', 'Maize', 'Sugarcane'],
        tags: [{ label: 'Fast Payment', highlight: true }, { label: 'Local Market', highlight: false }],
        markerColor: '#7c3aed',
        phone: '+919876543211',
        description: 'Trusted local trader in the Pune region for over 15 years. Specializing in retail and wholesale grain distribution.',
    },
    {
        id: '3',
        name: 'Patel Foods & Oils',
        shortName: 'PF',
        avatarBg: '#fff3e0',
        avatarText: '#c2410c',
        type: 'Processor',
        verified: true,
        verifiedColor: '#1e4a3b',
        location: 'Nashik, MH',
        region: 'Nashik',
        lat: 19.9975,
        lng: 73.7898,
        rating: 4.7,
        reviews: 203,
        deals: 267,
        distance: '6.2 km',
        price: 2310,
        crops: ['Tomato', 'Onion', 'Grapes'],
        tags: [{ label: 'Pickup Available', highlight: true }, { label: 'Direct Agency', highlight: false }],
        markerColor: '#ea580c',
        phone: '+919876543212',
        description: 'Large scale food processing unit. We buy seasonal vegetables and fruits directly from farm gates with specialized transport.',
    },
    {
        id: '4',
        name: 'Rajput Grain Merchants',
        shortName: 'RG',
        avatarBg: '#e0f2f1',
        avatarText: '#065f46',
        type: 'Merchant',
        verified: false,
        verifiedColor: '#1e4a3b',
        location: 'Kolhapur, MH',
        region: 'Kolhapur',
        lat: 16.7050,
        lng: 74.2433,
        rating: 4.2,
        reviews: 56,
        deals: 71,
        distance: '8.9 km',
        price: 2190,
        crops: ['Wheat', 'Jowar', 'Bajra'],
        tags: [{ label: 'Reliable', highlight: false }],
        markerColor: '#1e4a3b',
        phone: '+919876543213',
        description: 'General grain merchants offering fair transparency and quality-based pricing for diversified crop types.',
    },
];

const REGIONS = [
    { label: 'All Regions', center: [74.7378, 19.2183], zoom: 7 },
    { label: 'Pune', center: [73.8567, 18.5204], zoom: 11 },
    { label: 'Nashik', center: [73.7898, 19.9975], zoom: 11 },
    { label: 'Ahmednagar', center: [74.7496, 19.0948], zoom: 11 },
    { label: 'Kolhapur', center: [74.2433, 16.7050], zoom: 11 },
];

const CROP_CHIPS = ['Wheat', 'Rice', 'Tomato', 'Soybean', 'Near Me'];

// ─── MapLibre setup (called inside component, not at module level) ─────────────

// ─── MAP SECTION ──────────────────────────────────────────────────────────────
const MapSection = memo(({ onMarkerPress, externalCenter }) => {
    const [userCoords, setUserCoords] = useState(null);
    const [mapCenter, setMapCenter] = useState([74.7378, 19.2183]); // default fallback
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [fsSelectedBuyer, setFsSelectedBuyer] = useState(null);
    const cameraRef = useRef(null);

    // Update map center when external center changes (from region selection)
    useEffect(() => {
        if (externalCenter && isMapLoaded) {
            setMapCenter(externalCenter);
        }
    }, [externalCenter, isMapLoaded]);

    useEffect(() => {
        let watchId = null;
        let settled = false;

        const startWatch = () => {
            watchId = Geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserCoords([longitude, latitude]);
                    if (!settled) {
                        settled = true;
                        setMapCenter([longitude, latitude]);
                    }
                },
                (error) => {
                    console.warn('Marketplace location error:', error.message);
                },
                {
                    enableHighAccuracy: false,
                    distanceFilter: 50,
                    interval: 10000,
                    fastestInterval: 5000,
                    timeout: 15000,
                    maximumAge: 60000,
                }
            );
        };

        if (Platform.OS === 'android') {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'KrishiSetu needs your location to show nearby buyers.',
                    buttonPositive: 'OK',
                }
            ).then((result) => {
                if (result === PermissionsAndroid.RESULTS.GRANTED) {
                    startWatch();
                }
            });
        } else {
            startWatch();
        }

        return () => {
            if (watchId !== null) Geolocation.clearWatch(watchId);
        };
    }, []);

    const centerCoord = userCoords || mapCenter;

    const renderMapLayers = () => {
        if (!isMapLoaded) return null;
        return (
            <>
                {/* Radius circle around user */}
                <GeoJSONSource
                    id="radius"
                    data={{ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: centerCoord } }] }}
                >
                    <Layer
                        id="radiusCircle"
                        type="circle"
                        paint={{
                            'circle-radius': 80,
                            'circle-color': 'rgba(30,74,59,0.08)',
                            'circle-stroke-width': 1,
                            'circle-stroke-color': 'rgba(30,74,59,0.2)',
                        }}
                    />
                </GeoJSONSource>

                {/* User location dot */}
                {userCoords && (
                    <GeoJSONSource
                        id="userLoc"
                        data={{ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: userCoords } }] }}
                    >
                        <Layer
                            id="userDot"
                            type="circle"
                            paint={{
                                'circle-radius': 8,
                                'circle-color': '#2563eb',
                                'circle-stroke-width': 2,
                                'circle-stroke-color': '#fff',
                            }}
                        />
                    </GeoJSONSource>
                )}

                {/* Buyer markers */}
                {BUYERS.map((buyer) => (
                    <GeoJSONSource
                        key={buyer.id}
                        id={`buyer_${buyer.id}`}
                        data={{ type: 'FeatureCollection', features: [{ type: 'Feature', properties: { id: buyer.id }, geometry: { type: 'Point', coordinates: [buyer.lng, buyer.lat] } }] }}
                        onPress={() => isFullScreen ? setFsSelectedBuyer(buyer) : onMarkerPress(buyer)}
                    >
                        <Layer
                            id={`dot_${buyer.id}`}
                            type="circle"
                            paint={{
                                'circle-radius': 14,
                                'circle-color': buyer.markerColor,
                                'circle-stroke-width': 2,
                                'circle-stroke-color': '#fff',
                            }}
                        />
                    </GeoJSONSource>
                ))}
            </>
        );
    };

    return (
        <>
            <View className="mx-4 rounded-2xl overflow-hidden mb-4 bg-gray-200" style={{ height: 220 }}>
                {/* When full screen is active, we unmount the mini-map to save memory and avoid GL conflicts on Android */}
                {!isFullScreen && (
                    <Map
                        style={{ flex: 1 }}
                        mapStyle="https://tiles.openfreemap.org/styles/liberty"
                        logo={false}
                        attribution={false}
                        scrollEnabled={true}  // Enabled panning as requested
                        pitchEnabled={true}
                        rotateEnabled={true}
                        onDidFinishLoadingStyle={() => setIsMapLoaded(true)}
                    >
                        <Camera
                            ref={cameraRef}
                            zoomLevel={11}
                            centerCoordinate={centerCoord}
                            animationMode="flyTo"
                            animationDuration={1000}
                        />
                        {renderMapLayers()}
                    </Map>
                )}

                {/* Floating controls for Mini Map */}
                <View className="absolute right-3 bottom-3" style={{ gap: 8 }}>
                    <TouchableOpacity
                        className="bg-white w-9 h-9 rounded-xl items-center justify-center"
                        style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
                        onPress={() => userCoords && setMapCenter([...userCoords])}
                    >
                        <Locate size={18} color="#374151" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-white w-9 h-9 rounded-xl items-center justify-center"
                        style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
                        onPress={() => setIsFullScreen(true)}
                    >
                        <Maximize2 size={18} color="#374151" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* FULL SCREEN MAP MODAL */}
            <Modal visible={isFullScreen} animationType="slide" transparent={false} onRequestClose={() => setIsFullScreen(false)}>
                <View className="flex-1 bg-[#f0f4f0]">
                    <View className="pt-12 pb-3 px-4 bg-[#123524] flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-white">Select Region & Buyers</Text>
                        <TouchableOpacity onPress={() => setIsFullScreen(false)} className="p-2">
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1 relative">
                        {isFullScreen && (
                            <Map
                                style={{ flex: 1 }}
                                mapStyle="https://tiles.openfreemap.org/styles/liberty"
                                logo={false}
                                attribution={false}
                                onDidFinishLoadingStyle={() => setIsMapLoaded(true)}
                            >
                                <Camera
                                    zoomLevel={11}
                                    centerCoordinate={centerCoord}
                                    animationMode="flyTo"
                                />
                                {renderMapLayers()}
                            </Map>
                        )}

                        <TouchableOpacity
                            className="absolute right-4 top-4 bg-white w-10 h-10 rounded-full items-center justify-center shadow-lg"
                            onPress={() => userCoords && setMapCenter([...userCoords])}
                            style={{ elevation: 5 }}
                        >
                            <Locate size={20} color="#374151" />
                        </TouchableOpacity>

                        {/* Quick detail popup for Full Screen view */}
                        {fsSelectedBuyer && (
                            <View className="absolute bottom-10 left-4 right-4">
                                <BuyerCard 
                                    item={fsSelectedBuyer} 
                                    onPress={(b) => {
                                        setIsFullScreen(false);
                                        onMarkerPress(b);
                                    }} 
                                />
                                <TouchableOpacity 
                                    className="absolute -top-3 -right-2 bg-white rounded-full p-1 border border-gray-100 shadow-sm"
                                    onPress={() => setFsSelectedBuyer(null)}
                                >
                                    <X size={16} color="#666" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
});




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
                className="bg-white rounded-2xl p-4"
                style={{ shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}
            >
                <View className="flex-row items-start">
                    {/* Avatar */}
                    <View className="w-14 h-14 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: item.avatarBg }}>
                        <Text className="text-xl font-bold" style={{ color: item.avatarText }}>{item.shortName}</Text>
                    </View>

                    {/* Info */}
                    <View className="flex-1 mr-2">
                        {/* Name + badge */}
                        <View className="flex-row items-center" style={{ gap: 5 }}>
                            <Text className="text-[14px] font-bold text-gray-900 flex-shrink" numberOfLines={1}>{item.name}</Text>
                            {item.verified && (
                                <CheckCircle2 size={15} color={item.verifiedColor} fill={item.verifiedColor} style={{ flexShrink: 0 }} />
                            )}
                        </View>

                        {/* Location */}
                        <Text className="text-[12px] text-gray-400 mt-0.5">{item.location} • {item.distance}</Text>

                        {/* Rating + deals */}
                        <View className="flex-row items-center mt-1" style={{ gap: 2 }}>
                            <Star size={12} color="#f59e0b" fill="#f59e0b" />
                            <Text className="text-[12px] font-bold text-amber-500">{item.rating}</Text>
                            <Text className="text-[12px] text-gray-400"> ({item.reviews})</Text>
                            <Text className="text-[12px] text-gray-400 ml-1">🤝 {item.deals} Deals</Text>
                        </View>

                        {/* Tags */}
                        <View className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
                            {item.tags.map((tag) => (
                                <View
                                    key={tag.label}
                                    className="px-2.5 py-1 rounded-lg"
                                    style={{ backgroundColor: tag.highlight ? '#dcf0e3' : '#f3f4f6' }}
                                >
                                    <Text
                                        className="text-[11px] font-semibold"
                                        style={{ color: tag.highlight ? '#1e4a3b' : '#6b7280' }}
                                    >
                                        {tag.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Price + Button */}
                    <View className="items-end" style={{ minWidth: 82 }}>
                        <Text className="text-[18px] font-extrabold text-[#1e4a3b]">₹{item.price.toLocaleString('en-IN')}</Text>
                        <Text className="text-[10px] text-gray-400 -mt-0.5">per quintal</Text>
                        <TouchableOpacity
                            className="mt-3 bg-[#123524] rounded-xl px-3 py-2"
                            onPress={() => onPress(item)}
                        >
                            <Text className="text-white text-[12px] font-bold">View Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

// ─── DETAILED BUYER MODAL ─────────────────────────────────────────────────────
const BuyerDetailModal = memo(({ buyer, onClose }) => {
    if (!buyer) return null;

    const handleCall = () => {
        Linking.openURL(`tel:${buyer.phone}`);
    };

    const handleWhatsApp = () => {
        const message = `Hello ${buyer.name}, I found your profile on KrishiSetu and I'm interested in selling my produce.`;
        Linking.openURL(`whatsapp://send?phone=${buyer.phone}&text=${encodeURIComponent(message)}`);
    };

    return (
        <Modal
            visible={!!buyer}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                className="flex-1 bg-black/60 justify-end" 
                activeOpacity={1} 
                onPress={onClose}
            >
                <View 
                    className="bg-[#f8fafc] rounded-t-[32px] overflow-hidden" 
                    onPress={(e) => e.stopPropagation()}
                    style={{ height: '80%' }}
                >
                    {/* Draggable indicator */}
                    <View className="items-center py-4">
                        <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="px-6">
                        {/* Header Section */}
                        <View className="flex-row items-center mb-6">
                            <View className="w-20 h-20 rounded-[24px] items-center justify-center shadow-sm" style={{ backgroundColor: buyer.avatarBg }}>
                                <Text className="text-3xl font-extrabold" style={{ color: buyer.avatarText }}>{buyer.shortName}</Text>
                            </View>
                            <View className="ml-4 flex-1">
                                <View className="flex-row items-center" style={{ gap: 6 }}>
                                    <Text className="text-2xl font-bold text-gray-900">{buyer.name}</Text>
                                    {buyer.verified && <ShieldCheck size={20} color="#1e4a3b" fill="#dcf0e3" />}
                                </View>
                                <View className="flex-row items-center mt-1" style={{ gap: 4 }}>
                                    <MapPin size={14} color="#64748b" />
                                    <Text className="text-gray-500 font-medium">{buyer.location} • {buyer.distance} away</Text>
                                </View>
                            </View>
                        </View>

                        {/* Quick Stats Grid */}
                        <View className="flex-row mb-6" style={{ gap: 12 }}>
                            <View className="flex-1 bg-white p-3 rounded-2xl items-center border border-gray-100">
                                <Star size={18} color="#f59e0b" fill="#f59e0b" />
                                <Text className="text-gray-900 font-bold mt-1">{buyer.rating}</Text>
                                <Text className="text-[10px] text-gray-400">Rating</Text>
                            </View>
                            <View className="flex-1 bg-white p-3 rounded-2xl items-center border border-gray-100">
                                <TrendingUp size={18} color="#10b981" />
                                <Text className="text-gray-900 font-bold mt-1">{buyer.deals}</Text>
                                <Text className="text-[10px] text-gray-400">Deals Done</Text>
                            </View>
                            <View className="flex-1 bg-white p-3 rounded-2xl items-center border border-gray-100">
                                <Zap size={18} color="#3b82f6" />
                                <Text className="text-gray-900 font-bold mt-1">98%</Text>
                                <Text className="text-[10px] text-gray-400">Response</Text>
                            </View>
                        </View>

                        {/* Pricing Highlight */}
                        <View className="bg-white p-5 rounded-3xl mb-6 shadow-sm border border-green-50">
                            <Text className="text-gray-400 font-bold text-[11px] tracking-widest uppercase">Current Buying Price</Text>
                            <View className="flex-row items-baseline mt-1" style={{ gap: 4 }}>
                                <Text className="text-3xl font-extrabold text-[#123524]">₹{buyer.price.toLocaleString('en-IN')}</Text>
                                <Text className="text-gray-500 font-bold">/ quintal</Text>
                            </View>
                            <View className="mt-3 flex-row items-center bg-green-50 self-start px-2 py-1 rounded-lg" style={{ gap: 4 }}>
                                <TrendingUp size={12} color="#16a34a" />
                                <Text className="text-[11px] text-green-700 font-bold">+2.3% from yesterday</Text>
                            </View>
                        </View>

                        {/* About Section */}
                        <View className="mb-6">
                            <Text className="text-lg font-bold text-gray-900 mb-2">About Business</Text>
                            <Text className="text-gray-600 leading-6 text-[14px]">{buyer.description}</Text>
                        </View>

                        {/* Crops Section */}
                        <View className="mb-8">
                            <Text className="text-lg font-bold text-gray-900 mb-3">Crops they Buy</Text>
                            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                {buyer.crops.map((crop) => (
                                    <View key={crop} className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex-row items-center" style={{ gap: 6 }}>
                                        <Sprout size={14} color="#16a34a" />
                                        <Text className="text-gray-800 font-bold">{crop}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Footer */}
                    <View className="px-6 pt-4 pb-10 bg-white border-t border-gray-100 flex-row" style={{ gap: 12 }}>
                        <TouchableOpacity 
                            onPress={handleWhatsApp}
                            className="w-14 h-14 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100"
                        >
                            <MessageSquare size={24} color="#123524" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleCall}
                            className="flex-1 h-14 bg-[#123524] rounded-2xl flex-row items-center justify-center shadow-lg"
                            style={{ gap: 8 }}
                        >
                            <Phone size={20} color="#fff" />
                            <Text className="text-white font-bold text-lg">Call Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function MarketplaceScreen() {
    const [search, setSearch] = useState('');
    const [activeChip, setActiveChip] = useState('Wheat');
    const [isFarmer, setIsFarmer] = useState(true);
    const [selectedBuyer, setSelectedBuyer] = useState(null);
    const [sortBy, setSortBy] = useState('Distance');
    const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
    const [isRegionModalVisible, setIsRegionModalVisible] = useState(false);

    const filteredBuyers = useCallback(() => {
        let buyers = BUYERS;
        
        // Region filtering
        if (selectedRegion && selectedRegion.label !== 'All Regions') {
            buyers = buyers.filter(b => b.region === selectedRegion.label);
        }

        if (!search.trim()) return buyers;
        const q = search.toLowerCase();
        return buyers.filter(b =>
            b.name.toLowerCase().includes(q) ||
            b.tags.some(t => t.label.toLowerCase().includes(q)) ||
            b.location.toLowerCase().includes(q)
        );
    }, [search, selectedRegion]);

    const renderBuyer = useCallback(({ item }) => (
        <BuyerCard item={item} onPress={setSelectedBuyer} />
    ), []);

    const keyExtractor = useCallback((item) => item.id, []);

    // ── List header (everything above the buyer cards) ──
    const ListHeader = useCallback(() => (
        <View>
            {/* ── Search row ── */}
            <View className="flex-row items-center px-4 pt-6 pb-8" style={{ gap: 5 }}>
                <View
                    className="flex-1 flex-row items-center bg-white rounded-full px-4"
                    style={{ paddingVertical: Platform.OS === 'ios' ? 12 : 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, gap: 8 }}
                >
                    <Search size={16} color="#9ca3af" />
                    <TextInput
                        className="flex-1 text-[14px] text-gray-800 p-0"
                        placeholder="Search buyers, crops..."
                        placeholderTextColor="#9ca3af"
                        value={search}
                        onChangeText={setSearch}
                    />
                    <TouchableOpacity>
                        <Mic size={16} color="#9ca3af" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    className="flex-row items-center bg-[#123524] rounded-full px-4"
                    style={{ paddingVertical: Platform.OS === 'ios' ? 12 : 10, gap: 5 }}
                >
                    <SlidersHorizontal size={14} color="#fff" />
                    <Text className="text-white text-[13px] font-semibold">Filters</Text>
                </TouchableOpacity>
            </View>

            {/* ── Crop chips ── */}
            <FlatList 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
                data={CROP_CHIPS}
                keyExtractor={(item) => item}
                renderItem={({ item: chip }) => (
                    <TouchableOpacity
                        onPress={() => setActiveChip(chip)}
                        className="rounded-full px-4 py-1.5 border"
                        style={{
                            backgroundColor: activeChip === chip ? '#123524' : '#fff',
                            borderColor: activeChip === chip ? '#123524' : '#e5e7eb',
                        }}
                    >
                        <Text
                            className="text-[13px] font-medium"
                            style={{ color: activeChip === chip ? '#fff' : '#4b5563' }}
                        >
                            {chip}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* ── Stat cards ── */}
            <View className="flex-row px-4 pb-4" style={{ gap: 10 }}>
                {/* Buyers */}
                <View
                    className="flex-1 bg-white rounded-2xl p-3 items-center"
                    style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
                >
                    <View className="w-9 h-9 rounded-xl bg-[#dcf0e3] items-center justify-center mb-1.5">
                        <Users size={18} color="#1e4a3b" />
                    </View>
                    <Text className="text-[13px] font-bold text-gray-900 text-center">12 Buyers</Text>
                    <Text className="text-[10px] text-gray-400 text-center mt-0.5">Within 25 km</Text>
                </View>

                {/* Price */}
                <View
                    className="flex-1 bg-white rounded-2xl p-3 items-center"
                    style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
                >
                    <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center mb-1.5">
                        <Text className="text-[18px]" style={{ color: '#d97706' }}>₹</Text>
                    </View>
                    <Text className="text-[13px] font-bold text-gray-900 text-center">₹2,250</Text>
                    <Text className="text-[10px] text-gray-400 text-center mt-0.5">Avg. Wheat Price</Text>
                </View>

                {/* Response */}
                <View
                    className="flex-1 bg-white rounded-2xl p-3 items-center"
                    style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
                >
                    <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mb-1.5">
                        <Zap size={18} color="#3b82f6" />
                    </View>
                    <Text className="text-[13px] font-bold text-gray-900 text-center">98%</Text>
                    <Text className="text-[10px] text-gray-400 text-center mt-0.5">Response Rate</Text>
                </View>
            </View>

            {/* ── Map ── */}
            <MapSection onMarkerPress={setSelectedBuyer} externalCenter={selectedRegion.center} />

            {/* ── Region Selection UI ── */}
            <View className="px-4 pb-3">
                <TouchableOpacity 
                    onPress={() => setIsRegionModalVisible(true)}
                    className="bg-white rounded-xl p-3 flex-row items-center justify-between border border-gray-100"
                    style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 }}
                >
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                        <Locate size={16} color="#1e4a3b" />
                        <View>
                            <Text className="text-[10px] text-gray-400 font-medium">SELECTED REGION</Text>
                            <Text className="text-[14px] font-bold text-gray-900">{selectedRegion.label}</Text>
                        </View>
                    </View>
                    <ChevronDown size={18} color="#9ca3af" />
                </TouchableOpacity>
            </View>

            {/* ── Nearby Buyers header ── */}
            <View className="flex-row items-center justify-between px-4 mb-3">
                <Text className="text-[18px] font-bold text-gray-900">Nearby Buyers</Text>
                <TouchableOpacity
                    className="flex-row items-center bg-white rounded-full px-3 py-1.5 border border-gray-200"
                    style={{ gap: 4 }}
                    onPress={() => setSortBy(s => s === 'Distance' ? 'Rating' : 'Distance')}
                >
                    <Text className="text-[12px] text-gray-600">Sort: <Text className="font-bold text-gray-800">{sortBy}</Text></Text>
                    <ChevronDown size={13} color="#374151" />
                </TouchableOpacity>
            </View>
        </View>
    ), [search, activeChip, sortBy]);

    // ── List footer (tip card) ──
    const ListFooter = useCallback(() => (
        <View
            className="mx-4 mt-1 mb-28 rounded-2xl p-4 flex-row items-center border border-green-100"
            style={{ backgroundColor: '#f0fdf4', gap: 10 }}
        >
            <Sprout size={28} color="#16a34a" />
            <Text className="flex-1 text-[13px] font-semibold text-green-800 leading-5">
                Tip: Add your crops & quantity{'\n'}to get better matches!
            </Text>
            <TouchableOpacity>
                <Text className="text-[13px] font-bold text-[#1e4a3b]">Update Profile →</Text>
            </TouchableOpacity>
        </View>
    ), []);

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">

                {/* ── Header ── */}
                <Header
                    title="Marketplace"
                    showNotification={true}
                />

                {/* ── Scrollable body ── */}
                <View className="flex-1 bg-[#f0f4f0] rounded-t-3xl overflow-hidden">
                    <FlatList
                        data={filteredBuyers()}
                        renderItem={renderBuyer}
                        keyExtractor={keyExtractor}
                        ListHeaderComponent={ListHeader}
                        ListFooterComponent={ListFooter}
                        showsVerticalScrollIndicator={false}
                        extraData={selectedBuyer}
                    />
                </View>
            </SafeAreaView>

            {/* ── Buyer Profile Detail Modal ── */}
            <BuyerDetailModal buyer={selectedBuyer} onClose={() => setSelectedBuyer(null)} />

            {/* ── Region Selector Modal ── */}
            <Modal visible={isRegionModalVisible} transparent animationType="fade" onRequestClose={() => setIsRegionModalVisible(false)}>
                <TouchableOpacity 
                    className="flex-1 bg-black/50 justify-center items-center p-6" 
                    activeOpacity={1} 
                    onPress={() => setIsRegionModalVisible(false)}
                >
                    <View className="bg-white w-full rounded-2xl overflow-hidden shadow-xl" onPress={(e) => e.stopPropagation()}>
                        <View className="bg-[#123524] p-4 flex-row items-center justify-between">
                            <Text className="text-white font-bold text-lg">Select Region</Text>
                            <TouchableOpacity onPress={() => setIsRegionModalVisible(false)}>
                                <X size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View className="p-2">
                            {REGIONS.map((region) => (
                                <TouchableOpacity 
                                    key={region.label}
                                    onPress={() => {
                                        setSelectedRegion(region);
                                        setIsRegionModalVisible(false);
                                    }}
                                    className="p-4 flex-row items-center justify-between border-b border-gray-50 last:border-b-0"
                                >
                                    <Text className={`text-[15px] ${selectedRegion.label === region.label ? 'font-bold text-[#1e4a3b]' : 'text-gray-600'}`}>
                                        {region.label}
                                    </Text>
                                    {selectedRegion.label === region.label && <CheckCircle2 size={18} color="#1e4a3b" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}