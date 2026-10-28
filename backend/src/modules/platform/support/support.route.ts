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
    updateParentPlan,
    toggleStudentStatus,
    toggleTeacherStatus,
    toggleParentStatus,
    toggleAdminStatus,
    deleteSchool,
    deleteStudent,
    deleteTeacher,
    deleteParent,
    deleteAdmin,
    listComplianceRequests
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
 * @route   PATCH /api/platform/support/status
 */
router.patch("/schools/:id/status", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), toggleSchoolStatus);
router.patch("/students/:id/status", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), toggleStudentStatus);
router.patch("/teachers/:id/status", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), toggleTeacherStatus);
router.patch("/parents/:id/status", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), toggleParentStatus);
router.patch("/admins/:id/status", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), toggleAdminStatus);
router.patch("/schools/:id/limits", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updateSchoolLimits);
router.patch("/schools/:id/plan", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updateSchoolPlan);
router.patch("/students/:id/plan", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updateStudentPlan);
router.patch("/teachers/:id/plan", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updateTeacherPlan);

/**
 * @route   DELETE /api/platform/support/:entity/:id
 * Permanent deletion endpoints requiring password verification
 */
router.delete("/schools/:id", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), deleteSchool);
router.delete("/students/:id", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), deleteStudent);
router.delete("/teachers/:id", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), deleteTeacher);
router.delete("/parents/:id", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), deleteParent);
router.delete("/admins/:id", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), deleteAdmin);

/**
 * @route   POST /api/platform/support/impersonate
 */
router.post("/impersonate", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), impersonateAdmin);

/**
 * @route   GET /api/platform/support/tickets
 */
router.get("/tickets", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), listTickets);
router.get("/compliance-requests", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), listComplianceRequests);
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

import { listFaqs, getFaqDetails, createFaq, updateFaq, deleteFaq } from "./faq.controller";

/**
 * @route   PATCH /api/platform/support/features/:id
 */
router.patch("/features/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updatePlatformFeature);

/**
 * @route   FAQ Management Endpoints
 */
router.get("/faqs", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), listFaqs);
router.get("/faqs/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), getFaqDetails);
router.post("/faqs", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), createFaq);
router.patch("/faqs/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updateFaq);
router.put("/faqs/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), updateFaq);
router.delete("/faqs/:id", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), deleteFaq);

export default router;
