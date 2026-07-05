import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiBell, FiSend, FiSettings, FiLogOut, FiUsers, FiHome, FiCalendar, FiBriefcase, FiDollarSign } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ROLE_META = {
  MAIN_ADMIN:    { label: 'Main Admin',    bg: 'bg-[#EEF5FB]', text: 'text-brand-blue', desc: 'Full system management and branch oversight', icon: 'MA' },
  BRANCH_ADMIN:  { label: 'Branch Admin',  bg: 'bg-[#F0F4FF]', text: 'text-indigo-600', desc: 'Manage a single school branch', icon: 'BA' },
  PRINCIPAL:     { label: 'Principal',     bg: 'bg-[#E8F8F0]', text: 'text-accent-green', desc: 'Academic and staff management', icon: 'PR' },
  COORDINATOR:   { label: 'Coordinator',   bg: 'bg-[#FFF8EE]', text: 'text-accent-orange', desc: 'Manage academic operations and wings', icon: <FiUsers className="w-4 h-4" /> },
  TEACHER:       { label: 'Teacher',       bg: 'bg-[#EBFDF5]', text: 'text-[#23C16B]', desc: 'Mark attendance and manage classes', icon: <FiBriefcase className="w-4 h-4" /> },
  CLASS_TEACHER: { label: 'Class Teacher', bg: 'bg-[#EBFDF5]', text: 'text-[#23C16B]',  desc: 'Class teacher duties and section management', icon: <span className="text-xs font-black font-sans">?</span> },
  PARENT:        { label: 'Parent',        bg: 'bg-[#EEF5FB]', text: 'text-brand-blue', desc: 'View child attendance, fees and homework', icon: <FiUser className="w-4 h-4" /> },
  ACCOUNTANT:    { label: 'Accountant',    bg: 'bg-[#FFF3E0]', text: 'text-accent-orange', desc: 'Fee collection and financial records', icon: <FiDollarSign className="w-4 h-4" /> },
};
import SwitchUserModal from './SwitchUserModal';

