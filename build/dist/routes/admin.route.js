"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller"); // your admin controllers
const authAdmin_middleware_1 = require("../middlewares/authAdmin.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post("/auth/register", (0, validation_middleware_1.validateRequestBody)(["fname", "lname", "email", "phone", "password", "confirmPassword"]), validation_middleware_1.validatePassword, auth_controller_1.RegisterAdmin);
router.post("/auth/login", (0, validation_middleware_1.validateRequestBody)(["email", "password"]), auth_controller_1.LoginAdmin);
router.post("/auth/logout/:adminID", (req, res) => {
    if (req.session.admin && req.session.admin.adminID.toString() === req.params.adminID) {
        req.session.destroy((err) => {
            if (err) {
                console.error("Admin Logout Error:", err);
                return res.status(500).json({ message: "Error logging out admin" });
            }
            res.clearCookie("connect.sid"); // default session cookie name
            return res.status(200).json({ message: "Admin logout successful" });
        });
    }
    else {
        res.status(400).json({ message: "Admin not logged in or invalid adminID" });
    }
});
router.put("/admin/update/:adminId", authAdmin_middleware_1.authenticateAdmin, auth_controller_1.UpdateAdminProfile);
exports.default = router;
