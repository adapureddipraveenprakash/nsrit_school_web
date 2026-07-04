// Central data service — wraps all Data Connect queries for the web app.
// All pages import from here instead of calling dataConnectClient directly.

import dataConnectClient from './dataConnectClient';
import { getJSON } from './storage';
import { STORAGE_KEYS } from './storage';

// ─── Query / Mutation names (from mobile operations.js) ───────────────────────

const Q = {
  GET_BRANCHES: 'GetBranches',
  GET_BRANCH_DETAILS: 'GetBranchDetails',
  GET_DASHBOARD_STATISTICS: 'GetDashboardStatistics',
  GET_WINGS_BY_BRANCH: 'GetWingsByBranch',
  GET_GLOBAL_STUDENTS: 'GetGlobalStudents',
  GET_STUDENTS: 'GetStudents',
  GET_STUDENTS_BY_SECTION: 'GetStudentsBySection',
  GET_STUDENT_DETAILS: 'GetStudentDetails',
  SEARCH_STUDENTS: 'SearchStudents',
  GET_GLOBAL_CLASSES: 'GetGlobalClasses',
  GET_ACADEMIC_CLASSES: 'GetAcademicClasses',
  GET_CLASSES_BY_WING: 'GetClassesByWing',
  GET_SECTIONS: 'GetSections',
  GET_SECTIONS_BY_CLASS: 'GetSectionsByClass',
  GET_TEACHERS: 'GetTeachers',
  GET_TEACHERS_BY_BRANCH: 'GetTeachersByBranch',
  GET_TEACHER_PROFILE: 'GetTeacherProfile',
  GET_TEACHER_PROFILE_BY_USER: 'GetTeacherProfileByUser',
  GET_TEACHER_DASHBOARD: 'GetTeacherDashboard',
  GET_CLASS_TEACHER_ASSIGNMENTS: 'GetClassTeacherAssignments',
  GET_SUBJECTS: 'GetSubjects',
  GET_COORDINATORS: 'GetCoordinators',
  GET_COORDINATOR_DETAILS: 'GetCoordinatorDetails',
  GET_ACCOUNTANTS: 'GetAccountants',
  GET_ACCOUNTANT_PROFILE: 'GetAccountantProfile',
  GET_FEE_CATEGORIES: 'GetFeeCategories',
  GET_CLASS_FEES: 'GetClassFees',
  GET_STUDENT_FEE_PROFILE: 'GetStudentFeeProfile',
  GET_PAYMENT_HISTORY: 'GetPaymentHistory',
  GET_FEE_REPORTS: 'GetFeeReports',
  GET_CLASS_FEE_REPORT: 'GetClassFeeReport',
  GET_CLASS_STUDENTS_FEE_STATUS: 'GetClassStudentsFeeStatus',
  GET_ALL_FEE_RECORDS: 'GetAllFeeRecords',
  GET_FEE_RECORDS_BY_BRANCH: 'GetFeeRecordsByBranch',
  GET_ATTENDANCE_BY_SECTION: 'GetAttendanceBySection',
  GET_PARENT_BY_PHONE: 'GetParentByPhone',
  GET_ATTENDANCE_BY_MONTH: 'GetAttendanceByMonth',
  GET_ATTENDANCE_BY_BRANCH: 'GetAttendanceByBranch',
  GET_NOTICES_BY_BRANCH: 'GetNoticesByBranch',
  GET_AUDIT_LOGS: 'GetAuditLogs',
  GET_GLOBAL_REPORTS: 'GetGlobalReports',
  GET_TIMETABLE_FOR_SECTION: 'GetTimetableForSection',
  GET_TIMETABLES_FOR_BRANCH: 'GetTimetablesForBranch',
  GET_TIMETABLE_FOR_TEACHER: 'GetTimetableForTeacher',
  GET_SUGGESTIONS_BY_BRANCH: 'GetSuggestionsByBranch',
  GET_SUGGESTIONS_BY_PARENT: 'GetSuggestionsByParent',
  GET_NOTIFICATIONS_BY_USER: 'GetNotificationsByUser',
  GET_UNREAD_NOTIFICATION_COUNT: 'GetUnreadNotificationCount',
  GET_PARENT_CHILDREN: 'GetParentChildren',
  GET_PARENT_CHILDREN_BY_USER: 'GetParentChildrenByUser',
  GET_STUDENT_ATTENDANCE: 'GetStudentAttendance',
  GET_STUDENT_FEE_HISTORY: 'GetStudentFeeHistory',
  GET_STUDENT_PARENTS: 'GetStudentParents',
  GET_PRINCIPAL_DASHBOARD: 'GetPrincipalDashboard',
  GET_BRANCH_ANALYTICS: 'GetBranchAnalytics',
  GET_USERS_BY_ROLE: 'GetUsersByRole',
  GET_PROMOTION_HISTORY: 'GetPromotionHistory',
  GET_SECTIONS_FOR_TEACHER_ASSIGNMENT: 'GetSectionsForTeacherAssignment',
  GET_FEE_DETAILS: 'GetFeeDetails',
  GET_FEE_PLAN_ITEMS: 'GetClassFees',
  GENERATE_ADMISSION_NUMBER: 'GenerateAdmissionNumber',
  GET_STUDENT_ID_SEQUENCE: 'GetStudentIdSequence',
  GET_STAFF_ID_SEQUENCE: 'GetStaffIdSequence',
  GET_RECEIPT_SEQUENCE: 'GetReceiptSequence',
  GET_BRANCH_STAFF_USER_IDS: 'GetBranchStaffUserIds',
  GET_BRANCH_STUDENTS_WITH_PARENTS: 'GetBranchStudentsWithParents',
  GET_COORDINATOR_STUDENTS_BY_WING: 'GetCoordinatorStudentsByWing',
  GET_HOLIDAYS_BY_BRANCH: 'GetHolidaysByBranch',
  GET_ACTIVE_ACADEMIC_YEAR: 'GetActiveAcademicYear',
};

