import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiUsers, FiSettings, FiGlobe, FiDollarSign, FiLayers,
  FiTrendingUp, FiActivity, FiArrowUpRight, FiArrowRight, FiSliders,
  FiBriefcase, FiPlus, FiBookOpen, FiClock, FiPercent, FiMoreVertical,
  FiUser, FiBell, FiSend, FiLogOut
} from 'react-icons/fi';
import {
  HiOutlineBuildingOffice2, HiOutlineUserGroup, HiOutlineCalendarDays
} from 'react-icons/hi2';
import Drawer from '../components/Drawer';
import { useNavigate } from 'react-router-dom';

// Import action views
import BranchContextModal from './Subpages/BranchContext';
import CreateBranchModal from './Subpages/CreateBranch';
import CreateUserModal from './Subpages/CreateUser';
import StudentRecordsModal from './Subpages/StudentRecords';
import FeeSetupModal from './Subpages/FeeSetup';
import AuditLogsModal from './Subpages/AuditLogs';
import BranchAdminDashboard from './BranchAdminDashboard';
import PrincipalDashboard from './PrincipalDashboard';
import CoordinatorDashboard from './CoordinatorDashboard';
import TeacherDashboard from './TeacherDashboard';
import ParentDashboard from './ParentDashboard';
import AccountantDashboard from './AccountantDashboard';

