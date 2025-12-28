import { Router, Request, Response } from "express";
import { RegisterAdmin, LoginAdmin, UpdateAdminProfile } from "../controllers/auth.controller"; // your admin controllers
import { authenticateAdmin } from "../middlewares/authAdmin.middleware";
import { validateRequestBody, validatePassword } from "../middlewares/validation.middleware";

const router = Router();

router.post(
  "/auth/register",
  validateRequestBody(["fname", "lname", "email", "phone", "password", "confirmPassword"]),
  validatePassword,
  RegisterAdmin
);

router.post(
  "/auth/login",
  validateRequestBody(["email", "password"]),
  LoginAdmin
);

router.post("/auth/logout/:adminID", (req: Request, res: Response) => {
  if (req.session.admin && req.session.admin.adminID.toString() === req.params.adminID) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Admin Logout Error:", err);
        return res.status(500).json({ message: "Error logging out admin" });
      }
      res.clearCookie("connect.sid"); // default session cookie name
      return res.status(200).json({ message: "Admin logout successful" });
    });
  } else {
    res.status(400).json({ message: "Admin not logged in or invalid adminID" });
  }
});

router.put("/admin/update/:adminId", authenticateAdmin, UpdateAdminProfile);

export default router;
