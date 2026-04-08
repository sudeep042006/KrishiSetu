import './global.css';
import React, { useState, createContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
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
  const [userRole, setUserRole] = useState(null);

  // ✅ NEW: This is the "loading" state
  // While we check AsyncStorage, we show nothing (or a spinner)
  // This prevents the login screen from flashing briefly on startup
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ✅ NEW: On every app start, check if a token exists
  useEffect(() => {
    const checkStoredLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const role = await AsyncStorage.getItem('userRole');

        if (token && role) {
          // Token found → user is already logged in
          setUserRole(role);
          setIsAuthenticated(true);
        }
        // If no token → isAuthenticated stays false → Login screen shows
      } catch (error) {
        console.error('Error reading auth from storage:', error);
      } finally {
        // Whether token found or not, we're done checking
        setIsCheckingAuth(false);
      }
    };

    checkStoredLogin();
  }, []); // ← empty array means: run once when app starts

  const authContext = {
    login: (role) => {
      // Token already saved in api.js — just update the state here
      setUserRole(role);
      setIsAuthenticated(true);
    },
    logout: async () => {
      // ✅ NEW: Clear the permanent storage on logout
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
    <SafeAreaProvider>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>

            {isAuthenticated ? (
              userRole === 'Farmer' ? (
                <Stack.Screen name="FarmerApp" component={FarmerDrawerNavigator} />
              ) : (
                <Stack.Screen name="OfftakerHome" component={OfftakerHome} />
              )
            ) : (
              <>
                <Stack.Screen name="Landing" component={LandingPage} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            )}

          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
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