import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useDataFetch } from '../../hooks/useDataFetch';
import { getDashboardStatistics } from '../../services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiUsers, FiSettings, FiGlobe, FiDollarSign, FiLayers,
  FiTrendingUp, FiActivity, FiArrowUpRight, FiArrowRight, FiSliders,
  FiBriefcase, FiPlus, FiBookOpen, FiClock, FiPercent, FiMoreVertical,
  FiCalendar, FiFileText, FiList, FiTag
} from 'react-icons/fi';
import {
  HiOutlineBuildingOffice2, HiOutlineUserGroup, HiOutlineCalendarDays,
  HiOutlineUserPlus, HiOutlineAcademicCap, HiOutlineClipboardDocumentList
} from 'react-icons/hi2';
import Drawer from '../../components/Drawer';
import { useNavigate } from 'react-router-dom';

// Import action views
import BranchContextModal from './subpages/BranchContext';
import CreateBranchModal from './subpages/CreateBranch';
import CreateUserModal from './subpages/CreateUser';
import StudentRecordsModal from '../shared/StudentRecords';
import FeeSetupModal from './subpages/FeeSetup';
import AuditLogsModal from './subpages/AuditLogs';
import BranchAdminDashboard from '../branchAdmin/Dashboard';
import PrincipalDashboard from '../principal/Dashboard';
import CoordinatorDashboard from '../coordinator/Dashboard';
import TeacherDashboard from '../teacher/Dashboard';
import ParentDashboard from '../parent/Dashboard';
import AccountantDashboard from '../accountant/Dashboard';