const Drawer = ({ isOpen, onClose, position = 'left' }) => {
  const { user, activeRole, logout, switchRole } = useApp();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const roles = [
    { key: 'MAIN_ADMIN', label: 'Main Admin (Global)' },
    { key: 'BRANCH_ADMIN', label: 'Branch Admin' },
    { key: 'PRINCIPAL', label: 'Principal' },
    { key: 'COORDINATOR', label: 'Coordinator' },
    { key: 'TEACHER', label: 'Teacher' },
    { key: 'PARENT', label: 'Parent' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark/80 z-50"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: position === 'left' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: position === 'left' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed ${position === 'left' ? 'left-0' : 'right-0'} top-0 bottom-0 w-80 bg-white z-50 flex flex-col shadow-2xl h-full overflow-hidden`}
          >
            {activeRole === 'COORDINATOR' ? (
              <>
                {/* Header Blue Gradient */}
                <div className="relative bg-gradient-to-br from-[#1E56EC] via-[#2F65F8] to-[#4076FF] p-6 text-white pb-8 overflow-hidden shrink-0">
                  {/* Floating decorative circles */}
                  <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/5" />
                  <div className="absolute top-[-10px] right-[-10px] w-24 h-24 rounded-full bg-white/10" />

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all text-white cursor-pointer"
                  >
                    <FiX className="w-5 h-5" />
                  </button>

                  {/* Profile Details */}
                  <div className="flex flex-col gap-4 mt-6">
                    <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xl font-bold font-sans">
                      RR
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight">Raghupatruni Roopakala</h3>
                      
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/25 rounded-full mt-2 text-[10px] font-bold uppercase tracking-wider">
                        <span>COORDINATOR</span>
                        <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />
                        <span className="text-[9px] text-white/90">Active</span>
                      </div>
                      
                      <p className="text-xs opacity-90 mt-3 font-semibold flex items-center gap-3 select-none">
                        <span className="flex items-center gap-1">📞 +918297191669</span>
                        <span className="flex items-center gap-1">🏢 Sontyam</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                  {/* Account Section */}
                  <div>
                    <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider mb-3 px-2">Account</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNav('/settings/profile')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-white flex items-center justify-center text-brand-blue font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors shrink-0">
                            <FiUser className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">My Profile</p>
                            <p className="text-[10px] text-secondaryText">View and edit your details</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>

                      <button
                        onClick={() => handleNav('/settings/notifications')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-white flex items-center justify-center text-amber-500 font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors shrink-0">
                            <FiBell className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Notifications</p>
                            <p className="text-[10px] text-secondaryText">Alerts and announcements</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>

                      <button
                        onClick={() => handleNav('/settings/send-notification')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-50 group-hover:bg-white flex items-center justify-center text-sky-500 font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors shrink-0">
                            <FiSend className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Send Notification</p>
                            <p className="text-[10px] text-secondaryText">Broadcast to parents or staff</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>

                      <button
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-default"
                        onClick={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-semibold border border-transparent shrink-0">
                            <FiSettings className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold">Settings</p>
                              <span className="px-1.5 py-0.5 bg-[#e2e8f0] text-secondaryText text-[8px] font-black rounded-full uppercase tracking-wider">
                                SOON
                              </span>
                            </div>
                            <p className="text-[10px] text-secondaryText">App preferences</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>
                    </div>
                  </div>

                  {/* Switch Active Role Section */}
                  {user?.roles && user.roles.length > 1 && (
                    <div>
                      <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider mb-3 px-2">Switch Active Role</p>
                      <div className="space-y-1">
                        {user.roles.map((role) => {
                          const meta = ROLE_META[role] || { label: role, bg: 'bg-slate-50', text: 'text-slate-500', icon: null };
                          const isActive = role === activeRole;
                          return (
                            <button
                              key={role}
                              onClick={() => {
                                if (!isActive) {
                                  switchRole(role);
                                  onClose();
                                  navigate('/dashboard');
                                }
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left text-dark group cursor-pointer ${
                                isActive ? 'bg-blue-50' : 'hover:bg-[#EEF5FB]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border border-transparent shrink-0 ${
                                  isActive ? 'bg-blue-100 text-brand-blue' : `${meta.bg} ${meta.text}`
                                }`}>
                                  {typeof meta.icon === 'string' ? <span className="text-xs font-black">{meta.icon}</span> : meta.icon || role.slice(0, 2)}
                                </div>
                                <div>
                                  <p className={`text-sm font-bold ${isActive ? 'text-brand-blue' : ''}`}>{meta.label}</p>
                                </div>
                              </div>
                              {isActive ? (
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-brand-blue text-[8px] font-extrabold rounded-md uppercase tracking-wider">
                                    ACTIVE
                                  </span>
                                  <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                    ✓
                                  </div>
                                </div>
                              ) : (
                                <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Session Section */}
                  <div>
                    <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider mb-3 px-2">Session</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsSwitchUserModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-accent-purple font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors shrink-0">
                            <FiUsers className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Switch User</p>
                            <p className="text-[10px] text-secondaryText">Login as a different account</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent-red/5 transition-all text-left text-accent-red group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-red-50 group-hover:bg-white flex items-center justify-center text-accent-red font-semibold border border-transparent transition-colors shrink-0">
                            <FiLogOut className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-accent-red">Sign Out</p>
                            <p className="text-[10px] text-[#EF4444]/65">End your current session</p>
                          </div>
                        </div>
                        <span className="text-accent-red text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#e2e8f0]/80 bg-[#EEF5FB]/30 shrink-0 text-center select-none">
                  <p className="text-[10px] text-secondaryText flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
                    NSRIT Connect ERP • v1.0.0
                  </p>
                </div>
              </>
            ) : activeRole === 'ACCOUNTANT' ? (
              <>
                {/* Header Blue Gradient matching accountant screenshot */}
                <div className="relative bg-[#1597E5] p-6 text-white pb-8 overflow-hidden shrink-0 select-none">
                  {/* Floating decorative circles */}
                  <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                  <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all text-white cursor-pointer z-10"
                  >
                    <FiX className="w-5 h-5" />
                  </button>

                  {/* Profile Details */}
                  <div className="flex flex-col gap-4 mt-6">
                    <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/35 flex items-center justify-center text-xl font-bold font-sans shadow-sm select-none">
                      {user?.name ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'PP'}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight select-none">
                        {user?.name || 'Patsamatla Padma Manjula'}
                      </h3>
                      
                      {/* Active Status Badge matching screenshot */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/25 rounded-full mt-2 text-[10px] font-bold uppercase tracking-wider select-none">
                        <span>ACCOUNTANT</span>
                        <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />
                        <span className="text-[9px] text-white/90 font-bold">Active</span>
                      </div>
                      
                      <p className="text-[11px] opacity-90 mt-3 font-semibold flex items-center gap-3 select-none">
                        <span className="flex items-center gap-1 font-sans">📞 {user?.phoneNumber || user?.phone || '+919951335377'}</span>
                        <span className="flex items-center gap-1">🏢 {user?.branchName || 'Sontyam'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 select-none no-scrollbar">
                  {/* Account Section */}
                  <div>
                    <p className="text-[9.5px] font-black text-secondaryText uppercase tracking-widest mb-3 px-2">Account</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNav('/settings/profile')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-[#1597E5] border border-blue-50 transition-colors shrink-0">
                            <FiUser className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0F172A]">My Profile</p>
                            <p className="text-[10px] text-secondaryText font-semibold">View and edit your details</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>

                      <button
                        onClick={() => handleNav('/settings/notifications')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#FFF9E5] group-hover:bg-white flex items-center justify-center text-[#FF9F0A] border border-amber-50 transition-colors shrink-0">
                            <FiBell className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0F172A]">Notifications</p>
                            <p className="text-[10px] text-secondaryText font-semibold">Alerts and announcements</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>

                      <button
                        onClick={() => handleNav('/settings/send-notification')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-[#1597E5] border border-blue-50 transition-colors shrink-0">
                            <FiSend className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0F172A]">Send Notification</p>
                            <p className="text-[10px] text-secondaryText font-semibold">Broadcast to parents or staff</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>

                      <button
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-default"
                        onClick={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] border border-slate-50 shrink-0">
                            <FiSettings className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-[#64748B]">Settings</p>
                              <span className="px-1.5 py-0.5 bg-[#EEF5FB] text-[#1597E5] text-[8px] font-black rounded-full uppercase tracking-wider">
                                SOON
                              </span>
                            </div>
                            <p className="text-[10px] text-secondaryText font-semibold">App preferences</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Switch Active Role Section */}
                  <div>
                    <p className="text-[9.5px] font-black text-secondaryText uppercase tracking-widest mb-3 px-2">Switch Active Role</p>
                    <div className="space-y-1">
                      {/* Parent Role (Clickable) */}
                      <button
                        onClick={() => {
                          switchRole('PARENT');
                          onClose();
                          navigate('/dashboard');
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] border border-slate-50 shrink-0">
                            <FiUser className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#64748B]">Parent</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>

                      {/* Accountant Role (Active) */}
                      <button
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50/50 transition-all text-left text-dark cursor-default"
                        onClick={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#1597E5] border border-blue-50 shrink-0 font-black text-xs font-sans">
                            📊
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1597E5]">Accountant</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-brand-blue text-[8px] font-extrabold rounded-md uppercase tracking-wider">
                            ACTIVE
                          </span>
                          <div className="w-5 h-5 rounded-full bg-[#1597E5] flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                            ✓
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Session Section */}
                  <div>
                    <p className="text-[9.5px] font-black text-secondaryText uppercase tracking-widest mb-3 px-2">Session</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsSwitchUserModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F3E8FF] group-hover:bg-white flex items-center justify-center text-[#7C3AED] border border-purple-50 transition-colors shrink-0">
                            <FiUsers className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0F172A]">Switch User</p>
                            <p className="text-[10px] text-secondaryText font-semibold">Login as a different account</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#e2e8f0]/40 shrink-0 text-center select-none bg-white">
                  <p className="text-[10px] text-secondaryText flex items-center justify-center gap-1.5 font-semibold">
                    <span className="w-1.5 h-1.5 bg-[#1597E5] rounded-full animate-pulse" />
                    NSRIT Connect ERP • v1.0.0
                  </p>
                </div>
              </>
            ) : (activeRole === 'TEACHER' || activeRole === 'CLASS_TEACHER') ? (
              <>
                {/* Header Blue Gradient matching screenshot */}
                <div className="relative bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white pb-8 overflow-hidden shrink-0">
                  {/* Floating decorative circles */}
                  <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/5" />
                  <div className="absolute top-[-10px] right-[-10px] w-24 h-24 rounded-full bg-white/10" />

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all text-white cursor-pointer animate-fade-in"
                  >
                    <FiX className="w-5 h-5" />
                  </button>

                  {/* Profile Details */}
                  <div className="flex flex-col gap-4 mt-6">
                    <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xl font-bold font-sans shadow-inner select-none">
                      SV
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight select-none">Salapu Vasanthi</h3>
                      
                      {/* Active Status Badge matching screenshot */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/25 rounded-full mt-2 text-[10px] font-bold uppercase tracking-wider select-none">
                        <span className="text-[11px] font-black">?</span>
                        <span>{activeRole === 'CLASS_TEACHER' ? 'CLASS TEACHER' : 'TEACHER'}</span>
                        <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />
                        <span className="text-[9px] text-white/90 font-bold lowercase first-letter:uppercase">Active</span>
                      </div>
                      
                      <p className="text-xs opacity-90 mt-3 font-semibold flex items-center gap-3 select-none">
                        <span className="flex items-center gap-1 font-sans">📞 +919347339048</span>
                        <span className="flex items-center gap-1">🏢 Sontyam</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                  {/* Account Section */}
                  <div>
                    <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider mb-3 px-2">Account</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNav('/settings/profile')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-white flex items-center justify-center text-brand-blue font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors shrink-0">
                            <FiUser className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">My Profile</p>
                            <p className="text-[10px] text-secondaryText">View and edit your details</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>

                      <button
                        onClick={() => handleNav('/settings/notifications')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-white flex items-center justify-center text-amber-500 font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors shrink-0">
                            <FiBell className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Notifications</p>
                            <p className="text-[10px] text-secondaryText">Alerts and announcements</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>

                      <button
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-default"
                        onClick={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-semibold border border-transparent shrink-0">
                            <FiSettings className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold">Settings</p>
                              <span className="px-1.5 py-0.5 bg-[#e2e8f0] text-secondaryText text-[8px] font-black rounded-full uppercase tracking-wider">
                                SOON
                              </span>
                            </div>
                            <p className="text-[10px] text-secondaryText">App preferences</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>
                    </div>
                  </div>

                  {/* Switch Active Role Section */}
                  {user?.roles && user.roles.length > 1 && (
                    <div>
                      <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider mb-3 px-2">Switch Active Role</p>
                      <div className="space-y-1">
                        {user.roles.map((role) => {
                          const meta = ROLE_META[role] || { label: role, bg: 'bg-slate-50', text: 'text-slate-500', icon: null };
                          const isActive = role === activeRole;
                          return (
                            <button
                              key={role}
                              onClick={() => {
                                if (!isActive) {
                                  switchRole(role);
                                  onClose();
                                  navigate('/dashboard');
                                }
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left text-dark group cursor-pointer ${
                                isActive ? 'bg-blue-50' : 'hover:bg-[#EEF5FB]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border border-transparent shrink-0 ${
                                  isActive ? 'bg-blue-100 text-brand-blue' : `${meta.bg} ${meta.text}`
                                }`}>
                                  {typeof meta.icon === 'string' ? <span className="text-xs font-black">{meta.icon}</span> : meta.icon || role.slice(0, 2)}
                                </div>
                                <div>
                                  <p className={`text-sm font-bold ${isActive ? 'text-brand-blue' : ''}`}>{meta.label}</p>
                                </div>
                              </div>
                              {isActive ? (
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-brand-blue text-[8px] font-extrabold rounded-md uppercase tracking-wider">
                                    ACTIVE
                                  </span>
                                  <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                    ✓
                                  </div>
                                </div>
                              ) : (
                                <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Session Section */}
                  <div>
                    <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider mb-3 px-2">Session</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsSwitchUserModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-accent-purple font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors shrink-0">
                            <FiUsers className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Switch User</p>
                            <p className="text-[10px] text-secondaryText">Login as a different account</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent-red/5 transition-all text-left text-accent-red group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-red-50 group-hover:bg-white flex items-center justify-center text-accent-red font-semibold border border-transparent transition-colors shrink-0">
                            <FiLogOut className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-accent-red">Sign Out</p>
                            <p className="text-[10px] text-[#EF4444]/65">End your current session</p>
                          </div>
                        </div>
                        <span className="text-accent-red text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#e2e8f0]/80 bg-[#EEF5FB]/30 shrink-0 text-center select-none">
                  <p className="text-[10px] text-secondaryText flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
                    NSRIT Connect ERP • v1.0.0
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Header Blue Gradient */}
                <div className="relative bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white pb-8 overflow-hidden shrink-0">
                  {/* Floating decorative circles */}
                  <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-white/10" />
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white/10" />

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all text-white"
                  >
                    <FiX className="w-5 h-5" />
                  </button>

                  {/* Profile Details */}
                  <div className="flex flex-col gap-4 mt-6">
                    <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-2xl font-bold font-sans">
                      {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'MA'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{user?.name || 'Main Admin'}</h3>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/25 border border-white/30 rounded-full mt-2 text-xs font-semibold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
                        {activeRole.replace('_', ' ')} • Active
                      </div>
                      <p className="text-xs opacity-90 mt-2.5 font-medium flex items-center gap-3">
                        <span className="flex items-center gap-1">📞 +91 {user?.phone || '7670818348'}</span>
                        {(activeRole === 'BRANCH_ADMIN' || user?.role === 'BRANCH_ADMIN' || user?.phone === '9347339048' || user?.phone === '9951335377') && (
                          <span className="flex items-center gap-1">🏢 Sontyam</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                  {/* Account Section */}
                  <div>
                    <p className="text-[11px] font-bold text-secondaryText uppercase tracking-wider mb-3 px-2">Account</p>
                    <div className="space-y-1">
                          <button
                            onClick={() => handleNav('/settings/profile')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-brand-blue font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors">
                                <FiUser className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">My Profile</p>
                                <p className="text-[10px] text-secondaryText">View and edit your details</p>
                              </div>
                            </div>
                            <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                          </button>

                          {user?.phone === '9347339048' && (
                            <>
                              <button
                                onClick={() => handleNav('/settings/teacher-students')}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-[#1597E5] font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors">
                                    <FiUsers className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">Students</p>
                                    <p className="text-[10px] text-secondaryText">View your assigned sections roster</p>
                                  </div>
                                </div>
                                <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                              </button>

                              <button
                                onClick={() => handleNav('/settings/create-student')}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-[#23C16B] font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">Add Student</p>
                                    <p className="text-[10px] text-secondaryText">Enroll new student to your section</p>
                                  </div>
                                </div>
                                <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleNav('/settings/notifications')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-accent-orange font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors">
                                <FiBell className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">Notifications</p>
                                <p className="text-[10px] text-secondaryText">Alerts and announcements</p>
                              </div>
                            </div>
                            <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                          </button>

                          {(activeRole === 'MAIN_ADMIN' || activeRole === 'BRANCH_ADMIN' || activeRole === 'PRINCIPAL' || activeRole === 'COORDINATOR') && (
                            <button
                              onClick={() => handleNav('/settings/send-notification')}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-brand-blue font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors">
                                  <FiSend className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">Send Notification</p>
                                  <p className="text-[10px] text-secondaryText">Broadcast to parents or staff</p>
                                </div>
                              </div>
                              <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                            </button>
                          )}

                          {activeRole === 'MAIN_ADMIN' && (
                            <button
                              onClick={() => handleNav('/settings')}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-secondaryText font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors">
                                  <FiSettings className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-semibold">Settings</p>
                                    {(user?.phone === '9347339048' || user?.phone === '9951335377') && (
                                      <span className="px-1.5 py-0.5 bg-[#e2e8f0] text-secondaryText text-[8px] font-black rounded-full uppercase tracking-wider">
                                        SOON
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-secondaryText">App preferences</p>
                                </div>
                              </div>
                              <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                            </button>
                          )}

                    </div>
                  </div>

                  {/* Switch Active Role Section */}
                  {user?.phone === '9347339048' && (
                    <div>
                      <p className="text-[11px] font-bold text-secondaryText uppercase tracking-wider mb-3 px-2">Switch Active Role</p>
                      <div className="space-y-1">
                        {/* Teacher Option */}
                        <button
                          onClick={() => {
                            if (activeRole !== 'TEACHER') {
                              switchRole('TEACHER');
                              onClose();
                            }
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#E8F8F0] text-[#23C16B] flex items-center justify-center font-semibold border border-transparent transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Teacher</p>
                              <p className="text-[10px] text-secondaryText">Mark attendance and manage classes</p>
                            </div>
                          </div>
                          {activeRole === 'TEACHER' ? (
                            <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                          )}
                        </button>

                        {/* Class Teacher Option */}
                        <button
                          onClick={() => {
                            if (activeRole !== 'CLASS_TEACHER') {
                              switchRole('CLASS_TEACHER');
                              onClose();
                            }
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#E8F8F0] text-[#23C16B] flex items-center justify-center font-semibold border border-transparent transition-colors">
                              <span className="text-xs font-black">?</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Class Teacher</p>
                              <p className="text-[10px] text-secondaryText">Class teacher duties & section management</p>
                            </div>
                          </div>
                          {activeRole === 'CLASS_TEACHER' ? (
                            <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Switch Active Role Section */}
                  {user?.roles && user.roles.length > 1 && (
                    <div>
                      <p className="text-[11px] font-bold text-secondaryText uppercase tracking-wider mb-3 px-2">Switch Active Role</p>
                      <div className="space-y-1">
                        {user.roles.map((role) => {
                          const meta = ROLE_META[role] || { label: role, bg: 'bg-slate-50', text: 'text-slate-500', icon: null };
                          const isActive = role === activeRole;
                          return (
                            <button
                              key={role}
                              onClick={() => {
                                if (!isActive) {
                                  switchRole(role);
                                  onClose();
                                  navigate('/dashboard');
                                }
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left text-dark group cursor-pointer ${
                                isActive ? 'bg-blue-50' : 'hover:bg-[#EEF5FB]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border border-transparent shrink-0 ${
                                  isActive ? 'bg-blue-100 text-brand-blue' : `${meta.bg} ${meta.text}`
                                }`}>
                                  {typeof meta.icon === 'string' ? <span className="text-xs font-black">{meta.icon}</span> : meta.icon || role.slice(0, 2)}
                                </div>
                                <div>
                                  <p className={`text-sm font-bold ${isActive ? 'text-brand-blue' : ''}`}>{meta.label}</p>
                                </div>
                              </div>
                              {isActive ? (
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-brand-blue text-[8px] font-extrabold rounded-md uppercase tracking-wider">
                                    ACTIVE
                                  </span>
                                  <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                    ✓
                                  </div>
                                </div>
                              ) : (
                                <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Session Section */}
                  <div>
                    <p className="text-[11px] font-bold text-secondaryText uppercase tracking-wider mb-3 px-2">Session</p>
                    <div className="space-y-1">
                      <div className="rounded-xl overflow-hidden bg-[#EEF5FB]/40">
                        <button
                          onClick={() => setIsSwitchUserModalOpen(true)}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-accent-purple font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors">
                              <FiUsers className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Switch User</p>
                              <p className="text-[10px] text-secondaryText">Login as a different account</p>
                            </div>
                          </div>
                          <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                        </button>
                      </div>

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent-red/5 transition-all text-left text-accent-red group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-accent-red font-semibold border border-transparent transition-colors">
                            <FiLogOut className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-accent-red">Sign Out</p>
                            <p className="text-[10px] text-[#EF4444]/65">End your current session</p>
                          </div>
                        </div>
                        <span className="text-accent-red text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#e2e8f0]/80 bg-[#EEF5FB]/30 shrink-0 text-center">
                  <p className="text-[10px] text-secondaryText flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
                    NSRIT Connect ERP • v1.0.0
                  </p>
                </div>
              </>
            )}
          </motion.div>

          {/* Switch User Confirmation Modal Overlay */}
          <SwitchUserModal
            isOpen={isSwitchUserModalOpen}
            onClose={() => setIsSwitchUserModalOpen(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
