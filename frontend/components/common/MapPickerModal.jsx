import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
    PermissionsAndroid
} from 'react-native';
import {
    Map,
    Camera,
    Marker
} from '@maplibre/maplibre-react-native';
import Geolocation from 'react-native-geolocation-service';

const MapPickerModal = ({ visible, onClose, onLocationSelected, initialLocation }) => {
    const [selectedCoords, setSelectedCoords] = useState(initialLocation || null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        if (visible) {
            requestLocationPermission();
        }
    }, [visible]);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getCurrentLocation();
                }
            } catch (err) {
                console.warn(err);
            }
        } else {
            getCurrentLocation();
        }
    };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([longitude, latitude]);
                if (!selectedCoords) {
                    setSelectedCoords([longitude, latitude]);
                }
            },
            (error) => console.log("Location Error:", error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    // The correct way to read a tap event from MapLibre React Native:
    // event.nativeEvent.lngLat is [longitude, latitude]
    const handleMapPress = (event) => {
        const lngLat = event?.nativeEvent?.lngLat;
        if (lngLat && Array.isArray(lngLat) && lngLat.length === 2) {
            setSelectedCoords(lngLat);
        }
    };

    const handleConfirm = () => {
        if (selectedCoords) {
            onLocationSelected({
                lng: selectedCoords[0],
                lat: selectedCoords[1]
            });
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Pick HQ Location</Text>
                            <Text style={styles.subtitle}>Tap anywhere on the map</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={{ fontSize: 18, color: '#64748b' }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Map */}
                    <View style={styles.mapContainer}>
                        <Map
                            style={styles.map}
                            mapStyle="https://tiles.openfreemap.org/styles/liberty"
                            logo={false}
                            attribution={false}
                            onPress={handleMapPress}
                            onLongPress={handleMapPress}
                            onDidFinishLoadingStyle={() => setMapLoaded(true)}
                        >
                            <Camera
                                zoomLevel={12}
                                centerCoordinate={selectedCoords || userLocation || [78.9629, 20.5937]}
                                animationMode="flyTo"
                            />

                            {selectedCoords && (
                                <Marker
                                    id="pin"
                                    lngLat={selectedCoords}
                                    anchor="bottom"
                                >
                                    <View>
                                        <Text style={{ fontSize: 40 }}>📍</Text>
                                    </View>
                                </Marker>
                            )}
                        </Map>

                        {!mapLoaded && (
                            <View style={styles.loaderContainer}>
                                <ActivityIndicator size="large" color="#1e4e8c" />
                            </View>
                        )}

                        {/* My Location button */}
                        <TouchableOpacity style={styles.locateButton} onPress={getCurrentLocation}>
                            <Text style={{ fontSize: 22 }}>🎯</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.coordsRow}>
                            <Text style={styles.coordsLabel}>📌  SELECTED</Text>
                            <Text style={styles.coordsText}>
                                {selectedCoords
                                    ? `${selectedCoords[1].toFixed(5)}, ${selectedCoords[0].toFixed(5)}`
                                    : 'Tap the map to select'}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.confirmButton, !selectedCoords && styles.disabledButton]}
                            onPress={handleConfirm}
                            disabled={!selectedCoords}
                        >
                            <Text style={styles.confirmText}>
                                {selectedCoords ? '✓  Confirm Location' : 'Select a location first'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#fff',
        height: '87%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 19,
        fontWeight: '900',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    closeButton: {
        backgroundColor: '#f1f5f9',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locateButton: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#fff',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    coordsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
        gap: 10,
    },
    coordsLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: '#94a3b8',
        letterSpacing: 0.8,
    },
    coordsText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1e4e8c',
        flex: 1,
    },
    confirmButton: {
        backgroundColor: '#1e4e8c',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#cbd5e1',
        elevation: 0,
    },
    confirmText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    }
});

export default MapPickerModal;
