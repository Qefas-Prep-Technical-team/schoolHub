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
router.get("/schools", searchSchools);
router.get("/schools/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), getSchoolDetails);
router.get("/students", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), searchStudents);
router.get("/students/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), getStudentDetails);
router.get("/teachers", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), searchTeachers);
router.get("/teachers/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), getTeacherDetails);
router.get("/parents", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), searchParents);
router.get("/parents/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), getParentDetails);
router.patch("/parents/:id/plan", authorizePlatformRole(["OWNER"]), updateParentPlan);

/**
 * @route   PATCH /api/platform/support/schools/:id/status
 */
router.patch("/schools/:id/status", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), toggleSchoolStatus);
router.patch("/schools/:id/limits", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), updateSchoolLimits);
router.patch("/schools/:id/plan", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), updateSchoolPlan);
router.patch("/students/:id/plan", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), updateStudentPlan);
router.patch("/teachers/:id/plan", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), updateTeacherPlan);

/**
 * @route   POST /api/platform/support/impersonate
 */
router.post("/impersonate", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), impersonateAdmin);

/**
 * @route   GET /api/platform/support/tickets
 */
router.get("/tickets", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), listTickets);
router.get("/tickets/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), getTicketSupportDetails);
router.patch("/tickets/:id/status", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), updateTicketStatus);
router.post("/tickets/:id/messages", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), replyToTicket);

/**
 * @route   GET /api/platform/support/plans
 */
router.get("/plans", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), listAllSubscriptionPlans);

/**
 * @route   GET /api/platform/support/features
 */
router.get("/features", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), getPlatformFeatures);

/**
 * @route   PATCH /api/platform/support/features/:id
 */
router.patch("/features/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), updatePlatformFeature);

export default router;
