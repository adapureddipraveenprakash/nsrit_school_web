import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiChevronLeft, FiChevronRight, FiInbox } from 'react-icons/fi';

const AttendanceOverview = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('2026-06-21'); // Sun, 21 Jun 2026

  // Formatted date for display
  const formatDateLabel = (dateStr) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

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
          Attendance
        </h1>
        <div className="w-9 h-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Day selection switcher widget */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow flex items-center justify-between">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-[#EEF5FB] rounded-full text-[#1597E5] transition-colors cursor-pointer"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 select-none">
              <FiCalendar className="w-4 h-4 text-[#1597E5]" />
              <span className="text-xs font-bold text-dark">{formatDateLabel(selectedDate)}</span>
            </div>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-[#EEF5FB] rounded-full text-[#1597E5] transition-colors cursor-pointer"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Empty State Box matching Screenshot 4 */}
          <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            {/* Center Checklist Folder Box Icon */}
            <div className="w-20 h-20 rounded-full bg-[#EEF5FB] border border-[#1597E5]/15 flex items-center justify-center text-[#1597E5] shadow-sm select-none">
              <div className="w-10 h-10 border-2 border-[#1597E5] rounded-[6px] relative flex flex-col justify-end p-0.5">
                <div className="w-full bg-[#1597E5] h-3.5 rounded-sm flex items-center justify-center">
                  <div className="w-2.5 h-0.5 bg-white rounded-full" />
                </div>
                {/* Simulated checklists */}
                <div className="absolute top-1 left-2.5 w-4 h-0.5 bg-[#1597E5]" />
                <div className="absolute top-2.5 left-2.5 w-4 h-0.5 bg-[#1597E5]" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-[280px]">
              <h3 className="text-sm font-extrabold text-dark">No attendance records</h3>
              <p className="text-[11px] text-secondaryText leading-relaxed">
                Attendance entries will appear after teachers submit them.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          {/* Purple Hero Card matching Screenshot 4 */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Branch Admin</p>
            <h2 className="text-2xl font-bold mt-1">Attendance Overview</h2>
            <p className="text-xs text-white/80 mt-1 font-semibold leading-relaxed">
              Branch-wide attendance submissions.
            </p>
          </div>

          {/* Additional details card for Desktop */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block">
              Status Indicators
            </span>
            <div className="divide-y divide-[#e2e8f0]/80">
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Class Submissions</span>
                <span className="text-dark font-extrabold">0 / 10 Sections</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Total Students</span>
                <span className="text-dark font-extrabold">105</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Submission Status</span>
                <span className="text-[#FF9F1C] font-extrabold uppercase text-[10px] tracking-wide">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceOverview;
