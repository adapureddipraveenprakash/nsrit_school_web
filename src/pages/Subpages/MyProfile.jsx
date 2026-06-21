import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiLogOut, FiActivity } from 'react-icons/fi';

const MyProfile = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const sysInfo = [
    { label: 'App Version', value: 'v1.0.0 (Release)', bold: true },
    { label: 'Database', value: 'Firebase Data Connect', bold: true },
    { label: 'Region', value: 'asia-south1 (Live)', bold: true },
    { label: 'Auth Service', value: 'Production Phone Auth', bold: true },
    { label: 'Active Workspace', value: 'chaitanyareddykarri/NSRITSchoolApp', bold: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Header Card (Screenshot style) */}
        <div className="space-y-6 md:col-span-1">
          {/* Header Panel matching Screenshot 1 */}
          <div className="relative rounded-[32px] bg-[#1597E5] p-6 text-white text-center flex flex-col items-center shadow-lg pb-10 overflow-hidden">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-full text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>

            {/* Avatar Circle */}
            <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl font-extrabold font-sans mb-4 mt-4 shadow-inner">
              {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'MA'}
            </div>

            {/* User Title & Info */}
            <h2 className="text-2xl font-bold tracking-tight">{user?.name || 'Main Admin'}</h2>
            
            <span className="inline-block px-4 py-1.5 bg-white/25 border border-white/25 rounded-full mt-2.5 text-[10px] font-bold tracking-widest uppercase text-white/90">
              {user?.role ? user.role.replace('_', ' ') : 'MAIN ADMIN'}
            </span>

            <p className="text-sm font-semibold text-white/80 mt-3 tracking-wide">
              +91 {user?.phone || '7670818348'}
            </p>
          </div>
        </div>

        {/* Right Column: System Environment List & Sign Out Button */}
        <div className="md:col-span-2 space-y-6">
          {/* System Environment Card */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden card-shadow">
            {/* Card Header Label */}
            <div className="bg-[#EEF5FB]/40 px-6 py-4 border-b border-[#e2e8f0]/60">
              <span className="text-[11px] font-extrabold text-secondaryText uppercase tracking-widest flex items-center gap-2">
                <FiActivity className="w-3.5 h-3.5 text-brand-blue" />
                SYSTEM ENVIRONMENT
              </span>
            </div>

            {/* Row List */}
            <div className="divide-y divide-[#e2e8f0]/80">
              {sysInfo.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-4 px-6 gap-4 text-xs">
                  <span className="text-secondaryText font-bold">{item.label}</span>
                  <span className={`text-dark text-right ${item.bold ? 'font-extrabold' : 'font-semibold'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Large Red Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full py-4.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[20px] font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#EF4444]/25 transition-all cursor-pointer active:scale-95"
          >
            <FiLogOut className="w-4 h-4" />
            Sign Out of ERP
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MyProfile;
