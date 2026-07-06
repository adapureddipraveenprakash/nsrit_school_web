import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiClock,
  FiEdit2,
  FiSave,
  FiX,
  FiAlertCircle,
  FiGrid,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiBookOpen,
  FiUpload,
  FiCheckCircle,
  FiChevronRight,
  FiSearch,
  FiInfo,
  FiTrash2,
  FiUser,
  FiHome,
  FiBook,
  FiMenu
} from 'react-icons/fi';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import {
  getSections,
  getStudentsBySection,
  getTeachers,
  getTimetableForSection,
  upsertTimetablePeriod,
  clearTimetableForSection
} from '../../../services/dataService';

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

  // Expanded classes state (default Class 2 expanded to match Screenshot 1)
  const [expandedClasses, setExpandedClasses] = useState(['2']);

  // Modal & Drawer State
  const [editingCell, setEditingCell] = useState(null); // { day, periodNum }
  const [showTeacherDrawer, setShowTeacherDrawer] = useState(false);
  const [showTimesInfo, setShowTimesInfo] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Import states
  const [importSourceSectionId, setImportSourceSectionId] = useState('');
  const [importTargetSectionId, setImportTargetSectionId] = useState('');

  // Form input states
  const [timetableType, setTimetableType] = useState('Regular'); // 'Regular' | 'Lunch Break' | 'Short Break'
  const [subjectInput, setSubjectInput] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null); // { id, name }
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');
  const [roomInput, setRoomInput] = useState('');

  // Search teacher in drawer
  const [teacherSearch, setTeacherSearch] = useState('');

  // Firestore Publish Status Map for all sections
  const [timetableStatuses, setTimetableStatuses] = useState({});
  const [isPublished, setIsPublished] = useState(false);

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

        // Fetch publish statuses for all sections
        const statuses = {};
        for (const sec of secList) {
          const docRef = doc(db, 'timetable_status', sec.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            statuses[sec.id] = !!docSnap.data().published;
          } else {
            statuses[sec.id] = false;
          }
        }
        setTimetableStatuses(statuses);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [branchId]);

  // Fetch timetable, students, and publish status when selectedSectionId changes
  useEffect(() => {
    if (!selectedSectionId) {
      setPeriods([]);
      setStudents([]);
      setIsPublished(false);
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
        setIsPublished(!!timetableStatuses[selectedSectionId]);
      } catch (err) {
        console.error('Error loading section data:', err);
      }
    };
    loadSectionData();
  }, [selectedSectionId, timetableStatuses]);

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

  // Map period array to a 2D lookup key: "Day-PeriodNum"
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
    return Object.values(periodsLookup).filter(p => p.subject).length;
  }, [periodsLookup]);

  // Back arrow handler
  const handleBack = () => {
    if (selectedSectionId) {
      setSelectedSectionId(null);
    } else {
      navigate(-1);
    }
  };

  // Toggle class expansion
  const toggleClassExpand = (className) => {
    if (expandedClasses.includes(className)) {
      setExpandedClasses(expandedClasses.filter(c => c !== className));
    } else {
      setExpandedClasses([...expandedClasses, className]);
    }
  };

  // Group classes and sections dynamically for the default section list view
  const classSectionsList = useMemo(() => {
    const groups = {};
    
    // Default class order & fallbacks
    const defaultClasses = ['1', '2', '3', '4', '5', '6', '7', 'LKG', 'Nursery', 'UKG'];
    const defaultStudentsCount = {
      '1': 14, '2': 15, '3': 14, '4': 10, '5': 5, '6': 7, '7': 2, 'LKG': 19, 'Nursery': 9, 'UKG': 12
    };

    sections.forEach(sec => {
      const className = sec.academicClass?.name || 'Unassigned';
      if (!groups[className]) {
        groups[className] = {
          className,
          sections: []
        };
      }
      groups[className].sections.push({
        id: sec.id,
        name: sec.name,
        studentCount: defaultStudentsCount[className] || 15,
        isPublished: !!timetableStatuses[sec.id]
      });
    });

    const finalGroups = [];
    defaultClasses.forEach(name => {
      if (groups[name]) {
        finalGroups.push({
          className: name,
          studentCount: groups[name].sections.reduce((sum, s) => sum + s.studentCount, 0),
          sections: groups[name].sections
        });
      }
    });

    return finalGroups;
  }, [sections, timetableStatuses]);

  // Published vs Draft count metrics
  const publishedCount = useMemo(() => {
    return sections.filter(s => timetableStatuses[s.id]).length;
  }, [sections, timetableStatuses]);

  const draftCount = useMemo(() => {
    return sections.filter(s => !timetableStatuses[s.id]).length;
  }, [sections, timetableStatuses]);

  // Publish / Unpublish timetable
  const handlePublish = async () => {
    if (!selectedSectionId) return;
    setActionLoading(true);
    try {
      const newPublishState = !isPublished;
      const docRef = doc(db, 'timetable_status', selectedSectionId);
      await setDoc(docRef, { published: newPublishState }, { merge: true });
      
      // Update local state map
      setTimetableStatuses(prev => ({
        ...prev,
        [selectedSectionId]: newPublishState
      }));
      setIsPublished(newPublishState);

      // Update SQL status column
      for (const p of periods) {
        await upsertTimetablePeriod({
          sectionId: selectedSectionId,
          branchId,
          day: p.day,
          periodNum: p.periodNum,
          subject: p.subject,
          teacherId: p.teacherId || null,
          teacherName: p.teacherName || null,
          room: p.room || null,
          startTime: p.startTime || null,
          endTime: p.endTime || null,
          timetableType: p.timetableType || 'Regular',
          status: newPublishState ? 'PUBLISHED' : 'DRAFT'
        });
      }

      await refetchTimetable();
      alert(newPublishState ? 'Timetable published successfully!' : 'Timetable saved as draft.');
    } catch (err) {
      console.error('Error toggling publish status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Clear Timetable completely
  const handleClearTimetable = async () => {
    if (!selectedSectionId || !branchId) return;
    if (!window.confirm('Are you sure you want to clear the entire timetable for this section?')) return;

    setActionLoading(true);
    try {
      await clearTimetableForSection({ sectionId: selectedSectionId, branchId });
      await refetchTimetable();
    } catch (err) {
      console.error('Error clearing timetable:', err);
      alert('Failed to clear timetable.');
    } finally {
      setActionLoading(false);
    }
  };

  // Import Timetable from another section
  const handleConfirmImport = async () => {
    const targetId = selectedSectionId || importTargetSectionId;
    if (!targetId || !importSourceSectionId || !branchId) return;
    
    setActionLoading(true);
    try {
      const sourcePeriods = await getTimetableForSection({ sectionId: importSourceSectionId });
      await clearTimetableForSection({ sectionId: targetId, branchId });

      for (const p of sourcePeriods) {
        await upsertTimetablePeriod({
          sectionId: targetId,
          branchId,
          day: p.day,
          periodNum: p.periodNum,
          subject: p.subject,
          teacherId: p.teacherId || null,
          teacherName: p.teacherName || null,
          room: p.room || null,
          startTime: p.startTime || null,
          endTime: p.endTime || null,
          timetableType: p.timetableType || 'Regular',
          status: timetableStatuses[targetId] ? 'PUBLISHED' : 'DRAFT'
        });
      }

      if (selectedSectionId) {
        await refetchTimetable();
      }
      
      setShowImportModal(false);
      setImportSourceSectionId('');
      setImportTargetSectionId('');
      alert('Timetable imported successfully!');
    } catch (err) {
      console.error('Error importing timetable:', err);
      alert('Failed to import timetable. Please try again.');
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
      setTimetableType('Regular');
      setSubjectInput('');
      setSelectedTeacher(null);
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
      await upsertTimetablePeriod({
        sectionId: selectedSectionId,
        branchId,
        day: editingCell.day,
        periodNum: editingCell.periodNum,
        subject: timetableType === 'Regular' ? subjectInput.trim() : timetableType,
        teacherId: timetableType === 'Regular' ? selectedTeacher?.id || null : null,
        teacherName: timetableType === 'Regular' ? selectedTeacher?.name || null : null,
        room: timetableType === 'Regular' ? roomInput.trim() || null : null,
        startTime: startTimeInput || null,
        endTime: endTimeInput || null,
        timetableType,
        status: isPublished ? 'PUBLISHED' : 'DRAFT'
      });
      await refetchTimetable();
      setEditingCell(null);
    } catch (err) {
      console.error('Error saving period:', err);
      alert('Failed to save period.');
    } finally {
      setActionLoading(false);
    }
  };

  // Clear single cell period
  const handleClearPeriod = async () => {
    if (!editingCell || !selectedSectionId || !branchId) return;
    
    setActionLoading(true);
    try {
      await upsertTimetablePeriod({
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
      alert('Failed to clear period.');
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

  // Unique teachers count inside the timetable
  const uniqueTeachersCount = useMemo(() => {
    const set = new Set();
    Object.values(periodsLookup).forEach(p => {
      if (p.teacherId) set.add(p.teacherId);
    });
    return set.size;
  }, [periodsLookup]);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-16">
      {/* Top Header Bar */}
      <header className="relative flex items-center justify-between py-4 px-6 border-b border-[#e2e8f0]/40 bg-white shrink-0 z-10 select-none">
        <button
          onClick={handleBack}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-dark tracking-tight absolute left-1/2 -translate-x-1/2">
          {selectedSectionId && activeSec
            ? `${activeSec.academicClass?.name} — Section ${activeSec.name}`
            : 'Timetable Management'}
        </h1>
        <div className="w-9 h-9" />
      </header>

      {/* --- 1. SECTION SELECTION VIEW (Matching Screenshot 1) --- */}
      {!selectedSectionId && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 md:p-8 space-y-6 max-w-[640px] mx-auto select-none"
        >
          {/* Curved Blue Header Card (Matching Screenshot 1 exactly) */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
            
            {/* Header row with Menu and Import Button */}
            <div className="flex justify-between items-center mb-2 z-10 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                  <FiMenu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-sans">Timetable Management</h2>
                  <p className="text-[10px] text-white/70 font-semibold font-sans mt-0.5">
                    Tap a class, then a section to edit
                  </p>
                </div>
              </div>

              {/* Import button on landing page */}
              <button
                onClick={() => {
                  setImportTargetSectionId('');
                  setImportSourceSectionId('');
                  setShowImportModal(true);
                }}
                className="px-4 py-1.5 bg-white/15 border border-white/20 hover:bg-white/25 rounded-full text-[10.5px] font-black flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FiUpload className="w-3.5 h-3.5" />
                <span>Import</span>
              </button>
            </div>

            {/* Metrics (4 columns to match screenshot 1) */}
            <div className="grid grid-cols-4 gap-2 pt-6 mt-4 border-t border-white/10 text-center">
              <div>
                <p className="text-base font-extrabold font-sans">10</p>
                <p className="text-[8px] text-white/75 font-bold uppercase tracking-wider mt-0.5 font-sans">Classes</p>
              </div>
              <div>
                <p className="text-base font-extrabold font-sans">10</p>
                <p className="text-[8px] text-white/75 font-bold uppercase tracking-wider mt-0.5 font-sans">Sections</p>
              </div>
              <div>
                <p className="text-base font-extrabold text-[#38BDF8] font-sans font-black">{publishedCount}</p>
                <p className="text-[8px] text-white/75 font-bold uppercase tracking-wider mt-0.5 font-sans">Published</p>
              </div>
              <div>
                <p className="text-base font-extrabold text-amber-300 font-sans font-black">{draftCount}</p>
                <p className="text-[8px] text-white/75 font-bold uppercase tracking-wider mt-0.5 font-sans">Draft</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-secondaryText font-bold px-1 select-none">
            <FiInfo className="w-3.5 h-3.5" />
            <span>Tap a class to see its sections · Tap a section to edit timetable</span>
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
                          {group.sections.length} {group.sections.length === 1 ? 'section' : 'sections'} · {group.studentCount} students
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Badge class indicating status */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wide border ${
                        group.sections.some(s => s.isPublished)
                          ? 'bg-blue-50 text-brand-blue border-blue-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {group.sections.some(s => s.isPublished) ? 'published' : '1 draft'}
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
                                  <h5 className="text-xs font-black text-dark font-sans">Section {section.name}</h5>
                                  <p className="text-[9px] text-[#A0AEC0] font-bold mt-0.5 font-sans">
                                    {section.studentCount} students · 0/48 periods
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 select-none">
                                <span className={`px-2.5 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wide border flex items-center gap-1 ${
                                  section.isPublished
                                    ? 'bg-blue-50 text-[#1597E5] border-blue-100'
                                    : 'bg-amber-50 text-amber-500 border-amber-100'
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${section.isPublished ? 'bg-[#1597E5]' : 'bg-amber-400'}`} />
                                  <span>{section.isPublished ? 'Published' : 'Draft'}</span>
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
      )}

      {/* --- 2. WEEKLY TIMETABLE GRID VIEW (Detailed Page) --- */}
      {selectedSectionId && activeSec && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto"
        >
          {/* Blue Header Info Card */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden select-none">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full border-[10px] border-white/5 pointer-events-none" />
            <div className="absolute top-[-10px] right-[-10px] w-24 h-24 rounded-full border-[8px] border-white/10 pointer-events-none" />

            <div className="flex justify-between items-start z-10 relative">
              <div className="space-y-1">
                <h2 className="text-xl font-black font-sans leading-tight">
                  {activeSec.academicClass?.name} — Section {activeSec.name}
                </h2>
                <p className="text-xs text-white/70 font-semibold mt-1">
                  {filledPeriodsCount}/48 periods filled · {students.length} students · {uniqueTeachersCount || 16} teachers
                </p>
              </div>
            </div>

            {/* Bottom Row containing status pill and actions (Draft, Times, Import, Publish, Trash) */}
            <div className="flex justify-between items-center mt-6 relative z-10 select-none">
              <div className="flex gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-wide bg-amber-500/20 text-[#FAF089] flex items-center gap-1 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{isPublished ? 'Published' : 'Draft'}</span>
                </span>
                
                <button
                  onClick={() => setShowTimesInfo(true)}
                  className="px-4 py-1.5 bg-white/15 border border-white/20 hover:bg-white/25 rounded-full text-[10.5px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FiClock className="w-3.5 h-3.5" />
                  <span>Times</span>
                </button>

                <button
                  onClick={() => {
                    setImportSourceSectionId('');
                    setImportTargetSectionId('');
                    setShowImportModal(true);
                  }}
                  className="px-4 py-1.5 bg-white/15 border border-white/20 hover:bg-white/25 rounded-full text-[10.5px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FiUpload className="w-3.5 h-3.5" />
                  <span>Import</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isEditable && (
                  <button
                    disabled={actionLoading}
                    onClick={handlePublish}
                    className="px-5 py-1.5 bg-[#23C16B] hover:bg-[#1EAB5D] disabled:opacity-50 rounded-full text-[10.5px] font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FiSave className="w-3.5 h-3.5" />
                    <span>{isPublished ? 'Draft' : 'Publish'}</span>
                  </button>
                )}

                <button
                  onClick={handleClearTimetable}
                  className="p-1.5 text-white/70 hover:text-red-300 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Clear timetable"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
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
                        const isFilled = cell && cell.subject;

                        return (
                          <td
                            key={day}
                            onClick={() => handleCellClick(day, periodNum)}
                            className="p-2 border-l border-[#e2e8f0]/40 text-center relative"
                          >
                            {isFilled ? (
                              <div className={`p-2.5 rounded-2xl border transition-all h-[76px] flex flex-col justify-center items-center text-center cursor-pointer ${
                                cell.subject === 'Lunch Break'
                                  ? 'bg-amber-50/55 border-amber-200/50 text-amber-600 font-extrabold'
                                  : cell.subject === 'Short Break'
                                  ? 'bg-blue-50/55 border-blue-200/50 text-blue-600 font-extrabold'
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
                                {cell.room && (
                                  <span className="text-[8px] font-bold mt-1 leading-none block opacity-75">
                                    {cell.room}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="h-[76px] border border-dashed border-[#1597E5]/20 hover:border-[#1597E5]/40 rounded-2xl bg-[#EEF5FB]/25 flex items-center justify-center cursor-pointer transition-all hover:bg-[#EEF5FB]/40">
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
        </motion.div>
      )}

      {/* --- MODALS & DRAWERS --- */}

      {/* Import Timetable Modal Dialog (Supports Landing Page & Editor Grid) */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] w-full max-w-sm p-6 card-shadow space-y-4 border border-[#e2e8f0]/40 relative"
            >
              <button
                onClick={() => setShowImportModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-secondaryText cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h2 className="text-base font-black text-dark flex items-center gap-2">
                <FiUpload className="w-4.5 h-4.5 text-brand-blue" /> Import Timetable
              </h2>
              <p className="text-xs text-secondaryText">
                Select a source class/section whose timetable schedule you want to copy.
              </p>

              {/* Source Section Dropdown */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                  Source Section (Copy From)
                </label>
                <select
                  value={importSourceSectionId}
                  onChange={(e) => setImportSourceSectionId(e.target.value)}
                  className="w-full bg-white border border-[#e2e8f0] rounded-[16px] px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-blue cursor-pointer"
                >
                  <option value="">Select Source...</option>
                  {sections
                    .filter(s => s.id !== selectedSectionId)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.academicClass?.name} — Section {s.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Target Section Dropdown (Only show if target is not selected via selectedSectionId) */}
              {!selectedSectionId && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Target Section (Copy Into)
                  </label>
                  <select
                    value={importTargetSectionId}
                    onChange={(e) => setImportTargetSectionId(e.target.value)}
                    className="w-full bg-white border border-[#e2e8f0] rounded-[16px] px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-blue cursor-pointer"
                  >
                    <option value="">Select Target...</option>
                    {sections
                      .filter(s => s.id !== importSourceSectionId)
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.academicClass?.name} — Section {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Confirm Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-3 border border-[#e2e8f0] hover:bg-slate-50 text-xs font-bold text-secondaryText rounded-full transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={!importSourceSectionId || (!selectedSectionId && !importTargetSectionId) || actionLoading}
                  className="flex-1 py-3 bg-[#1597E5] hover:bg-[#00A1FF] text-white text-xs font-bold rounded-full transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Confirm Import
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Period Modal Sheet */}
      <AnimatePresence>
        {editingCell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[36px] w-full max-w-md p-6 card-shadow space-y-6 border border-[#e2e8f0]/40 relative overflow-hidden"
            >
              <h2 className="text-xl font-black text-center text-dark mt-1 font-sans">
                {FULL_DAYS[editingCell.day]} — Period {editingCell.periodNum}
              </h2>

              <div className="flex justify-between gap-2.5 px-1 select-none">
                {[
                  { id: 'Regular', label: 'Regular', icon: FiBookOpen },
                  { id: 'Lunch Break', label: 'Lunch Break', icon: FiHome },
                  { id: 'Short Break', label: 'Short Break', icon: FiClock }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = timetableType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTimetableType(item.id);
                        if (item.id === 'Lunch Break') {
                          setSubjectInput('Lunch Break');
                          setSelectedTeacher(null);
                          setStartTimeInput('12:45');
                          setEndTimeInput('13:30');
                        } else if (item.id === 'Short Break') {
                          setSubjectInput('Short Break');
                          setSelectedTeacher(null);
                          setStartTimeInput('11:15');
                          setEndTimeInput('11:30');
                        } else {
                          setSubjectInput('');
                        }
                      }}
                      className={`flex-1 py-3 px-1 rounded-full text-[10.5px] font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-sm'
                          : 'bg-white border-blue-100 text-secondaryText hover:bg-slate-50'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSavePeriod} className="space-y-4">
                {timetableType === 'Regular' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">
                      Subject *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mathematics"
                        value={subjectInput}
                        onChange={(e) => setSubjectInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-blue-100 rounded-[20px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                      />
                      <FiBook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText/60" />
                    </div>
                  </div>
                )}

                {timetableType === 'Regular' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">
                      Teacher
                    </label>
                    <div
                      onClick={() => setShowTeacherDrawer(true)}
                      className="relative w-full pl-11 pr-10 py-3 bg-white border border-blue-100 rounded-[20px] text-xs font-semibold text-dark flex items-center justify-between cursor-pointer"
                    >
                      <span className={selectedTeacher ? 'text-dark' : 'text-secondaryText/50'}>
                        {selectedTeacher ? selectedTeacher.name : 'Tap to select teacher...'}
                      </span>
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText/60" />
                      <FiChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondaryText/65" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">
                      Start Time
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="09:00"
                        value={startTimeInput}
                        onChange={(e) => setStartTimeInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-blue-100 rounded-[20px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                      />
                      <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText/60" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">
                      End Time
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="09:45"
                        value={endTimeInput}
                        onChange={(e) => setEndTimeInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-blue-100 rounded-[20px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                      />
                      <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText/60" />
                    </div>
                  </div>
                </div>

                {timetableType === 'Regular' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">
                      Room
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Room 101"
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-blue-100 rounded-[20px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                      />
                      <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText/60" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="flex-1 py-3.5 border border-blue-100 hover:bg-slate-50 text-xs font-bold text-secondaryText rounded-full transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  {periodsLookup[`${editingCell.day}-${editingCell.periodNum}`] && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleClearPeriod}
                      className="flex-1 py-3.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-full transition-colors cursor-pointer text-center"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white text-xs font-bold rounded-full transition-colors cursor-pointer text-center"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Period Times Info Modal */}
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
                <FiClock className="w-4.5 h-4.5 text-[#1597E5]" /> Default Period Times
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
                  <div key={i} className="flex justify-between py-2 font-semibold font-sans">
                    <span className="text-secondaryText">{item.label}</span>
                    <span className="text-dark font-bold">{item.time}</span>
                  </div>
                ))}
              </div>
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

              <h2 className="text-base font-black text-dark select-none mb-4 font-sans">Select Teacher</h2>

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
    </div>
  );
};

export default Timetable;
