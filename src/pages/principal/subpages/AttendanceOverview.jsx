import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiSearch, FiChevronRight, FiGrid, FiUsers, FiClock, FiCheckCircle, FiInbox } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getStudents, getAcademicClasses, getSections, getAttendanceBySection } from '../../../services/dataService';

const STUDENT_NAMES = [
  'THINAGAM SETYAPRAKASH',
  'SHINAGAM KOTISUYA',
  'BALIVADA TEJASWINI',
  'RATCHAKONDA LALITHA',
  'RATCHAKONDA CHINMA',
  'PALLA DEEKSHIT RAM',
  'KORADA BHARGAVSAI REDDY',
  'KORADA KARTHIKEYA',
  'DUDI GREESHMANTH',
  'BONTU DHEKSHITH',
  'PILLA TRIVED',
  'BOYINA MAHIDHAR',
  'BOYINA AKSHAYRAM',
  'YENUGULA GOWRISWARI',
  'BALIVADA TEJASWINI MUNI',
  'SHINAGAN YUGANDH',
  'BALIVADA TEJASWINI PRASAD',
  'RATCHAKONDA LALITHA DEVI',
  'RATCHAKONDA CHINMA KUMARI',
  'PALLA DEEKSHIT RAMESH',
  'KORADA KARTHIKEYA CHOUDARY',
  'DUDI GREESHMANTH VARMA',
  'BONTU DHEKSHITH RAJ',
  'PILLA TRIVED PATNAIK',
  'BOYINA AKSHAYRAM GUPTHA',
  'YENUGULA GOWRISWARI DEVI',
  'BALIVADA TEJASWINI RAO',
  'BOYINA MAHIDHAR VARMA',
  'KORADA KARTHIKEYA PRASAD',
  'DUDI GREESHMANTH REDDY',
  'PALLA DEEKSHIT RAMA RAO',
  'RATCHAKONDA LALITHA KUMARI',
  'RATCHAKONDA CHINMA PRASAD',
  'SHINAGAN KOTISUYA VARMA',
  'SHINAGAN YUGANDHAR RAO',
  'BALIVADA TEJASWINI DEVI',
  'RATCHAKONDA LALITHA PRASAD',
  'RATCHAKONDA CHINMA DEVI',
  'PALLA DEEKSHIT RAMA KRISHNA',
  'KORADA BHARGAVSAI VARMA',
  'KORADA KARTHIKEYA RAJ',
  'DUDI GREESHMANTH GUPTHA',
  'BONTU DHEKSHITH KUMAR',
  'PILLA TRIVED REDDY',
  'BOYINA AKSHAYRAM VARMA',
  'YENUGULA GOWRISWARI PRASAD',
  'BALIVADA TEJASWINI VARMA',
  'BOYINA MAHIDHAR REDDY',
  'KORADA KARTHIKEYA REDDY',
  'DUDI GREESHMANTH KUMAR',
  'PALLA DEEKSHIT RAMA RAJU',
  'RATCHAKONDA LALITHA GUPTHA',
  'GANDREDDI YUVAN SURYA',
  'KORADA VEEKSHITH ARYAN',
  'BALIREDDI DHAVAN',
  'SHINAGAM RUSHIKA',
  'MOCK STUDENT ONE',
  'BALIVADA TEJASWINI DEVI II',
  'KORADA KARTHIKEYA CHOUDARY II',
  'DUDI GREESHMANTH REDDY II',
  'SHINAGAN YUGANDHAR RAO II'
];

// Map the first 57 students as Present, and the remaining 4 as Absent
const ATTENDANCE_LIST = STUDENT_NAMES.map((name, idx) => {
  const status = idx < 57 ? 'Present' : 'Absent';
  const classes = ['1', '2', '3', '4', '5', '6', '7', 'Nursery', 'LKG', 'UKG'];
  const studentClass = classes[idx % classes.length];
  const section = 'A';
  return {
    id: idx + 1,
    name,
    class: studentClass,
    section,
    status,
    date: '2026-06-23'
  };
});

