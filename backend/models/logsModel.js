import mongoose from 'mongoose';

const LOG_LEVELS = ["INFO", "WARN", "ERROR"];

const logSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: [true, "Log message is required"],
            trim: true,
            maxlength: [2000, "Log message cannot exceed 2000 characters"],
        },
        level: {
            type: String,
            required: [true, "Log level is required"],
            enum: {
                values: LOG_LEVELS,
                message: `Log level must be one of: ${LOG_LEVELS.join(", ")}`,
            },
            uppercase: true,
        },
        count: {
            type: Number,
            default: 1,
            min: [1, "Count cannot be less than 1"],
        },
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index: fast lookups by application + message + level (deduplication key)
logSchema.index({ application: 1, message: 1, level: 1 }, { unique: true });
// Index for efficient filtering and sorting queries
logSchema.index({ application: 1, level: 1 });
logSchema.index({ application: 1, createdAt: -1 });


const Log = mongoose.model("Log", logSchema);

export default Log;