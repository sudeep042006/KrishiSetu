import express from 'express';
import { getCropPricesByLocation } from '../controllers/cropPrice.controller.js';
// Optional: import your authentication middleware if you only want logged-in users to see this
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route will look like: GET /api/crop-prices?state=Maharashtra&district=Nagpur
router.get('/', authenticate, getCropPricesByLocation);

export default router;