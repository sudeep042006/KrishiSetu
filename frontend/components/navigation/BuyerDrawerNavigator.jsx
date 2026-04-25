import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ThemeContext } from '../../context/ThemeContext';

// Import local navigators
import BuyerBottomTabs from './BuyerBottomTabs';

// Import Screens from Offtaker
import OfftakerWallet from '../pages/homescreen/offtaker/wallet';
import FarmerProfilesScreen from '../pages/homescreen/offtaker/FarmerProfiles';
import ProfileScreen from '../pages/homescreen/offtaker/profile';
import SettingsScreen from '../pages/homescreen/offtaker/settings'; // Settings is shared
import MessageScreen from '../pages/homescreen/offtaker/message';
import MessageWindowScreen from '../pages/homescreen/offtaker/messageWindow';
import FarmerProfileWindowScreen from '../pages/homescreen/offtaker/farmerProfileWindow';
import FarmerProfile from '../pages/homescreen/offtaker/FarmerProfiles'
import CropsPage from '../pages/homescreen/offtaker/CropsPage';
import CropWindow from '../pages/homescreen/offtaker/cropWindow';
import OfftakerOrders from '../pages/homescreen/offtaker/orders';

const Drawer = createDrawerNavigator();

export default function BuyerDrawerNavigator() {
    const { isDarkMode } = React.useContext(ThemeContext);

    return (
        <Drawer.Navigator
            initialRouteName="BuyerMainTabs"
            screenOptions={{
                headerShown: false,
                drawerActiveBackgroundColor: isDarkMode ? '#1e4e8c' : '#e0f2fe',
                drawerActiveTintColor: isDarkMode ? '#ffffff' : '#1e4e8c',
                drawerInactiveTintColor: isDarkMode ? '#9ca3af' : '#4b5563',
                drawerStyle: {
                    backgroundColor: isDarkMode ? '#121212' : '#ffffff',
                    width: 280,
                },
                drawerLabelStyle: {
                    fontSize: 16,
                    fontWeight: '500',
                }
            }}
        >
            <Drawer.Screen
                name="BuyerMainTabs"
                component={BuyerBottomTabs}
                options={{ drawerLabel: 'Market Home' }}
            />
            <Drawer.Screen
                name="CropWindow"
                component={CropWindow}
                options={{ drawerItemStyle: { display: 'none' } }}
            />

            <Drawer.Screen
                name="Farmer Profile"
                component={FarmerProfile}
            />
            {/* <Drawer.Screen 
                name="Sellers" 
                component={FarmerProfilesScreen} 
                options={{ drawerLabel: 'Trusted Sellers' }}
            /> */}
            <Drawer.Screen 
                name="CropsPage" 
                component={CropsPage} 
                options={{ drawerLabel: 'Crops' }}
            />
            <Drawer.Screen
                name="OfftakerOrders"
                component={OfftakerOrders}
                options={{ drawerLabel: 'Orders' }}
            />

            <Drawer.Screen
                name="Wallet"
                component={OfftakerWallet}
                options={{ drawerLabel: 'Billing & Wallet' }}
            />

            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
            />

            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
            />
            <Drawer.Screen
                name="Message"
                component={MessageScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
            <Drawer.Screen
                name="MessageWindow"
                component={MessageWindowScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
            <Drawer.Screen
                name="FarmerProfileWindow"
                component={FarmerProfileWindowScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
           


        </Drawer.Navigator>
    );
}
