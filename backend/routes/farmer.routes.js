import farmerController from "../controllers/farmer.controller.js";
import {Router} from "express";
import upload from "../middlewares/multer.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register",farmerController.registerFarmer);
router.get("/get",farmerController.getData);
router.post("/search",farmerController.searchFarmer);
router.put("/update/:id",farmerController.updateFarmer);
router.post("/profile",farmerController.farmerProfile);
router.post("/profile-photo", authenticate, upload.single("photo"), farmerController.uploadFarmerPhoto);

export default router;
