import supabase from "../config/supabase.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!["farmer", "offtaker", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role
                }
            }
        });

        if (error) {
            return res.status(400).json({ message: error.message });
        }

        const mongoUser = await User.create({
            supabaseId: data.user.id,
            name,
            email,
            role
        });

        if (role === "farmer") {
            await Wallet.create({
                userId: mongoUser._id,
                availableBalance: 0,
                pendingBalance: 0,
                totalEarnings: 0,
                totalSpent: 0,
                currency: "INR"
            });
        }

        return res.status(201).json({
            message: "User registered successfully",
            supabaseUser: data.user,
            mongoUser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ message: error.message });
        }

        const mongoUser = await User.findOneAndUpdate(
            { email },
            { lastLogin: new Date() },
            { new: true }
        );

        if (!mongoUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (mongoUser.role !== role) {
            return res.status(403).json({ message: `This account is registered as a ${mongoUser.role}. Please login with the correct role.` });
        }

        return res.status(200).json({
            message: "User logged in successfully",
            token: data.session.access_token,
            refreshToken: data.session.refresh_token,
            role: mongoUser.role,
            user: mongoUser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

export default { register, login };
