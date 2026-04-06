import mongoose from 'mongoose';
import FarmerProfile from "../models/FarmerProfile.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

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


 const farmerProfile = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware

        const { name, email, phone, address } = req.body;

        // check if profile already exists
        let profile = await FarmerProfile.findOne({ userId });

        if (profile) {
            // UPDATE existing profile
            profile.name = name || profile.name;
            profile.email = email || profile.email;
            profile.phone = phone || profile.phone;
            profile.address = address || profile.address;

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
            email,
            phone,
            address
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

export default {registerFarmer,getData,searchFarmer,updateFarmer,farmerProfile};