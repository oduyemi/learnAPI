import { Router } from "express";
import { changePassword, forgotPassword, login, me, resetPassword, updateProfile } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", login);
router.get("/me", authenticate, me);
router.patch("/profile", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// router.post("/logout", (_req, res) => {
//   return res.status(200).json({ message: "Logout successful" });
// });


export default router;
