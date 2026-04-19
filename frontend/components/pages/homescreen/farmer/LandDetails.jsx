import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Linking,
    PermissionsAndroid,
    Platform,
    Alert,
    ActivityIndicator,
    Modal,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    MapPin,
    Sprout,
    Info,
    Navigation as NavIcon,
    Droplets,
    X,
    Locate,
    RouteIcon,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import {
    Map,
    Camera,
    GeoJSONSource,
    Layer,
    UserLocation,
} from '@maplibre/maplibre-react-native';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

const C = {
    bg: '#011a03',
    accent: '#10b981',
    surface: '#f5f9f6',
    textPrimary: '#022c22',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
};

// ─── Geocode an address string via Nominatim ───────────────────────────────────
async function geocodeAddress(query) {
    try {
        const encoded = encodeURIComponent(query);
        const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'KrishiSetuApp/1.0' },
        });
        const json = await res.json();
        if (json && json.length > 0) {
            return {
                lat: parseFloat(json[0].lat),
                lng: parseFloat(json[0].lon),
                displayName: json[0].display_name,
            };
        }
        return null;
    } catch (e) {
        console.warn('Geocoding error:', e.message);
        return null;
    }
}

// ─── Build a GeoJSON LineString from two [lng,lat] points ─────────────────────
function buildRouteLine(from, to) {
    return {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [from, to],
        },
        properties: {},
    };
}

// ─── Compute bounds that contain both points ────────────────────────────────────
function boundsFromPoints(points) {
    const lngs = points.map(p => p[0]);
    const lats = points.map(p => p[1]);
    const sw = [Math.min(...lngs), Math.min(...lats)];
    const ne = [Math.max(...lngs), Math.max(...lats)];
    return { ne, sw };
}

