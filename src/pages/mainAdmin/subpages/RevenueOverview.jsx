import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiAlertCircle, FiTag, FiUsers } from 'react-icons/fi';
import {
  HiOutlineBuildingOffice2, HiOutlineUserGroup, HiOutlineCalendarDays
} from 'react-icons/hi2';

const RevenueOverview = () => {
  const navigate = useNavigate();
  const { fees, branches } = useApp();

  // Stats calculation
  const totalStudents = branches.reduce((sum, b) => sum + b.studentsCount, 0);
  const facultyCount = branches.reduce((sum, b) => sum + b.facultyCount, 0);
  const coordinatorsCount = branches.reduce((sum, b) => sum + b.coordinatorsCount, 0);

  const totalFeeAggregate = fees.collected + fees.pending + fees.concession;
  const collectedPercentage = totalFeeAggregate > 0 ? Math.round((fees.collected / totalFeeAggregate) * 100) : 0;
  const pendingPercentage = totalFeeAggregate > 0 ? Math.round((fees.pending / totalFeeAggregate) * 100) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: stats and breakdown */}
        <div className="lg:col-span-2 space-y-6">
      {/* Top Header Card */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 text-lg font-bold font-sans">
            ₹
          </div>
          <div>
            <h2 className="text-xl font-bold md:text-2xl">Revenue Overview</h2>
            <p className="text-xs text-white/70 mt-0.5">Fee collection across all branches</p>
          </div>
        </div>

        {/* Display Total Collected inside Hero */}
        <div className="bg-white/20 border border-white/25 rounded-2xl p-4">
          <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Total Collected</p>
          <p className="text-2xl font-extrabold mt-1">Rs {fees.collected.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* COLLECTED */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#E8F8F0] text-accent-green flex items-center justify-center">
            <FiCheck className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Collected</p>
          <p className="text-base font-extrabold text-accent-green">Rs {fees.collected.toLocaleString('en-IN')}</p>
          <p className="text-[8px] font-bold text-secondaryText">{collectedPercentage}% of total</p>
        </div>

        {/* OUTSTANDING */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow space-y-2">
          <div className="w-8 h-8 rounded-full bg-accent-red/10 text-accent-red flex items-center justify-center">
            <FiAlertCircle className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Outstanding</p>
          <p className="text-base font-extrabold text-accent-red">Rs {fees.pending.toLocaleString('en-IN')}</p>
          <p className="text-[8px] font-bold text-secondaryText">{pendingPercentage}% pending</p>
        </div>

        {/* CONCESSIONS */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow space-y-2">
          <div className="w-8 h-8 rounded-full bg-accent-orange/10 text-accent-orange flex items-center justify-center">
            <FiTag className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Concessions</p>
          <p className="text-base font-extrabold text-accent-orange">Rs {fees.concession.toLocaleString('en-IN')}</p>
          <p className="text-[8px] font-bold text-secondaryText">Waivers granted</p>
        </div>

        {/* STUDENTS */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow space-y-2">
          <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center">
            <FiUsers className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Students</p>
          <p className="text-base font-extrabold text-brand-blue">{totalStudents}</p>
          <p className="text-[8px] font-bold text-secondaryText">Enrolled</p>
        </div>
      </div>

      {/* Collection Breakdown */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
        <h3 className="text-xs font-bold text-dark uppercase tracking-wider px-1">Collection Breakdown</h3>

        {/* Collected percentage bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-dark">Collected</span>
            <span className="text-accent-green">{collectedPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-accent-green rounded-full" style={{ width: `${collectedPercentage}%` }} />
          </div>
          <p className="text-[9px] text-secondaryText font-semibold">Rs {fees.collected.toLocaleString('en-IN')}</p>
        </div>

        {/* Outstanding percentage bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-dark">Outstanding Dues</span>
            <span className="text-accent-red">{pendingPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-accent-red rounded-full" style={{ width: `${pendingPercentage}%` }} />
          </div>
          <p className="text-[9px] text-secondaryText font-semibold">Rs {fees.pending.toLocaleString('en-IN')}</p>
        </div>
      </div>
        </div> {/* End Left column */}

        {/* Right column: System overview card */}
        <div>
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-3">
        <h3 className="text-xs font-bold text-dark uppercase tracking-wider px-1">System Overview</h3>

        <div className="divide-y divide-[#e2e8f0]/80">
          <div className="flex justify-between items-center py-3 first:pt-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                <HiOutlineBuildingOffice2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-dark">Active Branches</span>
            </div>
            <span className="text-xs font-extrabold text-brand-blue">{branches.length}</span>
          </div>

          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] text-secondaryText flex items-center justify-center shrink-0 text-sm">
                ?
              </div>
              <span className="text-xs font-bold text-dark">Total Students</span>
            </div>
            <span className="text-xs font-extrabold text-brand-blue">{totalStudents}</span>
          </div>

          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EEF5FB] text-secondaryText flex items-center justify-center shrink-0 text-sm">
                ?
              </div>
              <span className="text-xs font-bold text-dark">Faculty & Staff</span>
            </div>
            <span className="text-xs font-extrabold text-brand-blue">{facultyCount + coordinatorsCount}</span>
          </div>

          <div className="flex justify-between items-center py-3 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-accent-orange flex items-center justify-center shrink-0">
                <HiOutlineCalendarDays className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-dark">Active Classes</span>
            </div>
            <span className="text-xs font-extrabold text-accent-orange">10</span>
          </div>
        </div>
      </div>
      </div> {/* End Right column wrapper */}
      </div> {/* End grid layout wrapper */}
    </motion.div>
  );
};

export default RevenueOverview;
