"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const question_controller_1 = require("../controllers/question.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)("admin", "instructor"), question_controller_1.createQuestion);
exports.default = router;
