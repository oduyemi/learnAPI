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
    updateCourseThumbnail,
} from "../controllers/course.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { uploadCourseThumbnail } from "../utils/cloudinaryStorage";
  
  
const router = Router();


router.post("/", authenticate, requireRole("admin"), uploadCourseThumbnail.single("thumbnail"), createCourse);
router.get("/", getCourses);
router.get("/general", getGeneralCourses);
router.get("/category/:categoryId", getCoursesByCategory);
router.get("/instructor/:userId", getCoursesByInstructor);
router.get("/:id", getCourse);  
router.patch("/:id", authenticate, requireRole("admin"), updateCourse);
router.patch("/:id/thumbnail", authenticate, requireRole("admin"), uploadCourseThumbnail.single("thumbnail"), updateCourseThumbnail);
router.delete("/:id", authenticate, requireRole("admin"), deleteCourse);

export default router;
