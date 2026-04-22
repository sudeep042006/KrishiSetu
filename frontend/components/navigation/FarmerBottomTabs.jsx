import React from 'react';
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
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: '#1e4a3b', // Deep green
                tabBarInactiveTintColor: '#9ca3af', // Gray
                tabBarStyle: styles.tabBar,
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
                        <View className={`items-center justify-center p-2 rounded-full ${focused ? 'bg-[#e9f5ef]' : 'bg-transparent'}`}>
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
        bottom: Platform.OS === 'ios' ? 24 : 16,
        left: 20,
        right: 20,
        backgroundColor: '#ffffff',
        borderRadius: 30,
        height: 72,
        paddingBottom: Platform.OS === 'ios' ? 22 : 12,
        paddingTop: 12,
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
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
