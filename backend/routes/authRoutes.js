import express from "express";
const router = express.Router();

import { protect } from "../middleware/protectsRoutes.js";
import { signup, login, logout } from "../controllers/authController.js";

// PUBLIC ROUTES (Anyone can access these)
router.post("/signup", signup);
router.post("/login", login);

// PROTECTED ROUTES (Requires authentication)
router.use(protect);
router.get("/logout", logout);

export default router;