const M = {
  CREATE_BRANCH: 'CreateBranch',
  UPDATE_BRANCH: 'UpdateBranch',
  ASSIGN_BRANCH_ADMIN: 'AssignBranchAdmin',
  ASSIGN_PRINCIPAL: 'AssignPrincipal',
  CREATE_STUDENT: 'CreateStudent',
  UPDATE_STUDENT: 'UpdateStudent',
  UPDATE_STUDENT_STATUS: 'UpdateStudentStatus',
  TRANSFER_STUDENT: 'TransferStudent',
  BULK_ASSIGN_STUDENTS: 'BulkAssignStudents',
  PROMOTE_STUDENTS: 'PromoteStudents',
  CREATE_TEACHER: 'CreateTeacher',
  UPDATE_TEACHER: 'UpdateTeacher',
  ASSIGN_CLASS_TEACHER: 'AssignTeacherClassTeacher',
  REMOVE_CLASS_TEACHER_ASSIGNMENT: 'RemoveClassTeacherAssignment',
  CREATE_COORDINATOR: 'CreateCoordinator',
  UPDATE_COORDINATOR: 'UpdateCoordinator',
  CREATE_ACCOUNTANT: 'CreateAccountant',
  UPDATE_ACCOUNTANT: 'UpdateAccountant',
  CREATE_SECTION: 'CreateSection',
  UPDATE_SECTION: 'UpdateSection',
  REMOVE_SECTION: 'RemoveSection',
  ACTIVATE_CLASS: 'ActivateClass',
  DEACTIVATE_CLASS: 'DeactivateClass',
  CREATE_FEE_CATEGORY: 'CreateFeeCategory',
  UPDATE_FEE_CATEGORY: 'UpdateFeeCategory',
  CREATE_CLASS_FEE: 'CreateClassFee',
  UPDATE_CLASS_FEE: 'UpdateClassFee',
  CREATE_FEE_PLAN: 'CreateFeePlan',
  UPDATE_FEE_PLAN: 'UpdateFeePlan',
  RECORD_PAYMENT: 'RecordPayment',
  UPDATE_PAYMENT: 'UpdatePayment',
  REVERSE_PAYMENT: 'ReversePayment',
  CREATE_ATTENDANCE: 'CreateAttendance',
  UPDATE_ATTENDANCE: 'UpdateAttendance',
  CORRECT_ATTENDANCE: 'CorrectAttendance',
  CREATE_NOTICE: 'CreateNotice',
  UPDATE_NOTICE: 'UpdateNotice',
  DELETE_NOTICE: 'DeleteNotice',
  TOGGLE_NOTICE_PIN: 'ToggleNoticePin',
  UPSERT_TIMETABLE_PERIOD: 'UpsertTimetablePeriod',
  CLEAR_TIMETABLE_FOR_SECTION: 'ClearTimetableForSection',
  CREATE_SUGGESTION: 'CreateSuggestion',
  RESPOND_TO_SUGGESTION: 'RespondToSuggestion',
  CREATE_NOTIFICATION: 'CreateNotification',
  MARK_NOTIFICATION_READ: 'MarkNotificationRead',
  MARK_ALL_NOTIFICATIONS_READ: 'MarkAllNotificationsRead',
  CREATE_USER: 'CreateUser',
  LINK_STUDENT_PARENT: 'LinkStudentParent',
  CREATE_PARENT: 'CreateParent',
  CREATE_PARENT_WITHOUT_USER: 'CreateParentWithoutUser',
  LINK_PARENT_USER: 'LinkParentUser',
  CREATE_SUBJECT: 'CreateSubject',
  ASSIGN_TEACHER_SUBJECT: 'AssignTeacherSubject',
  SWITCH_ROLE: 'SwitchRole',
  CREATE_HOLIDAY: 'CreateHoliday',
  UPDATE_HOLIDAY: 'UpdateHoliday',
  DELETE_HOLIDAY: 'DeleteHoliday',
  CREATE_PUBLIC_HOLIDAY: 'CreatePublicHoliday',
  UPSERT_TIMETABLE_PERIOD_FULL: 'UpsertTimetablePeriodFull',
  PUBLISH_TIMETABLE_SECTION: 'PublishTimetableSection',
  UNPUBLISH_TIMETABLE_SECTION: 'UnpublishTimetableSection',
};

