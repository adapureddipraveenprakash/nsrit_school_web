import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiInbox, FiChevronRight, FiUserPlus, FiFileText, FiRepeat, FiPlus } from 'react-icons/fi';
import { BiTransfer } from 'react-icons/bi';
import { useApp } from '../../context/AppContext';

const BASE_STUDENTS = [
  { id: 1, name: 'BOYINA MAHIDHAR', class: '2', section: 'A', admissionNo: '26SO0107', status: 'Active', gender: 'Male', phone: '+919100046512' },
  { id: 2, name: 'BOYINA AKSHAYRAM', class: '5', section: 'A', admissionNo: '26SO0106', status: 'Active', gender: 'Male', phone: '+919876543210' },
  { id: 3, name: 'PALLA DEEKSHIT RAM', class: '1', section: 'A', admissionNo: '26SO0105', status: 'Active', gender: 'Male', phone: '+918765432109' },
  { id: 4, name: 'DUDI GREESHMANTH', class: '3', section: 'A', admissionNo: '26SO0104', status: 'Active', gender: 'Male', phone: '+917654321098' },
  { id: 5, name: 'BONTU DHEKSHITH', class: '3', section: 'A', admissionNo: '26SO0103', status: 'Active', gender: 'Male', phone: '+916543210987' },
  { id: 6, name: 'PILLA TRIVED', class: 'UKG', section: 'A', admissionNo: '26SO0102', status: 'Active', gender: 'Male', phone: '+915432109876' },
  { id: 7, name: 'SHINAGAN KOTISUYA', class: 'Nursery', section: 'A', admissionNo: '26SO0101', status: 'Active', gender: 'Female', phone: '+914321098765' },
  { id: 8, name: 'BALIVADA TEJASWINI', class: '6', section: 'A', admissionNo: '26SO0100', status: 'Active', gender: 'Female', phone: '+913210987654' },
  { id: 9, name: 'RATCHAKONDA LALITHA', class: '7', section: 'A', admissionNo: '26SO0099', status: 'Active', gender: 'Female', phone: '+912109876543' },
  { id: 10, name: 'KORADA KARTHIKEYA', class: '7', section: 'A', admissionNo: '26SO0098', status: 'Inactive', gender: 'Male', phone: '+911098765432' },
  { id: 11, name: 'BALIVADA TEJASWINI MUNI', class: '6', section: 'A', admissionNo: '26SO0097', status: 'Active', gender: 'Female', phone: '+919900098877' },
  { id: 12, name: 'SHINAGAN YUGANDH', class: 'UKG', section: 'A', admissionNo: '26SO0096', status: 'Active', gender: 'Male', phone: '+919988776655' },
  { id: 13, name: 'RATCHAKONDA CHINMA', class: 'Nursery', section: 'A', admissionNo: '26SO0095', status: 'Active', gender: 'Female', phone: '+919966554433' }
];

const EXTRA_NAMES = [
  'BALIVADA TEJASWINI PRASAD', 'RATCHAKONDA LALITHA DEVI', 'RATCHAKONDA CHINMA KUMARI', 'PALLA DEEKSHIT RAMESH', 
  'KORADA BHARGAVSAI REDDY', 'KORADA KARTHIKEYA CHOUDARY', 'DUDI GREESHMANTH VARMA', 'BONTU DHEKSHITH RAJ',
  'PILLA TRIVED PATNAIK', 'BOYINA AKSHAYRAM GUPTHA', 'YENUGULA GOWRISWARI DEVI', 'BALIVADA TEJASWINI RAO', 
  'BOYINA MAHIDHAR VARMA', 'KORADA KARTHIKEYA PRASAD', 'DUDI GREESHMANTH REDDY', 'PALLA DEEKSHIT RAMA RAO', 
  'RATCHAKONDA LALITHA KUMARI', 'RATCHAKONDA CHINMA PRASAD', 'SHINAGAN KOTISUYA VARMA', 'SHINAGAN YUGANDHAR RAO', 
  'BALIVADA TEJASWINI DEVI', 'RATCHAKONDA LALITHA PRASAD', 'RATCHAKONDA CHINMA DEVI', 'PALLA DEEKSHIT RAMA KRISHNA', 
  'KORADA BHARGAVSAI VARMA', 'KORADA KARTHIKEYA RAJ', 'DUDI GREESHMANTH GUPTHA', 'BONTU DHEKSHITH KUMAR', 
  'PILLA TRIVED REDDY', 'BOYINA AKSHAYRAM VARMA', 'YENUGULA GOWRISWARI PRASAD', 'BALIVADA TEJASWINI VARMA', 
  'BOYINA MAHIDHAR REDDY', 'KORADA KARTHIKEYA REDDY', 'DUDI GREESHMANTH KUMAR', 'PALLA DEEKSHIT RAMA RAJU', 
  'RATCHAKONDA LALITHA GUPTHA'
];

