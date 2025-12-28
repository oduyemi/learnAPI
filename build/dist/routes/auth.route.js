"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post("/register", (0, validation_middleware_1.validateRequestBody)([
    "fname",
    "lname",
    "email",
    "phone",
    "username",
    "password",
    "confirmPassword",
]), validation_middleware_1.validatePassword, auth_controller_1.RegisterUser);
router.post("/login", (0, validation_middleware_1.validateRequestBody)(["email", "password"]), auth_controller_1.LoginUser);
router.post("/logout", (_req, res) => {
    return res.status(200).json({ message: "Logout successful" });
});
router.put("/update", auth_middleware_1.authenticateUser, auth_controller_1.UpdateUserProfile);
router.put("/reset-password", auth_middleware_1.authenticateUser, auth_controller_1.ResetUserPassword);
exports.default = router;