// ─── Branches ─────────────────────────────────────────────────────────────────
export const getBranches = async ({ limit = 200, offset = 0 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_BRANCHES, { limit, offset });
  return res.branches || [];
};

export const getBranchDetails = async (branchId) => {
  const res = await dataConnectClient.query(Q.GET_BRANCH_DETAILS, { branchId });
  return res.branch || null;
};

export const createBranch = async (payload) => {
  const res = await dataConnectClient.mutate(M.CREATE_BRANCH, payload);
  return res;
};

export const updateBranch = async (payload) => {
  const res = await dataConnectClient.mutate(M.UPDATE_BRANCH, payload);
  return res;
};

export const assignBranchAdmin = async (payload) => {
  return dataConnectClient.mutate(M.ASSIGN_BRANCH_ADMIN, payload);
};

export const assignPrincipal = async (payload) => {
  return dataConnectClient.mutate(M.ASSIGN_PRINCIPAL, payload);
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStatistics = async ({ branchId } = {}) => {
  const res = await dataConnectClient.query(Q.GET_DASHBOARD_STATISTICS, { branchId: branchId || null });
  return res;
};

export const getBranchAnalytics = async (branchId) => {
  const res = await dataConnectClient.query(Q.GET_BRANCH_ANALYTICS, { branchId });
  return res;
};

export const getPrincipalDashboard = async (branchId) => {
  const res = await dataConnectClient.query(Q.GET_PRINCIPAL_DASHBOARD, { branchId });
  return res;
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const getStudents = async ({ branchId, limit = 100, offset = 0 } = {}) => {
  if (!branchId) {
    const res = await dataConnectClient.query(Q.GET_GLOBAL_STUDENTS, { limit, offset });
    return res.students || [];
  }
  const res = await dataConnectClient.query(Q.GET_STUDENTS, { branchId, limit, offset });
  return res.students || [];
};

export const getStudentsBySection = async (sectionId, { limit = 500, offset = 0 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_STUDENTS_BY_SECTION, { sectionId, limit, offset });
  return res.students || [];
};

export const getCoordinatorStudentsByWing = async ({ branchId, wing, limit = 500, offset = 0 }) => {
  const res = await dataConnectClient.query(Q.GET_COORDINATOR_STUDENTS_BY_WING, { branchId, wing, limit, offset });
  return res.students || [];
};

export const getStudentDetails = async (studentId) => {
  const res = await dataConnectClient.query(Q.GET_STUDENT_DETAILS, { studentId });
  return res || null;
};

export const searchStudents = async ({ branchId, searchText, limit = 25 }) => {
  const res = await dataConnectClient.query(Q.SEARCH_STUDENTS, { branchId, searchText, limit });
  return res.students || [];
};

export const createStudent = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_STUDENT, payload);
};

