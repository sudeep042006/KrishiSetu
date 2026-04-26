import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

// Import local navigators
import BuyerBottomTabs from './BuyerBottomTabs';

// Import Screens from Offtaker
import OfftakerWallet from '../pages/homescreen/offtaker/wallet';
import FarmerProfilesScreen from '../pages/homescreen/offtaker/FarmerProfiles';
import ProfileScreen from '../pages/homescreen/offtaker/profile';
import SettingsScreen from '../pages/homescreen/offtaker/settings'; 
import MessageScreen from '../pages/homescreen/offtaker/message';
import MessageWindowScreen from '../pages/homescreen/offtaker/messageWindow';
import FarmerProfileWindowScreen from '../pages/homescreen/offtaker/farmerProfileWindow';
import FarmerProfile from '../pages/homescreen/offtaker/FarmerProfiles'
import CropsPage from '../pages/homescreen/offtaker/CropsPage';
import CropWindow from '../pages/homescreen/offtaker/cropWindow';
import OfftakerOrders from '../pages/homescreen/offtaker/orders';
import CropPriceScreen from '../pages/homescreen/offtaker/cropPrice';
import PostRequest from '../pages/homescreen/offtaker/PostRequest';
import OfftakerMarketplace from '../pages/homescreen/offtaker/marketPlace';

const Drawer = createDrawerNavigator();

function CustomBuyerDrawerContent(props) {
    const { isDarkMode } = React.useContext(ThemeContext);
    const theme = {
        primary: '#1e3a8a', // Deep Professional Blue for Offtakers
        bg: isDarkMode ? '#0f172a' : '#ffffff',
        text: isDarkMode ? '#f8fafc' : '#0f172a',
        muted: isDarkMode ? '#94a3b8' : '#64748b',
        activeBg: isDarkMode ? 'rgba(30, 58, 138, 0.15)' : 'rgba(30, 58, 138, 0.1)',
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
            {/* Minimalist Blue Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={styles.headerTitle}>KrishiSetu</Text>
                <Text style={styles.headerSubtitle}>Procurement Portal</Text>
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
                <View style={styles.drawerItemsSection}>
                    <DrawerItem
                        label="Marketplace"
                        onPress={() => navigation.navigate('BuyerMainTabs')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('BuyerMainTabs')}
                    />
                    <DrawerItem
                        label="Explore Crops"
                        onPress={() => navigation.navigate('CropsPage')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('CropsPage')}
                    />
                    <DrawerItem
                        label="Market Prices"
                        onPress={() => navigation.navigate('CropPriceScreen')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('CropPriceScreen')}
                    />
                    <DrawerItem
                        label="Post Buy Request"
                        onPress={() => navigation.navigate('PostRequest')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('PostRequest')}
                    />
                    <DrawerItem
                        label="Active Orders"
                        onPress={() => navigation.navigate('OfftakerOrders')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('OfftakerOrders')}
                    />
                    <DrawerItem
                        label="Wallet & Billing"
                        onPress={() => navigation.navigate('Wallet')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor={theme.primary}
                        inactiveTintColor={theme.muted}
                        activeBackgroundColor={theme.activeBg}
                        focused={isActive('Wallet')}
                    />
                </View>
            </DrawerContentScrollView>

            {/* Bottom Section */}
            <View style={[styles.bottomSection, { borderTopColor: theme.border }]}>
                <DrawerItem
                    label="User Profile"
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

export default function BuyerDrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomBuyerDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: 280,
                },
            }}
        >
            <Drawer.Screen name="BuyerMainTabs" component={BuyerBottomTabs} />
            <Drawer.Screen name="CropWindow" component={CropWindow} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="CropPriceScreen" component={CropPriceScreen} />
            <Drawer.Screen name="Farmer Profile" component={FarmerProfile} />
            <Drawer.Screen name="CropsPage" component={CropsPage} />
            <Drawer.Screen name="PostRequest" component={PostRequest} />
            <Drawer.Screen name="OfftakerOrders" component={OfftakerOrders} />
            <Drawer.Screen name="Wallet" component={OfftakerWallet} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
            <Drawer.Screen name="Message" component={MessageScreen} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="MessageWindow" component={MessageWindowScreen} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="FarmerProfileWindow" component={FarmerProfileWindowScreen} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="Marketplace" component={OfftakerMarketplace} options={{ drawerItemStyle: { display: 'none' } }} />
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
