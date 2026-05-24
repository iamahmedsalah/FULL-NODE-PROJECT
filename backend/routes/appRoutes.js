import express from "express";
const router = express.Router();

import {
  allApps,
  createApp,
  updateApp,
  getAppByName,
  deleteApp,
} from "../controllers/appController.js";
import { protect } from "../middleware/protectsRoutes.js";

// PROTECTED ROUTES (Requires authentication)
// All application routes require an authenticated session
router.use(protect);

router.get("/", allApps);
router.post("/create", createApp);
router.put("/update/:name", updateApp);
router.get("/get/:name", getAppByName);
router.delete("/delete/:name", deleteApp);

export default router;
