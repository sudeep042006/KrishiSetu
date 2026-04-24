import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StyleSheet } from 'react-native';
import { LayoutDashboard, Home, Search, Users, MessageSquare } from 'lucide-react-native';

// Import Screens from Offtaker
import OfftakerHome from '../pages/homescreen/offtaker/home';
import OfftakerMarketplace from '../pages/homescreen/offtaker/marketPlace';
import OfftakerDashboard from '../pages/homescreen/offtaker/dashboard';
import MessageScreen from '../pages/homescreen/offtaker/message';
import MessageWindowScreen from '../pages/homescreen/offtaker/messageWindow';
import FarmerProfileWindowScreen from '../pages/homescreen/offtaker/farmerProfileWindow';
import OfftakerProfileWindowScreen from '../pages/homescreen/farmer/offtakerProfilewindow';

const Tab = createBottomTabNavigator();

export default function BuyerBottomTabs() {
    const { isDarkMode } = useContext(ThemeContext);

    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: isDarkMode ? '#60a5fa' : '#1e4e8c', 
                tabBarInactiveTintColor: isDarkMode ? '#6b7280' : '#9ca3af',
                tabBarStyle: [styles.tabBar, { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }],
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.tabBarItem,
                tabBarIcon: ({ focused, color, size }) => {
                    let IconComponent;
                    size = 24;

                    if (route.name === 'Dashboard') IconComponent = LayoutDashboard;
                    else if (route.name === 'Home') IconComponent = Home;
                    else if (route.name === 'Marketplace') IconComponent = Users;
                    else if (route.name === 'Message') IconComponent = MessageSquare;

                    return (
                        <View className={`items-center justify-center p-2 rounded-full ${focused ? (isDarkMode ? 'bg-[#1e4e8c]/30' : 'bg-[#e0f2fe]') : 'bg-transparent'}`}>
                            <IconComponent color={color} size={size} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={OfftakerHome} />
            <Tab.Screen name="Marketplace" component={OfftakerMarketplace} options={{ tabBarLabel: 'Sellers' }} />
            <Tab.Screen name="Dashboard" component={OfftakerDashboard} />
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
