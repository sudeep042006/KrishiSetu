import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StyleSheet } from 'react-native';
import { LayoutDashboard, Home, ShoppingBag, MessageSquare } from 'lucide-react-native';

// Import Screens from Farmer
import DashboardScreen from '../pages/homescreen/farmer/dashboard';
import HomeScreen from '../pages/homescreen/farmer/Home';
import MarketplaceScreen from '../pages/homescreen/farmer/marketPlace';
import MessageScreen from '../pages/homescreen/farmer/message';
import MessageWindowScreen from '../pages/homescreen/farmer/messageWindow';
import OfftakerProfileWindowScreen from '../pages/homescreen/farmer/offtakerProfilewindow';
import FarmerProfileWindowScreen from '../pages/homescreen/offtaker/farmerProfileWindow';

const Tab = createBottomTabNavigator();

export default function FarmerBottomTabs() {
    const { isDarkMode } = useContext(ThemeContext);

    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: isDarkMode ? '#4ade80' : '#1e4a3b', 
                tabBarInactiveTintColor: isDarkMode ? '#6b7280' : '#9ca3af',
                tabBarStyle: [styles.tabBar, { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }],
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.tabBarItem,
                tabBarIcon: ({ focused, color, size }) => {
                    let IconComponent;
                    size = 24;

                    if (route.name === 'Dashboard') IconComponent = LayoutDashboard;
                    else if (route.name === 'Home') IconComponent = Home;
                    else if (route.name === 'Marketplace') IconComponent = ShoppingBag;
                    else if (route.name === 'Message') IconComponent = MessageSquare;

                    return (
                        <View className={`items-center justify-center p-2 rounded-full ${focused ? (isDarkMode ? 'bg-[#1e4a3b]/30' : 'bg-[#e9f5ef]') : 'bg-transparent'}`}>
                            <IconComponent color={color} size={size} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
            <Tab.Screen name="Message" component={MessageScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 12 : 8,
        left: 12,
        right: 12,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        height: 68,
        paddingBottom: Platform.OS === 'ios' ? 15 : 10,
        paddingTop: 10,
        borderTopWidth: 0,
        elevation: 8,
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
    tabBarItem: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});
