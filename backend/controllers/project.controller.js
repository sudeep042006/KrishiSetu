import mongoose from 'mongoose';
import Project from '../models/Project.js';
import cloudinary from '../config/cloudinary.js';

export const CreateProject = async (req,res) =>{
    try{
        const {
            cropName, 
            description, 
            category, 
            organic, 
            quantity, 
            unit, 
            pricePerUnit, 
            quality, 
            location, 
            harvestDate, 
            paymentModel, 
            qualityRequirements, 
            status, 
            totalApplications, 
            expiresAt
        } = req.body;

        // Validation - keeping it simple but checking core required fields
        if(!cropName || !description || !quantity || !pricePerUnit || !location){
            return res.status(400).json({message:"Crop name, description, quantity, price and location are required"});
        }

        // Parse location string "Village, District, State" if it's a string
        let locationObj = location;
        if (typeof location === 'string') {
            const parts = location.split(',').map(p => p.trim());
            locationObj = {
                village: parts[0] || "",
                district: parts[1] || "",
                state: parts[2] || parts[parts.length - 1] || "" // fallback to last part if only 1 or 2 parts
            };
        }
        // Parse category (frontend sends singular, backend needs plural in some cases)
        const categoryMap = {
            'Grain': 'Grains',
            'Vegetable': 'Vegetables',
            'Fruit': 'Fruits',
            'Pulse': 'Pulses',
            'Spice': 'Spices',
            'Oilseed': 'Oilseeds',
            'Cotton': 'Cotton',
            'Other': 'Other'
        };
        const mappedCategory = categoryMap[category] || category || "Grains";

        // Unit mapping
        const unitMap = {
            'Quintal': 'quintal',
            'Kg': 'kg',
            'Ton': 'ton',
            'Bag (50kg)': 'bag'
        };
        const mappedUnit = unitMap[unit] || "kg";

        const newProject = await Project.create({
            title: cropName,
            description,
            cropName,
            cropCategory: mappedCategory,
            organicFarming: organic ? "Yes" : "No",
            quantityRequired: Number(quantity),
            quantityUnit: mappedUnit,
            expectedPrice: Number(pricePerUnit),
            priceUnit: "per_unit",
            QualityGrade: quality === 'A' ? "premium" : quality === 'B' ? "standard" : "economy",
            location: locationObj,
            expectedHarvestDate: harvestDate ? new Date(harvestDate) : undefined,
            paymentModel: paymentModel || "advance",
            qualityRequirements,
            status: status || "open",
            totalApplications: totalApplications || 0,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            cropPhoto: "pending",
            cropPhotoPublicId: "pending",
            createdBy: req.user.id,
            creatorRole: req.user.role || 'farmer'
        });

        return res.status(201).json({message:"Project created successfully", project: newProject});
    }catch(error){
        console.log("Error in creating project", error);
        return res.status(500).json({message: "Internal server error", error: error.message});
    }
}

export const uploadProjectPhoto = async (req, res) => {
    try {
        const { projectId } = req.body; // Expecting projectId in body if not in params
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: "Photo is required" });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // Delete old profile photo if it exists
        if (project.cropPhotoPublicId) {
            await cloudinary.uploader.destroy(project.cropPhotoPublicId);
        }

        // Upload new photo to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "project_photos",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            stream.end(file.buffer);
        });

        // Update project
        project.cropPhoto = result.secure_url;
        project.cropPhotoPublicId = result.public_id;
        await project.save();

        return res.status(200).json({
            success: true,
            message: "Project photo uploaded successfully",
            cropPhoto: project.cropPhoto
        });

    } catch (error) {
        console.error("Error uploading project photo:", error);
        return res.status(500).json({
            success: false,
            message: "Error uploading project photo",
            error: error.message,
        });
    }
};

export const getProjectPhotoById = async (req,res) =>{
    try{
        const {id} = req.params;
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({message: "Project not found"});
        return res.status(200).json({message:"Project photo fetched successfully", cropPhoto: project.cropPhoto});
    }catch(error){
        console.log("Error in fetching project photo",error);
        return res.status(500).json({message: "Error fetching photo"});
    }
}

export const getProject = async (req,res) =>{
    try{
        const projects = await Project.find().populate('createdBy', 'name email');
        return res.status(200).json({message:"Projects fetched successfully", projects});
    }catch(error){
        console.log("Error in fetching projects",error);
        return res.status(500).json({message: "Error fetching projects"});
    }
}

export const getProjectByCropName = async (req,res) =>{
    try{
        const {cropName, search} = req.query;
        const query = cropName || search;
        if (!query) return res.status(400).json({message: "Search query is required"});

        const projects = await Project.find({
            cropName:{$regex: query, $options:"i"}
        });
        return res.status(200).json({message:"Projects fetched successfully", projects});
    }catch(error){
        console.log("Error in fetching projects",error);
        return res.status(500).json({message: "Error fetching projects"});
    }
}

export const updateProject = async (req, res) =>{
    try{
        const {id} = req.params;
        const updatedProject = await Project.findByIdAndUpdate(id, req.body, {new: true});
        if (!updatedProject) return res.status(404).json({message: "Project not found"});
        return res.status(200).json({message:"Project updated successfully", project: updatedProject});
    }catch(error){
        console.log("Error in updating project",error);
        return res.status(500).json({message: "Error updating project"});
    }
}

export const deleteProject = async (req,res) =>{
    try{
        const {id} = req.params;
        const deletedProject = await Project.findByIdAndDelete(id);
        if (!deletedProject) return res.status(404).json({message: "Project not found"});
        return res.status(200).json({message:"Project deleted successfully"});
    }catch(error){
        console.log("Error in deleting project",error);
        return res.status(500).json({message: "Error deleting project"});
    }
}

export const getProjectByLocation = async( req, res ) => {
    try{
        const {location} = req.query;
        if (!location) return res.status(400).json({message: "Location query is required"});

        const projects = await Project.find({
            $or: [
                { "location.state": { $regex: location, $options: "i" } },
                { "location.district": { $regex: location, $options: "i" } },
                { "location.village": { $regex: location, $options: "i" } }
            ]
        });
        return res.status(200).json({message:"Projects fetched successfully", projects});
    }catch(error){
        console.log("Error in fetching projects",error);
        return res.status(500).json({message: "Error fetching projects"});
    }
}