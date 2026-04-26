import express from 'express';
import cors from 'cors';
import axios from 'axios';

import dotenv from 'dotenv';
dotenv.config();

// Import routes
import farmerRoutes from "./routes/farmer.routes.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import weatherRoutes from "./routes/weather.routes.js";
import offtakerRoutes from "./routes/offtaker.routes.js"; // New weather route
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import cropPriceRoutes from "./routes/cropPrice.routes.js";
import proposalRoutes from "./routes/proposal.routes.js";
import { startPriceSyncJob } from './services/priceSync.service.js';

import http from 'http';
import { initializeSocket } from './config/socket.js';

const app = express();
const server = http.createServer(app);
initializeSocket(server);

app.use(express.json());
app.use(cors());
/* app.use(cookieParser()); */

//connect DB
import ConnectDB from "./config/db.js";
ConnectDB();
// Supabase client is imported and initialized automatically
import supabase from './config/supabase.js';


// API routes
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/farmer", farmerRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/weather", weatherRoutes);
app.use("/api/v1/offtaker", offtakerRoutes); // Mounted weather routes
app.use("/api/v1/chat", messageRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/crop-prices", cropPriceRoutes);
app.use("/api/v1/proposal", proposalRoutes);

startPriceSyncJob();

app.get("/",(req,res)=>{
    res.send("KrishiSetu is Running");
})

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);

    // Render Keep-Alive: Self-ping every 14 minutes
    const keepAlive = () => {
        const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT}`;
        if (url.includes('render.com') || url.includes('localhost')) {
            setInterval(async () => {
                try {
                    await axios.get(url);
                    console.log('Keep-Alive: Ping successful');
                } catch (err) {
                    console.log('Keep-Alive: Ping failed', err.message);
                }
            }, 14 * 60 * 1000); // 14 minutes
        }
    };
    keepAlive();
});