export const updateStudent = async (payload) => {
  return dataConnectClient.mutate(M.UPDATE_STUDENT, payload);
};

export const updateStudentStatus = async ({ studentId, status }) => {
  return dataConnectClient.mutate(M.UPDATE_STUDENT_STATUS, { studentId, status });
};

export const transferStudent = async (payload) => {
  return dataConnectClient.mutate(M.TRANSFER_STUDENT, payload);
};

export const bulkAssignStudents = async ({ studentIds, classId, sectionId }) => {
  const promises = studentIds.map(studentId => {
    return dataConnectClient.mutate('UpdateStudentSection', { studentId, classId, sectionId });
  });
  return Promise.all(promises);
};

export const promoteStudents = async (payload) => {
  return dataConnectClient.mutate(M.PROMOTE_STUDENTS, payload);
};

export const getParentChildren = async (parentId) => {
  const res = await dataConnectClient.query(Q.GET_PARENT_CHILDREN, { parentId });
  return res.students || [];
};

export const getParentChildrenByUser = async (userId) => {
  const res = await dataConnectClient.query(Q.GET_PARENT_CHILDREN_BY_USER, { userId });
  return res.students || [];
};

export const getStudentAttendance = async ({ studentId, month, year }) => {
  const res = await dataConnectClient.query(Q.GET_STUDENT_ATTENDANCE, { studentId, month, year });
  return res.attendanceRecords || [];
};

export const getStudentFeeHistory = async (studentId) => {
  const res = await dataConnectClient.query(Q.GET_STUDENT_FEE_HISTORY, { studentId });
  return res;
};

// ─── Classes & Sections ───────────────────────────────────────────────────────
export const getAcademicClasses = async ({ limit = 100, offset = 0 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_ACADEMIC_CLASSES, { limit, offset });
  return res.academicClasses || [];
};

export const getClassesByWing = async ({ wingId }) => {
  const res = await dataConnectClient.query(Q.GET_CLASSES_BY_WING, { wingId });
  return res.academicClasses || [];
};

export const getSections = async ({ branchId, academicYear = 2026, limit = 100, offset = 0 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_SECTIONS, {
    branchId: branchId || null,
    academicYear,
    limit,
    offset
  });
  return res.sections || [];
};

export const getSectionsDetailed = async ({ branchId, academicYear = 2026 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_SECTIONS, {
    branchId: branchId || null,
    academicYear: academicYear
  });
  return res;
};

export const getSectionsByClass = async (academicClassId) => {
  const res = await dataConnectClient.query(Q.GET_SECTIONS_BY_CLASS, { academicClassId });
  return res.sections || [];
};

export const createSection = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_SECTION, payload);
};

export const updateSection = async (payload) => {
  return dataConnectClient.mutate(M.UPDATE_SECTION, payload);
};

