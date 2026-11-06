export {
  resolveSchoolId,
  validateSchoolAccess,
  validateAdminSchoolAccess,
} from "./services/school-access.service";

export {
  getActiveSchoolTeacherFilter,
  getActiveSchoolStudentFilter,
  getSchoolTeachersService,
  getSchoolStudentsService,
  type SchoolStudentFilters,
} from "./services/school-members.service";

export {
  getSchoolStatsService,
  getSchoolTodayAttendanceService,
  getSchoolAttendanceOverviewService,
  getSchoolPerformanceAnalysisService,
  getDashboardRecentActivityService,
} from "./services/school-dashboard.service";

export {
  getSchoolProfileService,
  updateSchoolProfileService,
  getSchoolSettingsService,
  updateSchoolSettingsService,
  type UpdateSchoolSettingsInput,
} from "./services/school-profile.service";

export {
  getSchoolBillingService,
  getSchoolLandingPageService,
  getSchoolLandingPageBySubdomainService,
  updateSchoolLandingPageService,
  submitInquiryService,
  getInquiriesService,
  type SubmitInquiryInput,
} from "./services/school-billing-landing.service";
