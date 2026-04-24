import User from "../models/User.js";
import FarmerProfile from "../models/FarmerProfile.js";
import OfftakerProfile from "../models/OfftakerProfile.js";

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if 25 days have passed since last login
        if (user.lastLogin) {
            const twentyFiveDaysInMs = 25 * 24 * 60 * 60 * 1000;
            const timePassed = Date.now() - new Date(user.lastLogin).getTime();
            
            if (timePassed > twentyFiveDaysInMs) {
                return res.status(401).json({ 
                    success: false, 
                    message: "SESSION_EXPIRED_25_DAYS",
                    details: "25 days passed, re-login needed" 
                });
            }
        }
        
        let profile = null;
        if (user.role === 'farmer') {
            profile = await FarmerProfile.findOne({ userId });
        } else if (user.role === 'buyer' || user.role === 'offtaker') {
            profile = await OfftakerProfile.findOne({ userId });
        }
        
        return res.status(200).json({ 
            success: true, 
            user, 
            profile 
        });
    } catch (error) {
        console.error("Get User Profile Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