export const removeSection = async (sectionId) => {
  return dataConnectClient.mutate(M.REMOVE_SECTION, { sectionId });
};

export const activateClass = async (payload) => {
  return dataConnectClient.mutate(M.ACTIVATE_CLASS, payload);
};

export const deactivateClass = async (payload) => {
  return dataConnectClient.mutate(M.DEACTIVATE_CLASS, payload);
};

// ─── Teachers ─────────────────────────────────────────────────────────────────
export const getTeachers = async ({ branchId, limit = 100, offset = 0 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_TEACHERS, { branchId, limit, offset });
  return res.teachers || [];
};

export const getTeacherProfile = async (teacherId) => {
  const res = await dataConnectClient.query(Q.GET_TEACHER_PROFILE, { teacherId });
  return res.teacher || null;
};

export const getTeacherDashboard = async ({ branchId, teacherId }) => {
  const res = await dataConnectClient.query(Q.GET_TEACHER_DASHBOARD, { branchId, teacherId });
  return res;
};

export const getClassTeacherAssignments = async ({ branchId, academicYear = 2026 }) => {
  const res = await dataConnectClient.query(Q.GET_CLASS_TEACHER_ASSIGNMENTS, { branchId, academicYear });
  return {
    sections: res.sections || [],
    teacherSectionAssignments: res.teacherSectionAssignments || []
  };
};

export const createTeacher = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_TEACHER, payload);
};

export const updateTeacher = async (payload) => {
  return dataConnectClient.mutate(M.UPDATE_TEACHER, payload);
};

export const assignClassTeacher = async (payload) => {
  return dataConnectClient.mutate(M.ASSIGN_CLASS_TEACHER, payload);
};

export const removeClassTeacherAssignment = async (payload) => {
  return dataConnectClient.mutate(M.REMOVE_CLASS_TEACHER_ASSIGNMENT, payload);
};

export const getSectionsForTeacherAssignment = async ({ branchId, wing, academicYear = 2026 }) => {
  const res = await dataConnectClient.query(Q.GET_SECTIONS_FOR_TEACHER_ASSIGNMENT, {
    branchId,
    wing: wing || null,
    academicYear
  });
  return res.sections || [];
};

export const getSubjects = async ({ branchId } = {}) => {
  const res = await dataConnectClient.query(Q.GET_SUBJECTS, { branchId: branchId || null });
  return res.subjects || [];
};

// ─── Coordinators ─────────────────────────────────────────────────────────────
export const getCoordinators = async ({ branchId, limit = 100, offset = 0 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_COORDINATORS, {
    branchId: branchId || null, limit, offset,
  });
  return res.coordinators || [];
};

export const createCoordinator = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_COORDINATOR, payload);
};

export const updateCoordinator = async (payload) => {
  return dataConnectClient.mutate(M.UPDATE_COORDINATOR, payload);
};

// ─── Accountants ──────────────────────────────────────────────────────────────
export const getAccountants = async ({ branchId, limit = 100, offset = 0 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_ACCOUNTANTS, {
    branchId: branchId || null, limit, offset,
  });
  return res.accountants || [];
};

export const createAccountant = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_ACCOUNTANT, payload);
};

export const updateAccountant = async (payload) => {
  return dataConnectClient.mutate(M.UPDATE_ACCOUNTANT, payload);
};

// ─── Fees ─────────────────────────────────────────────────────────────────────
export const getFeeCategories = async ({ branchId } = {}) => {
  const res = await dataConnectClient.query(Q.GET_FEE_CATEGORIES, { branchId: branchId || null });
  return res.feeCategories || [];
};

export const getClassFees = async ({ branchId, academicYear }) => {
  const res = await dataConnectClient.query(Q.GET_CLASS_FEES, {
    branchId, academicYear: Number(academicYear), limit: 200, offset: 0,
  });
  return res.academicYearFeeTemplates || [];
};

export const getStudentFeeProfile = async (studentId) => {
  const res = await dataConnectClient.query(Q.GET_STUDENT_FEE_PROFILE, { studentId });
  return res;
};

