const Service = require("../models/service");

// CREATE SERVICE
const createService = async (req, res) => {
    try {
        const {
            serviceName,
            serviceType,
            description,
            startingPrice
        } = req.body;

        if (!serviceName || startingPrice === undefined) {
            return res.status(400).json({
                success: false,
                message: "Service name and starting price are required"
            });
        }

        const service = await Service.create({
            provider: req.user.id,
            serviceName,
            serviceType,
            description,
            startingPrice: Number(startingPrice)
        });

        res.status(201).json({
            success: true,
            message: "Service created successfully",
            service
        });

    } catch (error) {
        console.error("Create service error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating service"
        });
    }
};

// GET MY SERVICES
const getMyServices = async (req, res) => {
    try {
        const services = await Service.find({
            provider: req.user.id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: services.length,
            services
        });

    } catch (error) {
        console.error("Get services error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching services"
        });
    }
};

// GET ALL ACTIVE SERVICES
const getAllServices = async (req, res) => {
    try {
        const services = await Service.find({
            isActive: true
        })
            .populate(
                "provider",
                "name email phone role"
            )
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: services.length,
            services
        });

    } catch (error) {
        console.error("Get all services error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching services"
        });
    }
};

module.exports = {
    createService,
    getMyServices,
    getAllServices
};