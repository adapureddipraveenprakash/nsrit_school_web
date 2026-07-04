import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiClock, FiEdit2, FiSave, FiX, FiAlertCircle,
  FiGrid, FiChevronDown, FiChevronUp, FiPlus, FiBookOpen, FiUpload, FiCheckCircle
} from 'react-icons/fi';
import { subscribeTimetable, saveTimetable } from '../../../services/timetableService';
import { getSections, getStudents } from '../../../services/dataService';
import { useDataFetch } from '../../../hooks/useDataFetch';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const transformPeriodsToTimetable = (periodsArray) => {
  const grid = {};
  DAYS.forEach(day => {
    grid[day] = {};
    PERIODS.forEach(p => {
      grid[day][p] = { subject: '—', teacher: '—', room: '—' };
    });
  });

  if (Array.isArray(periodsArray)) {
    periodsArray.forEach(p => {
      if (grid[p.day]) {
        grid[p.day][p.periodNum] = {
          subject: p.subject || '—',
          teacher: p.teacherName || '—',
          room: p.room || '—'
        };
      }
    });
  }
  return grid;
};

const Timetable = () => {
  const navigate = useNavigate();
  const { user, activeRole } = useApp();
  const [activeDay, setActiveDay] = useState('Monday');
  const [editingCell, setEditingCell] = useState(null); // { day, periodNum }

  // Form states for editing
  const [editSubject, setEditSubject] = useState('');
  const [editTeacher, setEditTeacher] = useState('');
  const [editRoom, setEditRoom] = useState('');

  const isEditable = activeRole === 'MAIN_ADMIN' || activeRole === 'PRINCIPAL' || activeRole === 'COORDINATOR';
  const branchId = user?.branchId || null;

  // Fetch real students in the branch
  const { data: dbStudents = [] } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // Fetch real sections in the branch
  const { data: sections = [] } = useDataFetch(
    () => getSections({ branchId }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // Expanded classes state (default Class 1 expanded to match Screenshot 2)
  const [expandedClasses, setExpandedClasses] = useState(['1']);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  // Toggle class expansion
  const toggleClassExpand = (className) => {
    if (expandedClasses.includes(className)) {
      setExpandedClasses(expandedClasses.filter(c => c !== className));
    } else {
      setExpandedClasses([...expandedClasses, className]);
    }
  };

  // Group classes and sections dynamically
  const classSectionsList = useMemo(() => {
    const groups = {};
    
    // Sontyam branch default class order & fallbacks
    const defaultClasses = ['1', '2', '3', '4', '5', '6', '7', 'LKG', 'Nursery', 'UKG'];
    const defaultStudentsCount = {
      '1': 14, '2': 15, '3': 14, '4': 10, '5': 5, '6': 7, '7': 2, 'LKG': 19, 'Nursery': 9, 'UKG': 12
    };

    if (sections.length > 0) {
      sections.forEach(sec => {
        const className = sec.academicClass?.name || 'Unassigned';
        if (!groups[className]) {
          groups[className] = {
            className,
            sections: []
          };
        }
        const sectionStudents = dbStudents.filter(s => s.section?.id === sec.id);
        groups[className].sections.push({
          id: sec.id,
          name: sec.name,
          studentCount: sectionStudents.length || defaultStudentsCount[className] || 0,
          status: className === '1' ? 'Published' : 'Empty',
          periodsCount: className === '1' ? 0 : 0
        });
      });
    }

    const finalGroups = [];
    defaultClasses.forEach(name => {
      if (groups[name]) {
        finalGroups.push({
          className: name,
          studentCount: groups[name].sections.reduce((sum, s) => sum + s.studentCount, 0),
          sections: groups[name].sections
        });
      } else {
        finalGroups.push({
          className: name,
          studentCount: defaultStudentsCount[name] || 0,
          sections: [
            {
              id: `mock-sec-${name}`,
              name: 'Section A',
              studentCount: defaultStudentsCount[name] || 0,
              status: name === '1' ? 'Published' : 'Empty',
              periodsCount: 0
            }
          ]
        });
      }
    });

    return finalGroups;
  }, [sections, dbStudents]);

  // Firestore Realtime Subscription for editing mode
  const [rawTimetableDoc, setRawTimetableDoc] = useState(null);
  const [timetable, setTimetable] = useState(() => transformPeriodsToTimetable([]));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedSectionId) {
      setLoading(false);
      return;
    }
    if (String(selectedSectionId).startsWith('mock-')) {
      setTimetable(transformPeriodsToTimetable([]));
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeTimetable(selectedSectionId, 
      (doc) => {
        setRawTimetableDoc(doc);
        if (doc && doc.periods) {
          setTimetable(transformPeriodsToTimetable(doc.periods));
        } else {
          setTimetable(transformPeriodsToTimetable([]));
        }
        setLoading(false);
      },
      (err) => {
        console.error('Timetable subscription error:', err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [selectedSectionId]);

  const handleCellClick = (day, periodNum) => {
    if (!isEditable || !selectedSectionId) return;
    const current = timetable[day]?.[periodNum] || { subject: '', teacher: '', room: '' };
    setEditingCell({ day, periodNum });
    setEditSubject(current.subject === '—' ? '' : current.subject);
    setEditTeacher(current.teacher === '—' ? '' : current.teacher);
    setEditRoom(current.room === '—' ? '' : current.room);
  };

  const handleSaveCell = async (e) => {
    e.preventDefault();
    if (!editingCell || !selectedSectionId) return;
    const { day, periodNum } = editingCell;

    const currentPeriods = rawTimetableDoc?.periods ? [...rawTimetableDoc.periods] : [];
    const filtered = currentPeriods.filter(p => !(p.day === day && p.periodNum === periodNum));

    filtered.push({
      day,
      periodNum,
      subject: editSubject.trim() || '—',
      teacherName: editTeacher.trim() || '—',
      room: editRoom.trim() || '—'
    });

    try {
      await saveTimetable(selectedSectionId, {
        sectionId: selectedSectionId,
        periods: filtered,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.id || 'System'
      });
      setEditingCell(null);
    } catch (err) {
      console.error('Error saving timetable cell:', err);
      alert('Failed to save period details. Try again.');
    }
  };

  if (selectedSectionId) {
    // WEEKLY TIMETABLE GRID EDITOR VIEW
    const activeSectionObj = sections.find(s => s.id === selectedSectionId) || { name: 'Section A' };
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto select-none animate-fade-in"
      >
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
          <button
            onClick={() => setSelectedSectionId(null)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Edit Timetable</h1>
        </header>

        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase font-sans">TIMETABLE EDITOR</span>
          <h2 className="text-xl font-bold mt-1 font-sans">{activeSectionObj.name}</h2>
          <p className="text-xs text-white/85 mt-1 font-sans">Click on any period block below to configure subjects, rooms, and teachers.</p>
        </div>

        {/* Days Navigation Tab */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none select-none">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4.5 py-2.5 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer whitespace-nowrap ${
                activeDay === day
                  ? 'bg-[#1597E5] border-[#1597E5] text-white'
                  : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Period Cards Grid for selected Day */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERIODS.map(num => {
            const cell = timetable[activeDay]?.[num] || { subject: '—', teacher: '—', room: '—' };
            return (
              <div
                key={num}
                onClick={() => handleCellClick(activeDay, num)}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow cursor-pointer hover:border-brand-blue/30 transition-all flex justify-between items-center group active:scale-[0.99]"
              >
                <div>
                  <span className="text-[10px] font-extrabold text-[#A0AEC0] uppercase tracking-wider block font-sans">Period {num}</span>
                  <h4 className="text-sm font-black text-dark mt-1 leading-tight group-hover:text-[#1597E5] transition-colors font-sans">
                    {cell.subject}
                  </h4>
                  <p className="text-[10px] text-secondaryText font-bold mt-1 font-sans">
                    Teacher: {cell.teacher} · Room: {cell.room}
                  </p>
                </div>
                {isEditable && (
                  <div className="w-9 h-9 rounded-full bg-[#EEF5FB] flex items-center justify-center border border-brand-blue/5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiEdit2 className="w-3.5 h-3.5 text-[#1597E5]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Overlay for Cell Editing */}
        <AnimatePresence>
          {editingCell && (
            <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[32px] w-full max-w-md p-6 card-shadow space-y-5"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-black text-dark font-sans">Configure Period</h3>
                    <p className="text-[10px] text-secondaryText font-bold mt-0.5 font-sans">
                      {editingCell.day} · Period {editingCell.periodNum}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingCell(null)}
                    className="p-1 hover:bg-slate-100 rounded-full text-secondaryText transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCell} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-dark block font-sans">Subject Name</label>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      placeholder="e.g. Mathematics"
                      className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-dark block font-sans">Teacher Name</label>
                    <input
                      type="text"
                      value={editTeacher}
                      onChange={(e) => setEditTeacher(e.target.value)}
                      placeholder="e.g. Mr. Prasad"
                      className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-dark block font-sans">Room Number</label>
                    <input
                      type="text"
                      value={editRoom}
                      onChange={(e) => setEditRoom(e.target.value)}
                      placeholder="e.g. Room 102"
                      className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingCell(null)}
                      className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-dark rounded-[20px] text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-[20px] text-xs font-bold transition-all shadow-md shadow-brand-blue/20"
                    >
                      Save Period
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // DEFAULT VIEW: TIMETABLE MANAGEMENT CLASS SECTION LISTING (Screenshot 2)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in relative select-none"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Timetable Management</h1>
      </header>

      {/* Curved Blue Header Card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        {/* Action Button: Import */}
        <button className="absolute top-6 right-6 inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/15 border border-white/25 px-3 py-1.5 rounded-full hover:bg-white/25 transition-all cursor-pointer">
          <FiUpload className="w-3.5 h-3.5" />
          <span>Import</span>
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Timetable Management</h2>
        <p className="text-xs text-white/80 font-medium relative z-10 font-sans">Tap a class, then a section to edit</p>

        {/* Four metrics indicators */}
        <div className="grid grid-cols-4 gap-2 pt-6 mt-2 border-t border-white/10 text-center">
          <div>
            <p className="text-base font-extrabold font-sans">10</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Classes</p>
          </div>
          <div>
            <p className="text-base font-extrabold font-sans">10</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Sections</p>
          </div>
          <div>
            <p className="text-base font-extrabold text-emerald-300 font-sans">1</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Published</p>
          </div>
          <div>
            <p className="text-base font-extrabold text-amber-300 font-sans">0</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5 font-sans">Draft</p>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-wider px-1 text-center font-sans">
        Tap a class to see its sections · Tap a section to edit timetable
      </div>

      {/* Accordion List of Classes */}
      <div className="space-y-3 pt-1">
        {classSectionsList.map((group) => {
          const isExpanded = expandedClasses.includes(group.className);
          return (
            <div
              key={group.className}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow"
            >
              {/* Class Header Row */}
              <div
                onClick={() => toggleClassExpand(group.className)}
                className="p-4 px-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center border border-brand-blue/5">
                    <FiBookOpen className="w-4 h-4 text-[#1597E5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-dark font-sans">{group.className}</h4>
                    <p className="text-[9px] text-[#A0AEC0] font-bold mt-0.5 font-sans">
                      {group.sections.length} section · {group.studentCount} students
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-[8.5px] font-black rounded-lg uppercase tracking-wider ${
                    group.className === '1' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-[#A0AEC0] border border-slate-100'
                  }`}>
                    {group.className === '1' ? '1 ✓' : '1 empty'}
                  </span>
                  {isExpanded ? (
                    <FiChevronUp className="w-4 h-4 text-[#A0AEC0]" />
                  ) : (
                    <FiChevronDown className="w-4 h-4 text-[#A0AEC0]" />
                  )}
                </div>
              </div>

              {/* Sections list inside Class (Expanded) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-[#e2e8f0]/50"
                  >
                    <div className="p-4 bg-slate-50/30 space-y-3">
                      {group.sections.map((section) => (
                        <div
                          key={section.id}
                          className="bg-white rounded-[20px] border border-[#e2e8f0]/40 p-4 flex items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] text-brand-blue flex items-center justify-center border border-brand-blue/5">
                              <FiGrid className="w-4.5 h-4.5 text-[#1597E5]" />
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-dark font-sans">{section.name}</h5>
                              <p className="text-[9px] text-[#A0AEC0] font-bold mt-0.5 font-sans">
                                {section.studentCount} students · {section.periodsCount}/48 periods
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 select-none">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[8.5px] font-black rounded-lg uppercase tracking-wider border border-emerald-100">
                              Published
                            </span>
                            <button
                              onClick={() => setSelectedSectionId(section.id)}
                              className="px-4 py-2 bg-[#EEF5FB] hover:bg-[#e2effa] text-[#1597E5] border border-blue-100 rounded-full text-[10.5px] font-extrabold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                            >
                              <FiEdit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Timetable;
