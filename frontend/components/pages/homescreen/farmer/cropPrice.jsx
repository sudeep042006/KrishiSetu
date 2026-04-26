import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../common/Header';
import { fetchLiveCropPrices } from '../../service/api';
import MapPickerModal from '../../../common/MapPickerModal';

// ── Reverse geocode via Nominatim ────────────────────────────────────────────
const reverseGeocode = async (lat, lng) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'CropPriceApp/1.0' } }
        );
        const data = await res.json();
        const addr = data?.address || {};
        // Prioritize state_district as it usually maps to the 'District' used in crop prices
        let result = addr.state_district || addr.county || addr.city || addr.town || addr.village || '';
        
        // Clean up common suffixes that might prevent a match (e.g., "Nagpur District" -> "Nagpur")
        return result.replace(/\s+(District|Taluka|Tehsil|Subdivision)$/i, '').trim();
    } catch {
        return '';
    }
};

// ── Price Card ───────────────────────────────────────────────────────────────
const PriceCard = ({ item }) => {
    const date = item.arrivalDate
        ? new Date(item.arrivalDate).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
          })
        : '—';

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardCrop}>{item.commodity}</Text>
                    <Text style={styles.cardLocation}>
                        📍 {item.market}, {item.district}
                    </Text>
                </View>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>{date}</Text>
                </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.priceRow}>
                <View style={styles.priceBlock}>
                    <Text style={styles.priceLabel}>Min Price</Text>
                    <Text style={styles.priceAmt}>₹{item.minPrice}</Text>
                    <Text style={styles.priceUnit}>/qtl</Text>
                </View>

                <View style={styles.priceVDivider} />

                <View style={styles.priceBlock}>
                    <Text style={styles.priceLabel}>Max Price</Text>
                    <Text style={styles.priceAmt}>₹{item.maxPrice}</Text>
                    <Text style={styles.priceUnit}>/qtl</Text>
                </View>

                <View style={styles.priceVDivider} />

                <View style={[styles.priceBlock, styles.highlightBlock]}>
                    <Text style={[styles.priceLabel, { color: 'rgba(255,255,255,0.65)' }]}>
                        Modal Price
                    </Text>
                    <Text style={[styles.priceAmt, { color: '#fff', fontSize: 18 }]}>
                        ₹{item.modalPrice}
                    </Text>
                    <Text style={[styles.priceUnit, { color: 'rgba(255,255,255,0.6)' }]}>/qtl</Text>
                </View>
            </View>
        </View>
    );
};

