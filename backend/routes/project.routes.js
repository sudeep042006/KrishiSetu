import { Router } from "express";
import { 
    CreateProject, 
    getProject, 
    getProjectPhotoById, 
    uploadProjectPhoto, 
    updateProject, 
    deleteProject, 
    getProjectByLocation, 
    getProjectByCropName 
} from "../controllers/project.controller.js";
import upload from "../middlewares/multer.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

// Create project - requires authentication
router.post("/create", authenticate, upload.single("photo"), CreateProject);

// Upload/Update project photo
router.post("/upload-photo", authenticate, upload.single("photo"), uploadProjectPhoto);

// Get projects
router.get("/get", getProject);
router.get("/getPhoto/:id", getProjectPhotoById);

// Update/Delete - should ideally be protected
router.post("/update/:id", authenticate, updateProject);
router.post("/deleteProject/:id", authenticate, deleteProject);

// Search routes
router.get("/getProjectByLocation", getProjectByLocation);
router.get("/getProjectByCropName", getProjectByCropName);

export default router;