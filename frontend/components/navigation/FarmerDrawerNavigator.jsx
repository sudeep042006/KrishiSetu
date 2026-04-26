import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text } from 'react-native';
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

export default function FarmerDrawerNavigator() {
    const { isDarkMode } = React.useContext(ThemeContext);

    return (
        <Drawer.Navigator
            initialRouteName="FarmerMainTabs"
            screenOptions={{
                headerShown: false,
                drawerActiveBackgroundColor: isDarkMode ? '#1e4a3b' : '#e9f5ef',
                drawerActiveTintColor: isDarkMode ? '#ffffff' : '#1e4a3b',
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
                name="FarmerMainTabs"
                component={FarmerBottomTabs}
                options={{ drawerLabel: 'Home' }}
            />

            <Drawer.Screen name="Crops" component={CropListScreen} />
            <Drawer.Screen
                name="Add Crops"
                component={CropProjectScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
            <Drawer.Screen name="Crop Prices" component={CropPriceScreen} />
            <Drawer.Screen name="Crop Diseases" component={CropDiseaseScreen} />
            <Drawer.Screen name="Orders" component={OrdersScreen} 
                options={{ drawerItemStyle: { display: 'none' }}}
            />
            <Drawer.Screen name="Offtaker Profiles" component={OfftakerProfilesScreen} />
            <Drawer.Screen name="Requests" component={RequestFromOfftaker} />
            <Drawer.Screen name="Wallet" component={WalletScreen} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
            <Drawer.Screen
                name="Weather"
                component={WeatherScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
            <Drawer.Screen
                name="LandDetails"
                component={LandDetailsScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
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
                name="OfftakerProfileWindow"
                component={OfftakerProfileWindowScreen}
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
