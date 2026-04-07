import axios from 'axios';

// ---------------------------------------------------------
// API CONFIGURATION
// ---------------------------------------------------------
// Here we define the base URL for our backend API.
// Note: If you are testing on an Android emulator, 'localhost' might not work.
// Use '10.0.2.2' for the Android emulator to connect to your computer's local backend.
const BASE_URL = process.env.BACKEND_API_URL || 'http://10.0.2.2:5000/api';

// Create an Axios instance. This is useful because it allows us to set defaults 
// for all our API calls (like the base URL, default headers, or timeout limits).
// You use this `apiClient` instead of standard `axios` going forward.
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// [OPTIONAL BUT RECOMMENDED] - Interceptors
// Think of interceptors like "middleware" for your frontend requests.
// You can use them to automatically attach a User Token (JWT) to EVERY request
// so you don't have to write it out 100 times.
apiClient.interceptors.request.use(async (config) => {
  // Example: Attach a JWT token for authentication, if stored in async storage
  // const token = await AsyncStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
}, (error) => {
  return Promise.reject(error);
});


// ---------------------------------------------------------
// API SERVICES EXAMPLES - HOW TO CREATE NEW ONES
// ---------------------------------------------------------
/*
  HOW TO ADD A NEW API USING AXIOS:
  1. Check what route and method your backend expects (e.g., router.post('/register', ...))
  2. Create an async function in the relevant Service object below.
  3. Use apiClient.get(), apiClient.post(), apiClient.put(), or apiClient.delete()
  4. Ensure you pass the correct data payload if it's a POST or PUT.
  
  Format for HTTP Methods in Axios:
  - GET: await apiClient.get('/endpoint')
  - POST: await apiClient.post('/endpoint', dataObj)
  - PUT: await apiClient.put('/endpoint/ID', dataObj)
  - DELETE: await apiClient.delete('/endpoint/ID')
*/

export const farmerService = {
  // Example 1: Creating/Registering data (POST Request)
  // Maps to Backend Route: router.post("/register", ...)
  registerFarmer: async (farmerData) => {
    try {
      // Axios automatically stringifies the JSON payload for you!
      const response = await apiClient.post('/farmer/register', farmerData);
      return response.data; // Axios wraps your backend response in a 'data' object
    } catch (error) {
      console.error("Error registering farmer:", error?.response?.data || error);
      throw error;
    }
  },

  // Example 2: Fetching all data (GET Request)
  // Maps to Backend Route: router.get("/get", ...)
  getFarmers: async () => {
    try {
      const response = await apiClient.get('/farmer/get');
      return response.data;
    } catch (error) {
      console.error("Error fetching farmers:", error?.response?.data || error);
      throw error;
    }
  },

  // Example 3: Searching data based on a query payload (POST Request)
  // Maps to Backend Route: router.post("/search", ...)
  searchFarmer: async (searchQueries) => {
    try {
      const response = await apiClient.post('/farmer/search', searchQueries);
      return response.data;
    } catch (error) {
      console.error("Error searching farmer:", error?.response?.data || error);
      throw error;
    }
  },

  // Example 4: Updating specific data by ID (PUT Request)
  // Maps to Backend Route: router.put("/update/:id", ...)
  updateFarmer: async (farmerId, updateData) => {
    try {
      // Use template literals (backticks ` ) to inject the dynamic ID directly into the URL
      const response = await apiClient.put(`/farmer/update/${farmerId}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating farmer:", error?.response?.data || error);
      throw error;
    }
  },

  // Example 5: Canceling/Deleting Data by ID (DELETE Request)
  // Note: Your backend doesn't show a delete route yet, but this is how you'd write it:
  deleteFarmer: async (farmerId) => {
    try {
       const response = await apiClient.delete(`/farmer/delete/${farmerId}`);
       return response.data;
    } catch (error) {
       console.error("Error deleting farmer:", error?.response?.data || error);
       throw error;
    }
  },

  // Example 6: Handling File Uploads (Images/Files) - MULTIPART FORM DATA
  // Maps to Backend Route: router.post("/profile-photo", authenticate, upload.single("photo"), ...)
  uploadProfilePhoto: async (imageUri, fileType = 'image/jpeg', fileName = 'profile.jpg') => {
    try {
      // For uploading files, you MUST use FormData
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: fileType,
        name: fileName,
      }); // 'photo' MUST match your backend's Multer upload.single('photo') setting

      // Pass the formData and override the default Content-Type header
      const response = await apiClient.post('/farmer/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading profile photo:", error?.response?.data || error);
      throw error;
    }
  }
};


// ---------------------------------------------------------
// ADD MORE SERVICES BELOW IF YOU CREATE NEW MODELS
// ---------------------------------------------------------
/*
export const productService = {
  getAllProducts: async () => {
    const response = await apiClient.get('/product/get');
    return response.data;
  },
  createProduct: async (productData) => {
    const response = await apiClient.post('/product/create', productData);
    return response.data;
  }
};
*/

// Finally, we export apiClient so it can be used directly if needed in other files
export default apiClient;
