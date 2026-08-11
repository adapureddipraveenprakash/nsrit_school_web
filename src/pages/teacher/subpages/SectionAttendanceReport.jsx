import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import {
  getTeacherDashboard,
  getStudentsBySection,
  getAttendanceBySectionHistory
} from '../../../services/dataService';

const SectionAttendanceReport = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const teacherId = user?.teacherId || null;
  const { data: dashboardData, loading: teacherLoading } = useDataFetch(
    () => teacherId ? getTeacherDashboard({ teacherId }) : Promise.resolve(null),
    [teacherId]
  );

  const teacher = dashboardData?.teacher;
  const assignments = useMemo(() => (teacher?.assignments || []).filter(a => a.isActive), [teacher]);
  const classTeacherAssignment = assignments.find(a => a.isClassTeacher) || assignments[0];
  const activeSectionId = classTeacherAssignment?.section?.id || classTeacherAssignment?.sectionId;
  const sectionLabel = classTeacherAssignment?.section
    ? `${classTeacherAssignment.section.academicClass?.name || ''} - ${classTeacherAssignment.section.name || ''}`
    : 'Assigned Section';

  // Month navigation state (default July 2026)
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 6, 1)); // July 2026
  const [search, setSearch] = useState('');

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth(); // 0-indexed

  // Format month label e.g., "Jul 2026"
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = `${monthNamesShort[month]} ${year}`;
  const isCurrentMonth = month === 6 && year === 2026;

  // Calculate start & end date strings YYYY-MM-DD for query
  const fromDate = useMemo(() => {
    const d = new Date(year, month, 1);
    return d.toISOString().split('T')[0];
  }, [year, month]);

  const toDate = useMemo(() => {
    const d = new Date(year, month + 1, 0);
    return d.toISOString().split('T')[0];
  }, [year, month]);

  // Fetch students for section
  const { data: rawStudents, loading: studentsLoading } = useDataFetch(
    () => activeSectionId ? getStudentsBySection(activeSectionId) : Promise.resolve([]),
    [activeSectionId],
    { defaultValue: [] }
  );

  // Fetch monthly attendance history
  const { data: attendanceRecords, loading: attLoading } = useDataFetch(
    () => activeSectionId ? getAttendanceBySectionHistory({ sectionId: activeSectionId, fromDate, toDate, limit: 1000 }) : Promise.resolve([]),
    [activeSectionId, fromDate, toDate],
    { defaultValue: [] }
  );

  // Unique working dates in month
  const workingDays = useMemo(() => {
    const set = new Set();
    (attendanceRecords || []).forEach(r => {
      if (r.attendanceDate) set.add(r.attendanceDate);
    });
    return set.size;
  }, [attendanceRecords]);

  // Calculate per-student metrics
  const studentMetrics = useMemo(() => {
    const map = {};
    (attendanceRecords || []).forEach(r => {
      if (!r.studentId) return;
      if (!map[r.studentId]) map[r.studentId] = { present: 0, absent: 0 };
      const st = String(r.status || '').toUpperCase();
      if (st === 'PRESENT') map[r.studentId].present += 1;
      else if (st === 'ABSENT') map[r.studentId].absent += 1;
    });

    return (rawStudents || []).map(s => {
      const stats = map[s.id] || { present: 0, absent: 0 };
      const totalMarked = stats.present + stats.absent;
      const attPct = totalMarked > 0 ? Math.round((stats.present / totalMarked) * 100) : 0;

      return {
        id: s.id,
        studentId: s.studentId || 'N/A',
        name: s.fullName || 'Unknown Student',
        present: stats.present,
        absent: stats.absent,
        totalMarked,
        attPct
      };
    });
  }, [rawStudents, attendanceRecords]);

  // Overall statistics
  const summaryStats = useMemo(() => {
    if (studentMetrics.length === 0) {
      return { classAvg: 0, count100: 0, countBelow85: 0, countBelow75: 0 };
    }
    let sumPct = 0;
    let count100 = 0;
    let countBelow85 = 0;
    let countBelow75 = 0;

    studentMetrics.forEach(s => {
      sumPct += s.attPct;
      if (s.attPct === 100 && s.totalMarked > 0) count100++;
      if (s.attPct < 85) countBelow85++;
      if (s.attPct < 75) countBelow75++;
    });

    const classAvg = Math.round(sumPct / studentMetrics.length);
    return { classAvg, count100, countBelow85, countBelow75 };
  }, [studentMetrics]);

  // Filter & sort lowest attendance first
  const sortedStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = studentMetrics.filter(s =>
      s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q)
    );
    return filtered.sort((a, b) => a.attPct - b.attPct);
  }, [studentMetrics, search]);

  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const pageLoading = teacherLoading || studentsLoading || attLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 max-w-[640px] mx-auto select-none animate-fade-in font-sans"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Section Attendance Report</h1>
      </header>

      {/* Top curved blue header card matching Screenshot 3 */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#00A3FF] to-[#0066FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        {/* Subtitle Badge */}
        <div className="mb-2 relative z-10">
          <span className="text-[9px] text-white/70 font-black tracking-wider uppercase">
            MY SECTION · CLASS TEACHER
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Attendance Report</h2>
        <p className="text-xs text-white/80 font-medium relative z-10">
          {studentMetrics.length} students · {workingDays} working days this month
        </p>
      </div>

      {/* Month swiper selector matching Screenshot 3 */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 card-shadow flex items-center justify-between select-none">
        <button
          onClick={handlePrevMonth}
          className="w-9 h-9 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-[#1597E5] hover:bg-slate-50 shadow-sm active:scale-95 transition-all"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center justify-center">
          <span className="text-xs font-black text-[#0F172A] tracking-tight">
            {monthLabel}
          </span>
          {isCurrentMonth && (
            <span className="text-[9px] text-[#1597E5] font-black mt-0.5 uppercase tracking-wide">
              This month
            </span>
          )}
        </div>

        <button
          onClick={handleNextMonth}
          className="w-9 h-9 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-[#1597E5] hover:bg-slate-50 shadow-sm active:scale-95 transition-all"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Attendance summary statistics card matching Screenshot 3 */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-4 select-none">
        <div className="grid grid-cols-4 gap-2 text-center divide-x divide-[#e2e8f0]/80 items-center">
          <div>
            <p className="text-2xl font-black text-[#1597E5]">{summaryStats.classAvg}%</p>
            <p className="text-[9px] text-secondaryText font-extrabold uppercase mt-1">Class Avg</p>
          </div>
          <div className="pl-1">
            <p className="text-2xl font-black text-[#23C16B]">{summaryStats.count100}</p>
            <p className="text-[9px] text-secondaryText font-extrabold uppercase mt-1">100%</p>
          </div>
          <div className="pl-1">
            <p className="text-2xl font-black text-[#FF9F0A]">{summaryStats.countBelow85}</p>
            <p className="text-[9px] text-secondaryText font-extrabold uppercase mt-1">Below 85%</p>
          </div>
          <div className="pl-1">
            <p className="text-2xl font-black text-[#FF3B30]">{summaryStats.countBelow75}</p>
            <p className="text-[9px] text-secondaryText font-extrabold uppercase mt-1">Below 75%</p>
          </div>
        </div>

        <div className="border-t border-[#e2e8f0]/60 pt-3 text-center text-[10px] font-bold text-secondaryText">
          {monthLabel} · {workingDays} school days
        </div>
      </div>

      {/* Low attendance warning banner matching Screenshot 3 */}
      {summaryStats.countBelow75 > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-[20px] p-3.5 px-4 text-[#FF3B30] text-xs font-extrabold flex items-center gap-2.5 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-[#FF3B30] text-white flex items-center justify-center text-[10px] font-black shrink-0">
            !
          </div>
          <p>{summaryStats.countBelow75} students below 75% — contact parents</p>
        </div>
      )}

      {/* Sort indicator */}
      <div className="flex items-center gap-1.5 px-1 text-[10px] font-bold text-secondaryText">
        <span>⇆</span>
        <span>Sorted by attendance % — lowest first</span>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search student"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
      </div>

      {/* Student List */}
      {pageLoading ? (
        <div className="text-center py-10 text-xs font-semibold text-secondaryText">
          Loading section attendance data...
        </div>
      ) : sortedStudents.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-8 card-shadow text-center text-xs font-semibold text-secondaryText">
          No students found in section.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedStudents.map((st) => {
            const isCritical = st.attPct < 75;
            const isWarning = st.attPct < 85 && st.attPct >= 75;

            let circleBg = 'bg-[#E8F8F0] text-[#23C16B] border-[#23C16B]/20';
            if (isCritical) {
              circleBg = 'bg-red-50 text-[#FF3B30] border-red-200';
            } else if (isWarning) {
              circleBg = 'bg-amber-50 text-[#FF9F0A] border-amber-200';
            }

            return (
              <div
                key={st.id}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-[#1597E5]/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Left Attendance % Circle */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xs border shrink-0 ${circleBg}`}>
                    {st.attPct}%
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-[#1597E5] transition-colors">
                      {st.name}
                    </h3>
                    <p className="text-[9.5px] text-[#A0AEC0] font-bold mt-1 font-sans">
                      {st.studentId} · {st.present}P · {st.absent}A
                    </p>
                  </div>
                </div>

                {/* Right Warning Icon if below 75% */}
                {isCritical && (
                  <div className="w-6 h-6 rounded-full bg-[#FF3B30] text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-sm">
                    !
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default SectionAttendanceReport;