export default function LandDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const profileData = route.params?.profileData || {};

    // ── Farm coordinates (may be null) ────────────────────────────────────────
    const [farmCoord, setFarmCoord] = useState(
        (profileData.latitude && profileData.longitude)
            ? [profileData.longitude, profileData.latitude]
            : null
    );
    const [geocoding, setGeocoding] = useState(false);

    // ── User live location ────────────────────────────────────────────────────
    const [userCoords, setUserCoords] = useState(null);  // [lng, lat]
    const [mapReady, setMapReady] = useState(false);
    const [inAppNavVisible, setInAppNavVisible] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const cameraRef = useRef(null);
    const watchRef = useRef(null);

    // ── Geocode address if no saved coords ────────────────────────────────────
    useEffect(() => {
        if (farmCoord) return; // already have coords

        const parts = [profileData.village, profileData.district, profileData.state].filter(Boolean);
        if (parts.length === 0) return; // nothing to geocode

        setGeocoding(true);
        geocodeAddress(parts.join(', ') + ', India').then(result => {
            if (result) {
                setFarmCoord([result.lng, result.lat]);
            }
            setGeocoding(false);
        });
    }, []);

    const hasFarmCoord = !!farmCoord;

    // ── GeoJSON objects ────────────────────────────────────────────────────────
    const farmGeoJSON = hasFarmCoord ? {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: farmCoord }, properties: {} }],
    } : null;

    const routeGeoJSON = (hasFarmCoord && userCoords) ? buildRouteLine(userCoords, farmCoord) : null;

    // ── Permission helper ──────────────────────────────────────────────────────
    const requestPermission = useCallback(async () => {
        if (Platform.OS !== 'android') return true;
        const r = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Location Permission',
                message: 'KrishiSetu needs your GPS to show your position on the map.',
                buttonPositive: 'Allow',
                buttonNegative: 'Deny',
            }
        );
        return r === PermissionsAndroid.RESULTS.GRANTED;
    }, []);

    // ── Google Maps handler ────────────────────────────────────────────────────
    const handleGoogleMaps = async () => {
        setGoogleLoading(true);
        const granted = await requestPermission();
        if (!granted) {
            Alert.alert('Permission Denied', 'Location access is needed for navigation.');
            setGoogleLoading(false);
            return;
        }
        Geolocation.getCurrentPosition(
            ({ coords }) => {
                const { latitude: myLat, longitude: myLng } = coords;
                let url;
                if (hasFarmCoord) {
                    url = `https://www.google.com/maps/dir/?api=1&origin=${myLat},${myLng}&destination=${farmCoord[1]},${farmCoord[0]}&travelmode=driving`;
                } else {
                    url = `https://www.google.com/maps/?q=${myLat},${myLng}`;
                }
                Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Google Maps.'));
                setGoogleLoading(false);
            },
            (err) => {
                Alert.alert('GPS Error', 'Could not get your location. Check GPS settings.');
                console.warn(err.message);
                setGoogleLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
        );
    };

    // ── In-App navigation handler ──────────────────────────────────────────────
    const handleInAppNav = async () => {
        const granted = await requestPermission();
        if (!granted) {
            Alert.alert('Permission Denied', 'Location access is needed to show your position.');
            return;
        }
        setInAppNavVisible(true);
    };

    // ── Live location watch (active only when full-screen map is open) ─────────
    useEffect(() => {
        if (!inAppNavVisible) {
            if (watchRef.current !== null) {
                Geolocation.clearWatch(watchRef.current);
                watchRef.current = null;
            }
            setMapReady(false);
            return;
        }
        watchRef.current = Geolocation.watchPosition(
            ({ coords }) => setUserCoords([coords.longitude, coords.latitude]),
            (err) => console.warn('Watch error:', err.message),
            { enableHighAccuracy: true, distanceFilter: 3, interval: 2000, fastestInterval: 1500 }
        );
        return () => {
            if (watchRef.current !== null) {
                Geolocation.clearWatch(watchRef.current);
                watchRef.current = null;
            }
        };
    }, [inAppNavVisible]);

    // ── Auto-zoom: fit both user and farm when both are known ──────────────────
    useEffect(() => {
        if (!mapReady || !cameraRef.current) return;

        if (userCoords && hasFarmCoord) {
            // Both points known → fit bounds to show both
            const { ne, sw } = boundsFromPoints([userCoords, farmCoord]);
            cameraRef.current.fitBounds(ne, sw, 80, 1200);
        } else if (userCoords) {
            // Only user known → fly to user
            cameraRef.current.flyTo(userCoords, 800);
        } else if (hasFarmCoord) {
            // Only farm known → fly to farm
            cameraRef.current.flyTo(farmCoord, 800);
        }
    }, [userCoords, mapReady]);

    const crops = profileData.cropTypes || profileData.crops?.join(', ') || 'Not specified';

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>

                {/* ── Header ──────────────────────────────────────── */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft color="#fff" size={22} />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Land Details</Text>
                        <Text style={{ color: '#6ee7b7', fontSize: 12, marginTop: 1 }}>
                            {profileData.village
                                ? `${profileData.village}, ${profileData.district}`
                                : 'Farm location & specifications'}
                        </Text>
                    </View>
                    {geocoding && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <ActivityIndicator size="small" color="#6ee7b7" />
                            <Text style={{ color: '#6ee7b7', fontSize: 11 }}>Locating…</Text>
                        </View>
                    )}
                </View>

                <ScrollView
                    style={styles.scrollArea}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 60 }}
                >
                    {/* ── Mini Preview Map ──────────────────────────── */}
                    <View style={styles.mapContainer}>
                        {hasFarmCoord ? (
                            <Map
                                style={{ flex: 1 }}
                                mapStyle="https://tiles.openfreemap.org/styles/liberty"
                                logoEnabled={false}
                                attributionEnabled={false}
                                scrollEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                            >
                                <Camera zoomLevel={12} centerCoordinate={farmCoord} animationMode="none" />
                                <GeoJSONSource id="mGlow" data={farmGeoJSON}>
                                    <Layer id="mGlowL" type="circle" paint={{
                                        'circle-radius': 22,
                                        'circle-color': 'rgba(16,185,129,0.18)',
                                    }} />
                                </GeoJSONSource>
                                <GeoJSONSource id="mDot" data={farmGeoJSON}>
                                    <Layer id="mDotL" type="circle" paint={{
                                        'circle-radius': 10,
                                        'circle-color': '#10b981',
                                        'circle-stroke-width': 3,
                                        'circle-stroke-color': '#ffffff',
                                    }} />
                                </GeoJSONSource>
                            </Map>
                        ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#d1fae5' }}>
                                <Text style={{ fontSize: 32 }}>📍</Text>
                                <Text style={{ color: C.textPrimary, fontWeight: '700', marginTop: 8, fontSize: 13 }}>
                                    {geocoding ? 'Finding your farm location…' : 'No farm location saved'}
                                </Text>
                                <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }}>
                                    {geocoding ? 'Using address from your profile' : 'Update your profile with a village/district address'}
                                </Text>
                            </View>
                        )}

                        {/* Two navigation buttons */}
                        <View style={styles.navButtonsRow}>
                            <TouchableOpacity onPress={handleInAppNav} style={styles.inAppNavBtn}>
                                <Locate size={14} color="#fff" />
                                <Text style={styles.navBtnText}>In-App Nav</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleGoogleMaps}
                                disabled={googleLoading}
                                style={[styles.googleNavBtn, googleLoading && { opacity: 0.7 }]}
                            >
                                {googleLoading
                                    ? <ActivityIndicator size="small" color="#4285F4" />
                                    : <Text style={{ fontSize: 14, fontWeight: '900', color: '#4285F4' }}>G</Text>
                                }
                                <Text style={styles.googleNavBtnText}>
                                    {googleLoading ? 'Loading…' : 'Google Maps'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── Location banner ───────────────────────────── */}
                    <View style={styles.locationBanner}>
                        <Text style={styles.bannerLabel}>Farm Location</Text>
                        <Text style={styles.bannerAddress}>
                            {profileData.village
                                ? `Village ${profileData.village}, District ${profileData.district}, ${profileData.state}`
                                : 'Location not set — update your profile'}
                        </Text>
                        {hasFarmCoord && (
                            <Text style={styles.bannerCoords}>
                                {farmCoord[1].toFixed(5)}° N,  {farmCoord[0].toFixed(5)}° E
                                {!profileData.latitude && '  (geocoded from address)'}
                            </Text>
                        )}
                    </View>

                    {/* ── Farm Specifications ───────────────────────── */}
                    <View style={styles.section}>
                        <SectionLabel title="Farm Specifications" />
                        <View style={styles.specCard}>
                            <SpecRow icon={<Sprout size={18} color={C.accent} />} label="Total Land Area" value={`${profileData.landArea || '—'} Hectares`} />
                            <Divider />
                            <SpecRow icon={<MapPin size={18} color={C.accent} />} label="Location" value={profileData.village ? `${profileData.village}, ${profileData.district}, ${profileData.state}` : 'Not specified'} />
                            <Divider />
                            <SpecRow icon={<Info size={18} color={C.accent} />} label="Ownership" value="Owned Land — Verified" />
                            <Divider />
                            <SpecRow icon={<Droplets size={18} color={C.accent} />} label="Irrigation" value="Well & Canal" />
                        </View>
                    </View>

                    {/* ── Soil & Crop Info ────────────────────────────── */}
                    <View style={styles.section}>
                        <SectionLabel title="Soil & Crop Info" />
                        <InfoTile emoji="🪨" title="Soil Type" badge="Black Cotton Soil" desc="Ideal for cotton, wheat, and soybean. Retains moisture well during dry seasons." />
                        <InfoTile emoji="🌾" title="Crops Grown" badge={crops} desc="These crops are grown in rotation for maximum yield across seasons." />
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* ══════════════════════════════════════════════════════════
                FULL-SCREEN IN-APP NAVIGATION MODAL
            ══════════════════════════════════════════════════════════ */}
            <Modal
                visible={inAppNavVisible}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setInAppNavVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: '#000' }}>
                    <Map
                        style={{ flex: 1 }}
                        mapStyle="https://tiles.openfreemap.org/styles/liberty"
                        logoEnabled={false}
                        attributionEnabled={false}
                        onDidFinishLoadingStyle={() => setMapReady(true)}
                    >
                        <Camera
                            ref={cameraRef}
                            zoomLevel={14}
                            centerCoordinate={
                                userCoords
                                || farmCoord
                                || [78.9629, 20.5937] // fallback centre of India
                            }
                            animationMode="flyTo"
                            animationDuration={600}
                        />

                        {/* Built-in live user dot (blue) */}
                        <UserLocation visible renderMode="normal" />

                        {/* Farm marker (green) */}
                        {hasFarmCoord && farmGeoJSON && (
                            <>
                                <GeoJSONSource id="fsGlow" data={farmGeoJSON}>
                                    <Layer id="fsGlowL" type="circle" paint={{
                                        'circle-radius': 28,
                                        'circle-color': 'rgba(16,185,129,0.2)',
                                    }} />
                                </GeoJSONSource>
                                <GeoJSONSource id="fsDot" data={farmGeoJSON}>
                                    <Layer id="fsDotL" type="circle" paint={{
                                        'circle-radius': 12,
                                        'circle-color': '#10b981',
                                        'circle-stroke-width': 3,
                                        'circle-stroke-color': '#ffffff',
                                    }} />
                                </GeoJSONSource>
                            </>
                        )}

                        {/* Route dashed line between user and farm */}
                        {routeGeoJSON && (
                            <GeoJSONSource id="routeLine" data={routeGeoJSON}>
                                <Layer
                                    id="routeLineL"
                                    type="line"
                                    paint={{
                                        'line-color': '#10b981',
                                        'line-width': 3,
                                        'line-dasharray': [2, 2],
                                        'line-opacity': 0.85,
                                    }}
                                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                                />
                            </GeoJSONSource>
                        )}
                    </Map>

                    {/* Top bar */}
                    <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                        <View style={styles.fsHeader}>
                            <TouchableOpacity onPress={() => setInAppNavVisible(false)} style={styles.fsCloseBtn}>
                                <X size={20} color="#fff" />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fsTitleText}>Live Navigation</Text>
                                <Text style={styles.fsSubText}>
                                    {hasFarmCoord && userCoords
                                        ? '🔵 You  →  🟢 Farm'
                                        : hasFarmCoord
                                            ? '🟢 Farm shown — waiting for GPS…'
                                            : 'Showing your live location'}
                                </Text>
                            </View>
                        </View>
                    </SafeAreaView>

                    {/* Bottom action bar */}
                    <View style={styles.fsBottomBar}>
                        {/* Re-centre on me */}
                        <TouchableOpacity
                            style={styles.recentreBtn}
                            onPress={() => {
                                if (userCoords && cameraRef.current) {
                                    cameraRef.current.flyTo(userCoords, 500);
                                }
                            }}
                        >
                            <Locate size={18} color="#10b981" />
                            <Text style={styles.recentreBtnText}>My Location</Text>
                        </TouchableOpacity>

                        {/* Fit both in view */}
                        {hasFarmCoord && userCoords && (
                            <TouchableOpacity
                                style={styles.fitBtn}
                                onPress={() => {
                                    if (cameraRef.current) {
                                        const { ne, sw } = boundsFromPoints([userCoords, farmCoord]);
                                        cameraRef.current.fitBounds(ne, sw, 80, 900);
                                    }
                                }}
                            >
                                <NavIcon size={18} color="#fff" />
                                <Text style={styles.fitBtnText}>Show Route</Text>
                            </TouchableOpacity>
                        )}

                        {/* Fly to farm */}
                        {hasFarmCoord && (
                            <TouchableOpacity
                                style={styles.farmBtn}
                                onPress={() => {
                                    if (cameraRef.current) {
                                        cameraRef.current.flyTo(farmCoord, 700);
                                    }
                                }}
                            >
                                <Text style={{ fontSize: 16 }}>🌾</Text>
                                <Text style={styles.farmBtnText}>Farm</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* GPS lock indicator */}
                    {!userCoords && (
                        <View style={styles.gpsLoader}>
                            <ActivityIndicator color="#10b981" size="small" />
                            <Text style={styles.gpsLoaderText}>Getting your location…</Text>
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ title }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: C.accent, textTransform: 'uppercase', letterSpacing: 1 }}>
                {title}
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#d1fae5', marginLeft: 10 }} />
        </View>
    );
}

