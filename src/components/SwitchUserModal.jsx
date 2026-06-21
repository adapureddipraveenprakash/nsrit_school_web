import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiRefreshCw } from 'react-icons/fi';
import { HiOutlineUserPlus } from 'react-icons/hi2';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const SwitchUserModal = ({ isOpen, onClose }) => {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleSwitch = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark/70"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="bg-white rounded-[32px] w-full max-w-[380px] card-shadow relative overflow-hidden z-10 flex flex-col items-center"
          >
            {/* Top Blue Header Panel (Screenshot Style) */}
            <div className="relative w-full bg-[#1597E5] p-6 text-white text-center flex flex-col items-center pb-8 overflow-hidden shrink-0">
              {/* Floating decorative circles */}
              <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full bg-white/10" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all text-white cursor-pointer z-10"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Avatar circle */}
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold font-sans mb-3 shadow-inner">
                {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'MA'}
              </div>

              {/* Title & badge */}
              <h3 className="text-lg font-bold">{user?.name || 'Main Admin'}</h3>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/25 border border-white/20 rounded-full mt-2 text-[9px] font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
                {user?.role ? user.role.replace('_', ' ') : 'MAIN ADMIN'} • Active
              </div>

              <p className="text-[11px] opacity-85 mt-2 font-semibold tracking-wide flex items-center justify-center gap-2">
                <span>+91 {user?.phone || '7670818348'}</span>
                {user?.role === 'BRANCH_ADMIN' && (
                  <span>🏢 Sontyam</span>
                )}
              </p>
            </div>

            {/* White Body section (Screenshot Style) */}
            <div className="p-6 w-full flex flex-col items-center text-center space-y-5">
              {/* Center Icon */}
              <div className="w-20 h-20 rounded-full bg-[#EEF5FB] border border-[#e2e8f0]/40 flex items-center justify-center text-brand-blue shadow-inner mt-2">
                <HiOutlineUserPlus className="w-8 h-8 text-brand-blue" />
              </div>

              {/* Confirmation text */}
              <div className="space-y-1.5">
                <h4 className="text-lg font-extrabold text-dark">Switch user?</h4>
                <p className="text-xs text-secondaryText font-semibold leading-relaxed max-w-[260px] mx-auto">
                  Your current session will end. You can sign in with a different account.
                </p>
              </div>

              {/* Buttons */}
              <div className="w-full space-y-3.5 pt-2">
                {/* Switch Account button */}
                <button
                  onClick={handleSwitch}
                  className="w-full py-4 bg-[#00A1FF] hover:bg-brand-blue text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-blue/20 transition-all cursor-pointer active:scale-95"
                >
                  <FiRefreshCw className="w-4 h-4 animate-spin-slow" />
                  Switch Account
                </button>

                {/* Cancel link */}
                <button
                  onClick={onClose}
                  className="w-full text-secondaryText hover:text-dark text-xs font-extrabold transition-colors cursor-pointer block text-center"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="w-full p-4 border-t border-[#e2e8f0]/80 bg-[#EEF5FB]/30 text-center shrink-0">
              <p className="text-[10px] text-secondaryText flex items-center justify-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
                NSRIT Connect ERP • v1.0.0
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SwitchUserModal;
