import './global.css';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens here
import LoginScreen from './components/pages/auth/login';
import RegisterScreen from './components/pages/auth/register';
import HomeScreen from './components/pages/main/Home';
import LandingPage from './components/pages/main/LandingPage';

const Stack = createNativeStackNavigator();

export default function App() {
  // Authentication state (set to false initially)
  // When user logs in successfully, you can change this to true
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      {/* Hide the top header by default for a cleaner look */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* Protected Screens (Only when logged in) */}
        {isAuthenticated ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          /* Public Auth Screens (Only when logged out) */
          <>
            <Stack.Screen name="Landing" component={LandingPage} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}