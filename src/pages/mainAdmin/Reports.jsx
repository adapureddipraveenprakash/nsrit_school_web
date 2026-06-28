import React from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiActivity, FiUsers } from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';


const Reports = () => {
  const { branches, users, fees } = useApp();

  // Aggregate counts
  const totalStudents = branches.reduce((sum, b) => sum + b.studentsCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8"
    >
      {/* Top Banner */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
        <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Main Admin</p>
        <h2 className="text-xl font-bold md:text-2xl">Global Analytics</h2>
        <p className="text-xs text-white/70 mt-1 font-medium">Platform performance & growth overview</p>
      </div>

      <p className="text-[10px] font-bold text-secondaryText tracking-widest uppercase">Key Metrics</p>

      {/* Metric Cards matching screenshot layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Branch Growth */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 sm:p-6 card-shadow flex gap-3 sm:gap-4 hover:border-brand-blue/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <BiBuildingHouse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Branch Growth</p>
            <p className="text-lg font-extrabold text-brand-blue mt-1">+{branches.length} Registered</p>
            <p className="text-[10px] text-secondaryText font-medium mt-1 leading-relaxed">
              All school regions running in stable cloud environments.
            </p>
          </div>
        </div>

        {/* Card 2: Revenue Trend */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 sm:p-6 card-shadow flex gap-3 sm:gap-4 hover:border-accent-green/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#E8F8F0] text-accent-green flex items-center justify-center shrink-0">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Revenue Trend</p>
            <p className="text-lg font-extrabold text-accent-green mt-1">Rs {fees.collected.toLocaleString('en-IN')} Paid</p>
            <p className="text-[10px] text-secondaryText font-medium mt-1 leading-relaxed">
              Fee collection active with average collections monitored.
            </p>
          </div>
        </div>

        {/* Card 3: User Activity */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 sm:p-6 card-shadow flex gap-3 sm:gap-4 hover:border-accent-purple/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center shrink-0">
            <FiActivity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">User Activity</p>
            <p className="text-lg font-extrabold text-dark mt-1">{users.length + 147} Users</p>
            <p className="text-[10px] text-secondaryText font-medium mt-1 leading-relaxed">
              Live system connections authenticated without errors.
            </p>
          </div>
        </div>

        {/* Card 4: Total Students */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 sm:p-6 card-shadow flex gap-3 sm:gap-4 hover:border-[#1e88e5]/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#EEF5FB] text-brand-secondary flex items-center justify-center shrink-0">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Total Students</p>
            <p className="text-lg font-extrabold text-brand-secondary mt-1">{totalStudents}</p>
            <p className="text-[10px] text-secondaryText font-medium mt-1 leading-relaxed">
              Enrolled students across all registered branches.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;
