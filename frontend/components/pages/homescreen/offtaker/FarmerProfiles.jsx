import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, Map as MapIcon } from 'lucide-react-native';
import Header from '../../../common/BHeader';
import { farmerService } from '../../service/api';
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Fallback local data removed

const PAGE_SIZE = 5;

// ─── Crop Pill ─────────────────────────────────────────────────────────────────
const CropPill = ({ label }) => (
    <View className="bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 mr-1.5 mb-1">
        <Text className="text-emerald-700 text-xs font-medium">{label}</Text>
    </View>
);

// ─── Stat Block ────────────────────────────────────────────────────────────────
const StatBlock = ({ icon, value, label }) => (
    <View className="flex-row items-center">
        <Text className="text-base mr-1">{icon}</Text>
        <View>
            <Text className="text-sm font-bold text-[#1e4a3b]">{value}</Text>
            <Text className="text-xs text-gray-400">{label}</Text>
        </View>
    </View>
);

// ─── Farmer Card ───────────────────────────────────────────────────────────────
const FarmerCard = React.memo(({ item, onPress }) => (
    <View className="bg-white mx-4 mb-3 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Top accent bar */}
        <View className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500 w-full" style={{ backgroundColor: '#2d8a5e' }} />

        <View className="p-4">
            <View className="flex-row items-start">
                {/* Avatar */}
                <View className="relative mr-3">
                    <Image
                        source={{ uri: item.avatar }}
                        className="w-16 h-16 rounded-full bg-emerald-100"
                        resizeMode="cover"
                    />
                    {item.verified && (
                        <View className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full items-center justify-center border-2 border-white">
                            <Text className="text-white text-xs">✓</Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View className="flex-1">
                    <Text className="text-base font-bold text-[#1a2e22]" numberOfLines={1}>
                        {item.name}
                    </Text>
                    <View className="flex-row items-center mt-0.5 mb-2">
                        <Text className="text-emerald-600 text-xs mr-1">📍</Text>
                        <Text className="text-gray-500 text-xs flex-1" numberOfLines={1}>
                            {item.location}
                        </Text>
                    </View>

                    {/* Crop Pills */}
                    <View className="flex-row flex-wrap">
                        {item.crops.map((c) => (
                            <CropPill key={c} label={c} />
                        ))}
                    </View>
                </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-100 my-3" />

            {/* Stats + Button */}
            <View className="flex-row items-center justify-between">
                <View className="flex-row gap-x-4">
                    <StatBlock icon="🌱" value={`${item.farmSize} Ac`} label="Farm Size" />
                    <View className="w-px bg-gray-200 mx-1" />
                    <StatBlock icon="🧺" value={`${item.monthlySupply} kg`} label="Monthly" />
                </View>

                <TouchableOpacity
                    onPress={() => onPress?.(item)}
                    className="bg-[#1e4a3b] rounded-xl px-4 py-2 active:opacity-80"
                >
                    <Text className="text-white text-xs font-semibold">View Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
));

// ─── Search Bar ────────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChangeText, onFilterPress }) => (
    <View className="flex-row items-center px-4 py-3 gap-x-2">
        <View className="flex-1 flex-row items-center bg-white rounded-2xl border border-gray-200 px-3 h-11 shadow-sm">
            <Text className="text-gray-400 mr-2 text-base">🔍</Text>
            <TextInput
                className="flex-1 text-sm text-gray-700"
                placeholder="Search by name, crop, or location"
                placeholderTextColor="#9ca3af"
                value={value}
                onChangeText={onChangeText}
                returnKeyType="search"
                clearButtonMode="while-editing"
            />
        </View>
        <TouchableOpacity
            onPress={onFilterPress}
            className="bg-white border border-gray-200 rounded-2xl h-11 px-4 flex-row items-center shadow-sm gap-x-1 active:opacity-70"
        >
            <Text className="text-emerald-700 text-sm">⚡</Text>
            <Text className="text-emerald-700 text-sm font-semibold">Filter</Text>
        </TouchableOpacity>
    </View>
);

// ─── List Header ───────────────────────────────────────────────────────────────
const ListHeader = ({ query, onChangeText, onFilterPress, total }) => (
    <View>
        <SearchBar value={query} onChangeText={onChangeText} onFilterPress={onFilterPress} />
        <View className="flex-row items-center justify-between px-5 pb-2">
            <Text className="text-xs text-gray-400">
                Showing <Text className="font-semibold text-gray-600">{total}</Text> farmers
            </Text>
            <View className="flex-row items-center gap-x-1">
                <View className="w-2 h-2 rounded-full bg-emerald-500" />
                <Text className="text-xs text-gray-400">Verified available</Text>
            </View>
        </View>
    </View>
);

// ─── List Footer ───────────────────────────────────────────────────────────────
const ListFooter = ({ loading, hasMore }) => {
    if (loading)
        return (
            <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#1e4a3b" />
                <Text className="text-xs text-gray-400 mt-2">Loading more farmers…</Text>
            </View>
        );
    if (!hasMore)
        return (
            <View className="py-6 items-center">
                <Text className="text-xs text-gray-400">— All farmers loaded —</Text>
            </View>
        );
    return null;
};

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ query }) => (
    <View className="flex-1 items-center justify-center py-24 px-8">
        <Text className="text-5xl mb-4">🌾</Text>
        <Text className="text-lg font-bold text-[#1e4a3b] mb-1 text-center">No farmers found</Text>
        <Text className="text-sm text-gray-400 text-center">
            {query ? `No results for "${query}". Try a different name or crop.` : 'No farmers available right now.'}
        </Text>
    </View>
);

