import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiInbox, FiUsers, FiPercent, FiHelpCircle } from 'react-icons/fi';
import { BiReceipt } from 'react-icons/bi';

const StatIndicatorCard = ({ icon, label, value, bgClass, iconColorClass }) => {
  return (
    <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex flex-col items-center justify-center text-center space-y-3 font-sans transition-all hover:border-brand-blue/15 hover:shadow-md select-none">
      {/* Icon Circle */}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center border border-slate-100 shrink-0 ${bgClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-black text-dark">{value}</p>
        <p className="text-[8px] font-black text-secondaryText uppercase tracking-widest mt-0.5 leading-none">{label}</p>
      </div>
    </div>
  );
};

const FeeReports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  
  // Dynamic controls
  const [selectedClass, setSelectedClass] = useState('Nursery');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [selectedYear, setSelectedYear] = useState('2026');

  const tabs = ['All', 'Paid', 'Partial', 'Due', 'Concession'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 max-w-4xl mx-auto select-none animate-fade-in relative"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Fee Reports</h1>
      </header>

      {/* Title block matching the screenshot */}
      <div className="space-y-1">
        <h2 className="text-lg font-black text-[#0F172A] uppercase tracking-tight">
          {selectedClass} Fee Report
        </h2>
        <p className="text-[10px] text-secondaryText font-bold">
          Academic Year {selectedYear}
        </p>
      </div>

      {/* Select Controls & Pills Card */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {/* Class Select */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">Class</label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full appearance-none bg-white border border-[#e2e8f0] text-dark text-xs font-bold pl-4 pr-10 py-3 rounded-2xl focus:outline-none focus:border-brand-blue/50 cursor-pointer shadow-sm"
              >
                <option value="Nursery">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
                <option value="1st Class">1st Class</option>
                <option value="2nd Class">2nd Class</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondaryText">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Section Select */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">Section</label>
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full appearance-none bg-white border border-[#e2e8f0] text-dark text-xs font-bold pl-4 pr-10 py-3 rounded-2xl focus:outline-none focus:border-brand-blue/50 cursor-pointer shadow-sm"
              >
                <option value="All Sections">All Sections</option>
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondaryText">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Year Select */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">Year</label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full appearance-none bg-white border border-[#e2e8f0] text-dark text-xs font-bold pl-4 pr-10 py-3 rounded-2xl focus:outline-none focus:border-brand-blue/50 cursor-pointer shadow-sm"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2027">2027</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondaryText">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills row matching screenshot */}
        <div className="flex gap-2.5 pt-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/20'
                    : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of 6 Circular Icon Indicator Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Total Students */}
        <StatIndicatorCard
          icon={<FiUsers className="w-5.5 h-5.5 text-[#0088ff]" />}
          label="Total Students"
          value="0"
          bgClass="bg-[#EEF5FB]"
        />

        {/* 2. Expected Fees */}
        <StatIndicatorCard
          icon={<BiReceipt className="w-5.5 h-5.5 text-[#0088ff]" />}
          label="Expected Fees"
          value="Rs 0"
          bgClass="bg-[#EEF5FB]"
        />

        {/* 3. Collected Fees */}
        <StatIndicatorCard
          icon={<BiReceipt className="w-5.5 h-5.5 text-[#23C16B]" />}
          label="Collected Fees"
          value="Rs 0"
          bgClass="bg-[#E8F8F0]"
        />

        {/* 4. Pending Fees */}
        <StatIndicatorCard
          icon={<FiHelpCircle className="w-5.5 h-5.5 text-[#E53E3E]" />}
          label="Pending Fees"
          value="Rs 0"
          bgClass="bg-rose-50"
        />

        {/* 5. Concessions */}
        <StatIndicatorCard
          icon={<FiHelpCircle className="w-5.5 h-5.5 text-[#8e24aa]" />}
          label="Concessions"
          value="Rs 0"
          bgClass="bg-[#f3e5f5]"
        />

        {/* 6. Collection Rate */}
        <StatIndicatorCard
          icon={<FiPercent className="w-5.5 h-5.5 text-[#0088ff]" />}
          label="Collection Rate"
          value="0%"
          bgClass="bg-[#EEF5FB]"
        />
      </div>

      {/* Students List Section */}
      <div className="space-y-4">
        <div className="px-1 text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">
          STUDENTS LIST
        </div>

        {/* Empty state card matching screenshot */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
          <div className="w-18 h-18 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/10 relative">
            <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
            <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-dark">No records found</h4>
            <p className="text-[10px] text-secondaryText font-bold">
              No student fees match the selected filters.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeeReports;
