import { Router } from "express";
import { 
    createCourse, 
    deleteCourse, 
    getCourse, 
    getCourses, 
    getCoursesByCategory, 
    getCoursesByInstructor, 
    getGeneralCourses,
    updateCourse,
} from "../controllers/course.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();


router.post("/", authenticate, requireRole("admin"), createCourse);
router.get("/", getCourses);
router.get("/general", getGeneralCourses);
router.get("/category/:categoryId", getCoursesByCategory);
router.get("/instructor/:userId", getCoursesByInstructor);
router.get("/:id", getCourse);  
router.patch("/:id", authenticate, requireRole("admin"), updateCourse);
router.delete("/:id", authenticate, requireRole("admin"), deleteCourse);



export default router;
