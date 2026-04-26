import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

// Import local navigators
import FarmerBottomTabs from './FarmerBottomTabs';

// Import Screens from Farmer
import CropListScreen from '../pages/homescreen/farmer/CropList';
import CropProjectScreen from '../pages/homescreen/farmer/CropProject';
import CropDiseaseScreen from '../pages/homescreen/farmer/cropDisease';
import OrdersScreen from '../pages/homescreen/farmer/orders';
import OfftakerProfilesScreen from '../pages/homescreen/farmer/offtakerProfiles';
import WalletScreen from '../pages/homescreen/farmer/wallet';
import ProfileScreen from '../pages/homescreen/farmer/profile';
import SettingsScreen from '../pages/homescreen/farmer/settings';
import WeatherScreen from '../pages/homescreen/farmer/weather';
import LandDetailsScreen from '../pages/homescreen/farmer/LandDetails';
import MessageScreen from '../pages/homescreen/farmer/message';
import MessageWindowScreen from '../pages/homescreen/farmer/messageWindow';
import OfftakerProfileWindowScreen from '../pages/homescreen/farmer/offtakerProfilewindow';
import FarmerProfileWindowScreen from '../pages/homescreen/offtaker/farmerProfileWindow';
import CropPriceScreen from '../pages/homescreen/farmer/cropPrice';
import RequestFromOfftaker from '../pages/homescreen/farmer/RequestFromOfftaker'; 

const Drawer = createDrawerNavigator();

function CustomFarmerDrawerContent(props) {
    const { isDarkMode } = React.useContext(ThemeContext);
    const theme = {
        primary: '#143d0f', // Deep Forest Green
        bg: isDarkMode ? '#0f172a' : '#ffffff',
        text: isDarkMode ? '#f8fafc' : '#0f172a',
        muted: isDarkMode ? '#94a3b8' : '#64748b',
        activeBg: isDarkMode ? 'rgba(20, 61, 15, 0.2)' : 'rgba(20, 61, 15, 0.1)',
        border: isDarkMode ? '#1e293b' : '#f1f5f9',
    };

    const navigation = props.navigation;
    const state = props.state;

    const isActive = (routeName) => {
        const currentRoute = state.routes[state.index];
        return currentRoute.name === routeName;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Simple Text-Only Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>KrishiSetu</Text>
                <Text style={styles.headerSubtitle}>Farmer Dashboard</Text>
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
                <View style={styles.drawerItemsSection}>
                    <DrawerItem
                        label="Dashboard"
                        onPress={() => navigation.navigate('FarmerMainTabs')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('FarmerMainTabs')}
                    />
                    <DrawerItem
                        label="My Crops"
                        onPress={() => navigation.navigate('Crops')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('Crops')}
                    />
                    <DrawerItem
                        label="Crop Prices"
                        onPress={() => navigation.navigate('Crop Prices')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('Crop Prices')}
                    />
                    <DrawerItem
                        label="Crop Health"
                        onPress={() => navigation.navigate('Crop Diseases')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('Crop Diseases')}
                    />
                    <DrawerItem
                        label="Buyer Directory"
                        onPress={() => navigation.navigate('Offtaker Profiles')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('Offtaker Profiles')}
                    />
                    <DrawerItem
                        label="Demands & Requests"
                        onPress={() => navigation.navigate('Requests')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('Requests')}
                    />
                    <DrawerItem
                        label="My Wallet"
                        onPress={() => navigation.navigate('Wallet')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('Wallet')}
                    />
                </View>
            </DrawerContentScrollView>

            {/* Bottom Pinned Section */}
            <View style={[styles.bottomSection, { borderTopColor: theme.border }]}>
                <DrawerItem
                    label="My Profile"
                    onPress={() => navigation.navigate('Profile')}
                    labelStyle={styles.drawerLabel}
                    activeTintColor={theme.primary}
                    inactiveTintColor={theme.muted}
                    activeBackgroundColor={theme.activeBg}
                    focused={isActive('Profile')}
                />
                <DrawerItem
                    label="Settings"
                    onPress={() => navigation.navigate('Settings')}
                    labelStyle={styles.drawerLabel}
                    activeTintColor={theme.primary}
                    inactiveTintColor={theme.muted}
                    activeBackgroundColor={theme.activeBg}
                    focused={isActive('Settings')}
                />
            </View>
        </View>
    );
}

export default function FarmerDrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomFarmerDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: 280,
                },
            }}
        >
            <Drawer.Screen name="FarmerMainTabs" component={FarmerBottomTabs} />
            <Drawer.Screen name="Crops" component={CropListScreen} />
            <Drawer.Screen name="Add Crops" component={CropProjectScreen} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="Crop Prices" component={CropPriceScreen} />
            <Drawer.Screen name="Crop Diseases" component={CropDiseaseScreen} />
            <Drawer.Screen name="Orders" component={OrdersScreen} options={{ drawerItemStyle: { display: 'none' }}} />
            <Drawer.Screen name="Offtaker Profiles" component={OfftakerProfilesScreen} />
            <Drawer.Screen name="Requests" component={RequestFromOfftaker} />
            <Drawer.Screen name="Wallet" component={WalletScreen} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
            <Drawer.Screen name="Weather" component={WeatherScreen} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="LandDetails" component={LandDetailsScreen} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="Message" component={MessageScreen} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="MessageWindow" component={MessageWindowScreen} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="OfftakerProfileWindow" component={OfftakerProfileWindowScreen} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="FarmerProfileWindow" component={FarmerProfileWindowScreen} options={{ drawerItemStyle: { display: 'none' } }} />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 60,
        paddingBottom: 30,
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '800',
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    drawerItemsSection: {
        paddingTop: 10,
    },
    drawerLabel: {
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 5,
    },
    bottomSection: {
        padding: 10,
        paddingBottom: 30,
        borderTopWidth: 1,
    },
});