export const getPaymentHistory = async ({ branchId, studentId, fromDate, toDate, limit = 200, offset = 0 } = {}) => {
  const variables = {
    branchId: branchId || 'sontyam-branch-id',
    limit,
    offset
  };
  if (studentId) variables.studentId = studentId;
  if (fromDate) variables.fromDate = fromDate;
  if (toDate) variables.toDate = toDate;

  const res = await dataConnectClient.query(Q.GET_PAYMENT_HISTORY, variables);
  return res.feePayments || [];
};

export const getFeeRecordsByBranch = async ({ branchId }) => {
  const res = await dataConnectClient.query(Q.GET_FEE_RECORDS_BY_BRANCH, { branchId });
  return res;
};

export const getAllFeeRecords = async ({ limit = 200, offset = 0 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_ALL_FEE_RECORDS, { limit, offset });
  return res;
};

export const getFeeReports = async ({ branchId, academicYear, limit = 1000, offset = 0 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_FEE_REPORTS, { branchId, limit, offset });
  if (res && res.students && academicYear) {
    res.students = res.students.map(student => {
      const filteredPlans = (student.reportFeePlans || []).filter(
        fp => fp.academicYear === Number(academicYear)
      );
      return {
        ...student,
        reportFeePlans: filteredPlans
      };
    });
  }
  return res;
};

export const createFeeCategory = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_FEE_CATEGORY, payload);
};

export const createClassFee = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_CLASS_FEE, payload);
};

export const createFeePlan = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_FEE_PLAN, payload);
};

export const recordPayment = async (payload) => {
  return dataConnectClient.mutate(M.RECORD_PAYMENT, payload);
};

export const reversePayment = async (payload) => {
  return dataConnectClient.mutate(M.REVERSE_PAYMENT, payload);
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const getAttendanceBySection = async ({ sectionId, date }) => {
  const res = await dataConnectClient.query(Q.GET_ATTENDANCE_BY_SECTION, { sectionId, attendanceDate: date });
  return res.attendances || [];
};

export const getAttendanceByMonth = async ({ branchId, sectionId, month, year }) => {
  const res = await dataConnectClient.query(Q.GET_ATTENDANCE_BY_MONTH, { branchId, sectionId, month, year });
  return res.attendanceRecords || [];
};

export const createAttendance = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_ATTENDANCE, payload);
};

export const updateAttendance = async (payload) => {
  return dataConnectClient.mutate(M.UPDATE_ATTENDANCE, payload);
};

export const correctAttendance = async (payload) => {
  return dataConnectClient.mutate(M.CORRECT_ATTENDANCE, payload);
};

// ─── Notice Board ─────────────────────────────────────────────────────────────
export const getNoticesByBranch = async ({ branchId, limit = 50, offset = 0 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_NOTICES_BY_BRANCH, { branchId, limit, offset });
  return res.notices || [];
};

export const createNotice = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_NOTICE, payload);
};

export const updateNotice = async (payload) => {
  return dataConnectClient.mutate(M.UPDATE_NOTICE, payload);
};

export const deleteNotice = async (noticeId) => {
  return dataConnectClient.mutate(M.DELETE_NOTICE, { noticeId });
};

// ─── Timetable ────────────────────────────────────────────────────────────────
export const getTimetableForSection = async (param) => {
  const sectionId = typeof param === 'string' ? param : param?.sectionId;
  const res = await dataConnectClient.query(Q.GET_TIMETABLE_FOR_SECTION, { sectionId });
  return res.timetablePeriods || [];
};

export const getTimetablesForBranch = async (branchId) => {
  const res = await dataConnectClient.query(Q.GET_TIMETABLES_FOR_BRANCH, { branchId });
  return res.timetablePeriods || [];
};

export const upsertTimetablePeriod = async (payload) => {
  return dataConnectClient.mutate(M.UPSERT_TIMETABLE_PERIOD, payload);
};

