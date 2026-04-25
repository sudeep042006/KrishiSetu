import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView, Platform } from 'react-native';
import { WifiOff, AlertTriangle } from 'lucide-react-native';

const NetworkStatus = () => {
    const [isOffline, setIsOffline] = useState(false);
    const [animation] = useState(new Animated.Value(-100)); // Start off-screen

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Try to fetch a tiny resource with a short timeout
                const response = await fetch('https://www.google.com/favicon.ico', {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-store'
                });
                if (isOffline) setIsOffline(false);
            } catch (error) {
                if (!isOffline) setIsOffline(true);
            }
        };

        // Initial check
        checkConnection();

        // Periodic check every 5 seconds
        const interval = setInterval(checkConnection, 5000);

        return () => clearInterval(interval);
    }, [isOffline]);

    useEffect(() => {
        if (isOffline) {
            Animated.spring(animation, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 10
            }).start();
        } else {
            Animated.timing(animation, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true
            }).start();
        }
    }, [isOffline]);

    if (!isOffline && animation._value === -100) return null;

    return (
        <Animated.View 
            style={[
                styles.container, 
                { transform: [{ translateY: animation }] }
            ]}
        >
            <SafeAreaView>
                <View style={styles.content}>
                    <WifiOff size={18} color="#fff" />
                    <Text style={styles.text}>No Internet Connection</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Offline Mode</Text>
                    </View>
                </View>
            </SafeAreaView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ef4444', // Bright red
        zIndex: 9999,
        paddingTop: Platform.OS === 'ios' ? 0 : 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        marginLeft: 10,
        letterSpacing: 0.5,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 12,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
});

export default NetworkStatus;
