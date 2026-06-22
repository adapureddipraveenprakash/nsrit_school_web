import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiClock, FiEdit2, FiSave, FiX, FiCheck } from 'react-icons/fi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const MOCK_TIMETABLE = {
  Monday: {
    1: { subject: 'Telugu', teacher: 'R. Roopakala', room: 'Room 5A' },
    2: { subject: 'Maths', teacher: 'T. Satish Kumar', room: 'Room 5A' },
    3: { subject: 'English', teacher: 'S. Deepika', room: 'Room 5A' },
    4: { subject: 'Science', teacher: 'M. Lavanya', room: 'Lab 1' },
    5: { subject: 'Social', teacher: 'B. Geetha', room: 'Room 5A' },
    6: { subject: 'Telugu', teacher: 'R. Roopakala', room: 'Room 5A' },
    7: { subject: 'Maths', teacher: 'T. Satish Kumar', room: 'Room 5A' },
    8: { subject: 'Games', teacher: 'V. Ravi Kumar', room: 'Ground' }
  },
  Tuesday: {
    1: { subject: 'Maths', teacher: 'T. Satish Kumar', room: 'Room 5A' },
    2: { subject: 'English', teacher: 'S. Deepika', room: 'Room 5A' },
    3: { subject: 'Hindi', teacher: 'C. Rama Rao', room: 'Room 5A' },
    4: { subject: 'Science', teacher: 'M. Lavanya', room: 'Room 5A' },
    5: { subject: 'Telugu', teacher: 'R. Roopakala', room: 'Room 5A' },
    6: { subject: 'Social', teacher: 'B. Geetha', room: 'Room 5A' },
    7: { subject: 'Science', teacher: 'M. Lavanya', room: 'Room 5A' },
    8: { subject: 'Library', teacher: 'S. Deepika', room: 'Library' }
  },
  Wednesday: {
    1: { subject: 'Telugu', teacher: 'R. Roopakala', room: 'Room 5A' },
    2: { subject: 'Maths', teacher: 'T. Satish Kumar', room: 'Room 5A' },
    3: { subject: 'English', teacher: 'S. Deepika', room: 'Room 5A' },
    4: { subject: 'Science', teacher: 'M. Lavanya', room: 'Lab 1' },
    5: { subject: 'Social', teacher: 'B. Geetha', room: 'Room 5A' },
    6: { subject: 'Hindi', teacher: 'C. Rama Rao', room: 'Room 5A' },
    7: { subject: 'Maths', teacher: 'T. Satish Kumar', room: 'Room 5A' },
    8: { subject: 'Drawing', teacher: 'P. Lakshmi', room: 'Art Room' }
  },
  Thursday: {
    1: { subject: 'Science', teacher: 'M. Lavanya', room: 'Room 5A' },
    2: { subject: 'Social', teacher: 'B. Geetha', room: 'Room 5A' },
    3: { subject: 'Telugu', teacher: 'R. Roopakala', room: 'Room 5A' },
    4: { subject: 'English', teacher: 'S. Deepika', room: 'Room 5A' },
    5: { subject: 'Maths', teacher: 'T. Satish Kumar', room: 'Room 5A' },
    6: { subject: 'Hindi', teacher: 'C. Rama Rao', room: 'Room 5A' },
    7: { subject: 'Science', teacher: 'M. Lavanya', room: 'Room 5A' },
    8: { subject: 'Computer', teacher: 'V. Ravi Kumar', room: 'IT Lab' }
  },
  Friday: {
    1: { subject: 'Maths', teacher: 'T. Satish Kumar', room: 'Room 5A' },
    2: { subject: 'English', teacher: 'S. Deepika', room: 'Room 5A' },
    3: { subject: 'Hindi', teacher: 'C. Rama Rao', room: 'Room 5A' },
    4: { subject: 'Science', teacher: 'M. Lavanya', room: 'Room 5A' },
    5: { subject: 'Telugu', teacher: 'R. Roopakala', room: 'Room 5A' },
    6: { subject: 'Social', teacher: 'B. Geetha', room: 'Room 5A' },
    7: { subject: 'Science', teacher: 'M. Lavanya', room: 'Room 5A' },
    8: { subject: 'Moral Sci', teacher: 'B. Geetha', room: 'Room 5A' }
  },
  Saturday: {
    1: { subject: 'English', teacher: 'S. Deepika', room: 'Room 5A' },
    2: { subject: 'Telugu', teacher: 'R. Roopakala', room: 'Room 5A' },
    3: { subject: 'Maths', teacher: 'T. Satish Kumar', room: 'Room 5A' },
    4: { subject: 'Social', teacher: 'B. Geetha', room: 'Room 5A' },
    5: { subject: 'Science', teacher: 'M. Lavanya', room: 'Room 5A' },
    6: { subject: 'Games', teacher: 'V. Ravi Kumar', room: 'Ground' },
    7: { subject: '—', teacher: '—', room: '—' },
    8: { subject: '—', teacher: '—', room: '—' }
  }
};