const INITIAL_STUDENTS = [
  ...BASE_STUDENTS,
  ...EXTRA_NAMES.map((name, idx) => {
    const id = 14 + idx;
    const classes = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];
    const studentClass = classes[idx % classes.length];
    const sections = ['A', 'B', 'C'];
    const section = sections[idx % sections.length];
    const idNum = 94 - idx;
    const admissionNo = `26SO0${String(idNum).padStart(3, '0')}`;
    const status = idx % 8 === 0 ? 'Inactive' : 'Active';
    const gender = idx % 2 === 0 ? 'Female' : 'Male';
    const phone = `+91987654${3210 + idx}`;
    
    return { id, name, class: studentClass, section, admissionNo, status, gender, phone };
  })
];

const StudentRecords = () => {
  const { activeRole, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive'

  if (activeRole === 'COORDINATOR') {
    const isStudentManagement = location.pathname === '/settings/student-management';

    const coordinatorStudents = [
      { name: 'KORADA BHARGAVSAI', class: '5-A', admissionNo: isStudentManagement ? '26SO0002' : '#26SO0002', status: 'Active' },
      { name: 'GANDARDDI MANJUSHA', class: '4-A', admissionNo: isStudentManagement ? '26SO0003' : '#26SO0003', status: 'Active' },
      { name: 'GONTHINA POORVESH', class: '4-A', admissionNo: isStudentManagement ? '26SO0004' : '#26SO0004', status: 'Active' },
      { name: 'AKKIREDDY SADHVIK', class: '4-A', admissionNo: isStudentManagement ? '26SO0006' : '#26SO0006', status: 'Active' },
      { name: 'KORADA CHERVIK', class: '3-A', admissionNo: isStudentManagement ? '26SO0007' : '#26SO0007', status: 'Active' },
      { name: 'BOGADHI HETVIK', class: '2-A', admissionNo: isStudentManagement ? '26SO0008' : '#26SO0008', status: 'Active' },
      { name: 'BOOSA MANOJ', class: '4-A', admissionNo: isStudentManagement ? '26SO0011' : '#26SO0011', status: 'Active' },
      { name: 'GNANA ABHINAVA RAM KORADA', class: '3-A', admissionNo: isStudentManagement ? '26SO0014' : '#26SO0014', status: 'Active' },
      { name: 'GOLAGANA HANSHITH', class: '1-A', admissionNo: isStudentManagement ? '26SO0017' : '#26SO0017', status: 'Active' },
      { name: 'GOLAJANA GNANESWARI', class: '1-A', admissionNo: isStudentManagement ? '26SO0019' : '#26SO0019', status: 'Active' },
      { name: 'KORUKONDA NISSY SWAASTHYA', class: '1-A', admissionNo: isStudentManagement ? '26SO0021' : '#26SO0021', status: 'Active' },
      { name: 'RAMINA PARDHU', class: '2-A', admissionNo: isStudentManagement ? '26SO0022' : '#26SO0022', status: 'Active' },
      { name: 'RAMINA TEJASREE PRANAV', class: '3-A', admissionNo: isStudentManagement ? '26SO0024' : '#26SO0024', status: 'Active' },
      { name: 'M SRAVYA SRI', class: '2-A', admissionNo: isStudentManagement ? '26SO0025' : '#26SO0025', status: 'Active' },
      { name: 'BODDAPU PRERANA LATHA', class: '3-A', admissionNo: isStudentManagement ? '26SO0027' : '#26SO0027', status: 'Active' },
      { name: 'BALLIREDDY LOKSHITHA SRI', class: '2-A', admissionNo: isStudentManagement ? '26SO0031' : '#26SO0031', status: 'Active' },
      { name: 'CHANDAPARAPU GNANWITH', class: '2-A', admissionNo: isStudentManagement ? '26SO0037' : '#26SO0037', status: 'Active' },
      ...Array.from({ length: 33 }, (_, i) => {
        const names = ['KORADA BHARGAVSAI', 'GANDARDDI MANJUSHA', 'GONTHINA POORVESH', 'AKKIREDDY SADHVIK', 'BOGADHI HETVIK', 'RAMINA PARDHU', 'M SRAVYA SRI'];
        const classes = ['1-A', '2-A', '3-A', '4-A', '5-A'];
        const baseName = names[i % names.length];
        const admissionNum = 38 + i;
        return {
          name: `${baseName} JR ${i + 1}`,
          class: classes[i % classes.length],
          admissionNo: isStudentManagement ? `26SO${String(admissionNum).padStart(5, '0')}` : `#26SO${String(admissionNum).padStart(5, '0')}`,
          status: i % 10 === 0 ? 'Inactive' : 'Active'
        };
      })
    ];

    const wingName = user?.wing || 'PRIMARY';
    const filteredCoStudents = coordinatorStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                            student.class.toLowerCase().includes(search.toLowerCase()) ||
                            student.admissionNo.toLowerCase().includes(search.toLowerCase());
      
      if (!isStudentManagement) return matchesSearch;

      let matchesStatus = true;
      if (statusFilter === 'Active') matchesStatus = student.status === 'Active';
      else if (statusFilter === 'Inactive') matchesStatus = student.status === 'Inactive';

      return matchesSearch && matchesStatus;
    });

    if (isStudentManagement) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative select-none"
        >
          {/* Top Header Bar */}
          <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Students</h1>
          </header>

          {/* Top curved blue header card */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            {/* Subtitle */}
            <div className="mb-2 relative z-10">
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">MANAGEMENT</span>
            </div>

            {/* Title & Button */}
            <div className="flex items-center justify-between mb-1 relative z-10">
              <h2 className="text-xl font-bold">Students</h2>
              <button
                onClick={() => navigate('/settings/create-student')}
                className="bg-white hover:bg-slate-50 text-[#1597E5] px-3.5 py-1.5 rounded-full text-[10px] font-extrabold shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-1"
              >
                <span>+ Add Student</span>
              </button>
            </div>

            <p className="text-xs text-white/85 font-medium relative z-10">
              Admissions, profiles, status, and section transfers
            </p>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search students, admission no, parent mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
          </div>

          {/* Spaced Filters Area */}
          <div className="flex gap-2 select-none pb-1">
            {['All', 'Active', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/20'
                    : 'bg-white border-[#e2e8f0] text-[#A0AEC0] hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* List Subheading */}
          <div className="px-1 text-[9px] font-extrabold text-[#A0AEC0] tracking-widest uppercase">
            {filteredCoStudents.length} Students
          </div>

          {/* Student list grid */}
          <div className="space-y-3">
            {filteredCoStudents.map((student, idx) => {
              const firstLetter = student.name.trim().charAt(0);
              const isInactive = student.status === 'Inactive';

              return (
                <div
                  key={idx}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer relative group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    {/* Circle Avatar with First Letter */}
                    <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-brand-blue border border-brand-blue/5 flex items-center justify-center font-bold text-xs select-none">
                      {firstLetter}
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                        {student.name}
                      </h3>
                      <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                        {student.class} · {student.admissionNo}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-lg text-[8px] font-extrabold tracking-wider shrink-0 ${
                    isInactive ? 'bg-red-50 text-[#E53E3E]' : 'bg-[#E8F8F0] text-[#23C16B]'
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

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Wing Students</h1>
        </header>

        {/* Top curved blue header card */}
        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] to-[#4076FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

          {/* Subtitle */}
          <div className="mb-2 relative z-10">
            <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">COORDINATOR · {wingName}</span>
          </div>

          {/* Title & Count */}
          <div className="flex items-center gap-2 mb-1 relative z-10">
            <h2 className="text-xl font-bold">Wing Students</h2>
            <span className="bg-white/20 border border-white/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
              {coordinatorStudents.length}
            </span>
          </div>

          <p className="text-xs text-white/80 font-medium relative z-10">
            Students in your assigned wing
          </p>
        </div>

        {/* Action pills row matching Screenshot 2 */}
        <div className="flex gap-3 select-none pb-1">
          <button
            onClick={() => navigate('/settings/create-student')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#EEF5FB] text-brand-blue border border-blue-100 rounded-full text-[11px] font-extrabold shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => navigate('/settings/promotions')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#EEF5FB] text-brand-blue border border-blue-100 rounded-full text-[11px] font-extrabold shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <BiTransfer className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
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
          {coordinatorStudents.length} Students
        </div>

        {/* Student list grid */}
        <div className="space-y-3">
          {filteredCoStudents.length > 0 ? (
            filteredCoStudents.map((student, idx) => {
              const namesList = student.name.split(' ');
              const initials = namesList.length > 1 ? `${namesList[0][0]}${namesList[1][0]}` : student.name.charAt(0);
              
              return (
                <div
                  key={idx}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer relative group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    {/* Circle Avatar with Initials */}
                    <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-brand-blue border border-brand-blue/5 flex items-center justify-center font-bold text-xs select-none">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                        {student.name}
                      </h3>
                      <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                        {student.class} · {student.admissionNo}
                      </p>
                    </div>
                  </div>

                  {/* Hollow Circle Outline on the right */}
                  <span className="w-5 h-5 rounded-full border border-blue-200 shrink-0" />
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[260px]">
              <FiInbox className="w-8 h-8 text-secondaryText" />
              <h4 className="text-sm font-extrabold text-dark">No students found</h4>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (activeRole === 'ACCOUNTANT') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-24 max-w-4xl mx-auto select-none animate-fade-in relative"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Due Students</h1>
        </header>

        {/* Top curved blue header card */}
        <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

          <div className="mb-1 relative z-10 select-none">
            <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEES</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Due Students</h2>
          <p className="text-[11px] text-white/80 font-bold relative z-10">
            Students with pending balances
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search due students"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
        </div>

        {/* Empty state card matching Screenshot 2 */}
        <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
          <div className="w-18 h-18 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/10 relative">
            <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
            <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-[#0F172A]">No dues</h4>
            <p className="text-[10px] text-secondaryText font-bold">
              No students match this due filter.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (activeRole === 'PARENT') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-28 max-w-5xl mx-auto relative select-none animate-fade-in"
      >
        {/* Centered Page Header */}
        <div className="text-center py-1.5 shrink-0">
          <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">Students</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1 */}
          <div className="lg:col-span-1">
            {/* Select Student curved blue banner card */}
            <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

              <p className="text-[10px] text-white/75 font-bold tracking-wider uppercase">Parent Portal</p>
              <h2 className="text-xl font-black mt-1 tracking-tight">Select Student</h2>
              <p className="text-xs text-white/80 font-bold mt-1">Tap a child to view their attendance</p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="px-1 text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">
              Children
            </div>

            <div
              onClick={() => navigate('/settings/attendance-overview')}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#0088ff] font-bold text-sm shrink-0 select-none">
                  PP
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0F172A] leading-tight group-hover:text-[#0088ff] transition-colors">
                    PATCHAMATLA PRANEETH VARMA
                  </h3>
                  <p className="text-xs text-secondaryText font-bold mt-0.5">
                    1-A
                  </p>
                  <span className="inline-block px-2.5 py-0.5 bg-[#EEF5FB] text-[#0088ff] text-[9px] font-black rounded-full mt-1.5 uppercase tracking-wide">
                    #26SO0066
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#EEF5FB] group-hover:bg-blue-50 flex items-center justify-center text-[#0088ff] transition-all">
                <FiChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Handle filtering
  const filtered = INITIAL_STUDENTS.filter(student => {
    // Search filter
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                          student.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
                          student.phone.includes(search);
    
    // Status Filter
    let matchesStatus = true;
    if (statusFilter === 'Active') matchesStatus = student.status === 'Active';
    else if (statusFilter === 'Inactive') matchesStatus = student.status === 'Inactive';

    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Students</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        {/* Subtitle */}
        <div className="mb-2 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">BRANCH MANAGEMENT</span>
        </div>

        {/* Title & Count */}
        <div className="flex items-center gap-2 mb-1 relative z-10">
          <h2 className="text-xl font-bold">Students</h2>
          <span className="bg-white/20 border border-white/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
            {filtered.length}
          </span>
        </div>

        <p className="text-xs text-white/80 font-medium relative z-10">
          Search by name, student ID, or parent phone
        </p>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search students"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
      </div>

      {/* Spaced Filters Area */}
      <div className="flex gap-2 select-none pb-1">
        {['All', 'Active', 'Inactive'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-5 py-2 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === status
                ? 'bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/20'
                : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* List Subheading */}
      <div className="px-1 text-[9px] font-extrabold text-secondaryText tracking-widest uppercase">
        {filtered.length} Students
      </div>

      {/* Dynamic List Grid */}
      <div className="space-y-3 pt-1">
        {filtered.length > 0 ? (
          filtered.map((student) => {
            const isMale = student.gender === 'Male';
            const initials = student.name.trim().charAt(0);
            const isInactive = student.status === 'Inactive';

            return (
              <div
                key={student.id}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer relative group active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar with First Letter */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                    isMale ? 'bg-[#EEF5FB] text-brand-blue border border-brand-blue/5' : 'bg-pink-50 text-pink-500 border border-pink-100'
                  }`}>
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                      {student.class}-{student.section} · {student.admissionNo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  <span className={`px-2.5 py-1.5 rounded-lg text-[8px] font-extrabold tracking-wider ${
                    isInactive ? 'bg-red-50 text-[#E53E3E]' : 'bg-[#E8F8F0] text-[#23C16B]'
                  }`}>
                    {student.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State Panel */
          <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[260px]">
            <div className="w-18 h-18 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/10">
              <FiInbox className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-[260px]">
              <h4 className="text-sm font-extrabold text-dark">No students</h4>
              <p className="text-[10px] text-[#A0AEC0] font-semibold leading-relaxed">
                Adjust search text or status filter.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MORE ACTIONS Section */}
      <div className="space-y-3 pt-4 pb-4 select-none">
        <h2 className="px-1 text-[10px] font-extrabold text-[#718096] tracking-widest uppercase">
          More Actions
        </h2>

        <div className="space-y-3">
          {/* Advanced Search */}
          <div
            onClick={() => {
              // Focus search input
              const searchInput = document.querySelector('input[placeholder="Search students"]');
              if (searchInput) searchInput.focus();
            }}
            className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EEF5FB] flex items-center justify-center border border-brand-blue/5">
                <FiSearch className="w-4 h-4 text-[#1597E5]" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-dark group-hover:text-brand-blue transition-colors">
                  Advanced Search
                </h3>
                <p className="text-[9px] text-[#A0AEC0] font-semibold mt-0.5">
                  Find by class, section, status
                </p>
              </div>
            </div>
            <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Bulk Import */}
          <div
            onClick={() => navigate('/settings/bulk-upload')}
            className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EEF5FB] flex items-center justify-center border border-brand-blue/5">
                <FiFileText className="w-4 h-4 text-[#1597E5]" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-dark group-hover:text-brand-blue transition-colors">
                  Bulk Import
                </h3>
                <p className="text-[9px] text-[#A0AEC0] font-semibold mt-0.5">
                  Upload students via CSV
                </p>
              </div>
            </div>
            <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Transfer Student */}
          <div
            onClick={() => navigate('/settings/promotions')}
            className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EEF5FB] flex items-center justify-center border border-brand-blue/5">
                <FiRepeat className="w-4 h-4 text-[#1597E5]" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-dark group-hover:text-brand-blue transition-colors">
                  Transfer Student
                </h3>
                <p className="text-[9px] text-[#A0AEC0] font-semibold mt-0.5">
                  Move between sections
                </p>
              </div>
            </div>
            <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Add Student Button Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:left-[288px] animate-[slideUp_0.3s_ease-out]">
        <div className="max-w-[640px] mx-auto px-4 pb-0">
          <button
            onClick={() => navigate('/settings/create-student')}
            className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-t-[32px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95"
          >
            <FiUserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentRecords;
