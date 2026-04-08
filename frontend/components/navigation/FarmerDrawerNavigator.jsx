import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text } from 'react-native';

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

const Drawer = createDrawerNavigator();

export default function FarmerDrawerNavigator() {
    return (
        <Drawer.Navigator
            initialRouteName="FarmerMainTabs"
            screenOptions={{
                headerShown: false,
                drawerActiveBackgroundColor: '#e9f5ef',
                drawerActiveTintColor: '#1e4a3b',
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
                name="FarmerMainTabs" 
                component={FarmerBottomTabs} 
                options={{ drawerLabel: 'Home' }} 
            />
            
            <Drawer.Screen name="Crop List" component={CropListScreen} />
            <Drawer.Screen name="Crop Project" component={CropProjectScreen} />
            <Drawer.Screen name="Crop Disease" component={CropDiseaseScreen} />
            <Drawer.Screen name="Orders" component={OrdersScreen} />
            <Drawer.Screen name="Offtaker Profiles" component={OfftakerProfilesScreen} />
            <Drawer.Screen name="Wallet" component={WalletScreen} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
        </Drawer.Navigator>
    );
}
