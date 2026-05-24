
import Developer from "../models/devModel.js";
import generateTokenSetCookie, { getAuthCookieOptions } from "../utils/generateTokenSetCookie.js";

const toPublicDeveloper = (developer) => ({
    _id: developer._id,
    username: developer.username,
    email: developer.email,
    apiKey: developer.apiKey,
});



// POST - Signup
export const signup = async (req, res) => {

    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Username, email, and password are required." });
        }
        // Check for duplicates with a friendly message
        const existing = await Developer.findOne({
            $or: [{ email: email.toLowerCase() }, { username }],
        });
        if (existing) {
            const field = existing.email === email.toLowerCase() ? "email" : "username";
            return res.status(409).json({
                success: false,
                message: `A developer with that ${field} already exists.`,
            });
        }

        const newDeveloper = await Developer.create({ username, email, password });

        generateTokenSetCookie(res, newDeveloper._id);

        return res.status(201).json({
            success: true,
            message: "Developer created successfully",
            developer: toPublicDeveloper(newDeveloper),
        });



    } catch (error) {
        // Mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        console.error("Signup Error Details:", error);
        return res.status(500).json({
            success: false,
            message: "Registration failed.",
            error: error.message,
        });
    }
}

// POST - Login
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    try {
        const developer = await Developer.findOne({ email: email.toLowerCase() }).select("+password");

        if (!developer) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const isMatch = await developer.comparePassword(String(password));

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        generateTokenSetCookie(res, developer._id);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            developer: toPublicDeveloper(developer),
        });

    } catch (error) {
        console.error("Login Error Details:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed.",
            error: error.message,
        });
    }
};



// GET - Logout
export const logout = (req, res) => {
    res.clearCookie("token", getAuthCookieOptions());
    return res.status(200).json({ success: true, message: "Logged out successfully." });
};

export default { signup, login, logout };