// ── List Header (Defined outside to fix keyboard focus loss) ─────────────────
const ListHeader = ({ 
    searchDistrict, 
    setSearchDistrict, 
    searchCrop, 
    setSearchCrop, 
    onSearch, 
    setMapVisible, 
    geocoding, 
    lastUpdated 
}) => (
    <>
        <View style={styles.formBox}>
            <Text style={styles.fieldLabel}>District / Region</Text>
            <View style={styles.inputRow}>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Enter district or region"
                    placeholderTextColor="#aaa"
                    value={geocoding ? 'Detecting location…' : searchDistrict}
                    onChangeText={setSearchDistrict}
                    editable={!geocoding}
                />
                <TouchableOpacity
                    style={styles.mapBtn}
                    onPress={() => setMapVisible(true)}
                    activeOpacity={0.8}
                >
                    {geocoding
                        ? <ActivityIndicator size="small" color={PRIMARY_GREEN} />
                        : <Text style={styles.mapBtnIcon}>🗺️</Text>
                    }
                </TouchableOpacity>
            </View>
            <Text style={styles.fieldHint}>Type your district or pick on map</Text>

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Crop / Seed Type</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Wheat, Soybean, Cotton"
                placeholderTextColor="#aaa"
                value={searchCrop}
                onChangeText={setSearchCrop}
            />

            <TouchableOpacity
                style={styles.searchBtn}
                onPress={onSearch}
                activeOpacity={0.85}
            >
                <Text style={styles.searchBtnText}>🔍  Search Prices</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Market Prices</Text>
            {lastUpdated && (
                <Text style={styles.sectionSub}>
                    Updated{' '}
                    {lastUpdated.toLocaleTimeString('en-IN', {
                        day: '2-digit', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                    })}
                </Text>
            )}
        </View>
    </>
);

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function CropPriceScreen() {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchDistrict, setSearchDistrict] = useState('Nagpur');
    const [searchCrop, setSearchCrop] = useState('');
    const [mapVisible, setMapVisible] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchPrices = async (district = searchDistrict, crop = searchCrop) => {
        setLoading(true);
        try {
            const data = await fetchLiveCropPrices(district, crop);
            setPrices(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching prices:', error);
            if (error?.response?.status === 404) {
                setPrices([]);
            } else {
                const errMsg = error?.response?.data?.message || error.message || 'Unknown error';
                Alert.alert('Search Error', `Could not fetch prices: ${errMsg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPrices(); }, []);

    const handleLocationPicked = async ({ lat, lng }) => {
        setGeocoding(true);
        const district = await reverseGeocode(lat, lng);
        if (district) setSearchDistrict(district);
        setGeocoding(false);
    };

    return (
        <View style={{ flex: 1, backgroundColor: PRIMARY_GREEN }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <Header title="Live Crop Prices" />

                <View style={styles.body}>
                    {loading ? (
                        <>
                            <ListHeader 
                                searchDistrict={searchDistrict}
                                setSearchDistrict={setSearchDistrict}
                                searchCrop={searchCrop}
                                setSearchCrop={setSearchCrop}
                                onSearch={() => fetchPrices()}
                                setMapVisible={setMapVisible}
                                geocoding={geocoding}
                                lastUpdated={lastUpdated}
                            />
                            <View style={styles.loaderWrap}>
                                <ActivityIndicator size="large" color={PRIMARY_GREEN} />
                                <Text style={styles.loaderText}>Fetching prices…</Text>
                            </View>
                        </>
                    ) : (
                        <FlatList
                            data={prices}
                            keyExtractor={(item) => item._id?.toString() ?? String(Math.random())}
                            renderItem={({ item }) => <PriceCard item={item} />}
                            ListHeaderComponent={
                                <ListHeader 
                                    searchDistrict={searchDistrict}
                                    setSearchDistrict={setSearchDistrict}
                                    searchCrop={searchCrop}
                                    setSearchCrop={setSearchCrop}
                                    onSearch={() => fetchPrices()}
                                    setMapVisible={setMapVisible}
                                    geocoding={geocoding}
                                    lastUpdated={lastUpdated}
                                />
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyWrap}>
                                    <Text style={styles.emptyTitle}>No specific results</Text>
                                    <Text style={styles.emptySubTitle}>
                                        Try searching for a different district or crop.
                                    </Text>
                                </View>
                            }
                            ListFooterComponent={
                                prices.length > 0 ? (
                                    <View style={styles.footerNote}>
                                        <Text style={styles.footerNoteText}>
                                            ℹ️  Prices are indicative. Fallback results may show nearby regions.
                                        </Text>
                                    </View>
                                ) : null
                            }
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 32 }}
                        />
                    )}
                </View>
            </SafeAreaView>

            <MapPickerModal
                visible={mapVisible}
                onClose={() => setMapVisible(false)}
                onLocationSelected={handleLocationPicked}
                initialLocation={null}
            />
        </View>
    );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const PRIMARY_GREEN = '#123524'; 
const ACCENT_GREEN  = '#1e4a3b';
const BLACK = '#111111';
const WHITE = '#ffffff';

const styles = StyleSheet.create({
    body: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    formBox: {
        backgroundColor: WHITE,
        margin: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: PRIMARY_GREEN,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginBottom: 7,
    },
    fieldHint: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 5,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#f1f5f9',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: BLACK,
        backgroundColor: '#f8fafc',
    },
    mapBtn: {
        width: 50,
        height: 50,
        borderWidth: 1.5,
        borderColor: PRIMARY_GREEN,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: WHITE,
    },
    mapBtnIcon: {
        fontSize: 22,
    },
    searchBtn: {
        marginTop: 18,
        backgroundColor: PRIMARY_GREEN,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    searchBtnText: {
        color: WHITE,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        marginBottom: 10,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: BLACK,
    },
    sectionSub: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },
    card: {
        backgroundColor: WHITE,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        marginHorizontal: 14,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 14,
        paddingBottom: 12,
    },
    cardCrop: {
        fontSize: 15,
        fontWeight: '800',
        color: BLACK,
    },
    cardLocation: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 3,
    },
    dateBadge: {
        backgroundColor: '#f1f5f9',
        borderRadius: 6,
        paddingHorizontal: 9,
        paddingVertical: 5,
    },
    dateBadgeText: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '700',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    priceBlock: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
    },
    highlightBlock: {
        backgroundColor: PRIMARY_GREEN,
    },
    priceLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    priceAmt: {
        fontSize: 16,
        fontWeight: '900',
        color: BLACK,
    },
    priceUnit: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '600',
        marginTop: 1,
    },
    priceVDivider: {
        width: 1,
        backgroundColor: '#f1f5f9',
        alignSelf: 'stretch',
    },
    loaderWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        color: '#64748b',
        fontSize: 13,
        fontWeight: '600',
    },
    emptyWrap: {
        alignItems: 'center',
        paddingTop: 48,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: BLACK,
        marginBottom: 6,
    },
    emptySubTitle: {
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
    },
    footerNote: {
        marginHorizontal: 14,
        marginTop: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        backgroundColor: '#f8fafc',
    },
    footerNoteText: {
        fontSize: 11,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 17,
    },
});
