import OfftakerProfile from "../models/OfftakerProfile.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import FarmerProfile from "../models/FarmerProfile.js";
import Project from "../models/Project.js";

const getOfftakerProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const profile = await OfftakerProfile.findOne({ userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: "Offtaker profile not found" });
        }
        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error("Get Offtaker Profile Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const completeOfftakerProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const profileData = req.body;

        let profile = await OfftakerProfile.findOne({ userId });

        if (profile) {
            // Update existing
            Object.assign(profile, profileData);
            profile.isProfileCompleted = true; // Mark as completed on fill
            await profile.save();
            return res.status(200).json({ success: true, message: "Profile updated", data: profile });
        }

        // Create new
        profile = new OfftakerProfile({
            userId,
            ...profileData,
            isProfileCompleted: true
        });

        await profile.save();
        return res.status(201).json({ success: true, message: "Profile created", data: profile });
    } catch (error) {
        console.error("Complete Offtaker Profile Error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

const uploadOfftakerPhoto = async (req, res) => {
    try {
        const userId = req.user._id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: "No photo provided" });
        }

        let profile = await OfftakerProfile.findOne({ userId });
        if (!profile) {
            // Create a shell profile so the photo can be securely linked without blocking
            profile = new OfftakerProfile({ userId });
        }

        if (profile.profilePhotoPublicId) {
            await cloudinary.uploader.destroy(profile.profilePhotoPublicId);
        }

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "offtaker_profiles" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(file.buffer);
        });

        profile.profilePhoto = result.secure_url;
        profile.profilePhotoPublicId = result.public_id;
        await profile.save();

        return res.status(200).json({
            success: true,
            message: "Photo uploaded",
            profilePhoto: profile.secure_url
        });
    } catch (error) {
        console.error("Upload Offtaker Photo Error:", error);
        return res.status(500).json({ success: false, message: "Upload failed" });
    }
};

const getProfilePhotobyId = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await OfftakerProfile.findOne({ userId: id });
        if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
        return res.status(200).json({ success: true, profilePhoto: profile.profilePhoto });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getAllCrops = async (req, res) => {
    try {
        // Fetch all projects where the creator is a farmer (listings available for buyers)
        const crops = await Project.find({ creatorRole: "farmer", status: "open" })
            .populate("createdBy", "name email");
        return res.status(200).json({ success: true, crops });
    } catch (error) {
        console.error("Get All Crops Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const searchCrops = async (req, res) => {
    try {
        const { cropName } = req.body;
        if (!cropName) {
            return res.status(400).json({ success: false, message: "Crop name is required" });
        }
        const regex = new RegExp(cropName, "i");
        // Search projects by crop name for farmer listings
        const crops = await Project.find({ 
            cropName: regex, 
            creatorRole: "farmer",
            status: "open" 
        }).populate("createdBy", "name email");
        
        return res.status(200).json({ success: true, crops });
    } catch (error) {
        console.error("Search Crops Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const filterCrops = async (req, res) => {
    try {
        const { cropName, price, farmerName } = req.body;
        let query = { creatorRole: "farmer", status: "open" };

        if (cropName) {
            query.cropName = new RegExp(cropName, "i");
        }

        if (price) {
            // Assuming price matches exactly or check range if needed
            // Here we just follow the basic logic or use price as a threshold
            query.expectedPrice = { $lte: price };
        }

        let crops = await Project.find(query).populate("createdBy", "name email");

        if (farmerName) {
            const regex = new RegExp(farmerName, "i");
            crops = crops.filter(crop => crop.createdBy && regex.test(crop.createdBy.name));
        }

        return res.status(200).json({ success: true, crops });
    } catch (error) {
        console.error("Filter Crops Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getAllOfftakers = async (req, res) => {
    try {
        const offtakers = await OfftakerProfile.find({}).populate("userId", "name role");
        return res.status(200).json({ success: true, offtakers });
    } catch (error) {
        console.error("Get All Offtakers Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};




export default {
    getOfftakerProfile,
    completeOfftakerProfile,
    uploadOfftakerPhoto,
    getProfilePhotobyId,
    getAllCrops,
    searchCrops,
    filterCrops,
    getAllOfftakers
};
