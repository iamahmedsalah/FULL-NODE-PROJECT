
import Application from "../models/appModel.js";
import Log from "../models/logsModel.js";



// GET - All App
export const allApps = async (req, res) => {
    try {
        const applications = await Application.find({
            developer: req.developer._id,
        }).sort({ createdAt: -1 });

        let applicationsWithCounts = applications.map((app) => app.toObject());

        if (applications.length > 0) {
            const appIds = applications.map((app) => app._id);
            const groupedCounts = await Log.aggregate([
                { $match: { application: { $in: appIds } } },
                { $group: { _id: "$application", total: { $sum: "$count" } } },
            ]);

            const countMap = new Map(
                groupedCounts.map((row) => [String(row._id), row.total])
            );

            applicationsWithCounts = applicationsWithCounts.map((app) => ({
                ...app,
                logCount: countMap.get(String(app._id)) || 0,
            }));
        }

        return res.status(200).json({
            success: true,
            count: applications.length,
            data: applicationsWithCounts,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch applications.",
            error: error.message,
        });
    }
};

// POST - Add App
export const createApp = async (req, res) => {

    try {
        const { name, description } = req.body;


        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Application name and description are required.",
            });
        }

        // Check global uniqueness before attempting to save (friendlier error)
        const existing = await Application.findOne({ name });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: `Application name "${name}" is already taken. Names must be globally unique.`,
            });
        }

        const application = await Application.create({
            name,
            description,
            developer: req.developer._id,
        });

        return res.status(201).json({ success: true, data: application });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        // Mongoose duplicate key (race condition)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Application name is already taken.",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to create application.",
            error: error.message,
        });
    }
};


// PUT - Update App 
export const updateApp = async (req, res) => {
    try {
        const { name, description } = req.body;

        const application = await Application.findOneAndUpdate(
            { name: req.params.name, developer: req.developer._id },
            { name, description },
            { returnDocument: 'after' }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: `Application "${req.params.name}" not found or you do not own it.`,
            });
        }

        return res.status(200).json({ success: true, data: application });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update application.",
            error: error.message,
        });
    }
};

// GET - Get App by Name
export const getAppByName = async (req, res) => {
    try {
        const applicationDoc = await Application.findOne({
            name: req.params.name,
            developer: req.developer._id,
        });

        if (!applicationDoc) {
            return res.status(404).json({
                success: false,
                message: `Application "${req.params.name}" not found.`,
            });
        }

        const [countRow] = await Log.aggregate([
            { $match: { application: applicationDoc._id } },
            { $group: { _id: "$application", total: { $sum: "$count" } } },
        ]);

        const application = {
            ...applicationDoc.toObject(),
            logCount: countRow?.total || 0,
        };

        return res.status(200).json({ success: true, data: application });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch application.",
            error: error.message,
        });
    }
};


// DELETE - Delete App
// Also cascade-deletes all logs belonging to the application (handled by model hook).
export const deleteApp = async (req, res) => {
    try {
        const application = await Application.findOneAndDelete({
            name: req.params.name,
            developer: req.developer._id, // Ownership check: only the owner can delete
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: `Application "${req.params.name}" not found or you do not own it.`,
            });
        }

        return res.status(200).json({
            success: true,
            message: `Application "${application.name}" and all its logs have been deleted.`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete application.",
            error: error.message,
        });
    }
};


export default { allApps, createApp, updateApp, getAppByName, deleteApp };
