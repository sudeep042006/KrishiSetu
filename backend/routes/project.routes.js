import { Router } from "express";
import { 
    CreateProject, 
    getProject, 
    getProjectPhotoById, 
    uploadProjectPhoto, 
    updateProject, 
    deleteProject, 
    getProjectByLocation, 
    getProjectByCropName ,
    getProjectByOfftaker,
    getMyProjectByFarmers
} from "../controllers/project.controller.js";
import upload from "../middlewares/multer.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

// Create project - requires authentication
router.post("/create", authenticate, upload.single("photo"), CreateProject);

// Upload/Update project photo
router.post("/upload-photo", authenticate, upload.single("photo"), uploadProjectPhoto);

// Get projects
router.get("/my", authenticate, getMyProjectByFarmers);    // Farmer fetches their own listings
router.get("/get", authenticate, getProjectByOfftaker);     // Offtaker/Marketplace fetches open farmer crops
router.get("/all", authenticate, getProject);              // General fetch all projects
router.get("/getPhoto/:id", authenticate, getProjectPhotoById);

// Update/Delete (protected with ownership validation in controller)
router.post("/update/:id", authenticate, updateProject);
router.put("/update/:id", authenticate, updateProject);
router.post("/deleteProject/:id", authenticate, deleteProject);
router.delete("/deleteProject/:id", authenticate, deleteProject);
router.delete("/:id", authenticate, deleteProject);

// Search routes
router.get("/getProjectByLocation", getProjectByLocation);
router.get("/getProjectByCropName", getProjectByCropName);

export default router;