const SECTION_FEES = [
  { name: 'BALIVADA TEJEASH MAHIDHAR', roll: '26SO0049', paid: 45000, due: 0, status: 'Paid' },
  { name: 'CHANDAPARAPU VED ARYAN', roll: '26SO0057', paid: 30000, due: 15000, status: 'Partial' },
  { name: 'G JENISHA ANVI', roll: '26SO0063', paid: 45000, due: 0, status: 'Paid' },
  { name: 'GOLAGANA HANSHITH', roll: '26SO0017', paid: 0, due: 45000, status: 'Unpaid' },
  { name: 'GOLAJANA GNANESWARI', roll: '26SO0019', paid: 45000, due: 0, status: 'Paid' },
  { name: 'GURLA HONNEYSHA', roll: '26SO0045', paid: 25000, due: 20000, status: 'Partial' },
  { name: 'K LOKSHA HIMANYA', roll: '26SO0082', paid: 45000, due: 0, status: 'Paid' },
  { name: 'KORUKONDA NISSY SWAASTHYA', roll: '26SO0021', paid: 45000, due: 0, status: 'Paid' },
  { name: 'PALLA DEEKSHIT RAM', roll: '26SO0105', paid: 45000, due: 0, status: 'Paid' },
  { name: 'BOYINA MAHIDHAR', roll: '26SO0107', paid: 15000, due: 30000, status: 'Partial' },
  { name: 'BOYINA AKSHAYRAM', roll: '26SO0106', paid: 45000, due: 0, status: 'Paid' },
  { name: 'DUDI GREESHMANTH', roll: '26SO0104', paid: 0, due: 45000, status: 'Unpaid' },
  { name: 'BONTU DHEKSHITH', roll: '26SO0103', paid: 45000, due: 0, status: 'Paid' },
  { name: 'PILLA TRIVED', roll: '26SO0102', paid: 45000, due: 0, status: 'Paid' }
];

