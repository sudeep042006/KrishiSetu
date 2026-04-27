import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    DeviceEventEmitter,
    Dimensions
} from 'react-native';
import { Sparkles, X, Bot } from 'lucide-react-native';
import { ThemeContext } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function AplaSarthi() {
    const { isDarkMode } = useContext(ThemeContext);
    const [visible, setVisible] = useState(false);
    const [currentRoute, setCurrentRoute] = useState('Home');

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('openAplaSarthi', () => {
            setVisible(true);
        });
        const routeSub = DeviceEventEmitter.addListener('onRouteChange', (routeName) => {
            setCurrentRoute(routeName);
        });
        return () => {
            sub.remove();
            routeSub.remove();
        };
    }, []);

    const isHome = currentRoute === 'Home';
    const bg = isDarkMode ? '#0f172a' : '#ffffff';
    const textColor = isDarkMode ? '#f8fafc' : '#1e293b';

    return (
        <>
            {/* Floating Action Button - Only on Home Page */}
            {isHome && (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setVisible(true)}
                    style={styles.fab}
                >
                    <View style={styles.fabInner}>
                        <Sparkles size={24} color="#fff" />
                        <Text style={styles.fabText}>Apla Sarthi</Text>
                    </View>
                </TouchableOpacity>
            )}

            <Modal
                visible={visible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={[styles.card, { backgroundColor: bg }]}>
                        <View style={styles.header}>
                            <View style={styles.iconCircle}>
                                <Bot size={24} color="#fff" />
                            </View>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <X size={24} color={textColor} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.content}>
                            <Text style={[styles.title, { color: textColor }]}>Apla Sarthi</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>COMING SOON</Text>
                            </View>
                            <Text style={styles.description}>
                                Our intelligent AI assistant is currently being trained to serve you better. Stay tuned for expert agricultural advice!
                            </Text>
                            
                            <TouchableOpacity 
                                style={styles.button}
                                onPress={() => setVisible(false)}
                            >
                                <Text style={styles.buttonText}>Got it!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        backgroundColor: '#123524',
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 999,
    },
    fabInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8
    },
    fabText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    card: {
        width: '90%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#123524',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        alignItems: 'center',
        width: '100%'
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8
    },
    badge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#fbbf24'
    },
    badgeText: {
        color: '#b45309',
        fontSize: 12,
        fontWeight: '800'
    },
    description: {
        textAlign: 'center',
        fontSize: 15,
        color: '#64748b',
        lineHeight: 22,
        marginBottom: 30
    },
    button: {
        backgroundColor: '#123524',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16
    }
});
