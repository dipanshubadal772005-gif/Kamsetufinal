const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const ProviderProfile = require("../models/ProviderProfile");

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

// CUSTOMER SIGNUP
const customerSignup = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password
        } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { phone }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email or phone number already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            role: "customer"
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Customer signup error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during customer signup"
        });
    }
};

// PROVIDER SIGNUP
const providerSignup = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            professionalType,
            experience,
            city,
            serviceArea,
            bio,
            serviceName,
            serviceType,
            serviceDescription,
            price
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !password ||
            !professionalType ||
            !city ||
            !serviceName ||
            price === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing"
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { phone }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email or phone number already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            role: "provider"
        });

        const profile = await ProviderProfile.create({
            user: user._id,
            professionalType,
            experience: Number(experience) || 0,
            city,
            serviceArea,
            bio
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "Provider registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            profile: {
                id: profile._id,
                professionalType: profile.professionalType,
                experience: profile.experience,
                city: profile.city,
                serviceArea: profile.serviceArea,
                bio: profile.bio
            }
        });

    } catch (error) {
        console.error("Provider signup error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during provider signup"
        });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const {
            email,
            password,
            role
        } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Email, password and role are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            role
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email, password or role"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email, password or role"
            });
        }

        const token = generateToken(user);

        let profile = null;

        if (user.role === "provider") {
            profile = await ProviderProfile.findOne({
                user: user._id
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            profile
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

// GET CURRENT USER
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let profile = null;

        if (user.role === "provider") {
            profile = await ProviderProfile.findOne({
                user: user._id
            });
        }

        res.json({
            success: true,
            user,
            profile
        });

    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    customerSignup,
    providerSignup,
    login,
    getMe
};