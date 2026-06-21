import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiChevronRight, FiUser, FiCalendar, FiSettings, FiActivity, FiUsers, FiFileText } from 'react-icons/fi';
import { HiOutlineAcademicCap, HiOutlineClipboardDocumentList } from 'react-icons/hi2';

const BranchSettings = () => {
  const navigate = useNavigate();

  const branchInfo = [
    { label: 'BRANCH NAME', value: 'Sontyam' },
    { label: 'BRANCH CODE', value: 'SO' },
    { label: 'ADDRESS', value: 'Sontyam village' },
    { label: 'CITY', value: 'Visakhapatnam' },
    { label: 'PHONE', value: '9100046512' },
    { label: 'EMAIL', value: 'nsritschoolprincipal@gmail.com' },
    { label: 'STATUS', value: 'ACTIVE', isBadge: true }
  ];

  const adminOptions = [
    {
      title: 'Manage Teachers',
      desc: 'Create, edit and manage teaching staff',
      path: '/settings/teachers',
      icon: <HiOutlineAcademicCap className="w-5 h-5 text-brand-blue" />,
      bg: 'bg-[#EEF5FB]'
    },
    {
      title: 'Manage Students',
      desc: 'View, transfer and update student records',
      path: '/settings/global-students',
      icon: <FiUsers className="w-5 h-5 text-brand-blue" />,
      bg: 'bg-[#EEF5FB]'
    },
    {
      title: 'Attendance Overview',
      desc: 'Monitor attendance across all classes',
      path: '/settings/attendance-overview',
      icon: <FiCalendar className="w-5 h-5 text-[#8B5CF6]" />,
      bg: 'bg-[#F3E8FF]'
    },
    {
      title: 'Assign Class Teachers',
      desc: 'Assign homeroom teachers to sections',
      path: '/settings/class-teachers',
      icon: <HiOutlineClipboardDocumentList className="w-5 h-5 text-[#FF9F1C]" />,
      bg: 'bg-[#FFF8EE]'
    }
  ];

  const feeOptions = [
    {
      title: 'Fee Dashboard',
      desc: 'Overview of fee collection status',
      path: '/settings/fee-overview',
      icon: <FiActivity className="w-5 h-5 text-[#23C16B]" />,
      bg: 'bg-[#E8F8F0]'
    },
    {
      title: 'Fee Reports',
      desc: 'Class-wise and student-wise fee reports',
      path: '/settings/branch-analytics',
      icon: <FiFileText className="w-5 h-5 text-[#8B5CF6]" />,
      bg: 'bg-[#F3E8FF]'
    }
  ];



  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Centered Page Header */}
      <div className="relative flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-dark tracking-tight absolute left-1/2 -translate-x-1/2">
          Settings
        </h1>
        <div className="w-9 h-9" />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Sontyam Active Blue Header Card matching Screenshot 2 */}
        <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
          
          <div className="flex items-center justify-between mb-4">
            {/* Badge "so" */}
            <span className="bg-white/20 border border-white/25 px-2.5 py-0.5 rounded-lg text-xs font-bold font-sans uppercase">
              so
            </span>
            {/* Status active badge */}
            <span className="bg-[#23C16B] text-white px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-wide uppercase select-none">
              • Active
            </span>
          </div>

          <h2 className="text-2xl font-black">Sontyam</h2>
          <p className="text-[11px] text-white/80 font-bold uppercase tracking-wider mt-0.5">
            Visakhapatnam
          </p>
        </div>

        {/* Branch Information Card matching Screenshot 2 */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden card-shadow">
          {/* Header label banner */}
          <div className="bg-[#EEF5FB]/40 px-6 py-4.5 border-b border-[#e2e8f0]/60">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block">
              Branch Information
            </span>
          </div>

          {/* List group fields */}
          <div className="divide-y divide-[#e2e8f0]/80">
            {branchInfo.map((info, idx) => (
              <div key={idx} className="flex justify-between items-center py-4 px-6 gap-4 text-xs">
                <span className="text-secondaryText font-bold">{info.label}</span>
                {info.isBadge ? (
                  <span className="bg-[#E8F8F0] text-[#23C16B] px-3.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                    {info.value}
                  </span>
                ) : (
                  <span className="text-dark font-extrabold text-right break-words max-w-[70%]">
                    {info.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Administration Card panel links */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/40 px-5 py-4 border-b border-[#e2e8f0]/60">
            <span className="text-[9px] font-black text-secondaryText uppercase tracking-widest block">
              Administration
            </span>
          </div>
          
          <div className="divide-y divide-[#e2e8f0]/80">
            {adminOptions.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => navigate(opt.path)}
                className="flex items-center justify-between p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${opt.bg}`}>
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-dark group-hover:text-[#1597E5] transition-colors">
                      {opt.title}
                    </h4>
                    <p className="text-[9px] text-[#A0AEC0] font-medium mt-0.5 leading-tight">
                      {opt.desc}
                    </p>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-secondaryText/60 group-hover:translate-x-0.5 transition-transform" />
              </div>
            ))}
          </div>
        </div>

        {/* Fee Administration panel links */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/40 px-5 py-4 border-b border-[#e2e8f0]/60">
            <span className="text-[9px] font-black text-secondaryText uppercase tracking-widest block">
              Fee Administration
            </span>
          </div>

          <div className="divide-y divide-[#e2e8f0]/80">
            {feeOptions.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => navigate(opt.path)}
                className="flex items-center justify-between p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${opt.bg}`}>
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-dark group-hover:text-[#1597E5] transition-colors">
                      {opt.title}
                    </h4>
                    <p className="text-[9px] text-[#A0AEC0] font-medium mt-0.5 leading-tight">
                      {opt.desc}
                    </p>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-secondaryText/60 group-hover:translate-x-0.5 transition-transform" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default BranchSettings;
