import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiLogOut, FiPhone, FiDatabase, FiGlobe, 
  FiShield, FiMonitor, FiUser
} from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';

const MyProfile = () => {
  const { user, logout, activeRole } = useApp();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'PP';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Live profile details with screenshot fallbacks
  const userName = user?.name || 'Patsamatla Padma Manjula';
  const userPhone = user?.phoneNumber || user?.phone || '+919951335377';
  const userRole = activeRole ? activeRole.charAt(0).toUpperCase() + activeRole.slice(1).toLowerCase() : 'Accountant';
  const employeeId = user?.employeeId || '26SOSS002';
  const branchName = user?.branchName || 'Sontyam';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 max-w-[480px] mx-auto select-none animate-fade-in relative bg-[#EEF5FB] min-h-screen font-sans"
    >
      {/* Top Header Bar */}
      <header className="flex items-center gap-3 py-2 border-b border-[#e2e8f0]/40 shrink-0 select-none">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-white rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-extrabold text-dark tracking-tight">Account Settings</h1>
          <p className="text-[10px] text-secondaryText font-medium mt-0.5">Manage credentials & portal configurations</p>
        </div>
      </header>

      {/* Profile Avatar Card */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-6 card-shadow flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center text-2xl font-black font-sans mb-3.5 shadow-sm select-none">
          {getInitials(userName)}
        </div>
        <h2 className="text-base font-black text-[#0F172A] tracking-tight">{userName}</h2>
        <p className="text-xs text-secondaryText font-bold mt-1">{userRole}</p>
      </div>

      {/* PERSONAL INFORMATION Section */}
      <div>
        <span className="text-[9px] font-black text-secondaryText tracking-widest uppercase block mb-2 px-1">
          Personal Information
        </span>
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 shadow-sm divide-y divide-[#e2e8f0]/40 text-xs">
          {/* Registered Phone */}
          <div className="flex items-center gap-4 py-3.5 first:pt-1 last:pb-1">
            <div className="w-9 h-9 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center border border-blue-50 shrink-0">
              <FiPhone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-black text-secondaryText uppercase tracking-wider block">Registered Phone</span>
              <span className="text-xs font-bold text-[#0F172A] mt-0.5 block">{userPhone}</span>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-4 py-3.5 first:pt-1 last:pb-1">
            <div className="w-9 h-9 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center border border-blue-50 shrink-0">
              <FiShield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-black text-secondaryText uppercase tracking-wider block">Role</span>
              <span className="text-xs font-bold text-[#0F172A] mt-0.5 block">{userRole}</span>
            </div>
          </div>

          {/* Employee ID */}
          <div className="flex items-center gap-4 py-3.5 first:pt-1 last:pb-1">
            <div className="w-9 h-9 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center border border-blue-50 shrink-0 font-sans font-black text-[10px]">
              ID
            </div>
            <div>
              <span className="text-[8px] font-black text-secondaryText uppercase tracking-wider block">Employee ID</span>
              <span className="text-xs font-bold text-[#0F172A] mt-0.5 block">{employeeId}</span>
            </div>
          </div>

          {/* Allocated Branch */}
          <div className="flex items-center gap-4 py-3.5 first:pt-1 last:pb-1">
            <div className="w-9 h-9 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center border border-blue-50 shrink-0">
              <BiBuildingHouse className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[8px] font-black text-secondaryText uppercase tracking-wider block">Allocated Branch</span>
              <span className="text-xs font-bold text-[#0F172A] mt-0.5 block">{branchName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SYSTEM Section */}
      <div>
        <span className="text-[9px] font-black text-secondaryText tracking-widest uppercase block mb-2 px-1">
          System
        </span>
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 shadow-sm divide-y divide-[#e2e8f0]/40 text-xs">
          {/* App Version */}
          <div className="flex items-center gap-4 py-3.5 first:pt-1 last:pb-1">
            <div className="w-9 h-9 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center border border-blue-50 shrink-0">
              <FiMonitor className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-black text-secondaryText uppercase tracking-wider block">App Version</span>
              <span className="text-xs font-bold text-[#0F172A] mt-0.5 block">v1.0.0 (Release)</span>
            </div>
          </div>

          {/* Database */}
          <div className="flex items-center gap-4 py-3.5 first:pt-1 last:pb-1">
            <div className="w-9 h-9 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center border border-blue-50 shrink-0">
              <FiDatabase className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-black text-secondaryText uppercase tracking-wider block">Database</span>
              <span className="text-xs font-bold text-[#0F172A] mt-0.5 block">Firebase Data Connect</span>
            </div>
          </div>

          {/* Region */}
          <div className="flex items-center gap-4 py-3.5 first:pt-1 last:pb-1">
            <div className="w-9 h-9 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center border border-blue-50 shrink-0">
              <FiGlobe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-black text-secondaryText uppercase tracking-wider block">Region</span>
              <span className="text-xs font-bold text-[#0F172A] mt-0.5 block">asia-south1 (Live)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        className="w-full py-4 border border-[#FF3B30] text-[#FF3B30] rounded-[20px] text-xs font-black hover:bg-red-50/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-8"
      >
        <FiLogOut className="w-4.5 h-4.5" />
        <span>Sign Out of ERP</span>
      </button>
    </motion.div>
  );
};

export default MyProfile;