const Dashboard = () => {
  const {
    user,
    branches,
    fees,
    activeRole,
    currentBranchContext,
    setCurrentBranchContext
  } = useApp();

  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  // Modal Control States
  const [activeModal, setActiveModal] = useState(null); // 'branch_context' | 'create_branch' | 'create_user' | 'students' | 'fee_setup' | 'audit_logs'

  // Fetch live statistics from Firebase Data Connect
  const contextBranchId = currentBranchContext?.id || null;
  const { data: stats } = useDataFetch(
    () => getDashboardStatistics(),
    [],
    { defaultValue: null, pollInterval: 15000 }
  );

  // Compute stats dynamically from the returned arrays
  const studentsCount = useMemo(() => {
    if (!stats?.students) return currentBranchContext?.studentsCount ?? branches.reduce((s, b) => s + (b.studentsCount || 0), 0);
    if (contextBranchId) {
      return stats.students.filter(s => s.branchId === contextBranchId).length;
    }
    return stats.students.length;
  }, [stats, contextBranchId, currentBranchContext, branches]);

  const facultyCount = useMemo(() => {
    if (!stats?.teachers) return currentBranchContext?.facultyCount ?? branches.reduce((s, b) => s + (b.facultyCount || 0), 0);
    if (contextBranchId) {
      return stats.teachers.filter((teacher) => teacher.branchId === contextBranchId).length;
    }
    return stats.teachers.length;
  }, [stats, contextBranchId, currentBranchContext, branches]);

  const branchesCount = contextBranchId ? 1 : branches.length;
  const now = new Date();
  const currentDateLabel = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const currentHour = now.getHours();
  const greeting = currentHour < 12
    ? 'Good Morning'
    : currentHour < 17
      ? 'Good Afternoon'
      : 'Good Evening';

  if (activeRole === 'BRANCH_ADMIN') return <BranchAdminDashboard />;
  if (activeRole === 'PRINCIPAL') return <PrincipalDashboard />;
  if (activeRole === 'COORDINATOR') return <CoordinatorDashboard />;
  if (activeRole === 'TEACHER' || activeRole === 'CLASS_TEACHER') return <TeacherDashboard />;
  if (activeRole === 'PARENT') return <ParentDashboard />;
  if (activeRole === 'ACCOUNTANT') return <AccountantDashboard />;

  const handleListItemClick = (item) => {
    if (item === 'Branch Context') navigate('/settings/branch-context');
    else if (item === 'Manage Branches') navigate('/schools');
    else if (item === 'Create Branch') navigate('/settings/create-branch');
    else if (item === 'Manage Users') navigate('/users');
    else if (item === 'Global Students') navigate('/settings/global-students');
    else if (item === 'Class Fee Setup') navigate('/settings/class-fee-templates');
    else if (item === 'Audit Logs') navigate('/settings/audit-logs');
    else if (item === 'Global Analytics') navigate('/reports');
    else if (item === 'Add Student') navigate('/settings/create-student');
    else if (item === 'Manage Students') navigate('/settings/global-students');
    else if (item === 'View Attendance') navigate('/settings/attendance-overview');
    else if (item === 'Academic Structure') navigate('/settings/classes');
    else if (item === 'Promotion Management') navigate('/settings/promotions');
    else if (item === 'Graduate Students') navigate('/settings/graduate-students');
    else if (item === 'Timetable') navigate('/settings/timetable');
    else if (item === 'Notice Board') navigate('/settings/notice-board');
    else if (item === 'Holiday Management') navigate('/settings/holidays');
    else if (item === 'Academic Year') navigate('/settings/academic-year');
    else if (item === 'Year Management') navigate('/settings/year-management');
    else if (item === 'Exams & Marks') navigate('/settings/exams-marks');
    else if (item === 'Teachers') navigate('/settings/teachers');
    else if (item === 'Coordinators') navigate('/settings/coordinators');
    else if (item === 'Accountants') navigate('/settings/accountants');
    else if (item === 'Assign Class Teacher') navigate('/settings/class-teachers');
  };

  const branchAcademicItems = [
    { title: 'Add Student', desc: 'Enrol a student in this branch', icon: <HiOutlineUserPlus className="w-5 h-5" />, color: 'text-[#23C16B] bg-[#E8F8F0]' },
    { title: 'Manage Students', desc: 'View and edit student records', icon: <FiUsers className="w-5 h-5" />, color: 'text-[#1597E5] bg-[#EEF5FB]' },
    { title: 'View Attendance', desc: 'Review branch-wide attendance', icon: <FiCalendar className="w-5 h-5" />, color: 'text-accent-purple bg-[#F3E8FF]' },
    { title: 'Academic Structure', desc: 'Manage classes and sections', icon: <FiGrid className="w-5 h-5" />, color: 'text-brand-blue bg-[#EEF5FB]' },
    { title: 'Promotion Management', desc: 'Run year-end promotions', icon: <FiTrendingUp className="w-5 h-5" />, color: 'text-[#FF9F1C] bg-[#FFF8EE]' },
    { title: 'Graduate Students', desc: 'Manage graduating students', icon: <HiOutlineAcademicCap className="w-5 h-5" />, color: 'text-emerald-500 bg-[#E8F8F0]' },
    { title: 'Timetable', desc: 'Configure weekly schedules', icon: <FiClock className="w-5 h-5" />, color: 'text-brand-blue bg-[#EEF5FB]' },
    { title: 'Notice Board', desc: 'Publish notices to the branch', icon: <FiFileText className="w-5 h-5" />, color: 'text-cyan-500 bg-cyan-50' },
    { title: 'Holiday Management', desc: 'Manage school holidays', icon: <FiCalendar className="w-5 h-5" />, color: 'text-rose-500 bg-rose-50' },
    { title: 'Academic Year', desc: 'Review year status and rollover', icon: <FiSliders className="w-5 h-5" />, color: 'text-amber-500 bg-[#FFF8EE]' },
    { title: 'Year Management', desc: 'Create, activate and close years', icon: <FiCalendar className="w-5 h-5" />, color: 'text-sky-500 bg-sky-50' },
    { title: 'Exams & Marks', desc: 'Manage exams, marks and results', icon: <FiList className="w-5 h-5" />, color: 'text-purple-500 bg-purple-50' }
  ];

  const branchStaffItems = [
    { title: 'Teachers', desc: 'Roster, assignments and subjects', icon: <HiOutlineAcademicCap className="w-5 h-5" />, color: 'text-accent-purple bg-[#F3E8FF]' },
    { title: 'Coordinators', desc: 'Manage wing supervisors', icon: <FiUsers className="w-5 h-5" />, color: 'text-brand-blue bg-[#EEF5FB]' },
    { title: 'Accountants', desc: 'Manage fee desk operators', icon: <FiTag className="w-5 h-5" />, color: 'text-[#FF9F1C] bg-[#FFF8EE]' },
    { title: 'Assign Class Teacher', desc: 'Assign teachers to sections', icon: <HiOutlineClipboardDocumentList className="w-5 h-5" />, color: 'text-brand-blue bg-[#EEF5FB]' }
  ];

  const openBranchFeature = (title) => {
    if (!currentBranchContext) {
      navigate('/settings/branch-context');
      return;
    }
    handleListItemClick(title);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Area: Main content */}
        <div className="lg:col-span-2 space-y-6">
      {/* Top Hero Banner */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 md:p-8 text-white card-shadow overflow-hidden">
        {/* Floating circles decoration */}
        <div className="absolute top-[-40px] right-[-40px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-50px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        {/* Top bar with Profile click and Drawer Trigger */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-12 h-12 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-lg font-bold font-sans cursor-pointer hover:bg-white/30 transition-all select-none"
            >
              {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'MA'}
            </button>
            <div>
              <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">{greeting}</p>
              <h1 className="text-xl font-bold md:text-2xl">{user?.name || 'Main Admin'}</h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 border border-white/25 rounded-full mt-1.5 text-[10px] font-bold tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                {currentBranchContext ? `${currentBranchContext.name} Admin` : activeRole.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 relative">
            {/* Three Dots Trigger Button */}
            <button
              onClick={() => setShowThreeDotsMenu(true)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm active:scale-95 z-30"
            >
              <FiMoreVertical className="w-5 h-5" />
            </button>

            <time dateTime={now.toISOString()} className="text-[11px] font-bold text-white/70 uppercase">
              {currentDateLabel}
            </time>
            {/* Context indicator */}
            {currentBranchContext && (
              <button
                onClick={() => setCurrentBranchContext(null)}
                className="bg-white/20 hover:bg-white/30 border border-white/25 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Clear Branch Context
              </button>
            )}
          </div>
        </div>

        {/* Bottom statistics panel */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2 pt-6 border-t border-white/10 text-center">
          <div className="border-r border-white/10 last:border-none px-0.5">
            <p className="text-base sm:text-lg md:text-2xl font-bold">{branchesCount}</p>
            <p className="text-[8px] sm:text-[9.5px] md:text-xs text-white/60 font-semibold uppercase tracking-wider mt-0.5 whitespace-nowrap">Branches</p>
          </div>
          <div className="border-r border-white/10 last:border-none px-0.5">
            <p className="text-base sm:text-lg md:text-2xl font-bold">{studentsCount}</p>
            <p className="text-[8px] sm:text-[9.5px] md:text-xs text-white/60 font-semibold uppercase tracking-wider mt-0.5 whitespace-nowrap">Students</p>
          </div>
          <div className="border-r border-white/10 last:border-none px-0.5">
            <p className="text-base sm:text-lg md:text-2xl font-bold">{facultyCount}</p>
            <p className="text-[8px] sm:text-[9.5px] md:text-xs text-white/60 font-semibold uppercase tracking-wider mt-0.5 whitespace-nowrap">Faculty & Staff</p>
          </div>
          <div className="px-0.5">
            <p className="text-base sm:text-lg md:text-2xl font-bold">0%</p>
            <p className="text-[8px] sm:text-[9.5px] md:text-xs text-white/60 font-semibold uppercase tracking-wider mt-0.5 whitespace-nowrap">Attendance</p>
          </div>
        </div>
      </div>

      {/* Global Overview Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-[#1597E5]/10 text-brand-blue">
            <FiGlobe className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-dark tracking-wider uppercase">Global Overview</h2>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Branches */}
          <div
            onClick={() => handleListItemClick('Manage Branches')}
            className="bg-white rounded-[24px] p-3 sm:p-4 card-shadow border border-[#e2e8f0]/40 flex flex-col justify-between min-h-[130px] sm:min-h-[140px] relative group cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                <HiOutlineBuildingOffice2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <FiArrowUpRight className="w-4 h-4 text-secondaryText opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-extrabold text-dark leading-none">{branchesCount}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-secondaryText uppercase tracking-wider mt-1.5 leading-tight whitespace-nowrap">Total Branches</p>
              <p className="text-[7.5px] sm:text-[8px] font-bold text-accent-green mt-0.5 uppercase tracking-wide leading-none whitespace-nowrap">
                {currentBranchContext ? (currentBranchContext.active ? '1 Active' : '0 Active') : `${branches.filter(b=>b.active).length} Active`}
              </p>
            </div>
          </div>

          {/* Card 2: Students */}
          <div
            onClick={() => handleListItemClick('Global Students')}
            className="bg-white rounded-[24px] p-3 sm:p-4 card-shadow border border-[#e2e8f0]/40 flex flex-col justify-between min-h-[130px] sm:min-h-[140px] relative group cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center">
                <HiOutlineUserGroup className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <FiArrowUpRight className="w-4 h-4 text-secondaryText opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-extrabold text-dark leading-none">{studentsCount}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-secondaryText uppercase tracking-wider mt-1.5 leading-tight whitespace-nowrap">Students</p>
              <p className="text-[7.5px] sm:text-[8px] font-bold text-secondaryText mt-0.5 uppercase tracking-wide leading-none whitespace-nowrap">Enrolled Globally</p>
            </div>
          </div>

          {/* Card 3: Faculty */}
          <div
            onClick={() => handleListItemClick('Manage Users')}
            className="bg-white rounded-[24px] p-3 sm:p-4 card-shadow border border-[#e2e8f0]/40 flex flex-col justify-between min-h-[130px] sm:min-h-[140px] relative group cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center">
                <FiUsers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <FiArrowUpRight className="w-4 h-4 text-secondaryText opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-extrabold text-dark leading-none">{facultyCount}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-secondaryText uppercase tracking-wider mt-1.5 leading-tight whitespace-nowrap">Faculty & Staff</p>
              <p className="text-[7.5px] sm:text-[8px] font-bold text-secondaryText mt-0.5 uppercase tracking-wide leading-none whitespace-nowrap">All Branches</p>
            </div>
          </div>

          {/* Card 4: Attendance */}
          <div
            onClick={() => navigate('/settings/global-reports')}
            className="bg-white rounded-[24px] p-3 sm:p-4 card-shadow border border-[#e2e8f0]/40 flex flex-col justify-between min-h-[130px] sm:min-h-[140px] relative group cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center">
                <HiOutlineCalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <FiArrowUpRight className="w-4 h-4 text-secondaryText opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-extrabold text-dark leading-none">0%</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-secondaryText uppercase tracking-wider mt-1.5 leading-tight whitespace-nowrap">Attendance</p>
              <p className="text-[7.5px] sm:text-[8px] font-bold text-secondaryText mt-0.5 uppercase tracking-wide leading-none whitespace-nowrap">Today Global Avg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent-green/10 text-accent-green">
              <FiDollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-dark tracking-wider uppercase">Revenue</h2>
          </div>
          <button
            onClick={() => navigate('/settings/global-reports')}
            className="text-xs font-semibold text-brand-blue hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Full Report &gt;
          </button>
        </div>

        {/* Triple Column Card */}
        <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden p-4 sm:p-5 md:p-6">
          <div className="grid grid-cols-3 gap-1 md:gap-3 text-center pb-5 sm:pb-6 border-b border-[#e2e8f0]/80">
            {/* Collected */}
            <div className="border-r border-[#e2e8f0]/80 last:border-none px-0.5 sm:px-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center mx-auto mb-2">
                <FiDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-secondaryText uppercase tracking-wider leading-tight whitespace-nowrap">Collected</p>
              <p className="text-xs sm:text-sm md:text-base font-extrabold text-accent-green mt-1 leading-tight whitespace-nowrap truncate">{fees.collected.toLocaleString('en-IN')}</p>
              <span className="inline-block mt-1 text-[7.5px] sm:text-[8px] font-bold bg-[#E8F8F0] text-accent-green px-1.5 sm:px-2 py-0.5 rounded-full leading-none whitespace-nowrap max-w-full truncate">
                Rs {fees.collected.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Pending */}
            <div className="border-r border-[#e2e8f0]/80 last:border-none px-0.5 sm:px-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-accent-red/10 text-accent-red flex items-center justify-center mx-auto mb-2">
                <FiClock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-secondaryText uppercase tracking-wider leading-tight whitespace-nowrap">Pending</p>
              <p className="text-xs sm:text-sm md:text-base font-extrabold text-accent-red mt-1 leading-tight whitespace-nowrap truncate">{fees.pending.toLocaleString('en-IN')}</p>
              <span className="inline-block mt-1 text-[7.5px] sm:text-[8px] font-bold bg-accent-red/5 text-accent-red px-1.5 sm:px-2 py-0.5 rounded-full leading-none whitespace-nowrap max-w-full truncate">
                Rs {fees.pending.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Concession */}
            <div className="px-0.5 sm:px-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-accent-purple/10 text-accent-purple flex items-center justify-center mx-auto mb-2">
                <FiPercent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-secondaryText uppercase tracking-wider leading-tight whitespace-nowrap">Concession</p>
              <p className="text-xs sm:text-sm md:text-base font-extrabold text-accent-purple mt-1 leading-tight whitespace-nowrap truncate">{fees.concession.toLocaleString('en-IN')}</p>
              <span className="inline-block mt-1 text-[7.5px] sm:text-[8px] font-bold bg-[#EEF5FB] text-brand-blue px-1.5 sm:px-2 py-0.5 rounded-full leading-none whitespace-nowrap max-w-full truncate">
                Rs {fees.concession.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/settings/revenue-overview')}
            className="w-full mt-4 py-2.5 sm:py-3 border border-[#1597E5]/30 hover:bg-[#EEF5FB]/40 text-brand-blue rounded-btn font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            View detailed breakdown
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
        </div> {/* End Left Area */}

        {/* Right Area: Sidebar lists */}
        <div className="space-y-6">
          {/* Management Section */}
          <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-accent-purple/10 text-accent-purple">
            <FiSliders className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-dark tracking-wider uppercase">Management</h2>
        </div>

        <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
          {[
            { title: 'Branch Context', desc: 'Mimic a branch as local admin', icon: <FiLayers className="w-4 h-4" />, color: 'text-brand-blue bg-brand-blue/10' },
            { title: 'Manage Branches', desc: 'Create, edit, and configure branches', icon: <FiBriefcase className="w-4 h-4" />, color: 'text-brand-blue bg-brand-blue/10' },
            { title: 'Manage Users', desc: 'Role assignments and access control', icon: <FiUsers className="w-4 h-4" />, color: 'text-accent-purple bg-accent-purple/10' },
            { title: 'Global Students', desc: 'View all enrolled students', icon: <FiBookOpen className="w-4 h-4" />, color: 'text-accent-green bg-accent-green/10' }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleListItemClick(item.title)}
              className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark group-hover:text-brand-blue transition-colors">{item.title}</h3>
                  <p className="text-[10px] text-secondaryText mt-0.5">{item.desc}</p>
                </div>
              </div>
              <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics & Logs Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-accent-orange/10 text-accent-orange">
            <FiActivity className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-dark tracking-wider uppercase">Analytics & Logs</h2>
        </div>

        <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
          {[
            { title: 'Global Analytics', desc: 'Cross-branch performance charts', icon: <FiTrendingUp className="w-4 h-4" />, color: 'text-accent-orange bg-accent-orange/10' },
            { title: 'Audit Logs', desc: 'System transaction and security trace', icon: <FiClock className="w-4 h-4" />, color: 'text-accent-orange bg-accent-orange/10' },
            { title: 'Class Fee Setup', desc: 'Configure fee structures globally', icon: <FiSettings className="w-4 h-4" />, color: 'text-brand-secondary bg-brand-secondary/10' },
            { title: 'Create Branch', desc: 'Register a new school branch', icon: <FiPlus className="w-4 h-4" />, color: 'text-accent-green bg-accent-green/10' }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleListItemClick(item.title)}
              className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark group-hover:text-brand-blue transition-colors">{item.title}</h3>
                  <p className="text-[10px] text-secondaryText mt-0.5">{item.desc}</p>
                </div>
              </div>
              <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
            </div>
          ))}
        </div>
      </div>
      </div> {/* End Right Area wrapper */}
      </div> {/* End grid layout wrapper */}

      {/* Principal feature set, scoped to the branch selected by Main Admin */}
      <section className="mt-6 space-y-6">
        <div className="flex flex-col gap-3 rounded-[24px] border border-[#1597E5]/15 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 card-shadow">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FB] text-brand-blue">
              <HiOutlineAcademicCap className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-dark">Branch Administration</h2>
              <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-secondaryText sm:text-xs">
                {currentBranchContext
                  ? `Principal-level tools for ${currentBranchContext.name}`
                  : 'Select a branch to use academic and staff management tools.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/settings/branch-context')}
            className="w-full shrink-0 rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-brand-secondary active:scale-[0.98] sm:w-auto"
          >
            {currentBranchContext ? 'Change Branch' : 'Select Branch'}
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF5FB] text-brand-blue">
              <HiOutlineAcademicCap className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-secondaryText">Academic</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {branchAcademicItems.map((item) => (
              <button
                type="button"
                key={item.title}
                onClick={() => openBranchFeature(item.title)}
                className="group flex min-h-[92px] w-full items-center justify-between rounded-[22px] border border-[#e2e8f0]/50 bg-white p-4 text-left card-shadow transition-all hover:-translate-y-0.5 hover:border-brand-blue/25 active:scale-[0.99]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.color}`}>{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-dark transition-colors group-hover:text-brand-blue">{item.title}</span>
                    <span className="mt-1 block text-[10px] font-medium leading-snug text-secondaryText">{item.desc}</span>
                  </span>
                </span>
                <FiArrowRight className="ml-2 h-4 w-4 shrink-0 text-brand-blue transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF5FB] text-brand-blue">
              <FiUsers className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-secondaryText">Staff</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {branchStaffItems.map((item) => (
              <button
                type="button"
                key={item.title}
                onClick={() => openBranchFeature(item.title)}
                className="group flex min-h-[92px] w-full items-center justify-between rounded-[22px] border border-[#e2e8f0]/50 bg-white p-4 text-left card-shadow transition-all hover:-translate-y-0.5 hover:border-brand-blue/25 active:scale-[0.99]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.color}`}>{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-dark transition-colors group-hover:text-brand-blue">{item.title}</span>
                    <span className="mt-1 block text-[10px] font-medium leading-snug text-secondaryText">{item.desc}</span>
                  </span>
                </span>
                <FiArrowRight className="ml-2 h-4 w-4 shrink-0 text-brand-blue transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Left drawer for profile menu items */}
      <Drawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Right side drawer for three-dots profile menu */}
      <Drawer isOpen={showThreeDotsMenu} onClose={() => setShowThreeDotsMenu(false)} position="right" />

      {/* Modals & Subpages overlay controller */}
      <AnimatePresence>
        {activeModal === 'branch_context' && (
          <BranchContextModal isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'create_branch' && (
          <CreateBranchModal isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'create_user' && (
          <CreateUserModal isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'students' && (
          <StudentRecordsModal isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'fee_setup' && (
          <FeeSetupModal isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'audit_logs' && (
          <AuditLogsModal isOpen={true} onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
