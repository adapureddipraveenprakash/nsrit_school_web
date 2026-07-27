import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiInbox } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getTimetableForTeacher } from '../../../services/dataService';

const TeacherTimetable = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  
  const teacherId = user?.teacherId || null;
  const branchId = user?.branchId || null;

  const [activeDay, setActiveDay] = useState('All');
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fetch real timetable periods for the logged-in teacher from the database
  const { data: rawPeriods = [], loading } = useDataFetch(
    () => teacherId && branchId 
      ? getTimetableForTeacher({ teacherId, branchId }) 
      : Promise.resolve([]),
    [teacherId, branchId],
    { defaultValue: [] }
  );

  const activePeriods = useMemo(() => rawPeriods.filter(p => p.isActive), [rawPeriods]);

  const filteredPeriods = useMemo(() => {
    if (activeDay === 'All') {
      const dayOrder = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
      return [...activePeriods].sort((a, b) => {
        const dayDiff = (dayOrder[a.day] || 9) - (dayOrder[b.day] || 9);
        if (dayDiff !== 0) return dayDiff;
        return (a.periodNum || 0) - (b.periodNum || 0);
      });
    }
    return activePeriods
      .filter(p => String(p.day).toLowerCase() === activeDay.toLowerCase())
      .sort((a, b) => (a.periodNum || 0) - (b.periodNum || 0));
  }, [activePeriods, activeDay]);

  const totalPeriodsThisWeek = activePeriods.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 max-w-5xl mx-auto relative select-none animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">My Timetable</h1>
      </header>

      {/* Blue Header Card (Screenshot 1) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] via-[#2F65F8] to-[#4076FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex items-center gap-3.5 mb-1.5 relative z-10 select-none">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center border border-white/15 shrink-0">
            <FiCalendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-sans">My Timetable</h2>
            <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider mt-0.5 font-sans">
              {loading ? 'Loading...' : `${totalPeriodsThisWeek} assigned periods this week`}
            </p>
          </div>
        </div>

        {/* Day selection chips */}
        <div className="flex gap-2 mt-5 overflow-x-auto no-scrollbar relative z-10 select-none scrollbar-none">
          {['All', ...DAYS].map((day) => {
            const isSelected = activeDay === day;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-5 py-1.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-[#2F65F8] shadow-sm'
                    : 'bg-white/15 text-white/90 hover:bg-white/20 border border-white/5'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Periods list */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#2F65F8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPeriods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeriods.map((period, idx) => (
              <div
                key={period.id || idx}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex flex-col gap-3 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-1 bg-blue-50 text-[#2F65F8] text-[8.5px] font-black rounded-lg uppercase tracking-wider border border-blue-100">
                      {period.day} · Period {period.periodNum}
                    </span>
                    <h3 className="text-sm font-black text-[#0F172A] mt-2 font-sans">{period.subject}</h3>
                  </div>
                  {period.room && (
                    <span className="text-[10px] text-secondaryText font-bold bg-[#F8FAFC] border border-[#CBD5E1]/30 px-2 py-0.5 rounded-md">
                      Room {period.room}
                    </span>
                  )}
                </div>
                
                <div className="border-t border-slate-50 pt-2 flex items-center justify-between text-[10px] text-[#A0AEC0] font-bold font-sans">
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5 text-[#2F65F8]" /> {period.startTime || '—'} - {period.endTime || '—'}
                  </span>
                  {period.section && (
                    <span className="text-brand-blue font-extrabold text-[10px]">
                      Class: {period.section.academicClass?.name} - {period.section.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State (Screenshot 1) */
          <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-5 min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#2F65F8] border border-[#2F65F8]/10">
              <FiInbox className="w-8 h-8 text-[#2F65F8]" />
            </div>

            <div className="space-y-2 max-w-[280px]">
              <h3 className="text-sm font-extrabold text-dark font-sans">No periods assigned</h3>
              <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed font-sans">
                Your timetable will appear here once the principal has assigned your classes.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TeacherTimetable;
