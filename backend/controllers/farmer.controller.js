import mongoose from 'mongoose';
import FarmerProfile from "../models/FarmerProfile.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import cloudinary from "../config/cloudinary.js";

const registerFarmer = async (req,res) =>{
    try{
        const { name, email, password, phone, address, addhar_no, profilePhoto } = req.body;

        if (!name || !email || !password || !phone || !address || !addhar_no) {
            return res.status(400).json({ message: "All fields are required, including addhar_no" });
        }

        const farmer = await User.create({
            name,
            email,
            password,
            phone,
            address,
            addhar_no,
            profilePhoto,
            role: "farmer"
        });

        const wallet = await Wallet.create({
            userId: farmer._id,
            availableBalance: 0,
            pendingBalance: 0,
            totalEarnings: 0,
            totalSpent: 0,
            currency: "INR",
        });

        const savedFarmer = await farmer.save();
        const savedWallet = await wallet.save();
        return res.status(201).json({message:"Farmer registered successfully",farmer});
        
    }catch(error){
        console.log("Error in farmer registration",error);
    }
}


 const CompleteFarmerProfile = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware

        const { name,  phone, aadhaar, village, district, state, landArea, crops } = req.body;

        // check if profile already exists
        let profile = await FarmerProfile.findOne({ userId });

        if (profile) {
            // UPDATE existing profile
            profile.name = name || profile.name;
            profile.phone = phone || profile.phone;
            profile.aadhaar = aadhaar || profile.aadhaar;
            profile.village = village || profile.village;
            profile.district = district || profile.district;
            profile.state = state || profile.state;
            profile.landArea = landArea || profile.landArea;
            profile.crops = crops || profile.crops;

            await profile.save();

            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: profile
            });
        }

        // CREATE new profile
        profile = new FarmerProfile({
            userId,
            name,
            phone,
            aadhaar,
            village,
            district,
            state,
            landArea,
            crops
        });

        await profile.save();

        res.status(201).json({
            success: true,
            message: "Profile created successfully",
            data: profile
        });

    } catch (error) {
        console.error("Farmer Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
const getData = async (req,res) =>{
    try {
        const farmer = await User.find({ role: "farmer" });
        return res.status(200).json({ message: "Farmer data", farmer });
    }catch(error){
        console.log("Error in getting farmer data",error);
    }
}

const getFarmerProfile = async (req, res) => {
    try {
        const userId = req.user._id; // Use _id from req.user
        const profile = await FarmerProfile.findOne({ userId });
        if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getProfilePhotobyId = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await FarmerProfile.findOne({ userId: id });
        if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
        return res.status(200).json({ success: true, profilePhoto: profile.profilePhoto });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const searchFarmer = async (req, res) =>{
    try{
        const {name} = req.body;
        if(!name){
            return res.status(400).json({message:"Name is required"});
        }
        const farmer = await User.find({ name, role: "farmer" });
        return res.status(200).json({message:"Farmer data",farmer});
    }catch(error){
        console.log("Error in searching farmer",error);
    }
}
const uploadFarmerPhoto = async (req, res) => {
    try {
        const userId = req.user.id; 
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: "Photo is required" });
        }

        const profile = await FarmerProfile.findOne({ userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: "Farmer profile not found" });
        }

        // Delete old profile photo if it exists
        if (profile.profilePhotoPublicId) {
            await cloudinary.uploader.destroy(profile.profilePhotoPublicId);
        }

        // Upload new photo to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "farmer_profiles",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            stream.end(file.buffer);
        });

        // Update profile
        profile.profilePhoto = result.secure_url;
        profile.profilePhotoPublicId = result.public_id;
        await profile.save();

        return res.status(200).json({
            success: true,
            message: "Profile photo uploaded successfully",
            profilePhoto: profile.profilePhoto
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error uploading profile photo",
            error: error.message,
        });
    }
};

const updateFarmer = async (req,res) =>{
    try{
        const {id} = req.params;
        const {name,email,phone,address} = req.body;
        if(!id){
            return res.status(400).json({message:"Id is required"});
        }
        const farmer = await User.findByIdAndUpdate(
            id,
            req.body,
            {new:true}
        );
        return res.status(200).json({message:"Farmer updated successfully",farmer});
    }catch(error){
        console.log("Error in updating farmer",error);
    }
}

export default {registerFarmer,getData,searchFarmer,updateFarmer,CompleteFarmerProfile,uploadFarmerPhoto, getFarmerProfile, getProfilePhotobyId};