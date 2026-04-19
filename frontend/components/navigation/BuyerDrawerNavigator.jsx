import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Import local navigators
import BuyerBottomTabs from './BuyerBottomTabs';

// Import Screens from Offtaker
import OfftakerWallet from '../pages/homescreen/offtaker/wallet';
import FarmerProfilesScreen from '../pages/homescreen/offtaker/FarmerProfiles';
import ProfileScreen from '../pages/homescreen/offtaker/profile';
import SettingsScreen from '../pages/homescreen/farmer/settings'; // Settings is shared

const Drawer = createDrawerNavigator();

export default function BuyerDrawerNavigator() {
    return (
        <Drawer.Navigator
            initialRouteName="BuyerMainTabs"
            screenOptions={{
                headerShown: false,
                drawerActiveBackgroundColor: '#e0f2fe',
                drawerActiveTintColor: '#1e4e8c',
                drawerInactiveTintColor: '#4b5563',
                drawerStyle: {
                    backgroundColor: '#ffffff',
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
            
            {/* <Drawer.Screen 
                name="Sellers" 
                component={FarmerProfilesScreen} 
                options={{ drawerLabel: 'Trusted Sellers' }}
            /> */}
            
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
        </Drawer.Navigator>
    );
}
