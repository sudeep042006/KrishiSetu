import farmerController from "../controllers/farmer.controller.js";
import {Router} from "express";

const router = Router();

router.post("/register",farmerController.registerFarmer);
router.get("/get",farmerController.getData);
router.post("/search",farmerController.searchFarmer);
router.put("/update/:id",farmerController.updateFarmer);
router.post("/profile",farmerController.farmerProfile);

export default router;
