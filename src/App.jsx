import React,{ useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { AnimatePresence } from 'framer-motion';
import { FiMenu } from 'react-icons/fi';

// Navigation Components
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Drawer from './components/Drawer';

// Pages
import Login from './pages/shared/Login';
import Dashboard from './pages/mainAdmin/Dashboard';
import Schools from './pages/mainAdmin/Schools';
import Users from './pages/mainAdmin/Users';
import Reports from './pages/mainAdmin/Reports';
import Settings from './pages/mainAdmin/Settings';

// Subpages / Configurations from school.docx
import BranchContext from './pages/mainAdmin/subpages/BranchContext';
import CreateBranch from './pages/mainAdmin/subpages/CreateBranch';
import FeeSetup from './pages/mainAdmin/subpages/FeeSetup';
import AuditLogs from './pages/mainAdmin/subpages/AuditLogs';
import RevenueOverview from './pages/mainAdmin/subpages/RevenueOverview';
import GlobalReports from './pages/mainAdmin/subpages/GlobalReports';
import SendNotification from './pages/coordinator/subpages/SendNotification';
import PostNotice from './pages/coordinator/subpages/PostNotice';
import CreateStudent from './pages/branchAdmin/subpages/CreateStudent';
import CreateFeePlan from './pages/branchAdmin/subpages/CreateFeePlan';
import BulkUpload from './pages/branchAdmin/subpages/BulkUpload';
import CreateTeacher from './pages/branchAdmin/subpages/CreateTeacher';
import ClassTeachers from './pages/branchAdmin/subpages/ClassTeachers';
import FeePlans from './pages/accountant/subpages/FeePlans';
import FeeLedger from './pages/accountant/subpages/FeeLedger';
import BranchAnalytics from './pages/branchAdmin/subpages/BranchAnalytics';
import BranchSettings from './pages/branchAdmin/subpages/BranchSettings';
import EditBranch from './pages/mainAdmin/subpages/EditBranch';
import PromotionManagement from './pages/principal/subpages/PromotionManagement';
import Suggestions from './pages/parent/subpages/Suggestions';
import Homework from './pages/teacher/subpages/Homework';
import Coordinators from './pages/principal/subpages/Coordinators';
import Accountants from './pages/principal/subpages/Accountants';
import Sections from './pages/branchAdmin/subpages/Sections';
import ClassManagement from './pages/coordinator/subpages/ClassManagement';
import GraduateStudents from './pages/principal/subpages/GraduateStudents';
import HolidayManagement from './pages/principal/subpages/HolidayManagement';
import AcademicYear from './pages/principal/subpages/AcademicYear';
import YearManagement from './pages/principal/subpages/YearManagement';
import ExamsMarks from './pages/principal/subpages/ExamsMarks';
import FeeCollection from './pages/accountant/subpages/FeeCollection';
import FeeReports from './pages/accountant/subpages/FeeReports';
import FeeHistory from './pages/accountant/subpages/FeeHistory';
import TeacherStudents from './pages/teacher/subpages/TeacherStudents';
import Expenses from './pages/accountant/subpages/Expenses';
import RecordPayment from './pages/accountant/subpages/RecordPayment';
import BranchReports from './pages/accountant/subpages/BranchReports';
import Events from './pages/parent/subpages/Events';
import CorrectAttendance from './pages/teacher/subpages/CorrectAttendance';
import TakeAttendance from './pages/teacher/subpages/TakeAttendance';

// Role-Specific Imports to separate shared pages
import PrincipalProfile from './pages/principal/subpages/MyProfile';
import BranchAdminProfile from './pages/branchAdmin/subpages/MyProfile';
import CoordinatorProfile from './pages/coordinator/subpages/MyProfile';
import TeacherProfile from './pages/teacher/subpages/MyProfile';
import AccountantProfile from './pages/accountant/subpages/MyProfile';
import ParentProfile from './pages/parent/subpages/MyProfile';
import MainAdminProfile from './pages/mainAdmin/subpages/MyProfile';

import PrincipalNotifications from './pages/principal/subpages/Notifications';
import BranchAdminNotifications from './pages/branchAdmin/subpages/Notifications';
import CoordinatorNotifications from './pages/coordinator/subpages/Notifications';
import TeacherNotifications from './pages/teacher/subpages/Notifications';
import AccountantNotifications from './pages/accountant/subpages/Notifications';
import ParentNotifications from './pages/parent/subpages/Notifications';
import MainAdminNotifications from './pages/mainAdmin/subpages/Notifications';

import PrincipalNoticeBoard from './pages/principal/subpages/NoticeBoard';
import BranchAdminNoticeBoard from './pages/branchAdmin/subpages/NoticeBoard';
import CoordinatorNoticeBoard from './pages/coordinator/subpages/NoticeBoard';
import TeacherNoticeBoard from './pages/teacher/subpages/NoticeBoard';
import AccountantNoticeBoard from './pages/accountant/subpages/NoticeBoard';
import ParentNoticeBoard from './pages/parent/subpages/NoticeBoard';
import MainAdminNoticeBoard from './pages/mainAdmin/subpages/NoticeBoard';

import PrincipalAttendance from './pages/principal/subpages/AttendanceOverview';
import BranchAdminAttendance from './pages/branchAdmin/subpages/AttendanceOverview';
import CoordinatorAttendance from './pages/coordinator/subpages/AttendanceOverview';
import TeacherAttendance from './pages/teacher/subpages/AttendanceOverview';
import ParentAttendance from './pages/parent/subpages/AttendanceOverview';

import PrincipalFeeOverview from './pages/principal/subpages/FeeOverview';
import BranchAdminFeeOverview from './pages/branchAdmin/subpages/FeeOverview';
import CoordinatorFeeOverview from './pages/coordinator/subpages/FeeOverview';
import TeacherFeeOverview from './pages/teacher/subpages/FeeOverview';
import AccountantFeeOverview from './pages/accountant/subpages/FeeOverview';
import ParentFeeOverview from './pages/parent/subpages/FeeOverview';

import PrincipalTimetable from './pages/principal/subpages/Timetable';
import BranchAdminTimetable from './pages/branchAdmin/subpages/Timetable';
import CoordinatorTimetable from './pages/coordinator/subpages/Timetable';
import TeacherTimetable from './pages/teacher/subpages/Timetable';
import ParentTimetable from './pages/parent/subpages/Timetable';

import PrincipalStudentRecords from './pages/principal/subpages/StudentRecords';
import BranchAdminStudentRecords from './pages/branchAdmin/subpages/StudentRecords';
import CoordinatorStudentRecords from './pages/coordinator/subpages/StudentRecords';
import AccountantStudentRecords from './pages/accountant/subpages/StudentRecords';
import ParentStudentRecords from './pages/parent/subpages/StudentRecords';

import PrincipalSearchStudents from './pages/principal/subpages/SearchStudents';
import BranchAdminSearchStudents from './pages/branchAdmin/subpages/SearchStudents';
import CoordinatorSearchStudents from './pages/coordinator/subpages/SearchStudents';
import ParentSearchStudents from './pages/parent/subpages/SearchStudents';

import PrincipalTeachers from './pages/principal/subpages/Teachers';
import BranchAdminTeachers from './pages/branchAdmin/subpages/Teachers';

import PrincipalTransfer from './pages/principal/subpages/TransferStudent';
import BranchAdminTransfer from './pages/branchAdmin/subpages/TransferStudent';

// Role-Specific Wrappers
const MyProfile = () => {
  const { activeRole } = useApp();
  const r = activeRole?.toUpperCase();
  if (r === 'MAIN_ADMIN') return <MainAdminProfile />;
  if (r === 'BRANCH_ADMIN') return <BranchAdminProfile />;
  if (r === 'PRINCIPAL') return <PrincipalProfile />;
  if (r === 'COORDINATOR') return <CoordinatorProfile />;
  if (r === 'TEACHER' || r === 'CLASS_TEACHER') return <TeacherProfile />;
  if (r === 'ACCOUNTANT') return <AccountantProfile />;
  if (r === 'PARENT') return <ParentProfile />;
  return <PrincipalProfile />;
};

const Notifications = () => {
  const { activeRole } = useApp();
  const r = activeRole?.toUpperCase();
  if (r === 'MAIN_ADMIN') return <MainAdminNotifications />;
  if (r === 'BRANCH_ADMIN') return <BranchAdminNotifications />;
  if (r === 'PRINCIPAL') return <PrincipalNotifications />;
  if (r === 'COORDINATOR') return <CoordinatorNotifications />;
  if (r === 'TEACHER' || r === 'CLASS_TEACHER') return <TeacherNotifications />;
  if (r === 'ACCOUNTANT') return <AccountantNotifications />;
  if (r === 'PARENT') return <ParentNotifications />;
  return <PrincipalNotifications />;
};

const NoticeBoard = () => {
  const { activeRole } = useApp();
  const r = activeRole?.toUpperCase();
  if (r === 'MAIN_ADMIN') return <MainAdminNoticeBoard />;
  if (r === 'BRANCH_ADMIN') return <BranchAdminNoticeBoard />;
  if (r === 'PRINCIPAL') return <PrincipalNoticeBoard />;
  if (r === 'COORDINATOR') return <CoordinatorNoticeBoard />;
  if (r === 'TEACHER' || r === 'CLASS_TEACHER') return <TeacherNoticeBoard />;
  if (r === 'ACCOUNTANT') return <AccountantNoticeBoard />;
  if (r === 'PARENT') return <ParentNoticeBoard />;
  return <PrincipalNoticeBoard />;
};

const AttendanceOverview = () => {
  const { activeRole } = useApp();
  const r = activeRole?.toUpperCase();
  if (r === 'BRANCH_ADMIN') return <BranchAdminAttendance />;
  if (r === 'PRINCIPAL') return <PrincipalAttendance />;
  if (r === 'COORDINATOR') return <CoordinatorAttendance />;
  if (r === 'TEACHER' || r === 'CLASS_TEACHER') return <TeacherAttendance />;
  if (r === 'PARENT') return <ParentAttendance />;
  return <PrincipalAttendance />;
};

const FeeOverview = () => {
  const { activeRole } = useApp();
  const r = activeRole?.toUpperCase();
  if (r === 'BRANCH_ADMIN') return <BranchAdminFeeOverview />;
  if (r === 'PRINCIPAL') return <PrincipalFeeOverview />;
  if (r === 'COORDINATOR') return <CoordinatorFeeOverview />;
  if (r === 'TEACHER' || r === 'CLASS_TEACHER') return <TeacherFeeOverview />;
  if (r === 'ACCOUNTANT') return <AccountantFeeOverview />;
  if (r === 'PARENT') return <ParentFeeOverview />;
  return <PrincipalFeeOverview />;
};

const Timetable = () => {
  const { activeRole } = useApp();
  const r = activeRole?.toUpperCase();
  if (r === 'BRANCH_ADMIN') return <BranchAdminTimetable />;
  if (r === 'PRINCIPAL') return <PrincipalTimetable />;
  if (r === 'COORDINATOR') return <CoordinatorTimetable />;
  if (r === 'TEACHER' || r === 'CLASS_TEACHER') return <TeacherTimetable />;
  if (r === 'PARENT') return <ParentTimetable />;
  return <PrincipalTimetable />;
};

const StudentRecords = () => {
  const { activeRole } = useApp();
  const r = activeRole?.toUpperCase();
  if (r === 'BRANCH_ADMIN') return <BranchAdminStudentRecords />;
  if (r === 'PRINCIPAL') return <PrincipalStudentRecords />;
  if (r === 'COORDINATOR') return <CoordinatorStudentRecords />;
  if (r === 'ACCOUNTANT') return <AccountantStudentRecords />;
  if (r === 'PARENT') return <ParentStudentRecords />;
  return <PrincipalStudentRecords />;
};

const SearchStudents = () => {
  const { activeRole } = useApp();
  const r = activeRole?.toUpperCase();
  if (r === 'BRANCH_ADMIN') return <BranchAdminSearchStudents />;
  if (r === 'PRINCIPAL') return <PrincipalSearchStudents />;
  if (r === 'COORDINATOR') return <CoordinatorSearchStudents />;
  if (r === 'PARENT') return <ParentSearchStudents />;
  return <PrincipalSearchStudents />;
};

const Teachers = () => {
  const { activeRole } = useApp();
  const r = activeRole?.toUpperCase();
  if (r === 'BRANCH_ADMIN') return <BranchAdminTeachers />;
  return <PrincipalTeachers />;
};

const TransferStudent = () => {
  const { activeRole } = useApp();
  const r = activeRole?.toUpperCase();
  if (r === 'BRANCH_ADMIN') return <BranchAdminTransfer />;
  return <PrincipalTransfer />;
};






const LayoutShell = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useApp();

  return (
    <div className="flex min-h-screen bg-[#EEF5FB]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex justify-between items-center bg-white border-b border-[#e2e8f0]/80 py-3.5 px-4 sticky top-0 z-30 shadow-sm shrink-0">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-lg text-dark transition-colors cursor-pointer"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-bold text-brand-blue tracking-tight select-none">NSRIT Connect</span>
          
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-8 h-8 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center text-xs font-bold font-sans cursor-pointer hover:bg-brand-blue/20 transition-all select-none"
          >
            {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'MA'}
          </button>
        </header>

        {/* Dynamic Page Rendering */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Profile Drawer Overlay */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { user, activeRole, roleSelectionPending } = useApp();
  const isMainAdmin = activeRole === 'MAIN_ADMIN';

  if (!user || roleSelectionPending) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <LayoutShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schools" element={isMainAdmin ? <Schools /> : <Navigate to="/dashboard" replace />} />
          <Route path="/users" element={isMainAdmin ? <Users /> : <Navigate to="/dashboard" replace />} />
          <Route path="/reports" element={isMainAdmin ? <Reports /> : <Navigate to="/dashboard" replace />} />
          <Route path="/settings" element={isMainAdmin ? <Settings /> : <Navigate to="/dashboard" replace />} />
          
          {/* Subpage configuration routes */}
          <Route path="/settings/branch-context" element={<BranchContext />} />
          <Route path="/settings/create-branch" element={<CreateBranch />} />
          <Route path="/settings/global-students" element={<StudentRecords />} />
          <Route path="/settings/search-students" element={<SearchStudents />} />
          <Route path="/settings/class-fee-templates" element={<FeeSetup />} />
          <Route path="/settings/audit-logs" element={<AuditLogs />} />
          <Route path="/settings/revenue-overview" element={<RevenueOverview />} />
          <Route path="/settings/global-reports" element={<GlobalReports />} />
          <Route path="/settings/profile" element={<MyProfile />} />
          <Route path="/settings/notifications" element={<Notifications />} />
          <Route path="/settings/send-notification" element={<SendNotification />} />
          <Route path="/settings/post-notice" element={<PostNotice />} />
          <Route path="/settings/create-student" element={<CreateStudent />} />
          <Route path="/settings/bulk-upload" element={<BulkUpload />} />
          <Route path="/settings/teachers" element={<Teachers />} />
          <Route path="/settings/create-teacher" element={<CreateTeacher />} />
          <Route path="/settings/class-teachers" element={<ClassTeachers />} />
          <Route path="/settings/teacher-students" element={<TeacherStudents />} />
          <Route path="/settings/attendance-overview" element={<AttendanceOverview />} />
          <Route path="/settings/correct-attendance" element={<CorrectAttendance />} />
          <Route path="/settings/student-management" element={<StudentRecords />} />
          <Route path="/settings/fee-overview" element={<FeeOverview />} />
          <Route path="/settings/fee-plans" element={<FeePlans />} />
          <Route path="/settings/create-fee-plan" element={<CreateFeePlan />} />
          <Route path="/settings/ledger" element={<FeeLedger />} />
          <Route path="/settings/branch-analytics" element={<BranchAnalytics />} />
          <Route path="/settings/branch-settings" element={<BranchSettings />} />
          <Route path="/settings/edit-branch" element={<EditBranch />} />
          <Route path="/settings/timetable" element={<Timetable />} />
          <Route path="/settings/promotions" element={<PromotionManagement />} />
          <Route path="/settings/transfer-student" element={<TransferStudent />} />
          <Route path="/settings/suggestions" element={<Suggestions />} />
          <Route path="/settings/homework" element={<Homework />} />
          <Route path="/settings/coordinators" element={<Coordinators />} />
          <Route path="/settings/accountants" element={<Accountants />} />
          <Route path="/settings/sections" element={<Sections />} />
          <Route path="/settings/classes" element={<ClassManagement />} />
          <Route path="/settings/graduate-students" element={<GraduateStudents />} />
          <Route path="/settings/holidays" element={<HolidayManagement />} />
          <Route path="/settings/academic-year" element={<AcademicYear />} />
          <Route path="/settings/year-management" element={<YearManagement />} />
          <Route path="/settings/exams-marks" element={<ExamsMarks />} />
          <Route path="/settings/collection" element={<FeeCollection />} />
          <Route path="/settings/fee-reports" element={<FeeReports />} />
          <Route path="/settings/fee-history" element={<FeeHistory />} />
          <Route path="/settings/expenses" element={<Expenses />} />
          <Route path="/settings/record-payment" element={<RecordPayment />} />
          <Route path="/settings/branch-reports" element={<BranchReports />} />
          <Route path="/settings/events" element={<Events />} />
          <Route path="/settings/take-attendance" element={<TakeAttendance />} />
          <Route path="/settings/notice-board" element={<NoticeBoard />} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </LayoutShell>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}






export default App;
