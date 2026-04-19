import OfftakerProfile from "../models/OfftakerProfile.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

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

        const profile = await OfftakerProfile.findOne({ userId });
        if (!profile) {
            // Create a shell profile if it doesn't exist yet
            return res.status(404).json({ success: false, message: "Please complete basic profile info first" });
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

export default {
    getOfftakerProfile,
    completeOfftakerProfile,
    uploadOfftakerPhoto
};