const Dashboard = () => {
  const {
    user,
    branches,
    users,
    fees,
    auditLogs,
    activeRole,
    currentBranchContext,
    setCurrentBranchContext,
    logout
  } = useApp();

  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  if (activeRole === 'BRANCH_ADMIN') {
    return <BranchAdminDashboard />;
  }
  if (activeRole === 'PRINCIPAL') {
    return <PrincipalDashboard />;
  }
  if (activeRole === 'COORDINATOR') {
    return <CoordinatorDashboard />;
  }
  if (activeRole === 'TEACHER' || activeRole === 'CLASS_TEACHER') {
    return <TeacherDashboard />;
  }
  if (activeRole === 'PARENT') {
    return <ParentDashboard />;
  }
  if (activeRole === 'ACCOUNTANT') {
    return <AccountantDashboard />;
  }

  // Modal Control States
  const [activeModal, setActiveModal] = useState(null); // 'branch_context' | 'create_branch' | 'create_user' | 'students' | 'fee_setup' | 'audit_logs'

  // Dynamic stats based on active branch context
  const studentsCount = currentBranchContext
    ? currentBranchContext.studentsCount
    : branches.reduce((sum, b) => sum + b.studentsCount, 0);

  const facultyCount = currentBranchContext
    ? currentBranchContext.facultyCount
    : branches.reduce((sum, b) => sum + b.facultyCount, 0);

  const coordinatorsCount = currentBranchContext
    ? currentBranchContext.coordinatorsCount
    : branches.reduce((sum, b) => sum + b.coordinatorsCount, 0);

  const branchesCount = currentBranchContext ? 1 : branches.length;

  const handleListItemClick = (item) => {
    if (item === 'Branch Context') navigate('/settings/branch-context');
    else if (item === 'Manage Branches') navigate('/schools');
    else if (item === 'Create Branch') navigate('/settings/create-branch');
    else if (item === 'Manage Users') navigate('/users');
    else if (item === 'Global Students') navigate('/settings/global-students');
    else if (item === 'Class Fee Setup') navigate('/settings/class-fee-templates');
    else if (item === 'Audit Logs') navigate('/settings/audit-logs');
    else if (item === 'Global Analytics') navigate('/reports');
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
              <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Good Afternoon</p>
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

            <span className="text-[11px] font-bold text-white/70 uppercase">21 JUN 2026</span>
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
        <div className="grid grid-cols-4 gap-2 pt-6 border-t border-white/10 text-center">
          <div className="border-r border-white/10 last:border-none">
            <p className="text-lg font-bold md:text-2xl">{branchesCount}</p>
            <p className="text-[9px] md:text-xs text-white/60 font-semibold uppercase tracking-wider mt-0.5">Branches</p>
          </div>
          <div className="border-r border-white/10 last:border-none">
            <p className="text-lg font-bold md:text-2xl">{studentsCount}</p>
            <p className="text-[9px] md:text-xs text-white/60 font-semibold uppercase tracking-wider mt-0.5">Students</p>
          </div>
          <div className="border-r border-white/10 last:border-none">
            <p className="text-lg font-bold md:text-2xl">{facultyCount + coordinatorsCount}</p>
            <p className="text-[9px] md:text-xs text-white/60 font-semibold uppercase tracking-wider mt-0.5">Faculty & Staff</p>
          </div>
          <div>
            <p className="text-lg font-bold md:text-2xl">0%</p>
            <p className="text-[9px] md:text-xs text-white/60 font-semibold uppercase tracking-wider mt-0.5">Attendance</p>
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Branches */}
          <div
            onClick={() => handleListItemClick('Manage Branches')}
            className="bg-white rounded-[24px] p-5 card-shadow border border-[#e2e8f0]/40 flex flex-col justify-between h-[150px] relative group cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                <HiOutlineBuildingOffice2 className="w-5 h-5" />
              </div>
              <FiArrowUpRight className="w-4 h-4 text-secondaryText opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-dark">{branchesCount}</p>
              <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider mt-1">Total Branches</p>
              <p className="text-[9px] font-bold text-accent-green mt-0.5 uppercase">
                {currentBranchContext ? (currentBranchContext.active ? '1 Active' : '0 Active') : `${branches.filter(b=>b.active).length} Active`}
              </p>
            </div>
          </div>

          {/* Card 2: Students */}
          <div
            onClick={() => handleListItemClick('Global Students')}
            className="bg-white rounded-[24px] p-5 card-shadow border border-[#e2e8f0]/40 flex flex-col justify-between h-[150px] relative group cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center">
                <HiOutlineUserGroup className="w-5 h-5" />
              </div>
              <FiArrowUpRight className="w-4 h-4 text-secondaryText opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-dark">{studentsCount}</p>
              <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider mt-1">Students</p>
              <p className="text-[9px] font-bold text-secondaryText mt-0.5 uppercase">Enrolled Globally</p>
            </div>
          </div>

          {/* Card 3: Faculty */}
          <div
            onClick={() => handleListItemClick('Manage Users')}
            className="bg-white rounded-[24px] p-5 card-shadow border border-[#e2e8f0]/40 flex flex-col justify-between h-[150px] relative group cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center">
                <FiUsers className="w-5 h-5" />
              </div>
              <FiArrowUpRight className="w-4 h-4 text-secondaryText opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-dark">{facultyCount}</p>
              <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider mt-1">Faculty & Staff</p>
              <p className="text-[9px] font-bold text-secondaryText mt-0.5 uppercase">All Branches</p>
            </div>
          </div>

          {/* Card 4: Attendance */}
          <div
            onClick={() => navigate('/settings/global-reports')}
            className="bg-white rounded-[24px] p-5 card-shadow border border-[#e2e8f0]/40 flex flex-col justify-between h-[150px] relative group cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center">
                <HiOutlineCalendarDays className="w-5 h-5" />
              </div>
              <FiArrowUpRight className="w-4 h-4 text-secondaryText opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-dark">0%</p>
              <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider mt-1">Attendance</p>
              <p className="text-[9px] font-bold text-secondaryText mt-0.5 uppercase">Today Global Avg</p>
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
        <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden p-6">
          <div className="grid grid-cols-3 gap-2 text-center pb-6 border-b border-[#e2e8f0]/80">
            {/* Collected */}
            <div className="border-r border-[#e2e8f0]/80 last:border-none px-2">
              <div className="w-8 h-8 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center mx-auto mb-2">
                <FiDollarSign className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Collected</p>
              <p className="text-lg font-extrabold text-accent-green mt-1">{fees.collected.toLocaleString('en-IN')}</p>
              <span className="inline-block mt-1 text-[9px] font-bold bg-[#E8F8F0] text-accent-green px-2 py-0.5 rounded-full">
                📈 Rs {fees.collected.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Pending */}
            <div className="border-r border-[#e2e8f0]/80 last:border-none px-2">
              <div className="w-8 h-8 rounded-full bg-accent-red/10 text-accent-red flex items-center justify-center mx-auto mb-2">
                <FiClock className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Pending</p>
              <p className="text-lg font-extrabold text-accent-red mt-1">{fees.pending.toLocaleString('en-IN')}</p>
              <span className="inline-block mt-1 text-[9px] font-bold bg-accent-red/5 text-accent-red px-2 py-0.5 rounded-full">
                ⚠️ Rs {fees.pending.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Concession */}
            <div className="px-2">
              <div className="w-8 h-8 rounded-full bg-accent-purple/10 text-accent-purple flex items-center justify-center mx-auto mb-2">
                <FiPercent className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Concession</p>
              <p className="text-lg font-extrabold text-accent-purple mt-1">{fees.concession.toLocaleString('en-IN')}</p>
              <span className="inline-block mt-1 text-[9px] font-bold bg-[#EEF5FB] text-brand-blue px-2 py-0.5 rounded-full">
                Rs {fees.concession}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/settings/revenue-overview')}
            className="w-full mt-4 py-3 border border-[#1597E5]/30 hover:bg-[#EEF5FB]/40 text-brand-blue rounded-btn font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
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
