import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text } from 'react-native';

// Import local navigators
import BuyerBottomTabs from './BuyerBottomTabs';

// Import Screens from Buyer
import dashboard from '../pages/homescreen/offtaker/dashboard';

const Drawer = createDrawerNavigator();

export default function BuyerDrawerNavigator() {
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
                name="BuyerMainTabs" 
                component={BuyerBottomTabs} 
                options={{ drawerLabel: 'Home' }} 
            />
            
            <Drawer.Screen name="Crops" component={CropListScreen} />
            <Drawer.Screen 
                name="Add Crops" 
                component={CropProjectScreen} 
                options={{ drawerItemStyle: { display: 'none' } }} 
            />
            <Drawer.Screen name="Crop Diseases" component={CropDiseaseScreen} />
            <Drawer.Screen name="Orders" component={OrdersScreen} />
            <Drawer.Screen name="Offtaker Profiles" component={OfftakerProfilesScreen} />
            <Drawer.Screen name="Wallet" component={WalletScreen} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
            <Drawer.Screen 
                name="Weather" 
                component={WeatherScreen} 
                options={{ drawerItemStyle: { display: 'none' } }} 
            />
        </Drawer.Navigator>
    );
}
