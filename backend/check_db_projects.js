import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        const projects = await Project.find({}, 'title cropPhoto cropCategory status cropPhotoPublicId');
        console.log("Projects in DB:");
        console.log(JSON.stringify(projects, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