// ─── Separator ─────────────────────────────────────────────────────────────────
const ItemSeparator = () => <View className="h-0" />;

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function FarmerProfiles() {
    const navigation = useNavigation();
    const [allFarmers, setAllFarmers] = useState([]);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(false);

    const fetchFarmers = async () => {
        try {
            const data = await farmerService.getFarmers();
            const farmersList = data.farmer || [];

            const profilesWithPhotos = await Promise.all(
                farmersList.map(async (farmer) => {
                    let avatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                    try {
                        const photoData = await farmerService.getProfilePhotobyId(farmer._id);
                        if (photoData.success && photoData.profilePhoto) {
                            avatar = photoData.profilePhoto;
                        }
                    } catch (err) {
                        console.log('Could not fetch photo for', farmer._id);
                    }

                    // Generate simple deterministic coordinates based on name length or id
                    const baseLat = 15.9129; // AP center
                    const baseLng = 79.7400;
                    const charCodeSum = (farmer.name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                    const latOffset = (charCodeSum % 100) * 0.01 - 0.5;
                    const lngOffset = ((charCodeSum * 2) % 100) * 0.01 - 0.5;

                    return {
                        id: farmer._id,
                        name: farmer.name || 'Unknown Farmer',
                        location: farmer.address || 'Location Unavailable',
                        crops: farmer.crops || ['Paddy', 'Wheat'], 
                        farmSize: farmer.landArea || 5.0,
                        monthlySupply: 1000,
                        avatar: avatar,
                        verified: farmer.isVerified || false,
                        latitude: farmer.latitude || (baseLat + latOffset),
                        longitude: farmer.longitude || (baseLng + lngOffset),
                    };
                })
            );

            setAllFarmers(profilesWithPhotos);
        } catch (error) {
            console.error('Error fetching farmers data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setRefreshing(true);
        fetchFarmers();
    }, []);

    // Filtered data
    const filtered = query.trim()
        ? allFarmers.filter(
              (f) =>
                  f.name.toLowerCase().includes(query.toLowerCase()) ||
                  f.location.toLowerCase().includes(query.toLowerCase()) ||
                  f.crops.some((c) => c.toLowerCase().includes(query.toLowerCase()))
          )
        : allFarmers;

    // Paginated slice
    const visibleData = filtered.slice(0, page * PAGE_SIZE);
    const hasMore = visibleData.length < filtered.length;

    // Pull-to-refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        fetchFarmers();
    }, []);

    // Infinite scroll
    const onEndReached = useCallback(() => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        setTimeout(() => {
            setPage((p) => p + 1);
            setLoadingMore(false);
        }, 600);
    }, [loadingMore, hasMore]);

    const handleSearch = useCallback((text) => {
        setQuery(text);
        setPage(1);
    }, []);

    const renderItem = useCallback(
        ({ item }) => (
            <FarmerCard 
                item={item} 
                onPress={(f) => navigation.navigate('FarmerProfileWindow', { userId: f.id })} 
            />
        ),
        [navigation]
    );

    const keyExtractor = useCallback((item) => item.id, []);

    return (
        <View className="flex-1 bg-[#123524]">
            <SafeAreaView edges={['top']} className="flex-1">
                <Header 
                    title="Farmer Profiles" 
                    rightIcon={
                        <TouchableOpacity 
                            onPress={() => setIsMapVisible(true)}
                            activeOpacity={0.7} 
                            className="bg-white/10 p-2 rounded-full"
                        >
                            <MapIcon color="#ffffff" size={20} />
                        </TouchableOpacity>
                    }
                />

                <View className="flex-1 bg-[#f0f4f1]">
                    <FlatList
                        data={visibleData}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        ItemSeparatorComponent={ItemSeparator}
                        ListHeaderComponent={
                            <ListHeader
                                query={query}
                                onChangeText={handleSearch}
                                onFilterPress={() => console.log('Open filter')}
                                total={filtered.length}
                            />
                        }
                        ListFooterComponent={<ListFooter loading={loadingMore} hasMore={hasMore} />}
                        ListEmptyComponent={<EmptyState query={query} />}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#1e4a3b"
                                colors={['#1e4a3b']}
                            />
                        }
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.4}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        removeClippedSubviews
                        maxToRenderPerBatch={5}
                        windowSize={10}
                        initialNumToRender={5}
                        getItemLayout={(_, index) => ({
                            length: 170,
                            offset: 170 * index,
                            index,
                        })}
                    />
                </View>

                {/* Map Window Modal */}
                <Modal
                    visible={isMapVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsMapVisible(false)}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="h-[80%] bg-white rounded-t-3xl overflow-hidden shadow-2xl">
                            <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
                                <Text className="text-lg font-bold text-[#1a2e22]">Farmers Map View</Text>
                                <TouchableOpacity 
                                    onPress={() => setIsMapVisible(false)}
                                    className="p-1.5 bg-gray-100 rounded-full"
                                >
                                    <X color="#6b7280" size={20} />
                                </TouchableOpacity>
                            </View>
                            <View className="flex-1 bg-[#f0f4f1] overflow-hidden rounded-b-3xl relative">
                                <Map
                                    style={{ flex: 1 }}
                                    mapStyle="https://tiles.openfreemap.org/styles/liberty"
                                    logo={false}
                                    attribution={false}
                                >
                                    <Camera
                                        zoomLevel={6}
                                        centerCoordinate={[79.7400, 15.9129]}
                                    />
                                    {filtered.map(farmer => (
                                        <Marker
                                            key={farmer.id}
                                            id={farmer.id}
                                            lngLat={[farmer.longitude, farmer.latitude]}
                                            onPress={() => {
                                                setIsMapVisible(false);
                                                navigation.navigate('FarmerProfileWindow', { userId: farmer.id });
                                            }}
                                        >
                                            <View className="w-8 h-8 rounded-full bg-emerald-500 items-center justify-center border-2 border-white overflow-hidden shadow-sm">
                                                <Image 
                                                    source={{ uri: farmer.avatar }}
                                                    style={{ width: '100%', height: '100%' }}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                        </Marker>
                                    ))}
                                </Map>

                                <View className="absolute bottom-6 left-6 right-6 bg-white/95 p-4 rounded-xl shadow-sm border border-gray-200 pointer-events-none">
                                    <Text className="text-[#1e4a3b] font-bold text-center mb-1">Interactive Map</Text>
                                    <Text className="text-gray-500 text-xs text-center">
                                        Showing {filtered.length} farmers in your region
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}