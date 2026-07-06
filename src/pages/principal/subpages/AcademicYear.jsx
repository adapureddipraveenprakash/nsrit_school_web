import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiChevronRight, FiLayers } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import { useApp } from '../../../context/AppContext';
import { subscribeAcademicYears } from '../../../services/yearService';

const DEFAULT_YEARS = [
  { id: '2', year: '2027-28', status: 'PLANNING', startDate: '2027-06-01', endDate: '2028-04-30', startYear: '2027' },
  { id: '1', year: '2026-27', status: 'ACTIVE', startDate: '2026-06-12', endDate: '2027-04-24', startYear: '2026' }
];

const AcademicYear = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const branchId = user?.branchId || 'sontyam-branch-id';

  const [dbYears, setDbYears] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firestore academic years
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAcademicYears(branchId,
      (list) => {
        setDbYears(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching academic years:', err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [branchId]);

  const activeYearsList = useMemo(() => {
    return dbYears.length > 0 ? dbYears : DEFAULT_YEARS;
  }, [dbYears]);

  const activeYearObj = useMemo(() => {
    return activeYearsList.find(y => y.status === 'ACTIVE') || {
      year: '2026-27',
      startYear: '2026',
      startDate: '2026-06-12',
      endDate: '2027-04-24',
      status: 'ACTIVE'
    };
  }, [activeYearsList]);

  // Date formatter helper: 2026-06-12 -> 12 Jun 2026
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${monthNames[monthIndex] || parts[1]} ${year}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black text-dark pr-8 mx-auto tracking-tight">Academic Year</h1>
      </header>

      {/* Top curved blue header card (Matching Screenshot 1) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden text-center select-none font-sans">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-3 py-4">
          <div className="text-4xl font-extrabold text-white/95 leading-none">?</div>
          <h2 className="text-2xl font-black">{activeYearObj.year}</h2>
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/20 border border-white/20 rounded-full text-[9px] font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-[#48BB78] rounded-full animate-pulse" />
            <span className="text-[#48BB78] font-black">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Configuration dates details card */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow divide-y divide-[#e2e8f0]/60 select-none font-sans">
        {/* Start Date */}
        <div className="flex items-center gap-4 py-4 first:pt-2 last:pb-2">
          <div className="w-11 h-11 rounded-full bg-[#E8F8F0] text-[#23C16B] flex items-center justify-center border border-[#23C16B]/5 shrink-0">
            <FiCalendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">Start Date</p>
            <p className="text-xs font-extrabold text-dark mt-0.5">{formatDate(activeYearObj.startDate)}</p>
          </div>
        </div>

        {/* End Date */}
        <div className="flex items-center gap-4 py-4 first:pt-2 last:pb-2">
          <div className="w-11 h-11 rounded-full bg-red-50 text-[#E53E3E] flex items-center justify-center border border-red-100 shrink-0">
            <FiCalendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">End Date</p>
            <p className="text-xs font-extrabold text-dark mt-0.5">{formatDate(activeYearObj.endDate)}</p>
          </div>
        </div>

        {/* Academic Year Number */}
        <div className="flex items-center gap-4 py-4 first:pt-2 last:pb-2">
          <div className="w-11 h-11 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center border border-[#7C3AED]/5 shrink-0 font-extrabold text-xs">
            123
          </div>
          <div>
            <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">Academic Year Number</p>
            <p className="text-xs font-extrabold text-dark mt-0.5">{activeYearObj.startYear || '2026'}</p>
          </div>
        </div>
      </div>

      {/* Navigation links card */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow divide-y divide-[#e2e8f0]/60 select-none font-sans">
        {/* Academic Structure */}
        <div
          onClick={() => navigate('/settings/classes')}
          className="flex items-center justify-between py-4 first:pt-2 last:pb-2 cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center border border-brand-blue/5 shrink-0">
              <FiLayers className="w-4 h-4 text-[#1597E5]" />
            </div>
            <h3 className="text-xs font-extrabold text-dark group-hover:text-brand-blue transition-colors">
              Academic Structure
            </h3>
          </div>
          <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Promotion Management */}
        <div
          onClick={() => navigate('/settings/promotions')}
          className="flex items-center justify-between py-4 first:pt-2 last:pb-2 cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FFF8EE] text-[#FF9F1C] flex items-center justify-center border border-[#FF9F1C]/5 shrink-0">
              <HiOutlineAcademicCap className="w-5 h-5 text-[#FF9F1C]" />
            </div>
            <h3 className="text-xs font-extrabold text-dark group-hover:text-brand-blue transition-colors">
              Promotion Management
            </h3>
          </div>
          <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

export default AcademicYear;