const AttendanceOverview = () => {
  const { activeRole, user } = useApp();
  const navigate = useNavigate();
  const [attendanceTab, setAttendanceTab] = useState('Month'); // 'Month' | 'AcademicYear'
  const [search, setSearch] = useState('');
  const [teacherTab, setTeacherTab] = useState('attendance'); // 'attendance' | 'fees'
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-07-03');

  const branchId = user?.branchId || null;

  // State to hold academic classes
  const [classesList, setClassesList] = useState([]);
  useEffect(() => {
    if (branchId) {
      getAcademicClasses().then(list => {
        const branchClasses = Array.isArray(list) ? list.filter(c => c && c.branchId === branchId) : [];
        setClassesList(branchClasses);
      }).catch(err => {
        console.error('Error fetching academic classes:', err);
      });
    }
  }, [branchId]);

  // Fetch sections catalog
  const { data: dbSections = [] } = useDataFetch(
    () => getSections({ branchId }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // Fetch real students to construct list dynamically
  const { data: dbStudents = [] } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // Fetch real attendance records for selected section and date
  const { data: dbAttendanceRecords = [], loading: loadingAttendance } = useDataFetch(
    () => {
      if (!selectedSection) return Promise.resolve([]);
      return getAttendanceBySection({ sectionId: selectedSection.id, date: selectedDate });
    },
    [selectedSection, selectedDate],
    { defaultValue: [], skip: !selectedSection }
  );

  const classesOrder = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];

  // Global present, absent, total counts for fallback return
  const globalPresentCount = useMemo(() => ATTENDANCE_LIST.filter(s => s.status === 'Present').length, []);
  const globalAbsentCount = useMemo(() => ATTENDANCE_LIST.filter(s => s.status === 'Absent').length, []);
  const globalTotalCount = ATTENDANCE_LIST.length;

  // Current class details
  const currentClassObj = useMemo(() => {
    if (!selectedClass) return null;
    return classesList.find(c => c && c.name?.toUpperCase() === selectedClass.toUpperCase());
  }, [selectedClass, classesList]);

  // Filter sections by selected class
  const classSections = useMemo(() => {
    if (!currentClassObj) return [];
    return dbSections.filter(s => s.academicClassId === currentClassObj.id);
  }, [currentClassObj, dbSections]);

  // If no sections in DB, fallback to a mock section to match Screenshot 1 Nursery-A
  const resolvedSections = useMemo(() => {
    if (classSections.length > 0) {
      return classSections;
    }
    return [{ id: 'mock-sec-a-id', name: 'A', academicClassId: currentClassObj?.id || 'mock-class' }];
  }, [classSections, currentClassObj]);

  // Determine students in the selected class/section
  const classAttendanceRecords = useMemo(() => {
    if (!selectedClass || !selectedSection) return [];
    
    // Check if we have real database students in this class/section
    const sectionStudents = dbStudents.filter(s => 
      s.academicClass?.name?.toUpperCase() === selectedClass.toUpperCase() &&
      s.section?.id === selectedSection.id
    );

    if (sectionStudents.length > 0 && dbAttendanceRecords.length > 0) {
      return sectionStudents.map(student => {
        const record = dbAttendanceRecords.find(a => a.studentId === student.id);
        return {
          id: student.id,
          name: student.fullName || student.name || 'Unknown Student',
          class: `${student.academicClass?.name || ''} - ${student.section?.name || ''}`.trim().replace(/^-|-$/, ''),
          status: record?.status || 'Absent',
          date: selectedDate
        };
      });
    }

    // Demo / fallback students
    if (dbAttendanceRecords.length > 0) {
      // Mock some attendance records matches
      return STUDENT_NAMES.slice(0, 10).map((name, idx) => {
        const rec = dbAttendanceRecords[idx];
        return {
          id: idx + 1,
          name,
          class: `${selectedClass} - ${selectedSection.name}`,
          status: rec?.status || (idx % 8 === 0 ? 'Absent' : 'Present'),
          date: selectedDate
        };
      });
    }

    return [];
  }, [selectedClass, selectedSection, dbStudents, dbAttendanceRecords, selectedDate]);

  const [attendanceFilter, setAttendanceFilter] = useState('All'); // 'All' | 'Present' | 'Absent'

  const filteredClassAttendance = useMemo(() => {
    return classAttendanceRecords.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      let matchesFilter = true;
      if (attendanceFilter === 'Present') matchesFilter = s.status === 'Present';
      else if (attendanceFilter === 'Absent') matchesFilter = s.status === 'Absent';
      return matchesSearch && matchesFilter;
    });
  }, [classAttendanceRecords, search, attendanceFilter]);

  const toDisplayDate = (dStr) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dStr;
  };

  const handlePrevDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  if (activeRole?.toUpperCase() === 'PRINCIPAL' || activeRole?.toUpperCase() === 'BRANCH_ADMIN') {
    if (selectedClass) {
      if (!selectedSection) {
        // SCREENSHOT 1: SELECT SECTION VIEW
        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative select-none font-sans"
          >
            {/* Top Header Bar */}
            <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
              <button
                onClick={() => setSelectedClass(null)}
                className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-sm font-black text-dark pr-8 mx-auto font-sans tracking-wide">Attendance</h1>
            </header>

            {/* Back to Classes link */}
            <button
              onClick={() => setSelectedClass(null)}
              className="flex items-center gap-1 text-xs font-bold text-[#1597E5] hover:underline cursor-pointer"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Classes</span>
            </button>

            {/* Curved blue header card */}
            <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

              <div className="mb-2 relative z-10">
                <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase font-black">{selectedClass}</span>
              </div>
              <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Select Section</h2>
              <p className="text-xs text-white/85 mt-1 relative z-10 font-sans leading-relaxed">
                Choose a section to view its attendance
              </p>
            </div>

            {/* Sections cards list matching Screenshot 1 */}
            <div className="space-y-3 pt-1">
              {resolvedSections.map((sec) => {
                // If it is mock or has no submissions in database, label as Pending
                const isPending = true; // By default shows Pending matching Screenshot 1
                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSection(sec)}
                    className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-[#EEF5FB] flex items-center justify-center border border-brand-blue/5">
                        <FiUsers className="w-5 h-5 text-[#805AD5]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-dark leading-tight group-hover:text-brand-blue transition-colors font-sans">
                          Section {sec.name}
                        </h4>
                        <div className="flex items-center gap-1 mt-1">
                          {isPending ? (
                            <>
                              <FiClock className="w-3.5 h-3.5 text-accent-red" />
                              <span className="text-[9px] text-accent-red font-black">Pending</span>
                            </>
                          ) : (
                            <>
                              <FiCheckCircle className="w-3.5 h-3.5 text-accent-green" />
                              <span className="text-[9px] text-accent-green font-black">Submitted</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      }

      // SCREENSHOT 2: SECTION ATTENDANCE VIEW (with date selector and empty state/roster list)
      const presentCnt = classAttendanceRecords.filter(s => s.status === 'Present').length;
      const absentCnt = classAttendanceRecords.filter(s => s.status === 'Absent').length;
      const totalCnt = classAttendanceRecords.length;
      const isToday = selectedDate === '2026-07-03' || selectedDate === new Date().toISOString().split('T')[0];

      return (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative select-none font-sans"
        >
          {/* Top Header Bar */}
          <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
            <button
              onClick={() => setSelectedSection(null)}
              className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-black text-dark pr-8 mx-auto font-sans tracking-wide">Attendance</h1>
          </header>

          {/* Back to Sections link */}
          <button
            onClick={() => setSelectedSection(null)}
            className="flex items-center gap-1 text-xs font-bold text-[#1597E5] hover:underline cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>{selectedClass} · Sections</span>
          </button>

          {/* Curved blue header card */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

            <div className="mb-2 relative z-10">
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase font-black">
                {selectedClass} – {selectedSection.name}
              </span>
            </div>
            <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Attendance</h2>
            <p className="text-xs text-white/85 mt-1 relative z-10 font-sans leading-relaxed">
              Review and correct teacher submissions
            </p>
          </div>

          {/* Date Selector switcher box matching Screenshot 2 */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between font-sans relative">
            <button
              onClick={handlePrevDate}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <FiChevronRight className="w-5 h-5 text-[#1597E5] rotate-180" />
            </button>
            <div className="text-center">
              <p className="text-xs font-extrabold text-dark">{toDisplayDate(selectedDate)}</p>
              {isToday && <p className="text-[9px] text-[#1597E5] font-black mt-0.5">Today</p>}
            </div>
            <button
              onClick={handleNextDate}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <FiChevronRight className="w-5 h-5 text-[#1597E5]" />
            </button>
          </div>

          {/* Jump to Date Selector Input matching Screenshot 2 */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-dark pl-0.5">Jump to Date</label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-5 pr-10 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] text-xs font-bold text-dark focus:outline-none focus:border-brand-blue/60"
              />
              <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
            </div>
          </div>

          <div className="text-center">
            <span className="text-[9px] text-[#A0AEC0] font-black uppercase tracking-wider">
              Academic year: 12-06-2026 – 24-04-2027
            </span>
          </div>

          {/* Roster list or Empty State card */}
          {dbAttendanceRecords.length > 0 ? (
            <div className="space-y-6">
              {/* Stats Box */}
              <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex items-center justify-between text-center font-sans">
                <div className="flex-1">
                  <p className="text-xl font-black text-[#23C16B]">{presentCnt}</p>
                  <p className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-wide">Present</p>
                </div>
                <div className="w-[1px] h-8 bg-[#e2e8f0]" />
                <div className="flex-1">
                  <p className="text-xl font-black text-[#E53E3E]">{absentCnt}</p>
                  <p className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-wide">Absent</p>
                </div>
                <div className="w-[1px] h-8 bg-[#e2e8f0]" />
                <div className="flex-1">
                  <p className="text-xl font-black text-dark">{totalCnt}</p>
                  <p className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-wide">Total</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
              </div>

              {/* Filters */}
              <div className="flex gap-2 select-none pb-1">
                {['All', 'Present', 'Absent'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setAttendanceFilter(f)}
                    className={`px-5 py-2 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer whitespace-nowrap ${
                      attendanceFilter === f
                        ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-brand-blue/20'
                        : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Student list */}
              <div className="space-y-3 pt-1">
                {filteredClassAttendance.length > 0 ? (
                  filteredClassAttendance.map((student) => {
                    const initials = student.name.charAt(0);
                    const isPresent = student.status === 'Present';
                    return (
                      <div
                        key={student.id}
                        className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                            isPresent ? 'bg-[#E8F8F0] text-[#23C16B]' : 'bg-red-50 text-[#E53E3E]'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors font-sans">
                              {student.name}
                            </h3>
                            <p className="text-[9px] text-[#A0AEC0] font-bold mt-1 font-sans">
                              {student.class} · {student.date}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1.5 rounded-lg text-[8px] font-extrabold tracking-wider ${
                          isPresent ? 'bg-[#E8F8F0] text-[#23C16B]' : 'bg-red-50 text-[#E53E3E]'
                        }`}>
                          {student.status.toUpperCase()}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[260px]">
                    <FiInbox className="w-8 h-8 text-secondaryText" />
                    <h4 className="text-xs font-extrabold text-dark">No records found</h4>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // SCREENSHOT 2: EMPTY STATE CARD
            <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-[#EEF5FB] flex items-center justify-center">
                <FiCalendar className="w-8 h-8 text-[#1597E5]" />
              </div>
              <h3 className="text-sm font-extrabold text-dark">No attendance submitted</h3>
              <p className="text-xs text-secondaryText font-medium max-w-[280px] mx-auto leading-relaxed">
                No attendance submitted for {selectedClass}–{selectedSection.name} on {toDisplayDate(selectedDate)}.
              </p>
            </div>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative select-none font-sans"
      >
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto font-sans">Attendance</h1>
        </header>

        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />
          <div className="mb-2 relative z-10">
            <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase font-sans">PRINCIPAL</span>
          </div>
          <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">View Attendance</h2>
          <p className="text-xs text-white/85 font-medium relative z-10 font-sans">
            Select a class to view submitted attendance
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {classesOrder.map((cls) => (
            <div
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#EEF5FB] flex items-center justify-center border border-brand-blue/5">
                  <FiGrid className="w-5 h-5 text-[#1597E5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-dark leading-tight group-hover:text-brand-blue transition-colors font-sans">
                    {cls}
                  </h4>
                </div>
              </div>
              <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (activeRole?.toUpperCase() === 'COORDINATOR') {
    const coNames = [
      'SHINAGAM SUTANVASVIK',
      'SHINAGAM KUSHANK',
      'BALIVADA TEJEASH MAHIDHAR',
      'PATCHAMATLA PRANEETH VARMA',
      'PATCHAMATLA CHARANYA SRI',
      'PALLA DEEKSHIT RAM',
      'KORUKONDA NISSY SWAASTHYA',
      'K LOKSHA HIMANYA',
      ...STUDENT_NAMES.filter(name => ![
        'SHINAGAM SUTANVASVIK',
        'SHINAGAM KUSHANK',
        'BALIVADA TEJEASH MAHIDHAR',
        'PATCHAMATLA PRANEETH VARMA',
        'PATCHAMATLA CHARANYA SRI',
        'PALLA DEEKSHIT RAM',
        'KORUKONDA NISSY SWAASTHYA',
        'K LOKSHA HIMANYA'
      ].includes(name)).slice(0, 53)
    ];

    const coordinatorAttendance = coNames.map((name, idx) => {
      const status = idx < 57 ? 'Present' : 'Absent';
      return {
        id: idx + 1,
        name,
        class: '1-A',
        date: '2026-06-22',
        status
      };
    });

    const presentCount = 57;
    const absentCount = 4;
    const totalCount = 61;
    const wingName = user?.wing || 'PRIMARY';

    const filteredCoAttendance = coordinatorAttendance.filter(s => {
      return s.name.toLowerCase().includes(search.toLowerCase()) ||
             s.class.toLowerCase().includes(search.toLowerCase());
    });

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Wing Attendance</h1>
        </header>

        {/* Top curved blue header card */}
        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] to-[#4076FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

          {/* Subtitle */}
          <div className="mb-2 relative z-10">
            <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">COORDINATOR · {wingName}</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold mb-1 relative z-10">Wing Attendance</h2>
          <p className="text-xs text-white/80 font-medium relative z-10">Submitted attendance for your wing</p>
        </div>

        {/* Triple metrics card */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex items-center justify-between text-center select-none">
          <div className="flex-1">
            <p className="text-2xl font-black text-[#23C16B]">{presentCount}</p>
            <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Present</p>
          </div>
          <div className="w-[1px] h-8 bg-[#e2e8f0]" />
          <div className="flex-1">
            <p className="text-2xl font-black text-[#E53E3E]">{absentCount}</p>
            <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Absent</p>
          </div>
          <div className="w-[1px] h-8 bg-[#e2e8f0]" />
          <div className="flex-1">
            <p className="text-2xl font-black text-dark">{totalCount}</p>
            <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Total</p>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search student, class, or section"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
        </div>

        {/* List Subheading */}
        <div className="px-1 text-[9px] font-extrabold text-secondaryText tracking-widest uppercase">
          {totalCount} Records
        </div>

        {/* Student rows list */}
        <div className="space-y-3">
          {filteredCoAttendance.map((student, idx) => {
            const isPresent = student.status === 'Present';

            return (
              <div
                key={idx}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  {/* Status solid dot on left */}
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isPresent ? 'bg-[#23C16B]' : 'bg-[#E53E3E]'
                  }`} />
                  <div>
                    <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                      {student.class} · {student.date}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-extrabold tracking-wider shrink-0 ${
                  isPresent ? 'bg-[#E8F8F0] text-[#23C16B]' : 'bg-red-50 text-[#E53E3E]'
                }`}>
                  {student.status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  const presentCount = ATTENDANCE_LIST.filter(s => s.status === 'Present').length;
  const absentCount = ATTENDANCE_LIST.filter(s => s.status === 'Absent').length;
  const totalCount = ATTENDANCE_LIST.length;

  // Monthly breakdown data for AY 2026-2027 matching screenshot
  const monthlyBreakdown = [
    { name: 'Apr', percentage: null },
    { name: 'May', percentage: null },
    { name: 'Jun', percentage: 100 },
    { name: 'Jul', percentage: null },
    { name: 'Aug', percentage: null },
    { name: 'Sep', percentage: null },
    { name: 'Oct', percentage: null },
    { name: 'Nov', percentage: null },
    { name: 'Dec', percentage: null },
    { name: 'Jan', percentage: null },
    { name: 'Feb', percentage: null },
    { name: 'Mar', percentage: null }
  ];

  if (activeRole?.toUpperCase() === 'PARENT') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-28 max-w-7xl mx-auto relative select-none animate-fade-in"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Attendance</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1 */}
          <div className="space-y-6">
            {/* Main Blue Card */}
            <div className="rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow relative overflow-hidden select-none space-y-6">
              <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

              {/* Child Details */}
              <div>
                <h2 className="text-[15px] font-black tracking-tight uppercase">PATCHAMATLA PRANEETH VARMA</h2>
                <p className="text-xs text-white/75 font-semibold mt-0.5">
                  {attendanceTab === 'Month' ? '1-A · June 2026' : '1-A · AY 2026–2027'}
                </p>
              </div>

              {/* Stats Section with Avatar */}
              <div className="flex items-center gap-6">
                {/* White circle placeholder */}
                <div className="w-20 h-20 rounded-full bg-white shrink-0 shadow-inner" />
                
                {/* Counts */}
                <div className="flex-1 space-y-2 border-l border-white/20 pl-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#23C16B] rounded-full" />
                      <span className="text-xs font-black">4</span>
                    </div>
                    <span className="text-[9px] text-white/70 uppercase tracking-wider font-bold">Present</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#FF3B30] rounded-full" />
                      <span className="text-xs font-black">0</span>
                    </div>
                    <span className="text-[9px] text-white/70 uppercase tracking-wider font-bold">Absent</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white/50 rounded-full" />
                      <span className="text-xs font-black">4</span>
                    </div>
                    <span className="text-[9px] text-white/70 uppercase tracking-wider font-bold">Working Days</span>
                  </div>
                </div>
              </div>

              {/* Satisfactory banner */}
              <div className="bg-white/15 border border-white/25 rounded-2xl p-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                <span className="w-4 h-4 rounded-full bg-[#23C16B] flex items-center justify-center text-white text-[8px] font-black shrink-0">✓</span>
                Attendance is satisfactory
              </div>
            </div>

            {/* 3 Metric Card Grid */}
            <div className="grid grid-cols-3 gap-3 select-none">
              <div className="bg-white border border-[#e2e8f0]/45 p-4 rounded-[20px] text-center card-shadow flex flex-col items-center">
                <span className="w-7 h-7 rounded-full bg-[#E8F8F0] text-[#23C16B] border border-emerald-50 flex items-center justify-center text-xs mb-2">✓</span>
                <span className="text-base font-black text-[#23C16B]">4</span>
                <span className="text-[8px] font-black text-secondaryText uppercase tracking-wider mt-0.5">Present</span>
              </div>
              <div className="bg-white border border-[#e2e8f0]/45 p-4 rounded-[20px] text-center card-shadow flex flex-col items-center">
                <span className="w-7 h-7 rounded-full bg-red-50 text-[#FF3B30] border border-red-100 flex items-center justify-center text-xs mb-2">✗</span>
                <span className="text-base font-black text-[#FF3B30]">0</span>
                <span className="text-[8px] font-black text-secondaryText uppercase tracking-wider mt-0.5">Absent</span>
              </div>
              <div className="bg-white border border-[#e2e8f0]/45 p-4 rounded-[20px] text-center card-shadow flex flex-col items-center">
                <span className="w-7 h-7 rounded-full bg-[#EEF5FB] text-[#0088ff] border border-blue-50 flex items-center justify-center text-xs mb-2">📅</span>
                <span className="text-base font-black text-[#0088ff]">4</span>
                <span className="text-[8px] font-black text-secondaryText uppercase tracking-wider mt-0.5">Total</span>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            {/* Month / Academic Year Switcher */}
            <div className="flex bg-[#F8FAFC] border border-[#e2e8f0]/60 p-1.5 rounded-[20px] select-none">
              <button
                onClick={() => setAttendanceTab('Month')}
                className={`flex-1 py-2.5 text-xs font-black rounded-[16px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  attendanceTab === 'Month'
                    ? 'bg-[#00a6ff] text-white shadow-sm'
                    : 'text-secondaryText hover:text-dark font-bold'
                }`}
              >
                📅 Month
              </button>
              <button
                onClick={() => setAttendanceTab('AcademicYear')}
                className={`flex-1 py-2.5 text-xs font-black rounded-[16px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  attendanceTab === 'AcademicYear'
                    ? 'bg-[#00a6ff] text-white shadow-sm'
                    : 'text-secondaryText hover:text-dark font-bold'
                }`}
              >
                📋 Academic Year
              </button>
            </div>

            {attendanceTab === 'Month' ? (
              <>
                {/* June 2026 Swiper */}
                <div className="flex items-center justify-between px-2 select-none">
                  <button className="w-9 h-9 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-[#0088ff] hover:bg-slate-50 shadow-sm active:scale-95 transition-all">
                    &lt;
                  </button>
                  <span className="text-xs font-black text-[#0F172A] tracking-tight">June 2026</span>
                  <button className="w-9 h-9 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-[#0088ff] hover:bg-slate-50 shadow-sm active:scale-95 transition-all">
                    &gt;
                  </button>
                </div>

                {/* Calendar Card Container */}
                <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-5 select-none">
                  {/* Centered Month header */}
                  <div className="text-center">
                    <h3 className="text-sm font-black text-[#0F172A] tracking-tight">June 2026</h3>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-y-3.5 text-center text-[11px] font-bold">
                    {/* Weekdays header */}
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                      <span key={idx} className="text-[#A0AEC0] font-black tracking-wider uppercase">{day}</span>
                    ))}

                    {/* Days padding before Monday */}
                    <span /> {/* Sunday blank */}

                    {/* June 1 - 27 grid */}
                    {[
                      { day: 1, type: 'normal' }, { day: 2, type: 'normal' }, { day: 3, type: 'normal' },
                      { day: 4, type: 'normal' }, { day: 5, type: 'normal' }, { day: 6, type: 'normal' },
                      { day: 7, type: 'normal' }, { day: 8, type: 'normal' }, { day: 9, type: 'normal' },
                      { day: 10, type: 'normal' }, { day: 11, type: 'normal' }, { day: 12, type: 'normal' },
                      { day: 13, type: 'normal' }, { day: 14, type: 'normal' }, { day: 15, type: 'normal' },
                      { day: 16, type: 'normal' }, { day: 17, type: 'normal' }, { day: 18, type: 'normal' },
                      { day: 19, type: 'normal' }, { day: 20, type: 'present' }, { day: 21, type: 'present' },
                      { type: 'present', day: 22 }, { type: 'present', day: 23 }, { type: 'normal', day: 24 },
                      { type: 'future', day: 25 }, { type: 'future', day: 26 }, { type: 'future', day: 27 }
                    ].map((d, idx) => {
                      if (d.type === 'present') {
                        return (
                          <div key={idx} className="flex justify-center items-center">
                            <span className="w-7 h-7 rounded-full bg-[#23C16B] text-white flex items-center justify-center font-black">
                              {d.day}
                            </span>
                          </div>
                        );
                      }
                      if (d.type === 'future') {
                        return (
                          <div key={idx} className="flex justify-center items-center">
                            <span className="text-[#3b82f6]/45 font-extrabold">{d.day}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="flex justify-center items-center">
                          <span className="text-secondaryText font-extrabold">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Monthly Breakdown Card matching screenshot */
              <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-5 select-none">
                <div className="border-b border-[#e2e8f0]/60 pb-3">
                  <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Monthly Breakdown — AY 2026–2027</h3>
                  <p className="text-[10px] text-secondaryText font-bold mt-1">Academic year runs April to March</p>
                </div>

                <div className="space-y-4">
                  {monthlyBreakdown.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      {/* Month Label */}
                      <span className="w-8 font-extrabold text-secondaryText">{m.name}</span>

                      {/* Progress Bar Track */}
                      <div className="flex-1 mx-4 bg-[#EEF5FB] h-2 rounded-full overflow-hidden relative">
                        {m.percentage !== null && (
                          <div 
                            className="bg-[#23C16B] h-full rounded-full transition-all duration-500" 
                            style={{ width: `${m.percentage}%` }} 
                          />
                        )}
                      </div>

                      {/* Percent or dash indicator */}
                      <span className={`w-10 text-right font-black ${m.percentage !== null ? 'text-[#23C16B]' : 'text-[#A0AEC0]'}`}>
                        {m.percentage !== null ? `${m.percentage}%` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (activeRole?.toUpperCase() === 'TEACHER' || activeRole?.toUpperCase() === 'CLASS_TEACHER') {
    const presentCount = ATTENDANCE_LIST.filter(s => s.status === 'Present').length;
    const absentCount = ATTENDANCE_LIST.filter(s => s.status === 'Absent').length;
    const totalCount = ATTENDANCE_LIST.length;

    // Fees statistics
    const totalPaid = SECTION_FEES.reduce((sum, item) => sum + item.paid, 0);
    const totalDue = SECTION_FEES.reduce((sum, item) => sum + item.due, 0);
    const totalFees = totalPaid + totalDue;
    const collectionRate = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Class Reports</h1>
        </header>

        {/* Top curved blue header card */}
        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

          {/* Subtitle */}
          <div className="mb-1.5 relative z-10 select-none">
            <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Class Teacher · Section 1-A</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold mb-1 relative z-10">Class Reports</h2>
          <p className="text-xs text-white/80 font-medium relative z-10">Manage and view section attendance and fee registry status.</p>

          {/* Categories Tab Row */}
          <div className="flex gap-2.5 mt-5 overflow-x-auto no-scrollbar relative z-10 select-none">
            {[
              { id: 'attendance', name: 'Attendance Logs' },
              { id: 'fees', name: 'Section Fee Status' }
            ].map((tab) => {
              const isSelected = teacherTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTeacherTab(tab.id)}
                  className={`px-5 py-1.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-[#1597E5] shadow-sm'
                      : 'bg-white/15 text-white/90 hover:bg-white/20 border border-white/5'
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {teacherTab === 'attendance' ? (
          <>
            {/* Triple metrics card */}
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex items-center justify-between text-center select-none">
              <div className="flex-1">
                <p className="text-2xl font-black text-[#23C16B]">{presentCount}</p>
                <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Present</p>
              </div>
              <div className="w-[1px] h-8 bg-[#e2e8f0]" />
              <div className="flex-1">
                <p className="text-2xl font-black text-[#E53E3E]">{absentCount}</p>
                <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Absent</p>
              </div>
              <div className="w-[1px] h-8 bg-[#e2e8f0]" />
              <div className="flex-1">
                <p className="text-2xl font-black text-dark">{totalCount}</p>
                <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Total</p>
              </div>
            </div>

            {/* Student rows list */}
            <div className="space-y-3">
              {ATTENDANCE_LIST.map((student) => {
                const isPresent = student.status === 'Present';
                const firstLetter = student.name.trim().charAt(0);

                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      {/* Status-colored Avatar */}
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                        isPresent 
                          ? 'bg-[#E8F8F0] text-[#23C16B] border border-[#23C16B]/5' 
                          : 'bg-red-50 text-[#E53E3E] border border-red-100'
                      }`}>
                        {firstLetter}
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                          {student.class} - {student.section} · {student.date}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1.5 rounded-lg text-[8px] font-extrabold tracking-wider shrink-0 ${
                      isPresent ? 'bg-[#E8F8F0] text-[#23C16B]' : 'bg-red-50 text-[#E53E3E]'
                    }`}>
                      {student.status.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Fees metrics card */}
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex items-center justify-between text-center select-none font-sans">
              <div className="flex-1">
                <p className="text-sm font-black text-[#23C16B]">Rs {totalPaid.toLocaleString()}</p>
                <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Paid</p>
              </div>
              <div className="w-[1px] h-8 bg-[#e2e8f0]" />
              <div className="flex-1">
                <p className="text-sm font-black text-[#E53E3E]">Rs {totalDue.toLocaleString()}</p>
                <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Due</p>
              </div>
              <div className="w-[1px] h-8 bg-[#e2e8f0]" />
              <div className="flex-1">
                <p className="text-sm font-black text-brand-blue">{collectionRate}%</p>
                <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Rate</p>
              </div>
            </div>

            {/* Fees list */}
            <div className="space-y-3">
              {SECTION_FEES.map((item, idx) => {
                const initials = item.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                const isPaid = item.status === 'Paid';
                const isUnpaid = item.status === 'Unpaid';
                
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                        isPaid 
                          ? 'bg-[#E8F8F0] text-[#23C16B]' 
                          : isUnpaid 
                            ? 'bg-red-50 text-[#E53E3E]' 
                            : 'bg-amber-50 text-amber-600'
                      }`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-[9px] text-[#A0AEC0] font-bold mt-1 font-sans">
                          Roll {item.roll} · Paid: Rs {item.paid.toLocaleString()} · Due: Rs {item.due.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1.5 rounded-lg text-[8px] font-extrabold tracking-wider shrink-0 ${
                      isPaid 
                        ? 'bg-[#E8F8F0] text-[#23C16B]' 
                        : isUnpaid 
                          ? 'bg-red-50 text-[#E53E3E]' 
                          : 'bg-amber-50 text-amber-600'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Attendance</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        {/* Subtitle */}
        <div className="mb-2 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">PRINCIPAL</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10">All Attendance</h2>
        <p className="text-xs text-white/80 font-medium relative z-10">Today's active logs, including student and...</p>
      </div>

      {/* Triple metrics card */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex items-center justify-between text-center select-none">
        <div className="flex-1">
          <p className="text-2xl font-black text-[#23C16B]">{globalPresentCount}</p>
          <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Present</p>
        </div>
        <div className="w-[1px] h-8 bg-[#e2e8f0]" />
        <div className="flex-1">
          <p className="text-2xl font-black text-[#E53E3E]">{globalAbsentCount}</p>
          <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Absent</p>
        </div>
        <div className="w-[1px] h-8 bg-[#e2e8f0]" />
        <div className="flex-1">
          <p className="text-2xl font-black text-dark">{globalTotalCount}</p>
          <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Total</p>
        </div>
      </div>

      {/* Student rows list */}
      <div className="space-y-3">
        {ATTENDANCE_LIST.map((student) => {
          const isPresent = student.status === 'Present';
          const firstLetter = student.name.trim().charAt(0);

          return (
            <div
              key={student.id}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                {/* Status-colored Avatar */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                  isPresent 
                    ? 'bg-[#E8F8F0] text-[#23C16B] border border-[#23C16B]/5' 
                    : 'bg-red-50 text-[#E53E3E] border border-red-100'
                }`}>
                  {firstLetter}
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                    {student.class} - {student.section} · {student.date}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`px-2.5 py-1.5 rounded-lg text-[8px] font-extrabold tracking-wider shrink-0 ${
                isPresent ? 'bg-[#E8F8F0] text-[#23C16B]' : 'bg-red-50 text-[#E53E3E]'
              }`}>
                {student.status.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AttendanceOverview;
