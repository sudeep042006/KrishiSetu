import './global.css';
import React, { useState, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens here
import LoginScreen from './components/pages/auth/login';
import RegisterScreen from './components/pages/auth/register';
import LandingPage from './components/pages/main/LandingPage';
import FarmerHome from './components/pages/homescreen/farmer/Home';
import OfftakerHome from './components/pages/homescreen/offtaker/home';

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
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>

          {isAuthenticated ? (
            /* Protected Route */
            userRole === 'Farmer' ? (
              <Stack.Screen name="FarmerHome" component={FarmerHome} />
            ) : (
              <Stack.Screen name="OfftakerHome" component={OfftakerHome} />
            )
          ) : (
            /* Public Auth Screens */
            <>
              <Stack.Screen name="Landing" component={LandingPage} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}