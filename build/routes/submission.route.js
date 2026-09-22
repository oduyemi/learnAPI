"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submission_controller_1 = require("../controllers/submission.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// STUDENT
router.post("/assignment/:assignmentId", auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)("student"), submission_controller_1.submitAssignment);
router.post("/quiz/:quizId", auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)("student"), submission_controller_1.submitQuiz);
router.get("/my", auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)("student"), submission_controller_1.getMySubmissions);
router.get("/my/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)("student"), submission_controller_1.getMySubmission);
//  ADMIN / INSTRUCTOR / MENTOR
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)("admin", "instructor", "mentor"), submission_controller_1.getSubmissions);
router.get("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)("admin", "instructor", "mentor"), submission_controller_1.getSubmissionById);
router.patch("/:id/grade", auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)("admin", "instructor"), submission_controller_1.gradeSubmission);
router.patch("/:id/feedback", auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)("admin", "instructor"), submission_controller_1.updateSubmissionFeedback);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)("admin"), submission_controller_1.deleteSubmission);
exports.default = router;
