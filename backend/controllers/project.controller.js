import mongoose from 'mongoose';
import project from '../models/Project.js';
import cloudinary from '../config/cloudinary.js';

const CreateProject = async (req,res) =>{
    try{
        const {name,description,price,duration} = req.body;
        if(!name || !description || !price || !duration){
            return res.status(400).json({message:"All fields are required"});
        }
        const project = await project.create({
            name,
            description,
            price,
            duration,
            userId:req.user.id
        });
        return res.status(201).json({message:"Project created successfully",project});
    }catch(error){
        console.log("Error in creating project",error);
    }
}

const uploadProjectPhoto = async (req, res) => {
    try {
        const projectId = req.user.id; 
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: "Photo is required" });
        }

        const profile = await project.findOne({ projectId });
        if (!profile) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // Delete old profile photo if it exists
        if (profile.projectPhotoPublicId) {
            await cloudinary.uploader.destroy(profile.projectPhotoPublicId);
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
        profile.projectPhoto = result.secure_url;
        profile.projectPhotoPublicId = result.public_id;
        await profile.save();

        return res.status(200).json({
            success: true,
            message: "Profile photo uploaded successfully",
            projectPhoto: profile.projectPhoto
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error uploading profile photo",
            error: error.message,
        });
    }
};

export default {CreateProject,uploadProjectPhoto};