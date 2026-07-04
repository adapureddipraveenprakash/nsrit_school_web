import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiUsers,
  FiSearch,
  FiCheckCircle,
  FiChevronRight,
  FiChevronDown,
  FiCalendar,
  FiAlertCircle,
  FiClock,
  FiEdit,
  FiEdit2,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import {
  getAcademicClasses,
  getSectionsByClass,
  getStudentsBySection,
  getAttendanceBySection,
  correctAttendance,
  createAttendance
} from '../../../services/dataService';

const CorrectAttendance = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const branchId = user?.branchId || 'sontyam-branch-id';

  // Wizard steps: 1 = Date, 2 = Class, 3 = Section, 4 = Records
  const [step, setStep] = useState(1);

  // Date selection (Step 1)
  const getInitialDate = () => {
    const today = new Date();
    const minDate = new Date('2026-06-12');
    return today >= minDate ? today : minDate;
  };
  const [selectedDate, setSelectedDate] = useState(getInitialDate());

  // Class selection (Step 2)
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classesLoading, setClassesLoading] = useState(false);

  // Section selection (Step 3)
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // Records list & loading (Step 4)
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Corrections state
  const [corrections, setCorrections] = useState({}); // studentId -> newStatus ('Present' | 'Absent')
  const [reasons, setReasons] = useState({}); // studentId -> reason string

  // Dropdown states
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Dialog & success states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // History modal states
  const [historyStudent, setHistoryStudent] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Format Helpers
  const formatToYYYYMMDD = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateToDMY = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // 1. Fetch Classes (Step 2)
  useEffect(() => {
    if (step === 2 && classes.length === 0) {
      const loadClasses = async () => {
        setClassesLoading(true);
        try {
          const all = await getAcademicClasses();
          let branchClasses = all.filter(c => c.branchId === branchId);
          if (user?.wing) {
            branchClasses = branchClasses.filter(c => c.wing?.code?.toUpperCase() === user.wing.toUpperCase());
          }
          setClasses(branchClasses);
          if (branchClasses.length > 0 && !selectedClass) {
            setSelectedClass(branchClasses[0]);
          }
        } catch (err) {
          console.error('Error fetching classes:', err);
          setError('Failed to load classes.');
        } finally {
          setClassesLoading(false);
        }
      };
      loadClasses();
    }
  }, [step, branchId, classes.length, selectedClass, user?.wing]);

  // 2. Fetch Sections (Step 3)
  useEffect(() => {
    if (step === 3 && selectedClass) {
      const loadSections = async () => {
        setSectionsLoading(true);
        try {
          const classSections = await getSectionsByClass(selectedClass.id);
          setSections(classSections);
          if (classSections.length > 0) {
            setSelectedSection(classSections[0]);
          } else {
            setSelectedSection(null);
          }
        } catch (err) {
          console.error('Error fetching sections:', err);
          setError('Failed to load sections.');
        } finally {
          setSectionsLoading(false);
        }
      };
      loadSections();
    }
  }, [step, selectedClass]);

  // 3. Fetch Student Roster & Attendance Logs (Step 4)
  const loadRosterAndAttendance = async () => {
    if (!selectedSection) return;
    setRecordsLoading(true);
    setError(null);
    setCorrections({});
    setReasons({});
    try {
      const dateStr = formatToYYYYMMDD(selectedDate);
      const [studentList, records] = await Promise.all([
        getStudentsBySection(selectedSection.id),
        getAttendanceBySection({ sectionId: selectedSection.id, date: dateStr })
      ]);
      setStudents(studentList);
      setAttendanceRecords(records);
    } catch (err) {
      console.error('Error loading roster/attendance:', err);
      setError('Failed to load student roster and attendance.');
    } finally {
      setRecordsLoading(false);
    }
  };

  // Trigger loading when entering Step 4
  useEffect(() => {
    if (step === 4) {
      loadRosterAndAttendance();
    }
  }, [step]);

  // Combine student details with their attendance records
  const combinedRoster = useMemo(() => {
    return students.map(student => {
      const existing = attendanceRecords.find(r => r.student?.id === student.id);
      const originalStatus = existing?.status ? (
        existing.status.toUpperCase() === 'PRESENT' ? 'Present' : 'Absent'
      ) : 'Present'; // Default to Present if not marked

      return {
        id: student.id,
        name: student.fullName,
        rollNumber: student.rollNo || 'N/A',
        originalStatus: originalStatus,
        recordId: existing?.id || null
      };
    });
  }, [students, attendanceRecords]);

  // Filter list by search query
  const filteredStudents = useMemo(() => {
    return combinedRoster.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [combinedRoster, searchQuery]);

  // Count corrections
  const changedStudents = useMemo(() => {
    return combinedRoster.filter(s => {
      const currentStatus = corrections[s.id] || s.originalStatus;
      return currentStatus !== s.originalStatus;
    });
  }, [combinedRoster, corrections]);

  const changedCount = changedStudents.length;

  // Check if any corrected student is missing a reason
  const hasEmptyReason = useMemo(() => {
    return changedStudents.some(s => !reasons[s.id] || !reasons[s.id].trim());
  }, [changedStudents, reasons]);

  // Save changes mutation handler
  const handleSaveChanges = async () => {
    setSaveLoading(true);
    setError(null);
    try {
      const dateStr = formatToYYYYMMDD(selectedDate);
      const promises = changedStudents.map(student => {
        const newStatus = corrections[student.id];
        const reasonText = reasons[student.id] || 'Correction';

        if (student.recordId) {
          // Update existing attendance
          return correctAttendance({
            id: student.recordId,
            status: newStatus.toUpperCase(),
            editedById: user?.id || 'sontyam-coordinator-id',
            editedByRole: 'COORDINATOR',
            previousStatus: student.originalStatus.toUpperCase(),
            reason: reasonText,
            remarks: '',
            studentId: student.id,
            sectionId: selectedSection.id,
            attendanceDate: dateStr,
            branchId: branchId,
            academicYearId: null
          });
        } else {
          // Create new attendance
          return createAttendance({
            studentId: student.id,
            academicClassId: selectedClass.id,
            sectionId: selectedSection.id,
            branchId: branchId,
            attendanceDate: dateStr,
            status: newStatus.toUpperCase(),
            markedById: user?.id || 'sontyam-coordinator-id',
            remarks: reasonText
          });
        }
      });

      await Promise.all(promises);
      setShowConfirmModal(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setStep(1);
        setSelectedClass(null);
        setSelectedSection(null);
        setCorrections({});
        setReasons({});
      }, 2000);
    } catch (err) {
      console.error('Error saving corrections:', err);
      setError('Failed to save attendance corrections.');
      setShowConfirmModal(false);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 md:pb-8 max-w-[640px] mx-auto animate-fade-in relative select-none"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => {
            if (step > 1) {
              setStep(prev => prev - 1);
            } else {
              navigate(-1);
            }
          }}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-[#0F172A] pr-8 mx-auto">Correct Attendance</h1>
      </header>

      {/* Stepper Wizard Indicator (matches Screenshot 1) */}
      <div className="flex items-center justify-between px-2 py-4 bg-white border-b border-[#e2e8f0]/40 shrink-0">
        {[
          { key: 1, label: 'Date' },
          { key: 2, label: 'Class' },
          { key: 3, label: 'Section' },
          { key: 4, label: 'Records' }
        ].map((s, idx) => {
          const isDone = step > s.key;
          const isActive = step === s.key;
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center space-y-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isDone ? 'bg-[#23C16B] text-white' :
                  isActive ? 'bg-[#1597E5] text-white' :
                  'bg-[#EEF5FB] text-[#A0AEC0]'
                }`}>
                  {isDone ? <FiCheck className="w-4 h-4" /> : s.key}
                </div>
                <span className={`text-[10px] font-bold ${
                  isActive || isDone ? 'text-brand-blue font-extrabold' : 'text-[#A0AEC0]'
                }`}>{s.label}</span>
              </div>
              {idx < 3 && (
                <div className={`flex-1 h-[2px] mx-2 -mt-4 transition-all ${
                  step > s.key ? 'bg-[#23C16B]' : 'bg-[#EEF5FB]'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {showSuccess && (
        <div className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-600 font-bold animate-[bounce_0.5s_ease]">
          <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>Attendance corrections saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 rounded-xl p-3 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* STEP 1: SELECT DATE */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-6 shadow-xl shadow-blue-50/10 space-y-5"
        >
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#0F172A]">Select Date</h2>
            <p className="text-xs text-secondaryText">Choose the attendance date you wish to correct</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Date</label>
            <div className="relative">
              <input
                type="date"
                min="2026-06-12"
                value={formatToYYYYMMDD(selectedDate)}
                onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                className="w-full px-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark cursor-pointer"
              />
              <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-4 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-[20px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/15 transition-all cursor-pointer"
          >
            Next — Choose Class <FiChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* STEP 2: SELECT CLASS */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-6 shadow-xl shadow-blue-50/10 space-y-5"
        >
          <button
            onClick={() => setStep(1)}
            className="text-[10px] font-bold text-[#1597E5] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <FiArrowLeft className="w-3 h-3" /> {formatDateToDMY(selectedDate)}
          </button>

          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#0F172A]">Select Class</h2>
            <p className="text-xs text-secondaryText">Choose class to display sections</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Class</label>
            {classesLoading ? (
              <div className="py-3 text-xs font-semibold text-secondaryText">Loading classes...</div>
            ) : (
              <div className="relative">
                <select
                  value={selectedClass?.id || ''}
                  onChange={(e) => {
                    const found = classes.find(c => c.id === e.target.value);
                    if (found) setSelectedClass(found);
                  }}
                  className="w-full pl-4 pr-10 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark appearance-none cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
              </div>
            )}
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={!selectedClass}
            className="w-full py-4 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-[20px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/15 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next — Choose Section <FiChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* STEP 3: SELECT SECTION */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-6 shadow-xl shadow-blue-50/10 space-y-5"
        >
          <button
            onClick={() => setStep(2)}
            className="text-[10px] font-bold text-[#1597E5] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <FiArrowLeft className="w-3 h-3" /> {selectedClass?.name || 'Class'}
          </button>

          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#0F172A]">Select Section</h2>
            <p className="text-xs text-secondaryText">Choose section to load students list</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Section</label>
            {sectionsLoading ? (
              <div className="py-3 text-xs font-semibold text-secondaryText">Loading sections...</div>
            ) : sections.length === 0 ? (
              <div className="py-3 text-xs font-semibold text-rose-500">No sections found for this class.</div>
            ) : (
              <div className="relative">
                <select
                  value={selectedSection?.id || ''}
                  onChange={(e) => {
                    const found = sections.find(s => s.id === e.target.value);
                    if (found) setSelectedSection(found);
                  }}
                  className="w-full pl-4 pr-10 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark appearance-none cursor-pointer"
                >
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
              </div>
            )}
          </div>

          <button
            onClick={() => setStep(4)}
            disabled={!selectedSection}
            className="w-full py-4 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-[20px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/15 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Load Attendance Records <FiChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* STEP 4: RECORDS & CORRECTIONS */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Header Link */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className="text-[10px] font-extrabold text-[#1597E5] flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
              <span>{selectedClass?.name} - {selectedSection?.name} · {formatDateToDMY(selectedDate)}</span>
            </button>
            {changedCount > 0 && (
              <span className="bg-blue-50 text-brand-blue text-[9px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                <FiClock className="w-3 h-3" /> {changedCount} change{changedCount > 1 ? 's' : ''} pending
              </span>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search student"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
          </div>

          <p className="text-[10px] font-extrabold text-[#718096] uppercase tracking-wider px-1">
            Change a status then fill in a reason to save.
          </p>

          {/* Loading state */}
          {recordsLoading ? (
            <div className="text-center py-12 text-xs font-semibold text-secondaryText">Loading roster...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-xs font-semibold text-secondaryText">No students found</div>
          ) : (
            <div className="space-y-3.5">
              {filteredStudents.map((student) => {
                const currentStatus = corrections[student.id] || student.originalStatus;
                const isPresent = currentStatus === 'Present';
                const isChanged = currentStatus !== student.originalStatus;

                const nameParts = student.name.split(' ');
                const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : student.name.charAt(0);

                return (
                  <div
                    key={student.id}
                    className={`bg-white rounded-[24px] border p-4 px-5 card-shadow transition-all relative ${
                      isChanged
                        ? isPresent
                          ? 'border-emerald-200 bg-[#E8F8F0]/10 shadow-emerald-50/20'
                          : 'border-red-200 bg-red-50/10 shadow-red-50/20'
                        : isPresent
                          ? 'border-emerald-100/50 bg-[#E8F8F0]/20'
                          : 'border-red-100/50 bg-red-50/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                          isPresent ? 'bg-[#E8F8F0] text-[#23C16B]' : 'bg-red-50 text-[#E53E3E]'
                        }`}>
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-dark leading-tight">
                            {student.name}
                          </h3>
                          <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                            Roll {student.rollNumber}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown status selector */}
                      <div className="relative" ref={openDropdownId === student.id ? dropdownRef : null}>
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === student.id ? null : student.id)}
                          className={`rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-extrabold border transition-all cursor-pointer ${
                            isPresent
                              ? 'bg-[#E8F8F0] text-[#23C16B] border-emerald-100 hover:bg-[#D4F5E3]'
                              : 'bg-red-50 text-[#E53E3E] border-red-100 hover:bg-red-100/60'
                          }`}
                        >
                          {isPresent ? (
                            <FiCheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <FiX className="w-3.5 h-3.5 rounded-full border border-red-500 flex items-center justify-center" />
                          )}
                          <span>{currentStatus}</span>
                          <FiChevronDown className="w-3 h-3 opacity-70" />
                        </button>

                        <AnimatePresence>
                          {openDropdownId === student.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="absolute right-0 mt-1 w-28 bg-white border border-[#e2e8f0] rounded-[16px] card-shadow z-30 overflow-hidden"
                            >
                              <div
                                onClick={() => {
                                  setCorrections(prev => ({ ...prev, [student.id]: 'Present' }));
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center justify-between px-3 py-2.5 hover:bg-[#EEF5FB] text-xs font-semibold text-dark cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5 text-[#23C16B]">
                                  <FiCheckCircle className="w-3.5 h-3.5" />
                                  <span>Present</span>
                                </div>
                                {isPresent && <FiCheck className="w-3 h-3 text-brand-blue" />}
                              </div>
                              <div
                                onClick={() => {
                                  setCorrections(prev => ({ ...prev, [student.id]: 'Absent' }));
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center justify-between px-3 py-2.5 hover:bg-[#EEF5FB] text-xs font-semibold text-dark cursor-pointer border-t border-[#e2e8f0]/40"
                              >
                                <div className="flex items-center gap-1.5 text-[#E53E3E]">
                                  <FiX className="w-3.5 h-3.5" />
                                  <span>Absent</span>
                                </div>
                                {!isPresent && <FiCheck className="w-3 h-3 text-brand-blue" />}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Reason for Correction Input (Shown only when status changed) */}
                    {isChanged && (
                      <div className="border-t border-[#e2e8f0]/45 mt-3 pt-3 flex items-center gap-2">
                        <FiAlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <input
                          type="text"
                          placeholder="Reason for correction"
                          value={reasons[student.id] || ''}
                          onChange={(e) => setReasons(prev => ({ ...prev, [student.id]: e.target.value }))}
                          className="flex-1 bg-transparent border-none text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Roster student history action */}
                    <div className="flex justify-end mt-2 pt-1">
                      <button
                        onClick={() => setHistoryStudent(student)}
                        className="text-[9px] font-bold text-secondaryText hover:text-brand-blue flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <FiClock className="w-3.5 h-3.5" /> History
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky save corrections button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/70 backdrop-blur border-t border-[#e2e8f0]/40 z-20">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={changedCount === 0 || hasEmptyReason}
              className={`w-full max-w-[608px] mx-auto py-4 text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/15 transition-all cursor-pointer ${
                changedCount === 0 || hasEmptyReason
                  ? 'bg-[#CBD5E1] cursor-not-allowed opacity-80'
                  : 'bg-[#1597E5] hover:bg-[#00A1FF] active:scale-95'
              }`}
            >
              <FiEdit className="w-4 h-4" /> Save {changedCount} Correction{changedCount !== 1 ? 's' : ''}
            </button>
          </div>
        </motion.div>
      )}

      {/* CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-[340px] p-6 text-center space-y-5 shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-[#E5F4FD] text-brand-blue flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold">?</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-[#0F172A]">Save Corrections?</h3>
                <p className="text-xs text-secondaryText">
                  Save {changedCount} attendance correction{changedCount !== 1 ? 's' : ''} for {formatDateToDMY(selectedDate)}?
                </p>
                <p className="text-[10px] text-gray-400">
                  An audit log entry will be created for each change.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="py-3 bg-white border border-[#CBD5E1] text-[#718096] rounded-[20px] font-extrabold text-xs hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={saveLoading}
                  className="py-3 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-[20px] font-extrabold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {saveLoading ? 'Saving...' : 'Yes, Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STUDENT CORRECTION HISTORY MODAL */}
      <AnimatePresence>
        {historyStudent && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-[380px] p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#e2e8f0]/40 pb-2">
                <h3 className="text-sm font-extrabold text-dark flex items-center gap-1.5">
                  <FiClock className="w-4 h-4 text-brand-blue" /> Correction History
                </h3>
                <button
                  onClick={() => setHistoryStudent(null)}
                  className="p-1 hover:bg-[#EEF5FB] rounded-full text-secondaryText transition-all cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-[#0F172A]">{historyStudent.name}</p>
                <p className="text-[10px] text-secondaryText">Roll {historyStudent.rollNumber}</p>
              </div>

              <div className="py-6 text-center space-y-2">
                <FiInfo className="w-8 h-8 text-[#A0AEC0] mx-auto" />
                <p className="text-xs font-semibold text-secondaryText">No previous corrections found for this student.</p>
              </div>

              <button
                onClick={() => setHistoryStudent(null)}
                className="w-full py-3 bg-[#EEF5FB] hover:bg-[#DCEBF7] text-brand-blue rounded-[20px] font-extrabold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CorrectAttendance;
