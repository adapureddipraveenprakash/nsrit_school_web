import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiSearch,
  FiBookOpen,
  FiCalendar,
  FiPhone,
  FiEdit2,
  FiHelpCircle,
  FiInbox
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import {
  getStudents,
  getAllFeeRecords,
  getAcademicClasses
} from '../../../services/dataService';

// Normalize a student record from Data Connect into a display-friendly shape
const normalizeStudent = (s) => ({
  id: s.id,
  name: s.fullName || s.name || '',
  classId: s.academicClass?.id || s.academicClassId || '',
  className: s.academicClass?.name || s.className || '',
  sectionId: s.section?.id || s.sectionId || '',
  sectionName: s.section?.name || s.sectionName || '',
  admissionNo: s.studentId || s.admissionNumber || '',
  status: s.isActive !== false && s.status !== 'INACTIVE' ? 'Active' : 'Inactive',
  gender: s.gender || '',
  phone: s.phoneNumber || '',
  branchId: s.branchId || s.branch?.id || '',
  branchName: s.branch?.name || s.branchName || '',
});

const MainAdminStudentRecords = () => {
  const { branches } = useApp();
  const navigate = useNavigate();

  // State variables for fetched data
  const [students, setStudents] = useState([]);
  const [feeRecords, setFeeRecords] = useState([]);
  const [academicClasses, setAcademicClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active'); // Default 'Active' as in screenshot
  const [selectedBranch, setSelectedBranch] = useState(''); // Selected branch name
  const [selectedClass, setSelectedClass] = useState(''); // Selected class name
  const [selectedSection, setSelectedSection] = useState(''); // Selected section (e.g. 'LKG-A')

  // Load all required data globally
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [studentsList, feesList, classesList] = await Promise.all([
          getStudents({ branchId: null, limit: 1000 }),
          getAllFeeRecords({ limit: 1000 }).catch(() => ({ studentFees: [] })),
          getAcademicClasses().catch(() => [])
        ]);

        const normalized = (studentsList || []).map(normalizeStudent);
        setStudents(normalized);
        setFeeRecords(feesList?.studentFees || []);
        setAcademicClasses(classesList || []);

        // Set default branch from data if available, to match "Sontyam" or fallback
        const branchNames = [...new Set(normalized.map(s => s.branchName))].filter(Boolean);
        if (branchNames.includes('Sontyam')) {
          setSelectedBranch('Sontyam');
        } else if (branchNames.length > 0) {
          setSelectedBranch(branchNames[0]);
        } else if (branches && branches.length > 0) {
          setSelectedBranch(branches[0].name);
        }
      } catch (err) {
        console.error('Error loading global students data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [branches]);

  // Map student fees for quick lookups
  const studentFeesMap = useMemo(() => {
    const map = {};
    feeRecords.forEach(record => {
      if (record.student?.id) {
        map[record.student.id] = record;
      }
    });
    return map;
  }, [feeRecords]);

  // Extract unique branches from loaded student data and merge with branches context
  const branchOptions = useMemo(() => {
    const dataBranches = new Set(students.map(s => s.branchName).filter(Boolean));
    if (branches) {
      branches.forEach(b => {
        if (b.name) dataBranches.add(b.name);
      });
    }
    return Array.from(dataBranches).sort();
  }, [students, branches]);

  // Set default class when branch changes
  useEffect(() => {
    if (!selectedBranch) return;
    const branchStudents = students.filter(s => s.branchName === selectedBranch);
    const classes = [...new Set(branchStudents.map(s => s.className))].filter(Boolean);
    if (classes.includes('LKG')) {
      setSelectedClass('LKG');
    } else if (classes.length > 0) {
      setSelectedClass(classes[0]);
    } else {
      setSelectedClass('');
    }
  }, [selectedBranch, students]);

  // Set default section when class changes
  useEffect(() => {
    if (!selectedClass || !selectedBranch) {
      setSelectedSection('');
      return;
    }
    const matchingStudents = students.filter(
      s => s.branchName === selectedBranch && s.className === selectedClass
    );
    const sections = [...new Set(matchingStudents.map(s => s.sectionName))].filter(Boolean);
    
    // Check for composite section name e.g. LKG-A
    const formattedSections = sections.map(sec => `${selectedClass}-${sec}`);
    if (formattedSections.length > 0) {
      setSelectedSection(formattedSections[0]);
    } else {
      setSelectedSection('');
    }
  }, [selectedClass, selectedBranch, students]);

  // Get available classes for class pills (filtered by selected branch)
  const classOptions = useMemo(() => {
    if (!selectedBranch) return [];
    const branchStudents = students.filter(s => s.branchName === selectedBranch);
    return [...new Set(branchStudents.map(s => s.className))].filter(Boolean).sort();
  }, [selectedBranch, students]);

  // Get available sections for section pills (filtered by selected branch and class)
  const sectionOptions = useMemo(() => {
    if (!selectedBranch || !selectedClass) return [];
    const matchingStudents = students.filter(
      s => s.branchName === selectedBranch && s.className === selectedClass
    );
    const sections = [...new Set(matchingStudents.map(s => s.sectionName))].filter(Boolean);
    return sections.map(sec => `${selectedClass}-${sec}`).sort();
  }, [selectedBranch, selectedClass, students]);

  // Apply filters and search queries to get the final list of students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // 1. Search Query (name, admission no, phone)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesAdmission = student.admissionNo.toLowerCase().includes(query);
        const matchesPhone = student.phone.toLowerCase().includes(query);
        if (!matchesName && !matchesAdmission && !matchesPhone) return false;
      }

      // 2. Status/Gender Filter
      if (statusFilter === 'Active' && student.status !== 'Active') return false;
      if (statusFilter === 'Inactive' && student.status !== 'Inactive') return false;
      if (statusFilter === 'Male' && student.gender !== 'Male') return false;
      if (statusFilter === 'Female' && student.gender !== 'Female') return false;

      // 3. Branch Filter
      if (selectedBranch && student.branchName !== selectedBranch) return false;

      // 4. Class Filter
      if (selectedClass && student.className !== selectedClass) return false;

      // 5. Section Filter
      if (selectedSection) {
        // Extract section code from format 'Class-SectionName'
        const expectedSectionName = selectedSection.replace(`${student.className}-`, '');
        if (student.sectionName !== expectedSectionName) return false;
      }

      return true;
    });
  }, [students, search, statusFilter, selectedBranch, selectedClass, selectedSection]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-5 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative select-none font-sans"
      style={{ backgroundColor: '#F4F9FD', minHeight: '100vh' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-white rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <h1 className="text-base font-bold text-slate-800 pr-8 mx-auto">All Students</h1>
      </header>

      {/* Hero Banner Card */}
      <div className="relative rounded-[28px] bg-gradient-to-br from-[#0284c7] to-[#0369a1] p-6 text-white shadow-lg shadow-sky-900/10 overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="mb-1 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">MAIN ADMIN</span>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <h2 className="text-2xl font-black">Global Students</h2>
          <span className="bg-white/20 text-white text-[11px] font-extrabold px-3 py-1 rounded-full backdrop-blur-sm shadow-inner">
            {filteredStudents.length}
          </span>
        </div>

        <p className="text-xs text-white/85 font-medium mt-1 relative z-10">
          Students across every branch
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search name, admission no, parent phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-full shadow-sm focus:outline-none focus:border-sky-500 text-xs font-semibold text-slate-800 placeholder:text-slate-400"
        />
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center">
          <FiSearch className="w-4 h-4 text-sky-500" />
        </div>
      </div>

      {/* Row 1 Filter: Status / Gender */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 select-none">
        {['All', 'Active', 'Inactive', 'Male', 'Female'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === status
                ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-sky-500/20'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Row 2 Filter: Branches */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 select-none border-t border-slate-100 pt-3">
        {branchOptions.map((branchName) => (
          <button
            key={branchName}
            onClick={() => setSelectedBranch(branchName)}
            className={`px-5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
              selectedBranch === branchName
                ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-sky-500/20'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {branchName}
          </button>
        ))}
      </div>

      {/* Row 3 Filter: Classes */}
      {classOptions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 select-none border-t border-slate-100 pt-3">
          {classOptions.map((className) => (
            <button
              key={className}
              onClick={() => setSelectedClass(className)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                selectedClass === className
                  ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-sky-500/20'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {className}
            </button>
          ))}
        </div>
      )}

      {/* Row 4 Filter: Sections */}
      {sectionOptions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 select-none border-t border-slate-100 pt-3">
          {sectionOptions.map((sectionLabel) => (
            <button
              key={sectionLabel}
              onClick={() => setSelectedSection(sectionLabel)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                selectedSection === sectionLabel
                  ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-sky-500/20'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {sectionLabel}
            </button>
          ))}
        </div>
      )}

      {/* Page Roster Summary */}
      <div className="flex justify-between items-center pt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
        <span>PAGE 1 · {filteredStudents.length} TOTAL STUDENTS</span>
      </div>

      {/* Student List */}
      <div className="space-y-4 pt-1">
        {loading ? (
          <div className="bg-white rounded-[24px] border border-slate-100 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-3 min-h-[260px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            <h4 className="text-xs font-bold text-slate-400">Loading student records...</h4>
          </div>
        ) : filteredStudents.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student) => {
              const initials = student.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'ST';
              
              // Get fee status
              const feeRecord = studentFeesMap[student.id];
              const isDue = feeRecord ? feeRecord.remainingAmount > 0 : true;

              return (
                <motion.div
                  layout
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-[28px] border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  {/* Top Row: Avatar, Name and Due Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center font-bold text-sm text-sky-500 select-none">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight leading-tight">
                          {student.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">
                          #{student.admissionNo} · {student.branchName}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ${
                        isDue
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isDue ? 'Due' : 'Paid'}
                    </span>
                  </div>

                  {/* Badges Row: Class and Attendance */}
                  <div className="flex gap-2 mt-4 select-none">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-extrabold text-slate-600">
                      <FiBookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.className} {student.sectionName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-extrabold text-slate-600">
                      <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>0% attendance</span>
                    </div>
                  </div>

                  {/* Phone Row */}
                  {student.phone && (
                    <div className="mt-3.5">
                      <a
                        href={`tel:${student.phone}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-sky-500 hover:text-sky-600 hover:underline cursor-pointer"
                      >
                        <FiPhone className="w-3.5 h-3.5" />
                        <span>{student.phone}</span>
                      </a>
                    </div>
                  )}

                  {/* Divider */}
                  <hr className="border-slate-100 my-4" />

                  {/* Action Buttons Row */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/settings/edit-student/${student.id}`)}
                      className="flex-1 py-2 px-3 border border-sky-100 hover:bg-sky-50/50 text-[#1597E5] rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <FiEdit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => navigate('/settings/correct-attendance')}
                      className="flex-1 py-2 px-3 border border-sky-100 hover:bg-sky-50/50 text-[#1597E5] rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <FiCalendar className="w-3 h-3" />
                      <span>Attendance</span>
                    </button>

                    <button
                      onClick={() => navigate(`/settings/fee-profile/${student.id}`)}
                      className="flex-1 py-2 px-3 border border-amber-100 hover:bg-amber-50/30 text-amber-600 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full border border-current text-[9px] font-extrabold leading-none">?</span>
                      <span>Fees</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="bg-white rounded-[24px] border border-slate-100 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[260px]">
            <FiInbox className="w-8 h-8 text-slate-300" />
            <h4 className="text-xs font-bold text-slate-500">No students found for select filters</h4>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MainAdminStudentRecords;
