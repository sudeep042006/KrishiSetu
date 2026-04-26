import './global.css';
import React, { useState, createContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './services/supabase';
import apiClient from './components/pages/service/api';
import { ThemeProvider } from './context/ThemeContext';

// Import Screens
import LoginScreen from './components/pages/auth/login';
import RegisterScreen from './components/pages/auth/register';
import LandingPage from './components/pages/main/LandingPage';
import FarmerDrawerNavigator from './components/navigation/FarmerDrawerNavigator';
import BuyerDrawerNavigator from './components/navigation/BuyerDrawerNavigator';
import LandDetailsScreen from './components/pages/homescreen/farmer/LandDetails';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetworkStatus from './components/common/NetworkStatus';

export const AuthContext = createContext();

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // ✅ NEW: This is the "loading" state
  // While we check AsyncStorage, we show nothing (or a spinner)
  // This prevents the login screen from flashing briefly on startup
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ✅ NEW: On every app start, check if a token exists
  useEffect(() => {
    const checkStoredLogin = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn("Session error on startup (likely expired token), clearing storage...");
          await supabase.auth.signOut().catch(() => {});
          await AsyncStorage.multiRemove(['authToken', 'userRole', 'userId', 'userData', 'token', 'farmerId', 'farmerData']);
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          return;
        }

        const role = await AsyncStorage.getItem('userRole');
        const userId = await AsyncStorage.getItem('userId');

        if (session && role && userId) {
          // 🚀 OPTIMISTIC LOGIN: Go to app immediately
          setUserRole(role);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);

          // 🛡️ BACKGROUND CHECK: Verify the 25-day limit
          try {
            await apiClient.get(`/user/${userId}`);
            // Session is still valid, do nothing
          } catch (err) {
            if (err.response && err.response.data?.message === "SESSION_EXPIRED_25_DAYS") {
              Alert.alert("Session Expired", "25 days passed, re-login needed");
              await authContext.logout();
            }
          }
        } else {
          // No session or missing role
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Error reading auth from storage:', error);
        setIsCheckingAuth(false);
      }
    };

    checkStoredLogin();
  }, []);

  const authContext = {
    login: (role) => {
      // Token already saved in api.js — just update the state here
      setUserRole(role);
      setIsAuthenticated(true);
    },
    logout: async () => {
      // ✅ NEW: Sign out from Supabase (clears its storage)
      await supabase.auth.signOut();

      // Clear the permanent storage on logout
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userData');

      // Cleanup legacy keys if they exist
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('farmerId');
      await AsyncStorage.removeItem('farmerData');

      setUserRole(null);
      setIsAuthenticated(false);
    }
  };

  // ✅ NEW: While checking storage, show a simple spinner
  // This prevents the ugly flash of Login screen before auth check completes
  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eaf4ec' }}>
        <ActivityIndicator size="large" color="#346c53" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthContext.Provider value={authContext}>
          <NetworkStatus />
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>

              {isAuthenticated ? (
                userRole === 'Farmer' ? (
                  <Stack.Screen name="FarmerApp" component={FarmerDrawerNavigator} />
                ) : (
                  <Stack.Screen name="OfftakerApp" component={BuyerDrawerNavigator} />
                )
              ) : (
                <>
                  <Stack.Screen name="Landing" component={LandingPage} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                  <Stack.Screen name="LandDetails" component={LandDetailsScreen} />
                </>
              )}

            </Stack.Navigator>
          </NavigationContainer>
        </AuthContext.Provider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}































/* import './global.css';
import React, { useState, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens here
import LoginScreen from './components/pages/auth/login';
import RegisterScreen from './components/pages/auth/register';
import LandingPage from './components/pages/main/LandingPage';
import FarmerDrawerNavigator from './components/navigation/FarmerDrawerNavigator';
import OfftakerHome from './components/pages/homescreen/offtaker/home';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const AuthContext = createContext();

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'Farmer' or 'Buyer'

  const authContext = {
    login: (role) => {
      setUserRole(role);
      setIsAuthenticated(true);
    },
    logout: () => {
      setUserRole(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>

            {isAuthenticated ? (
              /* Protected Route */
/*               userRole === 'Farmer' ? (
                <Stack.Screen name="FarmerApp" component={FarmerDrawerNavigator} />
              ) : (
                <Stack.Screen name="OfftakerHome" component={OfftakerHome} />
              )
            ) : (
              /* Public Auth Screens */
/*       <>
        <Stack.Screen name="Landing" component={LandingPage} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </>
    )} */

/*    </Stack.Navigator>
 </NavigationContainer>
</AuthContext.Provider>
</SafeAreaProvider>
);
} */ 