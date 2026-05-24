import jwt from "jsonwebtoken";
import Developer from "../models/devModel.js";

// JWT Auth Guard
export const protect = async (req, res, next) => {
    try {
        let token;

        // Accept token from Authorization header OR httpOnly cookie
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please log in to continue.",
            });
        }

        // Verify and decode
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the developer (without password) to the request
        const developer = await Developer.findById(decoded.id);
        if (!developer) {
            return res.status(401).json({
                success: false,
                message: "The account associated with this token no longer exists.",
            });
        }

        req.developer = developer;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please log in again.",
            });
        }
        return res.status(401).json({
            success: false,
            message: "Invalid token. Authentication failed.",
        });
    }
};



// API Key Guard 
// The developer sends their API key via the `api-key` header.
export const validateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers["api-key"];

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: "Missing API key. Include it in the `api-key` header.",
            });
        }

        const developer = await Developer.findOne({ apiKey });
        if (!developer) {
            return res.status(401).json({
                success: false,
                message: "Invalid API key.",
            });
        }

        req.developer = developer;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "API key validation failed.",
            error: error.message,
        });
    }
};

export default { protect, validateApiKey }