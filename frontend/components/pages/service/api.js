import axios from 'axios';
import { Platform } from 'react-native';

// ---------------------------------------------------------
// API CONFIGURATION
// ---------------------------------------------------------
// Android Emulator uses 10.0.2.2 to point to localhost.
// iOS Simulator uses localhost.
// Physical device needs your computer's local WiFi IP (e.g., 192.168.1.5).
const getBaseUrl = () => {
  // If you are running on a physical device, replace this IP with your computer's IP
  // Example: return 'http://192.168.1.100:5000/api/v1';
  
  if (Platform.OS === 'android') {
    return 'http://192.168.49.117:5000/api/v1';
  } else {
    return 'http://192.168.49.117:5000/api/v1';
  }
};

const BASE_URL = getBaseUrl();

// Create a single Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Interceptor for JWT tokens (Optional later)
apiClient.interceptors.request.use(async (config) => {
  // const token = await AsyncStorage.getItem('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// ---------------------------------------------------------
// AUTHENTICATION SERVICES
// ---------------------------------------------------------
export const authService = {
  registerUser: async (userData) => {
    try {
      // Map frontend fields to backend expected fields
      const payload = {
        name: userData.fullName,
        email: userData.email, // using email exclusively since backend requires it
        password: userData.password,
        role: userData.role === 'Farmer' ? 'farmer' : 'offtaker', // map Buyer to offtaker
      };
      
      const response = await apiClient.post('/auth/register', payload);
      return response.data;
    } catch (error) {
      console.error("API Error registering user:", error?.response?.data || error);
      throw error;
    }
  },

  loginUser: async (credentials) => {
    try {
      // Map frontend fields
      const payload = {
        email: credentials.mobileOrEmail, // The form takes mobile/email, but backend expects 'email'
        password: credentials.password,
        role: credentials.role === 'Farmer' ? 'farmer' : 'offtaker',
      };
      
      const response = await apiClient.post('/auth/login', payload);
      return response.data;
    } catch (error) {
      console.error("API Error logging in:", error?.response?.data || error);
      throw error;
    }
  }
};

// ---------------------------------------------------------
// FARMER SERVICES
// ---------------------------------------------------------
export const farmerService = {
  getFarmers: async () => {
    const response = await apiClient.get('/farmer/get');
    return response.data;
  },

  searchFarmer: async (searchQueries) => {
    const response = await apiClient.post('/farmer/search', searchQueries);
    return response.data;
  },

  updateFarmer: async (farmerId, updateData) => {
    const response = await apiClient.put(`/farmer/update/${farmerId}`, updateData);
    return response.data;
  },

  uploadProfilePhoto: async (imageUri, fileType = 'image/jpeg', fileName = 'profile.jpg') => {
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      type: fileType,
      name: fileName,
    });
    const response = await apiClient.post('/farmer/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};

export default apiClient;
