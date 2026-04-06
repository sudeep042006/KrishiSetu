import supabase from "../config/supabase.js";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const mongoUser = await User.findOne({ supabaseId: data.user.id });

        if (!mongoUser) {
            return res.status(401).json({ message: "User not found in system" });
        }

        req.user = mongoUser;
        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

export default authenticate;