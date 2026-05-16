import { Router } from "express";
import { 
    searchSchools, 
    toggleSchoolStatus, 
    impersonateAdmin, 
    listTickets, 
    getTicketSupportDetails,
    updateTicketStatus,
    replyToTicket,
    updateSchoolLimits,
    getSchoolDetails,
    updateSchoolPlan,
    listAllSubscriptionPlans,
    searchStudents,
    searchTeachers,
    searchParents,
    getPlatformFeatures,
    updatePlatformFeature,
    getStudentDetails,
    updateStudentPlan,
    getTeacherDetails,
    updateTeacherPlan,
    getParentDetails,
    updateParentPlan
} from "./support.controller";
import { authenticatePlatformStaff, authorizePlatformRole } from "../../../middleware/platformAuthMiddleware";

const router = Router();

router.use(authenticatePlatformStaff);

/**
 * @route   GET /api/platform/support/schools
 */
router.get("/schools", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), searchSchools);
router.get("/schools/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), getSchoolDetails);
router.get("/students", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), searchStudents);
router.get("/students/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), getStudentDetails);
router.get("/teachers", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), searchTeachers);
router.get("/teachers/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), getTeacherDetails);
router.get("/parents", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), searchParents);
router.get("/parents/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), getParentDetails);
router.patch("/parents/:id/plan", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), updateParentPlan);

/**
 * @route   PATCH /api/platform/support/schools/:id/status
 */
router.patch("/schools/:id/status", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), toggleSchoolStatus);
router.patch("/schools/:id/limits", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updateSchoolLimits);
router.patch("/schools/:id/plan", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updateSchoolPlan);
router.patch("/students/:id/plan", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updateStudentPlan);
router.patch("/teachers/:id/plan", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updateTeacherPlan);

/**
 * @route   POST /api/platform/support/impersonate
 */
router.post("/impersonate", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), impersonateAdmin);

/**
 * @route   GET /api/platform/support/tickets
 */
router.get("/tickets", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), listTickets);
router.get("/tickets/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), getTicketSupportDetails);
router.patch("/tickets/:id/status", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updateTicketStatus);
router.post("/tickets/:id/messages", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), replyToTicket);

/**
 * @route   GET /api/platform/support/plans
 */
router.get("/plans", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), listAllSubscriptionPlans);

/**
 * @route   GET /api/platform/support/features
 */
router.get("/features", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), getPlatformFeatures);

/**
 * @route   PATCH /api/platform/support/features/:id
 */
router.patch("/features/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updatePlatformFeature);

export default router;