function SpecRow({ icon, label, value }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 }}>
            <View style={{ backgroundColor: '#f0fdf4', padding: 8, borderRadius: 10, marginRight: 14 }}>
                {icon}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    {label}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary, marginTop: 2 }}>{value}</Text>
            </View>
        </View>
    );
}

function Divider() {
    return <View style={{ height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 }} />;
}

function InfoTile({ emoji, title, badge, desc }) {
    return (
        <View style={styles.infoTile}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 }}>
                <Text style={{ fontSize: 22 }}>{emoji}</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: C.textPrimary, flex: 1 }}>{title}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText} numberOfLines={1}>{badge}</Text>
                </View>
            </View>
            <Text style={{ fontSize: 13, color: C.textSecondary, lineHeight: 19 }}>{desc}</Text>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.12)', padding: 8, borderRadius: 12 },
    scrollArea: {
        flex: 1,
        backgroundColor: C.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    mapContainer: { height: 290, backgroundColor: '#b7ddb0', position: 'relative' },
    navButtonsRow: {
        position: 'absolute',
        bottom: 14,
        right: 12,
        flexDirection: 'row',
        gap: 8,
    },
    inAppNavBtn: {
        backgroundColor: '#022c22',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 24,
        gap: 6,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
    navBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
    googleNavBtn: {
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 24,
        gap: 6,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 5,
    },
    googleNavBtnText: { color: '#1a1a1a', fontWeight: '700', fontSize: 12 },
    locationBanner: {
        backgroundColor: '#022c22',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    bannerLabel: { color: '#6ee7b7', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
    bannerAddress: { color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 20 },
    bannerCoords: { color: '#6ee7b7', fontSize: 11, marginTop: 4 },
    section: { paddingHorizontal: 16, paddingTop: 20 },
    specCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.border,
        overflow: 'hidden',
        marginBottom: 4,
    },
    infoTile: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: C.border,
    },
    badge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, maxWidth: 140 },
    badgeText: { fontSize: 11, fontWeight: '700', color: '#15803d' },

    // Full-screen nav overlay
    fsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: 'rgba(2,44,34,0.9)',
        gap: 12,
    },
    fsCloseBtn: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 12 },
    fsTitleText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    fsSubText: { color: '#6ee7b7', fontSize: 11, marginTop: 2 },
    fsBottomBar: {
        position: 'absolute',
        bottom: 30,
        left: 14,
        right: 14,
        flexDirection: 'row',
        gap: 8,
    },
    recentreBtn: {
        flex: 1,
        backgroundColor: '#022c22',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 18,
        gap: 6,
        elevation: 5,
    },
    recentreBtnText: { color: '#10b981', fontWeight: '800', fontSize: 13 },
    fitBtn: {
        flex: 1,
        backgroundColor: '#065f46',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 18,
        gap: 6,
        elevation: 5,
    },
    fitBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
    farmBtn: {
        flex: 1,
        backgroundColor: '#10b981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 18,
        gap: 6,
        elevation: 5,
    },
    farmBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
    gpsLoader: {
        position: 'absolute',
        top: SCREEN_H * 0.5 - 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(2,44,34,0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 24,
        gap: 8,
    },
    gpsLoaderText: { color: '#6ee7b7', fontWeight: '700', fontSize: 13 },
};
