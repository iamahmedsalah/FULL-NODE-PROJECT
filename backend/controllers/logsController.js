import Log from "../models/logsModel.js";
import Application from "../models/appModel.js";




// GET /api/applications/:name/logs
//   Requires JWT session.
//
//   Query parameters:
//   Filtering  : level=INFO|WARN|ERROR
//   Sorting    : sortBy=createdAt|updatedAt|count|level  (default: createdAt)
//                order=asc|desc                          (default: desc)
//   Pagination : page=<number>   (default: 1)
//                limit=<number>  (default: 20, max: 100)
//   Search     : message=<substring>



// Keep this outside the handler function
const resolveApplication = async (name, developerId) => {
    return Application.findOne({ name, developer: developerId });
};

export const allLogs = async (req, res) => {
    try {
        const application = await resolveApplication(
            req.params.name,
            req.developer._id
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: `Application "${req.params.name}" not found.`,
            });
        }

        // ── Filtering ────────────────────────────────────────────────────────
        const filter = { application: application._id };

        if (req.query.level) {
            const level = req.query.level.toUpperCase();
            const validLevels = ["INFO", "WARN", "ERROR"];
            if (!validLevels.includes(level)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid level. Must be one of: ${validLevels.join(", ")}.`,
                });
            }
            filter.level = level;
        }

        // Partial message search (case-insensitive)
        if (req.query.message) {
            filter.message = { $regex: req.query.message, $options: "i" };
        }

        // Date range filtering
        if (req.query.from || req.query.to) {
            filter.createdAt = {};
            if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
            if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
        }

        // ── Sorting ──────────────────────────────────────────────────────────
        const SORTABLE_FIELDS = ["createdAt", "updatedAt", "count", "level"];
        const sortBy = SORTABLE_FIELDS.includes(req.query.sortBy)
            ? req.query.sortBy
            : "createdAt";
        const order = req.query.order === "asc" ? 1 : -1;
        const sort = { [sortBy]: order };

        // ── Pagination ───────────────────────────────────────────────────────
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 20)
        );
        const skip = (page - 1) * limit;

        // ── Execute queries in parallel ──────────────────────────────────────
        const [logs, total] = await Promise.all([
            Log.find(filter).sort(sort).skip(skip).limit(limit),
            Log.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch logs.",
            error: error.message,
        });
    }
};


// POST - Create Log
export const createLog = async (req, res) => {
    try {
        const { message, level } = req.body;

        if (!message || !level) {
            return res.status(400).json({
                success: false,
                message: "Both `message` and `level` fields are required.",
            });
        }

        const normalizedLevel = level.toUpperCase();
        const validLevels = ["INFO", "WARN", "ERROR"];
        if (!validLevels.includes(normalizedLevel)) {
            return res.status(400).json({
                success: false,
                message: `Invalid level. Must be one of: ${validLevels.join(", ")}.`,
            });
        }

        // Resolve by both app name and API key owner to prevent cross-tenant log injection.
        const application = await Application.findOne({
            name: req.params.name,
            developer: req.developer._id,
        });
        if (!application) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to send logs for this application with the provided API key.",
            });
        }

        // Upsert: increment count if duplicate (same app + message + level)
        const log = await Log.findOneAndUpdate(
            {
                application: application._id,
                message: message.trim(),
                level: normalizedLevel,
            },
            {
                $inc: { count: 1 },
                $setOnInsert: {
                    application: application._id,
                    message: message.trim(),
                    level: normalizedLevel,
                },
            },
            {
                upsert: true,       // Create if not found
                returnDocument: 'after', // Return the updated/created document
                runValidators: true,
            }
        );

        const isNew = log.count === 1;
        return res.status(isNew ? 201 : 200).json({
            success: true,
            message: isNew ? "Log created." : `Log already exists — count updated to ${log.count}.`,
            data: log,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to save log.",
            error: error.message,
        });
    }
};


export default { allLogs, createLog };

