
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"])


// import express
import express from "express";
import path from "path";
import { fileURLToPath } from "url";




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

// Database connection
dbConfig();




// Enable CORS & CORS Configuration
// Supports localhost and deployed frontend domains from env.
const configuredOrigins = String(process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

const staticAllowedOrigins = new Set([
    "http://localhost:5173",
    "http://localhost:4173",
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
