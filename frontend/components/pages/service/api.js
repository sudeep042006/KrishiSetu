import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { supabase } from '../../../services/supabase';

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
    return API_BASE_URL;
  } else {
    return API_BASE_URL;
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
/* apiClient.interceptors.request.use(async (config) => {
  // const token = await AsyncStorage.getItem('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error)); */

// In api.js
apiClient.interceptors.request.use(async (config) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting Supabase session:', error);
    }

    const token = session?.access_token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('Auth Header set from Supabase session');
    } else {
      // Fallback to AsyncStorage for any legacy reasons during transition
      const legacyToken = await AsyncStorage.getItem('authToken');
      if (legacyToken) {
        config.headers.Authorization = `Bearer ${legacyToken}`;
      }
    }
  } catch (err) {
    console.error('Interceptor session check failed:', err);
  }
  return config;
}, (error) => Promise.reject(error));

// Catch 401 Unauthorized errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("401 Unauthorized caught globally. Session might be expired.");
      // Optional: uncomment below to auto-logout on 401
      // await AsyncStorage.removeItem('authToken');
      // await AsyncStorage.removeItem('userId');
      // await AsyncStorage.removeItem('userData');
      // await AsyncStorage.removeItem('userRole');
      // Alert.alert("Session Expired", "Please log in again.");
    }
    return Promise.reject(error);
  }
);


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

      const response = await apiClient.post('auth/register', payload);
      return response.data;
    } catch (error) {
      console.error("API Error registering user:", error?.response?.data || error);
      throw error;
    }
  },

  loginUser: async (credentials) => {
    try {
      const payload = {
        email: credentials.mobileOrEmail,
        password: credentials.password,
        role: credentials.role === 'Farmer' ? 'farmer' : 'offtaker',
      };

      const response = await apiClient.post('auth/login', payload);
      console.log('LOGIN RESPONSE:', JSON.stringify(response.data));

      // ✅ NEW: Save token and role to permanent storage
      const token = response.data?.token;       // adjust if your backend uses different key
      const role = credentials.role;

      if (token) {
        // ✅ Session persistence handled by Supabase JS
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: response.data?.refreshToken
        });

        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userRole', role);
        if (response.data?.user) {
          await AsyncStorage.setItem('userId', String(response.data.user._id));
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      }

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

export const CompleteFarmerProfile = async (farmerData) => {
  const response = await apiClient.post('/farmer/profile', farmerData);
  return response.data;
}


export const farmerService = {
  getFarmers: async () => {
    const response = await apiClient.get('farmer/get');
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('farmer/profile');
    return response.data;
  },

  uploadProfilePhoto: async (imageUri, fileType = 'image/jpeg', fileName = 'profile.jpg') => {
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      type: fileType,
      name: fileName,
    });

    // We use fetch here because React Native's FormData works best with native fetch
    // when dealing with multipart/form-data boundaries, avoiding multer backend crashes.
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${BASE_URL}/farmer/profile-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    return await response.json();
  },

  searchFarmer: async (searchQueries) => {
    const response = await apiClient.post('farmer/search', searchQueries);
    return response.data;
  },

  updateFarmer: async (farmerId, updateData) => {
    const response = await apiClient.put(`farmer/update/${farmerId}`, updateData);
    return response.data;
  },



  getProfilePhotobyId: async (farmerId) => {
    const response = await apiClient.get(`farmer/profile-photo/${farmerId}`);
    return response.data;
  }
};

// ---------------------------------------------------------
// OFFTAKER SERVICES
// ---------------------------------------------------------

export const offtakerService = {
  getAllOfftakers: async () => {
    const response = await apiClient.get('offtaker/all');
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('offtaker/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.post('offtaker/profile', profileData);
    return response.data;
  },

  uploadPhoto: async (imageUri, fileType = 'image/jpeg', fileName = 'profile.jpg') => {
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      type: fileType,
      name: fileName,
    });

    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${BASE_URL}/offtaker/profile-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    return await response.json();
  }
};

// ---------------------------------------------------------
// PROJECT SERVICES
// ---------------------------------------------------------
export const CropService = {
  getProjects: async () => {
    const response = await apiClient.get('project/get');
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('project/getCategories');
    return response.data;
  },

  getProjectByCropName: async (cropName) => {
    const response = await apiClient.get(`project/getProjectByCropName?cropName=${cropName}`);
    return response.data;
  },

  getProjectByLocation: async (location) => {
    const response = await apiClient.get(`project/getProjectByLocation?location=${location}`);
    return response.data;
  },

  getProjectPhotoById: async (projectId) => {
    const response = await apiClient.get(`project/getPhoto/${projectId}`);
    return response.data;
  },

  updateProject: async (projectId, updateData) => {
    const response = await apiClient.post(`project/update/${projectId}`, updateData);
    return response.data;
  },

  deleteProject: async (projectId) => {
    const response = await apiClient.post(`project/deleteProject/${projectId}`);
    return response.data;
  },

  uploadProjectPhoto: async (projectId, imageUri, fileType = 'image/jpeg', fileName = 'project.jpg') => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('photo', {
      uri: imageUri,
      type: fileType,
      name: fileName,
    });

    // We use fetch here because React Native's FormData works best with native fetch
    // when dealing with multipart/form-data boundaries, avoiding multer backend crashes.
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${BASE_URL}/project/upload-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    return await response.json();
  },

  createProject: async (projectData) => {
    const response = await apiClient.post('project/create', projectData);
    return response.data;
  },
};

// ==========================================
// CROP PRICES ENDPOINTS
// ==========================================

export const fetchLiveCropPrices = async (district, commodity) => {
  try {
    // This will automatically append to your BASE_URL
    // Result: GET http://10.0.2.2:5000/api/crop-prices?district=Nagpur&commodity=Wheat
    const response = await apiClient.get('crop-prices', {
      params: {
        district: district,
        commodity: commodity
      }
    });

    return response.data;

  } catch (error) {
    throw error;
  }
};


// ---------------------------------------------------------
// PAYMENT SERVICES
// ---------------------------------------------------------
export const paymentService = {
  createOrder: async (paymentData) => {
    const response = await apiClient.post('payment/checkout', paymentData);
    return response.data;
  },
  verifyPayment: async (verificationData) => {
    const response = await apiClient.post('payment/verify', verificationData);
    return response.data;
  },
  getTransactions: async () => {
    const response = await apiClient.get('payment/history');
    return response.data;
  },
  getWalletDetails: async () => {
    const response = await apiClient.get('payment/wallet');
    return response.data;
  },
  addBankDetails: async (bankData) => {
    const response = await apiClient.post('payment/bank', bankData);
    return response.data;
  }
};

export const ProposalService = {
  createProposal: async (proposalData) => {
    const response = await apiClient.post('proposal/create', proposalData);
    return response.data;
  },
  getFarmerProposals: async () => {
    const response = await apiClient.get('proposal/farmer');
    return response.data;
  },
  getOfftakerProposals: async () => {
    const response = await apiClient.get('proposal/offtaker');
    return response.data;
  },
  updateProposalStatus: async (proposalId, status) => {
    const response = await apiClient.put(`proposal/${proposalId}/status`, { status });
    return response.data;
  }
};

export default apiClient;
