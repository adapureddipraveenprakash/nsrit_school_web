import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiClock,
  FiEdit2,
  FiSave,
  FiX,
  FiAlertCircle,
  FiPlus,
  FiChevronRight,
  FiSearch,
  FiCalendar,
  FiInfo
} from 'react-icons/fi';
import {
  getSections,
  getStudentsBySection,
  getTeachers,
  getTimetableForSection,
  upsertTimetablePeriodFull,
  publishTimetableSection,
  unpublishTimetableSection
} from '../../services/dataService';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = {
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday',
  'Sat': 'Saturday'
};
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const Timetable = () => {
  const navigate = useNavigate();
  const { user, activeRole } = useApp();
  const branchId = user?.branchId;
  const isEditable = activeRole === 'MAIN_ADMIN' || activeRole === 'PRINCIPAL' || activeRole === 'COORDINATOR';

  // Section & Timetable State
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal & Drawer State
  const [editingCell, setEditingCell] = useState(null); // { day, periodNum }
  const [showTeacherDrawer, setShowTeacherDrawer] = useState(false);
  const [showTimesInfo, setShowTimesInfo] = useState(false);

  // Form input states
  const [timetableType, setTimetableType] = useState('Regular'); // 'Regular' | 'Lunch Break' | 'Short Break'
  const [subjectInput, setSubjectInput] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null); // { id, name }
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');
  const [roomInput, setRoomInput] = useState('');

  // Search teacher in drawer
  const [teacherSearch, setTeacherSearch] = useState('');

  // Fetch sections and teachers on mount
  useEffect(() => {
    if (!branchId) return;
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [secList, teachList] = await Promise.all([
          getSections({ branchId, academicYear: 2026 }),
          getTeachers({ branchId, limit: 200 })
        ]);
        setSections(secList);
        setTeachers(teachList);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [branchId]);

  // Fetch timetable and students when selectedSectionId changes
  useEffect(() => {
    if (!selectedSectionId) {
      setPeriods([]);
      setStudents([]);
      return;
    }
    const loadSectionData = async () => {
      try {
        const [timetableList, studentList] = await Promise.all([
          getTimetableForSection({ sectionId: selectedSectionId }),
          getStudentsBySection(selectedSectionId)
        ]);
        setPeriods(timetableList);
        setStudents(studentList);
      } catch (err) {
        console.error('Error loading section data:', err);
      }
    };
    loadSectionData();
  }, [selectedSectionId]);

  // Refetch timetable periods
  const refetchTimetable = async () => {
    if (!selectedSectionId) return;
    try {
      const list = await getTimetableForSection({ sectionId: selectedSectionId });
      setPeriods(list);
    } catch (err) {
      console.error('Error refetching timetable:', err);
    }
  };

  // Find section object
  const activeSec = useMemo(() => {
    return sections.find(s => s.id === selectedSectionId) || null;
  }, [sections, selectedSectionId]);

  // Determine section publish status
  const isPublished = useMemo(() => {
    return periods.some(p => p.status === 'PUBLISHED');
  }, [periods]);

  // Map period array to a 2D lookup key: "Day-Period"
  const periodsLookup = useMemo(() => {
    const map = {};
    periods.forEach(p => {
      if (p.isActive) {
        map[`${p.day}-${p.periodNum}`] = p;
      }
    });
    return map;
  }, [periods]);

  // Count filled periods
  const filledPeriodsCount = useMemo(() => {
    return Object.values(periodsLookup).filter(p => p.subject || p.timetableType !== 'Regular').length;
  }, [periodsLookup]);

  // Back arrow handler
  const handleBack = () => {
    if (selectedSectionId) {
      setSelectedSectionId(null);
    } else {
      navigate(-1);
    }
  };

  // Publish timetable
  const handlePublish = async () => {
    if (!selectedSectionId || !branchId || !user?.id) return;
    setActionLoading(true);
    try {
      if (isPublished) {
        await unpublishTimetableSection({ sectionId: selectedSectionId, branchId });
      } else {
        await publishTimetableSection({
          sectionId: selectedSectionId,
          branchId,
          publishedById: user.id
        });
      }
      await refetchTimetable();
    } catch (err) {
      console.error('Error toggling publish status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Click cell to open modal
  const handleCellClick = (day, periodNum) => {
    if (!isEditable) return;
    const existing = periodsLookup[`${day}-${periodNum}`];

    setEditingCell({ day, periodNum });
    if (existing) {
      setTimetableType(existing.timetableType || 'Regular');
      setSubjectInput(existing.subject || '');
      setSelectedTeacher(
        existing.teacherId
          ? { id: existing.teacherId, name: existing.teacherName }
          : null
      );
      setStartTimeInput(existing.startTime || '');
      setEndTimeInput(existing.endTime || '');
      setRoomInput(existing.room || '');
    } else {
      // Default values
      setTimetableType('Regular');
      setSubjectInput('');
      setSelectedTeacher(null);
      // Default slot times
      const defaultTimes = {
        1: { start: '09:00', end: '09:45' },
        2: { start: '09:45', end: '10:30' },
        3: { start: '10:30', end: '11:15' },
        4: { start: '11:15', end: '12:00' },
        5: { start: '12:00', end: '12:45' },
        6: { start: '13:30', end: '14:15' },
        7: { start: '14:15', end: '15:00' },
        8: { start: '15:00', end: '15:45' }
      };
      setStartTimeInput(defaultTimes[periodNum]?.start || '');
      setEndTimeInput(defaultTimes[periodNum]?.end || '');
      setRoomInput('');
    }
  };

  // Submit period change
  const handleSavePeriod = async (e) => {
    e.preventDefault();
    if (!editingCell || !selectedSectionId || !branchId) return;

    setActionLoading(true);
    try {
      await upsertTimetablePeriodFull({
        sectionId: selectedSectionId,
        branchId,
        day: editingCell.day,
        periodNum: editingCell.periodNum,
        subject: timetableType === 'Regular' ? subjectInput : timetableType,
        teacherId: timetableType === 'Regular' ? selectedTeacher?.id || null : null,
        teacherName: timetableType === 'Regular' ? selectedTeacher?.name || null : null,
        room: timetableType === 'Regular' ? roomInput || null : null,
        startTime: startTimeInput || null,
        endTime: endTimeInput || null,
        timetableType,
        status: isPublished ? 'PUBLISHED' : 'DRAFT'
      });
      await refetchTimetable();
      setEditingCell(null);
    } catch (err) {
      console.error('Error saving period:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Clear (delete) period
  const handleClearPeriod = async () => {
    if (!editingCell || !selectedSectionId || !branchId) return;
    
    setActionLoading(true);
    try {
      await upsertTimetablePeriodFull({
        sectionId: selectedSectionId,
        branchId,
        day: editingCell.day,
        periodNum: editingCell.periodNum,
        subject: null,
        teacherId: null,
        teacherName: null,
        room: null,
        startTime: null,
        endTime: null,
        timetableType: 'Regular',
        status: 'DRAFT'
      });
      await refetchTimetable();
      setEditingCell(null);
    } catch (err) {
      console.error('Error clearing period:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter teachers for drawer list
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const name = t.user?.fullName || '';
      return name.toLowerCase().includes(teacherSearch.toLowerCase());
    });
  }, [teachers, teacherSearch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Top Header Bar */}
      <header className="relative flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer z-10"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-dark tracking-tight absolute left-1/2 -translate-x-1/2">
          {selectedSectionId && activeSec
            ? `${activeSec.academicClass?.name} – Section ${activeSec.name}`
            : 'Timetable'}
        </h1>
        <div className="w-9 h-9" />
      </header>

      {/* --- 1. SECTION SELECTION VIEW --- */}
      {!selectedSectionId && (
        <div className="space-y-6">
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-2">
            <h2 className="text-base font-black text-dark">Select Class/Section</h2>
            <p className="text-xs text-secondaryText leading-relaxed">
              Select a class and section below to view and configure its weekly timetable schedules.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-20 text-xs font-bold text-secondaryText">
              No classes or sections configured for this branch.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex justify-between items-center hover:border-brand-blue/30 hover:shadow-md cursor-pointer transition-all active:scale-[0.98]"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-dark">
                      {sec.academicClass?.name} – Section {sec.name}
                    </h3>
                    <p className="text-[10px] text-secondaryText font-bold uppercase tracking-wider">
                      Academic Year: {sec.academicYear} · Wing: {sec.academicClass?.wing?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                    <FiChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- 2. TIMETABLE GRID VIEW --- */}
      {selectedSectionId && activeSec && (
        <div className="space-y-6">
          {/* Blue Header Info Card */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] via-[#2F65F8] to-[#4076FF] p-6 text-white card-shadow overflow-hidden select-none">
            {/* Concentric translucent circles */}
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full border-[10px] border-white/5" />
            <div className="absolute top-[-10px] right-[-10px] w-24 h-24 rounded-full border-[8px] border-white/10" />

            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black">
                    {activeSec.academicClass?.name} – Section {activeSec.name}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border border-white/20 ${
                    isPublished ? 'bg-[#23C16B]/25 text-[#23C16B]' : 'bg-amber-500/20 text-[#FAF089]'
                  }`}>
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-white/70 font-semibold mt-1">
                  {filledPeriodsCount}/48 periods filled · {students.length} students · {teachers.length} teachers
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 relative z-10">
              <button
                onClick={() => setShowTimesInfo(true)}
                className="px-4 py-2 bg-white/15 border border-white/20 hover:bg-white/25 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FiClock className="w-4 h-4" />
                Times
              </button>
              {isEditable && (
                <button
                  disabled={actionLoading}
                  onClick={handlePublish}
                  className="px-4 py-2 bg-[#23C16B] hover:bg-[#1EAB5D] disabled:opacity-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FiSave className="w-4 h-4" />
                  {isPublished ? 'Unpublish' : 'Publish'}
                </button>
              )}
            </div>
          </div>

          {/* Timetable Table Grid */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 overflow-hidden card-shadow select-none">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e8f0]/60">
                    <th className="p-3 w-16 text-center text-[10px] font-black text-secondaryText uppercase tracking-wider bg-slate-50/50">
                      Slot
                    </th>
                    {DAYS.map(day => (
                      <th key={day} className="p-3 text-center text-[10px] font-black text-secondaryText uppercase tracking-wider bg-slate-50/50 border-l border-[#e2e8f0]/40 min-w-[120px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]/60">
                  {PERIODS.map(periodNum => (
                    <tr key={periodNum}>
                      {/* Period Row Label */}
                      <td className="p-3 text-center text-xs font-black text-secondaryText bg-slate-50/50">
                        P{periodNum}
                      </td>

                      {/* Day cells */}
                      {DAYS.map(day => {
                        const cell = periodsLookup[`${day}-${periodNum}`];
                        const isFilled = cell && (cell.subject || cell.timetableType !== 'Regular');

                        return (
                          <td
                            key={day}
                            onClick={() => handleCellClick(day, periodNum)}
                            className="p-2 border-l border-[#e2e8f0]/40 text-center relative"
                          >
                            {isFilled ? (
                              <div className={`p-2.5 rounded-2xl border transition-all h-[76px] flex flex-col justify-center items-center text-center cursor-pointer ${
                                cell.timetableType === 'Lunch Break'
                                  ? 'bg-amber-50/55 border-amber-200/50 text-amber-600'
                                  : cell.timetableType === 'Short Break'
                                  ? 'bg-blue-50/55 border-blue-200/50 text-blue-600'
                                  : 'bg-red-50/65 border-red-200/60 text-red-500 hover:shadow-sm'
                              }`}>
                                <span className="text-[11px] font-black leading-snug tracking-tight block truncate w-full">
                                  {cell.subject}
                                </span>
                                {cell.teacherName && (
                                  <span className="text-[9px] font-semibold mt-0.5 leading-none block opacity-80 truncate w-full">
                                    {cell.teacherName}
                                  </span>
                                )}
                                {cell.startTime && (
                                  <span className="text-[8px] font-bold mt-1 leading-none block opacity-75">
                                    {cell.startTime}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="h-[76px] border border-dashed border-[#1597E5]/20 hover:border-brand-blue/40 rounded-2xl bg-[#EEF5FB]/25 flex items-center justify-center cursor-pointer transition-all hover:bg-[#EEF5FB]/40">
                                <FiPlus className="w-4 h-4 text-[#1597E5]/55" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-secondaryText font-bold px-1 select-none">
            <FiInfo className="w-3.5 h-3.5" />
            <span>Tap empty cell to assign · Tap filled cell to edit or clear</span>
          </div>
        </div>
      )}

      {/* --- MODALS & DRAWERS --- */}

      {/* Period Config Times Info Modal */}
      <AnimatePresence>
        {showTimesInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] w-full max-w-sm p-6 card-shadow space-y-4 relative"
            >
              <button
                onClick={() => setShowTimesInfo(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-secondaryText cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h2 className="text-base font-black text-dark flex items-center gap-2">
                <FiClock className="w-4.5 h-4.5 text-brand-blue" /> Default Period Times
              </h2>

              <div className="divide-y divide-slate-100 text-xs">
                {[
                  { label: 'Period 1 (P1)', time: '09:00 – 09:45' },
                  { label: 'Period 2 (P2)', time: '09:45 – 10:30' },
                  { label: 'Period 3 (P3)', time: '10:30 – 11:15' },
                  { label: 'Period 4 (P4)', time: '11:15 – 12:00' },
                  { label: 'Period 5 (P5)', time: '12:00 – 12:45' },
                  { label: 'Period 6 (P6)', time: '13:30 – 14:15' },
                  { label: 'Period 7 (P7)', time: '14:15 – 15:00' },
                  { label: 'Period 8 (P8)', time: '15:00 – 15:45' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-2 font-semibold">
                    <span className="text-secondaryText">{item.label}</span>
                    <span className="text-dark font-bold">{item.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Period Modal */}
      <AnimatePresence>
        {editingCell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] w-full max-w-md p-6 card-shadow space-y-4 border border-[#e2e8f0]/40 relative overflow-hidden"
            >
              <button
                onClick={() => setEditingCell(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-secondaryText cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h2 className="text-base font-black text-dark">
                {FULL_DAYS[editingCell.day]} – Period {editingCell.periodNum}
              </h2>

              {/* Type Pills */}
              <div className="flex gap-2 pt-2 select-none">
                {['Regular', 'Lunch Break', 'Short Break'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setTimetableType(type);
                      if (type === 'Lunch Break') {
                        setSubjectInput('Lunch Break');
                        setSelectedTeacher(null);
                        setStartTimeInput('12:45');
                        setEndTimeInput('13:30');
                      } else if (type === 'Short Break') {
                        setSubjectInput('Short Break');
                        setSelectedTeacher(null);
                      } else {
                        setSubjectInput('');
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-[10px] font-black border transition-all cursor-pointer ${
                      timetableType === type
                        ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-sm'
                        : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSavePeriod} className="space-y-4 pt-1">
                {/* Subject name */}
                {timetableType === 'Regular' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Social, Mathematics"
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                )}

                {/* Teacher Selection */}
                {timetableType === 'Regular' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                      Teacher
                    </label>
                    <div
                      onClick={() => setShowTeacherDrawer(true)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark flex items-center justify-between cursor-pointer"
                    >
                      <span className={selectedTeacher ? 'text-dark' : 'text-secondaryText/60'}>
                        {selectedTeacher ? selectedTeacher.name : 'Tap to select teacher...'}
                      </span>
                      <FiChevronRight className="w-4 h-4 text-secondaryText" />
                    </div>
                  </div>
                )}

                {/* Start & End Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                      Start Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9.00"
                      value={startTimeInput}
                      onChange={(e) => setStartTimeInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                      End Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9.45"
                      value={endTimeInput}
                      onChange={(e) => setEndTimeInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>

                {/* Room */}
                {timetableType === 'Regular' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                      Room
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Room 101, Lab 2"
                      value={roomInput}
                      onChange={(e) => setRoomInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="flex-1 py-3 border border-[#e2e8f0] hover:bg-slate-50 text-xs font-bold text-secondaryText rounded-full transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  {periodsLookup[`${editingCell.day}-${editingCell.periodNum}`] && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleClearPeriod}
                      className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-full transition-colors cursor-pointer"
                    >
                      Clear Period
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-[#1597E5] hover:bg-[#00A1FF] text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Select Teacher Drawer/Modal Sheet */}
      <AnimatePresence>
        {showTeacherDrawer && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-[32px] w-full max-w-md h-[80vh] p-6 card-shadow border border-[#e2e8f0]/40 relative flex flex-col"
            >
              <button
                onClick={() => setShowTeacherDrawer(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-secondaryText cursor-pointer z-10"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h2 className="text-base font-black text-dark select-none mb-4">Select Teacher</h2>

              {/* Search Bar */}
              <div className="relative mb-4 select-none shrink-0">
                <input
                  type="text"
                  placeholder="Search teacher..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl text-xs font-semibold text-dark placeholder:text-secondaryText/50 focus:outline-none focus:border-brand-blue"
                />
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
              </div>

              {/* Teachers List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#e2e8f0]/60 scrollbar-thin pr-1">
                {filteredTeachers.map((t) => {
                  const teacherName = t.user?.fullName || 'Unnamed';
                  const initials = teacherName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTeacher({ id: t.id, name: teacherName });
                        setShowTeacherDrawer(false);
                      }}
                      className="flex items-center gap-3.5 py-3 hover:bg-[#EEF5FB]/30 cursor-pointer rounded-xl transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#EEF5FB] text-brand-blue border border-brand-blue/5 flex items-center justify-center font-bold text-xs select-none shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-dark truncate">
                          {teacherName}
                        </h3>
                        <p className="text-[9px] text-[#A0AEC0] font-bold uppercase mt-0.5">
                          {t.staffType || t.designation || 'Teacher'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Timetable;
