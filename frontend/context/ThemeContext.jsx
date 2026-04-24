import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    // Load preference from storage
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        setColorScheme(storedTheme);
        setIsDarkMode(storedTheme === 'dark');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setColorScheme(newTheme);
    setIsDarkMode(!isDarkMode);
    await AsyncStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
