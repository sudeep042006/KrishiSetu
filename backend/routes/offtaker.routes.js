import offtakerController from "../controllers/offtaker.controller.js";
import { Router } from "express";
import upload from "../middlewares/multer.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

// Profile Routes
router.get("/all", offtakerController.getAllOfftakers);
router.get("/profile", authenticate, offtakerController.getOfftakerProfile);
router.post("/profile", authenticate, offtakerController.completeOfftakerProfile);
router.post("/profile-photo", authenticate, upload.single("photo"), offtakerController.uploadOfftakerPhoto);

export default router;