export const clearTimetableForSection = async (param, branchId) => {
  let sectionIdArg;
  let branchIdArg;
  if (typeof param === 'string') {
    sectionIdArg = param;
    branchIdArg = branchId;
  } else {
    sectionIdArg = param?.sectionId;
    branchIdArg = param?.branchId;
  }
  return dataConnectClient.mutate(M.CLEAR_TIMETABLE_FOR_SECTION, {
    sectionId: sectionIdArg,
    branchId: branchIdArg
  });
};

// ─── Suggestions ──────────────────────────────────────────────────────────────
export const getSuggestionsByBranch = async ({ branchId, limit = 50 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_SUGGESTIONS_BY_BRANCH, { branchId, limit });
  return res.suggestions || [];
};

export const getSuggestionsByParent = async ({ parentId }) => {
  const res = await dataConnectClient.query(Q.GET_SUGGESTIONS_BY_PARENT, { parentId });
  return res.suggestions || [];
};

export const createSuggestion = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_SUGGESTION, payload);
};

export const respondToSuggestion = async (payload) => {
  return dataConnectClient.mutate(M.RESPOND_TO_SUGGESTION, payload);
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotificationsByUser = async ({ userId, limit = 50 }) => {
  const res = await dataConnectClient.query(Q.GET_NOTIFICATIONS_BY_USER, { userId, limit });
  return res.notifications || [];
};

export const getUnreadNotificationCount = async ({ userId }) => {
  const res = await dataConnectClient.query(Q.GET_UNREAD_NOTIFICATION_COUNT, { userId });
  return res.notificationsAggregate?.count || 0;
};

export const markNotificationRead = async (notificationId) => {
  return dataConnectClient.mutate(M.MARK_NOTIFICATION_READ, { notificationId });
};

export const markAllNotificationsRead = async ({ userId }) => {
  return dataConnectClient.mutate(M.MARK_ALL_NOTIFICATIONS_READ, { userId });
};

export const createNotification = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_NOTIFICATION, payload);
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = async ({ branchId, limit = 100, offset = 0 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_AUDIT_LOGS, { branchId: branchId || null, limit, offset });
  const logs = res.auditLogs || [];
  return logs.map(log => ({
    id: log.id,
    action: log.action || 'System Action',
    timestamp: log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : 'N/A',
    by: log.changedById || 'system',
    role: log.changedByRole || 'SYSTEM',
    branch: branchId ? 'This Branch' : 'Global',
    entity: `${log.targetType || 'Record'} (${log.targetId || 'N/A'})`
  }));
};

// ─── Global Reports ───────────────────────────────────────────────────────────
export const getGlobalReports = async () => {
  const res = await dataConnectClient.query(Q.GET_GLOBAL_REPORTS, {});
  return res;
};

// ─── Wings ────────────────────────────────────────────────────────────────────
export const getWingsByBranch = async (branchId) => {
  const res = await dataConnectClient.query(Q.GET_WINGS_BY_BRANCH, { branchId });
  return res.wings || [];
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const getUsersByRole = async ({ role, branchId, limit = 100 } = {}) => {
  const res = await dataConnectClient.query(Q.GET_USERS_BY_ROLE, { role, branchId: branchId || null, limit });
  return res.users || [];
};

export const getUserByPhone = async (phoneNumber) => {
  const res = await dataConnectClient.query(Q.GET_USER_BY_PHONE, { phoneNumber });
  return res.users?.[0] || null;
};

export const createUser = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_USER, payload);
};

// ─── Parents ──────────────────────────────────────────────────────────────────
export const getParentByPhone = async ({ branchId, phoneNumber }) => {
  const res = await dataConnectClient.query(Q.GET_PARENT_BY_PHONE, { branchId, phoneNumber });
  return res.parents?.[0] || null;
};

export const createParent = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_PARENT, payload);
};

export const createParentWithoutUser = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_PARENT_WITHOUT_USER, payload);
};

