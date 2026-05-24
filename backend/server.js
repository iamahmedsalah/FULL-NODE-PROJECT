
import express from "express";

// HTTP logger middleware
import morgan from "morgan";

import cookieParser from "cookie-parser";

import cors from "cors";


// Load environment variables ENV

import dotenv from 'dotenv';
dotenv.config({ path: ['.env', '.env.local'] });


// Database config
import dbConfig from "./config/database.js"
// Connect to database

// Create an express app
const app = express();
app.set("trust proxy", 1);

// Warm the DB connection on boot (non-blocking). Requests still await connection below.
dbConfig().catch((err) => {
    console.error(`Initial DB connect failed: ${err.message}`);
});




// Enable CORS & CORS Configuration
// Supports localhost and deployed frontend domains from env.
const configuredOrigins = String(process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

const staticAllowedOrigins = new Set([
    "http://localhost:5173",
    "http://localhost:4173",
    "https://logizy-web.vercel.app",
    "https://full-node-project.vercel.app",
    ...configuredOrigins,
]);

const isAllowedOrigin = (origin) => {
    if (staticAllowedOrigins.has(origin)) return true;

    // In local development allow localhost and 127.0.0.1 on any port.
    if (process.env.NODE_ENV !== "production") {
        return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    }

    return false;
};

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser clients (no Origin header) and allowed browser origins.
            if (!origin || isAllowedOrigin(origin)) return callback(null, true);
            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
    })
);

// Body parser 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// In serverless environments, ensure DB is connected before hitting API routes.
app.use("/api", async (req, res, next) => {
    // CORS middleware already handles preflight.
    if (req.method === "OPTIONS") return next();

    try {
        await dbConfig();
        return next();
    } catch (error) {
        console.error(`DB middleware error: ${error.message}`);
        return res.status(503).json({
            success: false,
            message: "Database is unavailable. Please try again.",
        });
    }
});

// Log requests to the console
const devMode = process.env.NODE_ENV;
devMode === "development"? app.use(morgan("dev")) && console.log(`Mode:In ${devMode}`) : console.log(`Mode:In ${devMode} `);

// Routes
import AuthRoutes  from "./routes/authRoutes.js";
import AppRoutes from "./routes/appRoutes.js"
import LogsRoutes from "./routes/logsRoutes.js"

// Auth routes
app.use("/api/auth", AuthRoutes);

// App routes 
app.use("/api/apps", AppRoutes);


// Logs routes 
app.use("/api/apps/:name/logs", LogsRoutes);

app.get("/api/health", (_req, res) => {
    res.status(200).json({ ok: true, service: "logizy-backend" });
});

app.get("/", (_req, res) => {
    res.status(200).json({
        message: "Logizy backend is running",
        health: "/api/health",
    });
});

app.use((err, req, res, _next) => {
    console.error(`Unhandled request error on ${req.method} ${req.originalUrl}:`, err);

    if (err?.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON payload.",
        });
    }

    if (String(err?.message || "").startsWith("CORS blocked")) {
        return res.status(403).json({
            success: false,
            message: "Origin is not allowed by CORS policy.",
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
});

let server;
if (!process.env.VERCEL) {
    // PORT & Start server on port
    const PORT = process.env.PORT || 5000;
    server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Handle rejection errors outside of express
process.on("unhandledRejection", (err) => {
    console.log(`unhandledRejection Errors: ${err.message} ${err.name}`);
    if (server) {
        server.close(() => {
            console.log(`Shutting down..`);
            process.exit(1);
        });
        return;
    }
    process.exit(1);
});

export default app;
