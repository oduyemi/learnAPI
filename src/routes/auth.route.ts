import { Router } from "express";
import {
  login,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  ResetPasswordParams,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validatePassword } from "../middlewares/validation.middleware";


const router = Router();


router.post("/login", login);
router.get("/me", authenticate, me);
router.patch("/profile", authenticate, updateProfile);
router.patch("/change-password", authenticate, validatePassword, changePassword);
router.post("/forgot-password", forgotPassword);
router.post<ResetPasswordParams>("/reset-password/:token", resetPassword);
export default router;