export const linkStudentParent = async (payload) => {
  return dataConnectClient.mutate(M.LINK_STUDENT_PARENT, payload);
};

export const getStudentParents = async (studentId) => {
  const res = await dataConnectClient.query(Q.GET_STUDENT_PARENTS, { studentId });
  return res.studentParentLinks || [];
};

// ─── Promotions ───────────────────────────────────────────────────────────────
export const getPromotionHistory = async ({ branchId }) => {
  const res = await dataConnectClient.query(Q.GET_PROMOTION_HISTORY, { branchId });
  return res.promotionRecords || [];
};

export const changeUserRole = async ({ userId, oldRole, newRole }) => {
  return dataConnectClient.mutate(M.SWITCH_ROLE, { userId, oldRole, newRole });
};

export const broadcastNotification = async ({ branchId, title, message, target = 'all' }) => {
  if (!branchId) throw new Error('branchId required for broadcast');
  const userIds = new Set();

  try {
    const includeStaff = target === 'all' || target === 'teachers';
    const includeParents = target === 'all' || target === 'parents' || target === 'students';

    const [staffRes, studentsRes] = await Promise.all([
      includeStaff
        ? dataConnectClient.query(Q.GET_BRANCH_STAFF_USER_IDS, { branchId, limit: 500 })
        : Promise.resolve(null),
      includeParents
        ? dataConnectClient.query(Q.GET_BRANCH_STUDENTS_WITH_PARENTS, { branchId, limit: 1000 })
        : Promise.resolve(null),
    ]);

    if (staffRes?.users) {
      staffRes.users.forEach(u => u?.id && userIds.add(u.id));
    }
    if (studentsRes?.students) {
      studentsRes.students.forEach(s => {
        (s?.linkedParents || []).forEach(lp => lp?.userId && userIds.add(lp.userId));
      });
    }
  } catch (err) {
    console.log('[Notifications] Broadcast user fetch failed:', err);
    throw err;
  }

  if (!userIds.size) return { sent: 0, failed: 0 };

  const results = await Promise.allSettled(
    [...userIds].map(uid =>
      createNotification({ userId: uid, branchId, title, message, audienceRole: target.toUpperCase() })
    )
  );
  const sent = results.filter(r => r.status === 'fulfilled' && r.value).length;
  const failed = results.length - sent;
  console.log(`[Notifications] Broadcast sent ${sent}/${userIds.size}, failed ${failed}`);
  return { sent, failed };

// ─── Holidays ─────────────────────────────────────────────────────────────────
export const getHolidaysByBranch = async ({ branchId, fromDate, toDate }) => {
  const res = await dataConnectClient.query(Q.GET_HOLIDAYS_BY_BRANCH, { branchId, fromDate, toDate });
  return res.holidays || [];
};

export const createHoliday = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_HOLIDAY, payload);
};

export const updateHoliday = async (payload) => {
  return dataConnectClient.mutate(M.UPDATE_HOLIDAY, payload);
};

export const deleteHoliday = async (payload) => {
  return dataConnectClient.mutate(M.DELETE_HOLIDAY, payload);
};

export const createPublicHoliday = async (payload) => {
  return dataConnectClient.mutate(M.CREATE_PUBLIC_HOLIDAY, payload);
};

export const getActiveAcademicYear = async ({ branchId }) => {
  const res = await dataConnectClient.query(Q.GET_ACTIVE_ACADEMIC_YEAR, { branchId });
  return res.academicYears?.[0] || null;
};

// ─── Timetable ────────────────────────────────────────────────────────────────
export const upsertTimetablePeriodFull = async (payload) => {
  return dataConnectClient.mutate(M.UPSERT_TIMETABLE_PERIOD_FULL, payload);
};

export const publishTimetableSection = async (payload) => {
  return dataConnectClient.mutate(M.PUBLISH_TIMETABLE_SECTION, payload);
};

export const unpublishTimetableSection = async (payload) => {
  return dataConnectClient.mutate(M.UNPUBLISH_TIMETABLE_SECTION, payload);
};
