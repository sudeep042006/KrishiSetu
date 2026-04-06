import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';

// Import routes
import farmerRoutes from "./routes/farmer.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

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


app.get("/",(req,res)=>{
    res.send("KrishiSetu is Running");
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
})