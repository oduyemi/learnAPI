"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/login", auth_controller_1.login);
router.get("/me", auth_middleware_1.authenticate, auth_controller_1.me);
router.patch("/profile", auth_middleware_1.authenticate, auth_controller_1.updateProfile);
router.patch("/change-password", auth_middleware_1.authenticate, auth_controller_1.changePassword);
router.post("/forgot-password", auth_controller_1.forgotPassword);
router.post("/reset-password/:token", auth_controller_1.resetPassword);
// router.post("/logout", (_req, res) => {
//   return res.status(200).json({ message: "Logout successful" });
// });
exports.default = router;
