import { Router } from "express";
import {
  RegisterUser,
  LoginUser,
  UpdateUserProfile,
  ResetUserPassword,
} from "../controllers/auth.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import {
  validateRequestBody,
  validatePassword,
} from "../middlewares/validation.middleware";

const router = Router();


router.post(
  "/register",
  validateRequestBody([
    "fname",
    "lname",
    "email",
    "phone",
    "username",
    "password",
    "confirmPassword",
  ]),
  validatePassword,
  RegisterUser
);

router.post(
  "/login",
  validateRequestBody(["email", "password"]),
  LoginUser
);

router.post("/logout", (_req, res) => {
  return res.status(200).json({ message: "Logout successful" });
});

router.put("/update", authenticateUser, UpdateUserProfile);
router.put("/reset-password", authenticateUser, ResetUserPassword);

export default router;
