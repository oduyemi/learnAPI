import { Router } from "express";
import { createCohort, 
    deleteCohort, 
    getActiveCohorts, 
    getCohort, 
    getCohorts, 
    getCourseCohorts, 
    updateCohort,
    updateCohortStatus
} from "../controllers/cohort.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";


const router = Router();


router.post("/", authenticate, requireRole("admin"), createCohort);  
router.get("/", authenticate, getCohorts);
router.get("/active", authenticate,getActiveCohorts);
router.get("/course/:courseId", authenticate, getCourseCohorts);
router.get("/:id", authenticate, getCohort);
router.patch("/:id", authenticate, requireRole("admin"), updateCohort);
router.patch("/:id/status", authenticate, requireRole("admin"), updateCohortStatus);
router.delete("/:id", authenticate, requireRole("admin"), deleteCohort);



export default router;
