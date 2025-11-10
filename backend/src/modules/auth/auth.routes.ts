import express from "express";
import { registerSchool } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { schoolRegistrationSchema } from "./auth.validation";

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new school and admin account
 * @access  Public
 */
router.post(
  "/register/school",
  validateRequest(schoolRegistrationSchema),
  registerSchool
);
router.get("/check", (req, res) => {
  res.send("auth Template Running 🚀");
});

export default router;
