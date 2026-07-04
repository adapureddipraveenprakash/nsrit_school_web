import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiSearch, FiUsers, FiBookOpen, FiGrid, FiChevronRight, FiClipboard } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { getAcademicClasses, getSectionsByClass, getStudentsBySection, getAttendanceBySection } from '../../services/dataService';


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

  if (activeRole === 'COORDINATOR') {
    const [view, setView] = useState('classes'); // 'classes' | 'sections' | 'attendance'
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedDate, setSelectedDate] = useState(() => {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    });

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const branchId = user?.branchId || 'sontyam-branch-id';
    const wingCode = user?.wing || 'PRIMARY';

    // 1. Fetch active classes in coordinator's wing
    useEffect(() => {
      let active = true;
      const loadClasses = async () => {
        setLoading(true);
        setError(null);
        try {
          const all = await getAcademicClasses();
          if (active) {
            let wingClasses = all.filter(c => c.branchId === branchId);
            if (wingCode) {
              wingClasses = wingClasses.filter(c => c.wing?.code?.toUpperCase() === wingCode.toUpperCase());
            }
            setClasses(wingClasses);
          }
        } catch (err) {
          console.error('Error fetching classes:', err);
          if (active) setError('Failed to load classes.');
        } finally {
          if (active) setLoading(false);
        }
      };
      loadClasses();
      return () => { active = false; };
    }, [branchId, wingCode]);

    // 2. Fetch sections when selectedClass changes
    useEffect(() => {
      if (!selectedClass) return;
      let active = true;
      const loadSections = async () => {
        setLoading(true);
        setError(null);
        try {
          const classSections = await getSectionsByClass(selectedClass.id);
          if (active) setSections(classSections);
        } catch (err) {
          console.error('Error fetching sections:', err);
          if (active) setError('Failed to load sections.');
        } finally {
          if (active) setLoading(false);
        }
      };
      loadSections();
      return () => { active = false; };
    }, [selectedClass]);

    // 3. Fetch students and attendance records
    useEffect(() => {
      if (!selectedSection) return;
      let active = true;
      const loadRosterAndAttendance = async () => {
        setLoading(true);
        setError(null);
        try {
          const dateStr = formatToYYYYMMDD(selectedDate);
          const [studentList, records] = await Promise.all([
            getStudentsBySection(selectedSection.id),
            getAttendanceBySection({ sectionId: selectedSection.id, date: dateStr })
          ]);

          if (active) {
            setStudents(studentList);
            setAttendanceRecords(records);
          }
        } catch (err) {
          console.error('Error fetching roster/attendance:', err);
          if (active) setError('Failed to load attendance records.');
        } finally {
          if (active) setLoading(false);
        }
      };
      loadRosterAndAttendance();
      return () => { active = false; };
    }, [selectedSection, selectedDate]);

    // Date Helpers
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

    const checkIsToday = (date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    };

    const getDayName = (date) => {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const MIN_DATE = new Date('2026-06-12');

    const handlePrevDay = () => {
      const prevDate = new Date(selectedDate);
      prevDate.setDate(prevDate.getDate() - 1);
      
      const minTime = new Date(MIN_DATE.getFullYear(), MIN_DATE.getMonth(), MIN_DATE.getDate()).getTime();
      const prevTime = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate()).getTime();
      
      if (prevTime >= minTime) {
        setSelectedDate(prevDate);
      }
    };

    const handleNextDay = () => {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      setSelectedDate(nextDate);
    };

    const isMinDateReached = () => {
      const minTime = new Date(MIN_DATE.getFullYear(), MIN_DATE.getMonth(), MIN_DATE.getDate()).getTime();
      const selectedTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
      return selectedTime <= minTime;
    };

    // Combine student details with their attendance records
    const combinedRoster = useMemo(() => {
      const recordMap = {};
      attendanceRecords.forEach(r => {
        if (r.studentId) {
          recordMap[r.studentId] = r.status;
        }
      });
      
      return students.map((student) => {
        const rawStatus = recordMap[student.id];
        let status = 'Not Marked';
        if (rawStatus) {
          if (rawStatus.toUpperCase() === 'PRESENT') status = 'Present';
          else if (rawStatus.toUpperCase() === 'ABSENT') status = 'Absent';
          else status = rawStatus;
        }
        return {
          id: student.id,
          studentId: student.studentId || 'N/A',
          name: student.fullName,
          class: student.academicClass?.name || selectedClass?.name || '',
          section: selectedSection?.name || '',
          status: status,
          date: formatDateToDMY(selectedDate)
        };
      });
    }, [students, attendanceRecords, selectedClass, selectedSection, selectedDate]);

    const presentCount = combinedRoster.filter(s => s.status === 'Present').length;
    const absentCount = combinedRoster.filter(s => s.status === 'Absent').length;
    const totalCount = combinedRoster.length;

    // Filter by search query
    const filteredClasses = classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    const filteredSections = sections.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    const filteredRoster = combinedRoster.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    // Rendering functions
    if (view === 'classes') {
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
            <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Classes</h1>
          </header>

          {/* Top curved blue header card */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] to-[#4076FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            {/* Subtitle */}
            <div className="mb-2 relative z-10">
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">COORDINATOR · {wingCode}</span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold mb-1 relative z-10">Wing Attendance</h2>
            <p className="text-xs text-white/80 font-medium relative z-10">Select a class to view attendance</p>
          </div>

          {/* Loading / Error states */}
          {loading && classes.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-secondaryText">Loading classes...</div>
          ) : error ? (
            <div className="text-center py-8 text-xs font-semibold text-rose-500">{error}</div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-secondaryText">No classes found</div>
          ) : (
            /* Classes rows list matching Screenshot 4 */
            <div className="space-y-3">
              {filteredClasses.map((cls, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedClass(cls);
                    setView('sections');
                    setSearch('');
                  }}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0 select-none border border-blue-150/10">
                      <FiBookOpen className="w-4 h-4 text-brand-blue" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-[#0F172A] leading-tight group-hover:text-brand-blue transition-colors">
                        {cls.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-[#A0AEC0] group-hover:text-brand-blue transition-all shrink-0">
                    <FiChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      );
    }

    if (view === 'sections') {
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
              onClick={() => {
                setView('classes');
                setSelectedClass(null);
                setSearch('');
              }}
              className="flex items-center text-xs font-bold text-brand-blue hover:text-brand-blue/80 transition-colors cursor-pointer gap-1"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Classes</span>
            </button>
            <h1 className="text-sm font-bold text-dark pr-16 mx-auto">Select Section</h1>
          </header>

          {/* Top curved blue header card */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] to-[#4076FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            {/* Subtitle */}
            <div className="mb-2 relative z-10">
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">{selectedClass?.name}</span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold mb-1 relative z-10">Select Section</h2>
            <p className="text-xs text-white/80 font-medium relative z-10">Choose a section to view attendance</p>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search section"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
          </div>

          {/* List Subheading */}
          <div className="px-1 text-[9px] font-extrabold text-secondaryText tracking-widest uppercase">
            {sections.length} Sections
          </div>

          {/* Loading / Error states */}
          {loading && sections.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-secondaryText">Loading sections...</div>
          ) : error ? (
            <div className="text-center py-8 text-xs font-semibold text-rose-500">{error}</div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-secondaryText">No sections found</div>
          ) : (
            /* Sections rows list */
            <div className="space-y-3">
              {filteredSections.map((sec, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedSection(sec);
                    setView('attendance');
                    setSearch('');
                  }}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#EBF5FF] text-[#2F80ED] flex items-center justify-center font-bold text-xs select-none border border-blue-50">
                      <FiUsers className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                        {selectedClass?.name} - {sec.name}
                      </h3>
                      <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                        Active Section
                      </p>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-blue-50 flex items-center justify-center text-brand-blue transition-all shrink-0">
                    <FiChevronRight className="w-4 h-4 text-brand-blue group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      );
    }

    if (view === 'attendance') {
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
              onClick={() => {
                setView('sections');
                setSelectedSection(null);
                setSearch('');
              }}
              className="flex items-center text-xs font-bold text-brand-blue hover:text-brand-blue/80 transition-colors cursor-pointer gap-1"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="truncate max-w-[100px]">{selectedClass?.name} · Sections</span>
            </button>
            <h1 className="text-sm font-bold text-dark pr-24 mx-auto">Attendance</h1>
          </header>

          {/* Top curved blue header card */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] to-[#4076FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            {/* Subtitle */}
            <div className="mb-2 relative z-10">
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">
                {selectedClass?.name?.toUpperCase()} - {selectedSection?.name?.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold mb-1 relative z-10">Attendance</h2>
            <p className="text-xs text-white/80 font-medium relative z-10">Submitted records for this section</p>
          </div>

          {/* Date swiper selector */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 card-shadow flex items-center justify-between select-none relative">
            <button
              onClick={handlePrevDay}
              disabled={isMinDateReached()}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-brand-blue shadow-sm border border-[#e2e8f0] transition-all select-none active:scale-95 ${
                isMinDateReached() ? 'opacity-30 cursor-not-allowed bg-slate-50' : 'bg-white hover:bg-slate-50'
              }`}
            >
              &lt;
            </button>
            
            <div className="relative flex flex-col items-center justify-center cursor-pointer px-4">
              <span className="text-xs font-black text-[#0F172A] tracking-tight">
                {formatDateToDMY(selectedDate)}
              </span>
              {checkIsToday(selectedDate) ? (
                <span className="text-[9px] text-brand-blue font-black mt-0.5 select-none uppercase tracking-wide">Today</span>
              ) : (
                <span className="text-[9px] text-secondaryText font-bold mt-0.5 select-none uppercase tracking-wide">
                  {getDayName(selectedDate)}
                </span>
              )}
              {/* Native Calendar Picker Input overlapping for click selection */}
              <input
                type="date"
                min="2026-06-12"
                value={formatToYYYYMMDD(selectedDate)}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value));
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="w-9 h-9 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-brand-blue hover:bg-slate-50 shadow-sm active:scale-95 transition-all select-none"
            >
              &gt;
            </button>
          </div>

          {/* Roster / Empty state rendering */}
          {loading && combinedRoster.length === 0 ? (
            <div className="text-center py-12 text-xs font-semibold text-secondaryText">Loading roster...</div>
          ) : error ? (
            <div className="text-center py-12 text-xs font-semibold text-rose-500">{error}</div>
          ) : attendanceRecords.length === 0 ? (
            /* Screenshot 3 - No attendance submitted state */
            <div className="bg-white rounded-[32px] border border-[#e2e8f0]/45 p-8 py-10 card-shadow flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#EEF5FB]/70 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue">
                  <FiClipboard className="w-7 h-7 text-brand-blue" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-dark tracking-tight">No attendance found</h3>
                <p className="text-[10px] text-secondaryText mt-1.5 font-bold max-w-[240px] leading-relaxed mx-auto">
                  No attendance submitted for {selectedClass?.name}-{selectedSection?.name} on {formatDateToDMY(selectedDate)}.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Metrics card with Present, Absent, Total, Rate */}
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
                  <p className="text-2xl font-black text-[#0F172A]">{totalCount}</p>
                  <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Total</p>
                </div>
                <div className="w-[1px] h-8 bg-[#e2e8f0]" />
                <div className="flex-1">
                  <p className="text-2xl font-black text-[#1597E5]">
                    {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
                  </p>
                  <p className="text-[10px] text-[#A0AEC0] font-bold mt-1 uppercase tracking-wide">Rate</p>
                </div>
              </div>

              {/* Search Input Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search student"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
              </div>

              {/* List Subheading */}
              <div className="px-1 text-[9px] font-extrabold text-secondaryText tracking-widest uppercase">
                {filteredRoster.length} Records
              </div>

              {/* Student rows list */}
              <div className="space-y-3">
                {filteredRoster.map((student, idx) => {
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
                            {student.studentId}
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
            </>
          )}
        </motion.div>
      );
    }
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

  if (activeRole === 'PARENT') {
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

  if (activeRole === 'TEACHER' || activeRole === 'CLASS_TEACHER') {
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
    </motion.div>
  );
};

export default AttendanceOverview;
