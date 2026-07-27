import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiCheck, FiXCircle, FiCheckCircle, FiClock, FiInbox } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import {
  getTeacherProfile,
  getStudentsBySection,
  getAttendanceBySection,
  createAttendance,
  correctAttendance
} from '../../../services/dataService';

const TakeAttendance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();
  const branchId = user?.branchId || null;
  const teacherId = user?.teacherId || null;

  // Format today's date as DD-MM-YYYY for display
  const getTodayDisplayStr = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const getTodayDatabaseStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDatabaseStr());

  // Check if current local time is past 3:00 PM
  const isPast3PM = useMemo(() => {
    const currentHour = new Date().getHours();
    return currentHour >= 15;
  }, []);

  // Fetch teacher profile
  const { data: dbTeacher, loading: teacherLoading } = useDataFetch(
    () => teacherId ? getTeacherProfile(teacherId) : Promise.resolve(null),
    [teacherId]
  );

  const assignments = dbTeacher?.assignments || [];
  const activeAssignments = useMemo(() => assignments.filter(a => a.isActive), [assignments]);

  // Dropdown options extracted dynamically from database assignments
  const classesList = useMemo(() => {
    const map = {};
    activeAssignments.forEach(a => {
      const cls = a.section?.academicClass;
      if (cls) {
        map[cls.id] = cls;
      }
    });
    return Object.values(map);
  }, [activeAssignments]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  // Initialize dropdowns from location state or first active assignment
  useEffect(() => {
    if (activeAssignments.length > 0) {
      const stateSectionId = location.state?.sectionId;
      const targetAssignment = activeAssignments.find(a => a.sectionId === stateSectionId) || activeAssignments[0];
      
      if (targetAssignment) {
        const clsId = targetAssignment.section?.academicClassId || targetAssignment.section?.academicClass?.id;
        setSelectedClassId(clsId);
        setSelectedSectionId(targetAssignment.sectionId);
      }
    }
  }, [activeAssignments, location.state]);

  // Update section when class changes
  const sectionsList = useMemo(() => {
    if (!selectedClassId) return [];
    return activeAssignments
      .filter(a => a.section?.academicClassId === selectedClassId || a.section?.academicClass?.id === selectedClassId)
      .map(a => a.section)
      .filter(Boolean);
  }, [activeAssignments, selectedClassId]);

  useEffect(() => {
    if (sectionsList.length > 0) {
      if (!sectionsList.some(s => s.id === selectedSectionId)) {
        setSelectedSectionId(sectionsList[0].id);
      }
    } else {
      setSelectedSectionId('');
    }
  }, [selectedClassId, sectionsList, selectedSectionId]);

  const activeSecName = useMemo(() => {
    const currentSection = sectionsList.find(s => s.id === selectedSectionId);
    const currentClass = classesList.find(c => c.id === selectedClassId);
    if (currentClass && currentSection) {
      return `${currentClass.name}-${currentSection.name}`;
    }
    return '—';
  }, [sectionsList, classesList, selectedClassId, selectedSectionId]);

  // Fetch students for the selected section
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    if (!selectedSectionId) {
      setStudents([]);
      return;
    }
    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const list = await getStudentsBySection(selectedSectionId);
        setStudents(list.filter(s => s.isActive && s.status === 'ACTIVE'));
      } catch (err) {
        console.error('Error fetching students:', err);
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedSectionId]);

  // Fetch existing attendance records
  const [existingRecords, setExistingRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  useEffect(() => {
    if (!selectedSectionId || !selectedDate) {
      setExistingRecords([]);
      return;
    }
    const fetchAttendance = async () => {
      setRecordsLoading(true);
      try {
        const records = await getAttendanceBySection({ sectionId: selectedSectionId, date: selectedDate });
        setExistingRecords(records);
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setExistingRecords([]);
      } finally {
        setRecordsLoading(false);
      }
    };
    fetchAttendance();
  }, [selectedSectionId, selectedDate]);

  // Local Roster State (Merged dynamically)
  const [roster, setRoster] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (studentsLoading || recordsLoading) return;
    const mapped = students.map(s => {
      const match = existingRecords.find(r => r.studentId === s.id);
      return {
        id: s.id,
        studentId: s.studentId,
        name: s.fullName,
        roll: s.rollNumber || '—',
        status: match ? (match.status === 'PRESENT' ? 'Present' : 'Absent') : 'Present',
        recordId: match?.id || null,
        originalStatus: match ? (match.status === 'PRESENT' ? 'Present' : 'Absent') : null
      };
    });
    setRoster(mapped);
  }, [students, existingRecords, studentsLoading, recordsLoading]);

  const handleToggleStatus = (id) => {
    setRoster(prev =>
      prev.map(student =>
        student.id === id
          ? { ...student, status: student.status === 'Present' ? 'Absent' : 'Present' }
          : student
      )
    );
  };

  const handleAllPresent = () => {
    setRoster(prev => prev.map(s => ({ ...s, status: 'Present' })));
  };

  const handleAllAbsent = () => {
    setRoster(prev => prev.map(s => ({ ...s, status: 'Absent' })));
  };

  const handleSave = async () => {
    if (!selectedSectionId || !user?.id || saveLoading) return;
    setSaveLoading(true);
    setSaveError(null);

    try {
      const promises = roster.map(student => {
        const statusUpper = student.status.toUpperCase();
        if (student.recordId) {
          if (student.status !== student.originalStatus) {
            return correctAttendance({
              id: student.recordId,
              status: statusUpper,
              editedById: user.id,
              editedByRole: 'TEACHER',
              previousStatus: (student.originalStatus || 'PRESENT').toUpperCase(),
              reason: 'Attendance correction by Teacher',
              remarks: '',
              studentId: student.id,
              sectionId: selectedSectionId,
              attendanceDate: selectedDate,
              branchId: branchId
            });
          }
          return Promise.resolve(null);
        } else {
          return createAttendance({
            studentId: student.id,
            academicClassId: selectedClassId,
            sectionId: selectedSectionId,
            branchId: branchId,
            attendanceDate: selectedDate,
            status: statusUpper,
            markedById: user.id,
            remarks: ''
          });
        }
      });

      await Promise.all(promises);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error('Error saving attendance:', err);
      setSaveError(err.message || 'Failed to save attendance. Some records may be locked.');
    } finally {
      setSaveLoading(false);
    }
  };

  const presentCount = roster.filter(s => s.status === 'Present').length;
  const absentCount = roster.filter(s => s.status === 'Absent').length;
  const totalCount = roster.length;
  const attendancePercentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  const filteredRoster = roster.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.roll.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageLoading = teacherLoading || studentsLoading || recordsLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 max-w-5xl mx-auto animate-fade-in relative select-none"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Take Attendance</h1>
      </header>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#23C16B] font-bold z-50 absolute left-4 right-4 top-14"
          >
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>Attendance saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Error Alert */}
      {saveError && (
        <div className="bg-[#FFF5F5] border border-[#EF4444]/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#EF4444] font-bold">
          <FiXCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Blue Header Card (Screenshot 2) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex justify-between items-center relative z-10">
          <span className="text-sm font-bold">{getTodayDisplayStr()}</span>
          <span className="text-[10px] text-white/95 font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/10">
            {activeSecName}
          </span>
        </div>

        {/* Date view pill selector */}
        <div className="inline-flex items-center gap-1.5 bg-white/20 border border-white/15 px-3 py-1 rounded-full text-[10px] font-bold mt-3 select-none relative z-10 cursor-pointer">
          <FiClock className="w-3.5 h-3.5" />
          <span>Today</span>
          <span className="text-[8px] opacity-80">▼</span>
        </div>

        {/* Attendance Window Rule banner */}
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 text-[10px] font-semibold mt-4 relative z-10 border border-white/5 leading-relaxed">
          <FiClock className="w-3.5 h-3.5 shrink-0" />
          <span>Attendance window is from 8:00 AM to 3:00 PM</span>
        </div>
      </div>

      {/* Class and Section selectors card (Screenshot 2) */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-extrabold text-[#A0AEC0] uppercase tracking-wider block mb-1.5 pl-1">Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={classesList.length <= 1}
            className="w-full px-4 py-3 bg-[#EEF5FB]/35 border border-[#e2e8f0] rounded-[18px] text-xs font-bold text-dark focus:outline-none focus:border-brand-blue/50"
          >
            {classesList.length === 0 && <option value="">Select Class</option>}
            {classesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-extrabold text-[#A0AEC0] uppercase tracking-wider block mb-1.5 pl-1">Section</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            disabled={sectionsList.length <= 1}
            className="w-full px-4 py-3 bg-[#EEF5FB]/35 border border-[#e2e8f0] rounded-[18px] text-xs font-bold text-dark focus:outline-none focus:border-brand-blue/50"
          >
            {sectionsList.length === 0 && <option value="">Select Section</option>}
            {sectionsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Input Box (Screenshot 2) */}
      <div className="bg-white rounded-full border border-[#e2e8f0] p-1.5 px-3.5 card-shadow flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#E5F4FD] flex items-center justify-center text-[#1597E5] shrink-0 select-none">
          <FiSearch className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search student name or roll number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none"
        />
      </div>

      {pageLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeAssignments.length === 0 ? (
        /* Denied / Aborted Empty State (Screenshot 2) */
        <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] border border-[#1597E5]/10">
            <FiInbox className="w-8 h-8 text-[#1597E5]" />
          </div>

          <div className="space-y-1.5 max-w-[280px]">
            <h3 className="text-sm font-extrabold text-dark font-sans">No students</h3>
            <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed font-sans">
              Access to this section's students is denied (aborted)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* present count status indicator */}
          {filteredRoster.length > 0 && (
            <div className="flex justify-between items-center px-1 text-[10px] font-black text-secondaryText uppercase tracking-widest">
              <span>{filteredRoster.length} students found</span>
              <span className="text-[#23C16B] font-extrabold">{presentCount} present · {absentCount} absent</span>
            </div>
          )}

          {/* Quick Mark Actions */}
          {filteredRoster.length > 0 && (
            <div className="flex justify-between items-center gap-4 bg-white border border-[#e2e8f0]/45 p-4 rounded-[20px] card-shadow">
              <button
                onClick={handleAllPresent}
                className="flex-1 py-2 border border-[#23C16B]/25 hover:bg-[#23C16B]/5 text-[#23C16B] text-[10px] font-extrabold uppercase rounded-xl transition-all cursor-pointer text-center"
              >
                Mark All Present
              </button>
              <button
                onClick={handleAllAbsent}
                className="flex-1 py-2 border border-[#EF4444]/25 hover:bg-[#EF4444]/5 text-[#EF4444] text-[10px] font-extrabold uppercase rounded-xl transition-all cursor-pointer text-center"
              >
                Mark All Absent
              </button>
            </div>
          )}

          {/* Student Roster feed */}
          {filteredRoster.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[250px]">
              <div className="w-16 h-16 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#1597E5]">
                <FiInbox className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-dark">No students found</h3>
                <p className="text-xs text-[#A0AEC0] font-semibold">Try modifying your class, section or search query.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoster.map((student) => {
                const isPresent = student.status === 'Present';
                const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                return (
                  <div
                    key={student.id}
                    onClick={() => handleToggleStatus(student.id)}
                    className={`bg-white rounded-[24px] p-4.5 border border-[#e2e8f0]/40 card-shadow flex items-center justify-between hover:border-brand-blue/25 transition-all cursor-pointer select-none border-l-[4px] ${
                      isPresent ? 'border-l-[#23C16B]' : 'border-l-[#EF4444]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold uppercase shrink-0 ${
                        isPresent ? 'bg-[#E8F8F0] text-[#23C16B]' : 'bg-[#FFF5F5] text-[#EF4444]'
                      }`}>
                        {initials}
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-dark leading-tight">{student.name}</h3>
                        <p className="text-[9px] text-[#A0AEC0] font-bold mt-1 leading-none">ID: {student.studentId || '—'} · Roll: {student.roll}</p>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      isPresent ? 'bg-[#23C16B] border-[#23C16B] text-white' : 'border-[#CBD5E1] text-transparent'
                    }`}>
                      <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Save Action Block */}
          {filteredRoster.length > 0 && (
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] active:scale-95 text-white rounded-[20px] text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-[#1597E5]/25 hover:shadow-xl hover:shadow-[#1597E5]/30 flex items-center justify-center gap-2"
              >
                {saveLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiCheckCircle className="w-4.5 h-4.5" />
                )}
                <span>{saveLoading ? 'Saving Attendance...' : 'Save Attendance'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Attendance window closed footer notice (Screenshot 2) */}
      {isPast3PM && (
        <div className="flex items-center justify-center gap-2 text-[#F59E0B] font-bold text-xs py-3 border-t border-[#e2e8f0]/40 mt-4 select-none animate-pulse">
          <FiClock className="w-4.5 h-4.5 shrink-0" />
          <span>Attendance window closed at 3:00 PM</span>
        </div>
      )}
    </motion.div>
  );
};

export default TakeAttendance;
