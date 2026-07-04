import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiInbox, FiChevronRight, FiUserPlus, FiFileText, FiRepeat, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { BiTransfer } from 'react-icons/bi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getStudents, getFeeRecordsByBranch } from '../../../services/dataService';

// Normalize a student record from Data Connect into a display-friendly shape
const normalizeStudent = (s) => ({
  id: s.id,
  name: s.fullName || s.name || '',
  class: s.academicClass?.name || s.className || '',
  section: s.section?.name || s.sectionName || '',
  admissionNo: s.studentId || s.admissionNumber || '',
  status: s.isActive !== false && s.status !== 'INACTIVE' ? 'Active' : 'Inactive',
  gender: s.gender || '',
  phone: s.phoneNumber || '',
});

const StudentRecords = () => {
  const { activeRole, user, currentBranchContext } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive'
  const [selectedClass, setSelectedClass] = useState(null);

  // Determine which branch to fetch students for
  const branchId = user?.branchId || currentBranchContext?.id || null;

  // Fetch real students from Firebase Data Connect
  const { data: rawStudents, loading: studentsLoading, error: studentsError, refetch } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [], pollInterval: 30000 }
  );

  const INITIAL_STUDENTS = useMemo(() => (rawStudents || []).map(normalizeStudent), [rawStudents]);

  const { data: rawFees, loading: feesLoading } = useDataFetch(
    activeRole === 'ACCOUNTANT' ? () => getFeeRecordsByBranch({ branchId }) : null,
    [branchId, activeRole],
    { defaultValue: null, pollInterval: 15000 }
  );

  const studentFees = rawFees?.studentFees || [];

  const dueStudents = useMemo(() => {
    return studentFees
      .filter(f => f.remainingAmount > 0)
      .map(f => ({
        id: f.id,
        name: f.student?.fullName || 'Unknown Student',
        class: f.student?.academicClassId || '1-A',
        admissionNo: f.student?.studentId || 'N/A',
        dueAmount: f.remainingAmount,
        status: f.status
      }));
  }, [studentFees]);

  const filteredDueStudents = useMemo(() => {
    return dueStudents.filter(student =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(search.toLowerCase())
    );
  }, [dueStudents, search]);

  const mockStudentsByClass = {
    'LKG': [
      { id: 'lkg1', name: 'KORADA BHARGAVSAI', class: 'LKG', section: 'A', admissionNo: '26SO0002', status: 'Active', gender: 'Male' },
      { id: 'lkg2', name: 'GANDARDDI MANJUSHA', class: 'LKG', section: 'A', admissionNo: '26SO0003', status: 'Active', gender: 'Female' },
      { id: 'lkg3', name: 'GONTHINA POORVESH', class: 'LKG', section: 'A', admissionNo: '26SO0004', status: 'Active', gender: 'Male' },
    ],
    'UKG': [
      { id: 'ukg1', name: 'AKKIREDDY SADHVIK', class: 'UKG', section: 'A', admissionNo: '26SO0006', status: 'Active', gender: 'Male' },
      { id: 'ukg2', name: 'KORADA CHERVIK', class: 'UKG', section: 'A', admissionNo: '26SO0007', status: 'Active', gender: 'Male' },
    ],
    '1': [
      { id: '1-1', name: 'GOLAGANA HANSHITH', class: '1', section: 'A', admissionNo: '26SO0017', status: 'Active', gender: 'Male' },
      { id: '1-2', name: 'GOLAJANA GNANESWARI', class: '1', section: 'A', admissionNo: '26SO0019', status: 'Active', gender: 'Female' },
    ]
  };

  const classGroups = useMemo(() => {
    const groups = {};
    (rawStudents || []).forEach(s => {
      const className = s.academicClass?.name || 'Unassigned';
      if (!groups[className]) {
        groups[className] = {
          name: className,
          students: [],
          sections: new Set()
        };
      }
      groups[className].students.push(s);
      if (s.section?.name) {
        groups[className].sections.add(s.section.name);
      }
    });

    const classNamesOrder = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', 'Nursery'];
    const mockStudentCounts = {
      'LKG': 19,
      'UKG': 12,
      '1': 14,
      '2': 15,
      '3': 14,
      '4': 10,
      '5': 5,
      '6': 7,
      '7': 2,
      'Nursery': 9
    };

    const finalGroups = [];
    classNamesOrder.forEach(name => {
      if (groups[name]) {
        finalGroups.push({
          name,
          sectionsStr: Array.from(groups[name].sections).join(', ') || 'A',
          studentCount: groups[name].students.length,
          students: groups[name].students
        });
      } else {
        finalGroups.push({
          name,
          sectionsStr: 'A',
          studentCount: mockStudentCounts[name] || 0,
          students: []
        });
      }
    });

    return finalGroups;
  }, [rawStudents]);

  const totalStudentsCount = useMemo(() => {
    if (rawStudents && rawStudents.length > 0) {
      return rawStudents.length;
    }
    return 107; // Mock fallback
  }, [rawStudents]);

  const totalClassesCount = useMemo(() => {
    const uniqueClasses = new Set((rawStudents || []).map(s => s.academicClass?.name).filter(Boolean));
    return uniqueClasses.size > 0 ? uniqueClasses.size : 10; // Mock fallback
  }, [rawStudents]);

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const actual = (rawStudents || []).filter(s => s.academicClass?.name?.toUpperCase() === selectedClass.toUpperCase());
    if (actual.length > 0) {
      return actual.map(normalizeStudent);
    }
    return mockStudentsByClass[selectedClass] || [
      { id: 'gen1', name: `Student One (${selectedClass})`, class: selectedClass, section: 'A', admissionNo: '26SO0101', status: 'Active', gender: 'Male' },
      { id: 'gen2', name: `Student Two (${selectedClass})`, class: selectedClass, section: 'A', admissionNo: '26SO0102', status: 'Active', gender: 'Female' },
    ];
  }, [selectedClass, rawStudents]);

  const filteredClassStudents = useMemo(() => {
    return classStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                            student.admissionNo.toLowerCase().includes(search.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === 'Active') matchesStatus = student.status === 'Active';
      else if (statusFilter === 'Inactive') matchesStatus = student.status === 'Inactive';

      return matchesSearch && matchesStatus;
    });
  }, [classStudents, search, statusFilter]);

  const classColorMap = {
    'LKG': { bg: 'bg-[#EEF5FB]', text: 'text-[#1597E5]', circle: 'bg-blue-100' },
    'UKG': { bg: 'bg-[#FAF5FF]', text: 'text-[#805AD5]', circle: 'bg-purple-100' },
    '1': { bg: 'bg-[#F0FDF4]', text: 'text-[#22C55E]', circle: 'bg-green-100' },
    '2': { bg: 'bg-[#FFF7ED]', text: 'text-[#EA580C]', circle: 'bg-orange-100' },
    '3': { bg: 'bg-[#FEF2F2]', text: 'text-[#EF4444]', circle: 'bg-red-100' },
    '4': { bg: 'bg-[#EEF5FB]', text: 'text-[#1597E5]', circle: 'bg-blue-100' },
    '5': { bg: 'bg-[#FAF5FF]', text: 'text-[#805AD5]', circle: 'bg-purple-100' },
    '6': { bg: 'bg-[#F0FDF4]', text: 'text-[#22C55E]', circle: 'bg-green-100' },
    '7': { bg: 'bg-[#FFF7ED]', text: 'text-[#EA580C]', circle: 'bg-orange-100' },
    'Nursery': { bg: 'bg-[#EEF5FB]', text: 'text-[#1597E5]', circle: 'bg-blue-100' }
  };

  if (activeRole === 'PRINCIPAL' || activeRole === 'BRANCH_ADMIN') {
    if (selectedClass) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative select-none"
        >
          <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
            <button
              onClick={() => setSelectedClass(null)}
              className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-dark pr-8 mx-auto font-sans">Class {selectedClass}</h1>
          </header>

          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="mb-1 relative z-10">
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">CLASS STUDENTS</span>
            </div>
            <h2 className="text-xl font-bold relative z-10 font-sans">Class {selectedClass}</h2>
            <p className="text-xs text-white/85 mt-1 relative z-10 font-sans">
              View student list and profiles for this grade.
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search students or admission no"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
          </div>

          <div className="flex gap-2 select-none pb-1">
            {['All', 'Active', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-brand-blue/20'
                    : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-1">
            {filteredClassStudents.length > 0 ? (
              filteredClassStudents.map((student) => {
                const initials = student.name.charAt(0);
                const isMale = student.gender === 'Male';
                const isInactive = student.status === 'Inactive';
                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                        isMale ? 'bg-[#EEF5FB] text-brand-blue' : 'bg-pink-50 text-pink-500'
                      }`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                          {student.class} - {student.section} · {student.admissionNo}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-extrabold tracking-wider ${
                      isInactive ? 'bg-red-50 text-[#E53E3E]' : 'bg-[#E8F8F0] text-[#23C16B]'
                    }`}>
                      {student.status.toUpperCase()}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[260px]">
                <FiInbox className="w-8 h-8 text-secondaryText" />
                <h4 className="text-xs font-extrabold text-dark">No students found</h4>
              </div>
            )}
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
        className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative select-none"
      >
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto font-sans">Students</h1>
        </header>

        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

          <div className="mb-2 relative z-10">
            <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">MANAGEMENT</span>
          </div>

          <div className="flex items-center justify-between mb-1 relative z-10">
            <h2 className="text-xl font-bold font-sans">Students</h2>
            <button
              onClick={() => navigate('/settings/create-student')}
              className="bg-white hover:bg-slate-50 text-[#1597E5] px-4 py-2 rounded-full text-[10px] font-black shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
            >
              <FiUserPlus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>
          </div>

          <p className="text-xs text-white/85 font-medium mt-1.5 relative z-10 font-sans">
            Admissions, profiles, status, and section transfers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex flex-col items-center justify-center text-center">
            <p className="text-lg font-black text-[#1597E5]">{totalClassesCount}</p>
            <p className="text-[9px] text-[#A0AEC0] font-black uppercase mt-1 tracking-wider leading-none">Classes</p>
          </div>
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex flex-col items-center justify-center text-center">
            <p className="text-lg font-black text-[#1597E5]">{totalStudentsCount}</p>
            <p className="text-[9px] text-[#A0AEC0] font-black uppercase mt-1 tracking-wider leading-none">Total Students</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-extrabold text-[#718096] uppercase tracking-widest px-1 font-sans">
            Select a Class
          </h3>

          <div className="space-y-3">
            {classGroups.map((group) => {
              const style = classColorMap[group.name] || { bg: 'bg-[#EEF5FB]', text: 'text-[#1597E5]', circle: 'bg-blue-100' };
              return (
                <div
                  key={group.name}
                  onClick={() => setSelectedClass(group.name)}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-[10px] ${style.bg} ${style.text}`}>
                      {group.name}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-dark leading-tight group-hover:text-brand-blue transition-colors font-sans">
                        Class {group.name}
                      </h4>
                      <p className="text-[9px] text-[#A0AEC0] font-bold mt-1 font-sans">
                        Sections: {group.sectionsStr}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-dark">
                      {group.studentCount}
                    </span>
                    <span className="text-[8.5px] text-[#A0AEC0] font-bold uppercase mr-1 font-sans">students</span>
                    <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-extrabold text-[#718096] uppercase tracking-widest px-1 font-sans">
            More Actions
          </h3>

          <div className="space-y-3">
            <div
              onClick={() => navigate('/settings/search-students')}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EEF5FB] flex items-center justify-center border border-brand-blue/5">
                  <FiSearch className="w-4 h-4 text-[#1597E5]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-dark group-hover:text-brand-blue transition-colors font-sans">
                    Advanced Search
                  </h3>
                  <p className="text-[9px] text-[#A0AEC0] font-semibold mt-0.5 font-sans">
                    Find by class, section, status
                  </p>
                </div>
              </div>
              <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={() => navigate('/settings/bulk-upload')}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EEF5FB] flex items-center justify-center border border-brand-blue/5">
                  <FiFileText className="w-4 h-4 text-[#1597E5]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-dark group-hover:text-brand-blue transition-colors font-sans">
                    Bulk Import
                  </h3>
                  <p className="text-[9px] text-[#A0AEC0] font-semibold mt-0.5 font-sans">
                    Upload students via CSV
                  </p>
                </div>
              </div>
              <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={() => navigate('/settings/transfer-student')}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EEF5FB] flex items-center justify-center border border-brand-blue/5">
                  <FiRepeat className="w-4 h-4 text-[#1597E5]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-dark group-hover:text-brand-blue transition-colors font-sans">
                    Transfer Student
                  </h3>
                  <p className="text-[9px] text-[#A0AEC0] font-semibold mt-0.5 font-sans">
                    Move between sections
                  </p>
                </div>
              </div>
              <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

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
            onClick={() => navigate('/settings/transfer-student')}
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

        {feesLoading ? (
          <div className="text-center py-12 text-xs font-bold text-secondaryText">
            Loading due students...
          </div>
        ) : filteredDueStudents.length > 0 ? (
          <div className="space-y-3">
            {filteredDueStudents.map((item) => {
              const initials = item.name.split(' ').map(n => n[0]).join('').slice(0, 2);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center text-accent-red font-bold text-sm shrink-0 select-none">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#0F172A] leading-tight group-hover:text-[#0088ff] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-secondaryText font-bold mt-0.5">
                        Class {item.class}
                      </p>
                      <span className="inline-block px-2.5 py-0.5 bg-[#EEF5FB] text-[#0088ff] text-[9px] font-black rounded-full mt-1.5 uppercase tracking-wide">
                        {item.admissionNo}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-accent-red">
                      ₹{item.dueAmount.toLocaleString()}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-accent-red/10 text-accent-red text-[8px] font-black rounded-full mt-1 uppercase tracking-wider">
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state card matching Screenshot 2 */
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
        )}
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
            onClick={() => navigate('/settings/search-students')}
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
            onClick={() => navigate('/settings/transfer-student')}
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
