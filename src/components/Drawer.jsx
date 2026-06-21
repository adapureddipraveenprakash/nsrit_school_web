import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiBell, FiSend, FiSettings, FiLogOut, FiUsers } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
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
                    {(activeRole === 'BRANCH_ADMIN' || user?.role === 'BRANCH_ADMIN') && (
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

                  <button
                    onClick={() => handleNav('/settings')}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF5FB] transition-all text-left text-dark group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] group-hover:bg-white flex items-center justify-center text-secondaryText font-semibold border border-transparent group-hover:border-[#e2e8f0]/40 transition-colors">
                        <FiSettings className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Settings</p>
                        <p className="text-[10px] text-secondaryText">App preferences</p>
                      </div>
                    </div>
                    <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                  </button>
                </div>
              </div>

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
