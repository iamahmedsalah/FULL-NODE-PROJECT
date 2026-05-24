import express from "express";
const router = express.Router( {mergeParams: true});


import {
  allLogs,
  createLog,
} from "../controllers/logsController.js";
import { protect , validateApiKey } from "../middleware/protectsRoutes.js";

// Dashboard read endpoint (JWT session required)
router.get("/", protect, allLogs);

// Ingestion endpoint for SDK/server-to-server usage (API key required)
router.post("/", validateApiKey, createLog);


export default router;