const Timetable = () => {
  const navigate = useNavigate();
  const { activeRole } = useApp();
  const [timetable, setTimetable] = useState(MOCK_TIMETABLE);
  const [activeDay, setActiveDay] = useState('Monday');
  const [editingCell, setEditingCell] = useState(null); // { day, periodNum }

  // Form states for editing
  const [editSubject, setEditSubject] = useState('');
  const [editTeacher, setEditTeacher] = useState('');
  const [editRoom, setEditRoom] = useState('');

  const isEditable = activeRole === 'MAIN_ADMIN' || activeRole === 'PRINCIPAL' || activeRole === 'COORDINATOR';

  const handleCellClick = (day, periodNum) => {
    if (!isEditable) return;
    const current = timetable[day]?.[periodNum] || { subject: '', teacher: '', room: '' };
    setEditingCell({ day, periodNum });
    setEditSubject(current.subject);
    setEditTeacher(current.teacher);
    setEditRoom(current.room);
  };

  const handleSaveCell = (e) => {
    e.preventDefault();
    if (!editingCell) return;
    const { day, periodNum } = editingCell;

    setTimetable((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [periodNum]: {
          subject: editSubject || '—',
          teacher: editTeacher || '—',
          room: editRoom || '—'
        }
      }
    }));
    setEditingCell(null);
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
          Timetable
        </h1>
        <div className="w-9 h-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Day selection pills */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {DAYS.map((day) => {
              const isActive = activeDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-[#1597E5]/15'
                      : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Periods List */}
          <div className="space-y-3">
            {PERIODS.map((periodNum) => {
              const period = timetable[activeDay]?.[periodNum] || { subject: '—', teacher: '—', room: '—' };
              return (
                <div
                  key={periodNum}
                  onClick={() => handleCellClick(activeDay, periodNum)}
                  className={`bg-white rounded-[22px] p-4.5 card-shadow border border-[#e2e8f0]/40 flex items-center justify-between transition-all group ${
                    isEditable ? 'cursor-pointer hover:border-[#1597E5]/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Period Number block */}
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF5FB] flex flex-col items-center justify-center text-[#1597E5] shrink-0 font-sans">
                      <span className="text-[10px] font-extrabold text-secondaryText">Slot</span>
                      <span className="text-base font-extrabold leading-none">{periodNum}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-dark group-hover:text-[#1597E5] transition-colors">
                        {period.subject}
                      </h3>
                      <p className="text-[10px] text-secondaryText font-bold mt-1">
                        Teacher: {period.teacher}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold bg-slate-100 text-secondaryText px-2.5 py-1 rounded-full">
                      {period.room}
                    </span>
                    {isEditable && (
                      <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-[#1597E5]/10 flex items-center justify-center text-[#1597E5] transition-all opacity-0 group-hover:opacity-100">
                        <FiEdit2 className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          {/* General instructions card */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#40B4FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Period Configuration</p>
            <h2 className="text-2xl font-bold mt-1">Schedules</h2>
            <p className="text-xs text-white/80 mt-2 font-semibold leading-relaxed">
              {isEditable 
                ? 'As administrator, you can tap on any period slot card in the list to update its subject, teacher, and room values.'
                : 'View the assigned weekly period slots and room listings for classes in this wing.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Edit period modal */}
      <AnimatePresence>
        {editingCell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCell(null)}
              className="fixed inset-0 bg-dark/70"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] w-full max-w-[400px] p-6 card-shadow relative overflow-hidden z-10 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-dark flex items-center gap-1.5">
                  <FiClock className="w-4 h-4 text-[#1597E5]" />
                  Edit Period {editingCell.periodNum} ({editingCell.day})
                </h3>
                <button onClick={() => setEditingCell(null)} className="p-1 hover:bg-slate-100 rounded-full text-secondaryText">
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCell} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="e.g. Maths, Telugu"
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Assigned Teacher
                  </label>
                  <input
                    type="text"
                    required
                    value={editTeacher}
                    onChange={(e) => setEditTeacher(e.target.value)}
                    placeholder="e.g. T. Satish Kumar"
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Classroom / Room
                  </label>
                  <input
                    type="text"
                    required
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    placeholder="e.g. Room 5A, Lab 1"
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-dark transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1597E5] hover:bg-brand-blue rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-1"
                  >
                    <FiSave className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Timetable;
