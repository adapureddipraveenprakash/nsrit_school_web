import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiSearch, FiInbox, FiChevronRight, FiUserPlus, FiFileText,
  FiRepeat, FiPlus, FiRefreshCw, FiCheck, FiX, FiChevronDown, FiUserCheck,
  FiGrid, FiCalendar, FiPhone, FiMapPin, FiUser, FiTrendingUp, FiDollarSign,
  FiFilter, FiActivity
} from 'react-icons/fi';
import { BiTransfer } from 'react-icons/bi';
import { useApp } from '../../context/AppContext';
import { useDataFetch } from '../../hooks/useDataFetch';
import {
  getStudents,
  getStudentDetails,
  getFeeReports,
  getCoordinatorStudentsByWing,
  getAcademicClasses,
  getSectionsByClass,
  updateStudentStatus,
  bulkAssignStudents
} from '../../services/dataService';

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
  const [statusFilter, setStatusFilter] = useState('All');
  // Multi-view states for Student Management
  const [currentView, setCurrentView] = useState('classList'); // 'classList' | 'classStudents' | 'advancedSearch' | 'studentDetails'
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [dbClasses, setDbClasses] = useState([]);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [prevView, setPrevView] = useState('classList');

  // Advanced Search filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchClassId, setSearchClassId] = useState('All');
  const [searchSectionId, setSearchSectionId] = useState('All');
  const [searchStatus, setSearchStatus] = useState('All');

  // Coordinator specific states
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedSectionOption, setSelectedSectionOption] = useState(null);
  const [selectedStatusOption, setSelectedStatusOption] = useState('ACTIVE');
  const [targetSections, setTargetSections] = useState([]);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Determine which branch to fetch students for
  const branchId = user?.branchId || currentBranchContext?.id || null;
  const isCoordinator = activeRole === 'COORDINATOR';
  const wingName = user?.wing || 'PRIMARY';

  // Fetch real students from Firebase Data Connect
  const { data: rawStudents, loading: studentsLoading, error: studentsError, refetch } = useDataFetch(
    isCoordinator
      ? () => getCoordinatorStudentsByWing({ branchId, wing: wingName })
      : () => getStudents({ branchId, limit: 2000 }),
    [branchId, isCoordinator, wingName],
    { defaultValue: [], pollInterval: 30000 }
  );

  const INITIAL_STUDENTS = useMemo(() => (rawStudents || []).map(normalizeStudent), [rawStudents]);

  // Load active academic classes for the current branch
  useEffect(() => {
    if (!branchId) return;
    getAcademicClasses()
      .then(list => {
        let branchClasses = list.filter(c => c.branchId === branchId);
        // Filter by coordinator's wing
        if (isCoordinator && wingName) {
          branchClasses = branchClasses.filter(c => c.wing?.code?.toUpperCase() === wingName.toUpperCase());
        }
        setDbClasses(branchClasses);
      })
      .catch(err => console.error('Error fetching academic classes:', err));
  }, [branchId, isCoordinator, wingName]);

  // Load detailed student info when selectedStudentId is set
  useEffect(() => {
    if (!selectedStudentId) {
      setStudentDetails(null);
      return;
    }
    const loadDetails = async () => {
      setDetailsLoading(true);
      try {
        const details = await getStudentDetails(selectedStudentId);
        setStudentDetails(details);
      } catch (err) {
        console.error('Error loading student details:', err);
      } finally {
        setDetailsLoading(false);
      }
    };
    loadDetails();
  }, [selectedStudentId]);

  // Load target sections dynamically for bulk assignment dropdown
  useEffect(() => {
    if (isCoordinator && branchId && targetSections.length === 0) {
      const loadBranchSections = async () => {
        try {
          const classes = await getAcademicClasses();
          let branchClasses = classes.filter(c => c.branchId === branchId);
          if (wingName) {
            branchClasses = branchClasses.filter(c => c.wing?.code?.toUpperCase() === wingName.toUpperCase());
          }
          
          const allSections = [];
          await Promise.all(
            branchClasses.map(async (cls) => {
              const classSections = await getSectionsByClass(cls.id);
              classSections.forEach(sec => {
                allSections.push({
                  id: sec.id,
                  name: `${cls.name}-${sec.name}`,
                  classId: cls.id
                });
              });
            })
          );
          allSections.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
          setTargetSections(allSections);
        } catch (err) {
          console.error('Error fetching target sections:', err);
        }
      };
      loadBranchSections();
    }
  }, [isCoordinator, branchId, targetSections.length, wingName]);

  // --- Summary calculations for Student Management view states ---

  // Compute Class Summary with student counts and sections list
  const classSummaryList = useMemo(() => {
    return dbClasses.map(cls => {
      // Find students in this class
      const classStudents = (rawStudents || []).filter(s => s.academicClassId === cls.id);
      const sections = new Set();
      classStudents.forEach(s => {
        if (s.section?.name) sections.add(s.section.name);
      });
      return {
        id: cls.id,
        name: cls.name,
        sortOrder: cls.sortOrder || 0,
        sections: Array.from(sections).sort().join(', ') || 'A', // default section label A if empty
        studentsCount: classStudents.length
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [dbClasses, rawStudents]);

  // Compute roster for the currently selected class
  const classStudentsList = useMemo(() => {
    if (!selectedClassId) return [];
    
    let list = (rawStudents || []).filter(s => s.academicClassId === selectedClassId);

    // Apply search filter
    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter(s => 
        (s.fullName || '').toLowerCase().includes(lower) || 
        (s.studentId || '').toLowerCase().includes(lower)
      );
    }

    // Apply status filter
    if (statusFilter === 'Active') {
      list = list.filter(s => s.isActive !== false && s.status !== 'INACTIVE');
    } else if (statusFilter === 'Inactive') {
      list = list.filter(s => s.isActive === false || s.status === 'INACTIVE');
    }

    return list;
  }, [rawStudents, selectedClassId, search, statusFilter]);

  // Group class students by section
  const studentsBySection = useMemo(() => {
    const map = {};
    classStudentsList.forEach(s => {
      const secName = s.section?.name || 'A'; // fallback to A
      if (!map[secName]) map[secName] = [];
      map[secName].push(s);
    });
    return Object.keys(map).sort().map(key => ({
      sectionName: key,
      items: map[key]
    }));
  }, [classStudentsList]);

  // Advanced Search results
  const searchResults = useMemo(() => {
    if (currentView !== 'advancedSearch') return [];
    
    let list = rawStudents || [];
    
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      list = list.filter(s => 
        (s.fullName || '').toLowerCase().includes(lower) ||
        (s.studentId || '').toLowerCase().includes(lower) ||
        (s.parent?.fullName || '').toLowerCase().includes(lower) ||
        (s.parent?.phoneNumber || '').toLowerCase().includes(lower)
      );
    }
    
    if (searchClassId && searchClassId !== 'All') {
      list = list.filter(s => s.academicClassId === searchClassId);
    }
    
    if (searchSectionId && searchSectionId !== 'All') {
      list = list.filter(s => s.sectionId === searchSectionId);
    }
    
    if (searchStatus && searchStatus !== 'All') {
      const isActive = searchStatus === 'ACTIVE';
      list = list.filter(s => (s.isActive !== false && s.status !== 'INACTIVE') === isActive);
    }
    
    return list;
  }, [rawStudents, searchQuery, searchClassId, searchSectionId, searchStatus, currentView]);

  // Individual student fee summary
  const feeSummary = useMemo(() => {
    if (!studentDetails?.studentFees) return { total: 0, paid: 0, pending: 0 };
    let total = 0;
    let paid = 0;
    let pending = 0;
    studentDetails.studentFees.forEach(f => {
      total += f.totalFee || 0;
      paid += f.paidAmount || 0;
      pending += f.remainingAmount || 0;
    });
    return { total, paid, pending };
  }, [studentDetails]);

  // Individual student attendance summary
  const attendanceSummary = useMemo(() => {
    if (!studentDetails?.attendances) return { percentage: 0, present: 0, absent: 0 };
    const list = studentDetails.attendances;
    const total = list.length;
    const present = list.filter(a => a.status === 'PRESENT').length;
    const absent = list.filter(a => a.status === 'ABSENT').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { percentage, present, absent };
  }, [studentDetails]);

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignSection = async () => {
    if (!selectedSectionOption || selectedStudentIds.length === 0) return;
    setActionLoading(true);
    try {
      await bulkAssignStudents({
        studentIds: selectedStudentIds,
        classId: selectedSectionOption.classId,
        sectionId: selectedSectionOption.id
      });
      setShowAssignModal(false);
      setSelectedStudentIds([]);
      setSelectedSectionOption(null);
      refetch();
    } catch (err) {
      console.error('Error assigning sections:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedStudentIds.length === 0) return;
    setActionLoading(true);
    try {
      await Promise.all(
        selectedStudentIds.map(studentId =>
          updateStudentStatus({ studentId, status: selectedStatusOption })
        )
      );
      setShowStatusModal(false);
      setSelectedStudentIds([]);
      refetch();
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const { data: rawFees, loading: feesLoading } = useDataFetch(
    activeRole === 'ACCOUNTANT' ? () => getFeeReports({ branchId }) : null,
    [branchId, activeRole],
    { defaultValue: null, pollInterval: 15000, skip: activeRole !== 'ACCOUNTANT' }
  );

  const feeStudents = rawFees?.students || [];

  const dueStudents = useMemo(() => {
    const liveMapped = feeStudents.map(s => {
      const activePlans = (s.reportFeePlans || []).filter(fp => fp.isActive !== false);
      let total = 0;
      let paid = 0;

      activePlans.forEach(plan => {
        total += plan.totalAmount || 0;
        const payments = plan.reportFeePayments || [];
        paid += payments
          .filter(p => String(p.status || 'RECORDED').toUpperCase() !== 'REVERSED')
          .reduce((sum, p) => sum + (p.amount || 0), 0);
      });

      const due = Math.max(total - paid, 0);
      const percent = total > 0 ? Math.round((paid / total) * 100) : 0;

      let status = 'Paid';
      if (total > 0) {
        if (percent === 100) status = 'Paid';
        else if (percent > 0) status = 'Partial';
        else status = 'Due';
      }

      return {
        id: s.id,
        name: s.fullName || 'Unknown Student',
        class: `${s.academicClass?.name || '1'}-${s.section?.name || 'A'}`.toUpperCase(),
        admissionNo: s.studentId || 'N/A',
        total,
        due,
        paid,
        percent,
        status
      };
    });

    const mockDueStudents = [
      {
        id: 'mock-student-2',
        name: 'KORADA BHARGAVSAI',
        class: '5-A',
        admissionNo: '26S00002',
        total: 52000,
        due: 47000,
        paid: 5000,
        percent: 10,
        status: 'Partial'
      },
      {
        id: 'mock-student-3',
        name: 'GANDARDDI MANJUSHA',
        class: '4-A',
        admissionNo: '26S00003',
        total: 50000,
        due: 50000,
        paid: 0,
        percent: 0,
        status: 'Due'
      },
      {
        id: 'mock-student-4',
        name: 'GONTHINA POORVESH',
        class: '4-A',
        admissionNo: '26S00004',
        total: 50000,
        due: 50000,
        paid: 0,
        percent: 0,
        status: 'Due'
      }
    ];

    const combined = [...liveMapped];
    mockDueStudents.forEach(mds => {
      if (!combined.some(s => s.admissionNo === mds.admissionNo)) {
        combined.push(mds);
      }
    });

    return combined;
  }, [feeStudents]);

  const filteredDueStudents = useMemo(() => {
    return dueStudents.filter(student =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
      student.class.toLowerCase().includes(search.toLowerCase())
    );
  }, [dueStudents, search]);

  if (activeRole === 'COORDINATOR') {
    const isStudentManagement = location.pathname === '/settings/student-management';

    const coordinatorStudents = INITIAL_STUDENTS;
    const filteredCoStudents = coordinatorStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                            student.class.toLowerCase().includes(search.toLowerCase()) ||
                            student.section.toLowerCase().includes(search.toLowerCase()) ||
                            student.admissionNo.toLowerCase().includes(search.toLowerCase());
      
      if (!isStudentManagement) return matchesSearch;

      let matchesStatus = true;
      if (statusFilter === 'Active') matchesStatus = student.status === 'Active';
      else if (statusFilter === 'Inactive') matchesStatus = student.status === 'Inactive';

      return matchesSearch && matchesStatus;
    });

    if (isStudentManagement) {
      
      // Helper function to format date
      const formatDate = (dateStr) => {
        if (!dateStr) return '–';
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return dateStr;
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          return `${day}-${month}-${year}`;
        } catch {
          return dateStr;
        }
      };

      // ─── VIEW 1: STUDENT DETAILS SCREEN ─────────────────────────────────────
      if (currentView === 'studentDetails') {
        const student = studentDetails?.student;
        const initials = student?.fullName ? student.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'ST';
        const classSectionLabel = student ? `${student.academicClass?.name || ''}-${student.section?.name || ''}` : '';

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto select-none"
          >
            {/* Header */}
            <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
              <button
                onClick={() => setCurrentView(prevView)}
                className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-sm font-extrabold text-dark mx-auto pr-8">Student Details</h1>
            </header>

            {detailsLoading || !student ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Card Banner */}
                <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] via-[#2D9CDB] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
                  <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-full bg-white/25 border border-white/20 flex items-center justify-center font-black text-sm select-none">
                      {initials}
                    </div>
                    <div>
                      <h2 className="text-base font-black tracking-tight leading-tight uppercase">
                        {student.fullName}
                      </h2>
                      <p className="text-[10px] text-white/80 font-bold mt-1">
                        #{student.studentId} · {classSectionLabel}
                      </p>
                    </div>
                  </div>

                  {/* Three Mini Stats */}
                  <div className="grid grid-cols-3 gap-2 border-t border-white/15 pt-4 mt-5 relative z-10 text-center">
                    <div className="space-y-0.5">
                      <span className="text-[14px] font-black block leading-none">{attendanceSummary.percentage}%</span>
                      <span className="text-[8px] text-white/70 font-bold uppercase tracking-wider block">Attendance</span>
                    </div>
                    <div className="space-y-0.5 border-l border-white/15">
                      <span className="text-[14px] font-black block leading-none">Rs {feeSummary.pending.toLocaleString()}</span>
                      <span className="text-[8px] text-white/70 font-bold uppercase tracking-wider block">Fee Due</span>
                    </div>
                    <div className="space-y-0.5 border-l border-white/15">
                      <span className="text-[14px] font-black block leading-none uppercase">{student.status || 'Active'}</span>
                      <span className="text-[8px] text-white/70 font-bold uppercase tracking-wider block">Status</span>
                    </div>
                  </div>

                  {/* Edit Student Button */}
                  <div className="mt-5 relative z-10">
                    <button
                      onClick={() => navigate('/settings/create-student', { state: { editStudentId: student.id } })}
                      className="bg-white hover:bg-slate-50 text-[#1597E5] px-4 py-2 rounded-full text-[10px] font-black shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <FiUserCheck className="w-3.5 h-3.5" />
                      <span>Edit Student</span>
                    </button>
                  </div>
                </div>

                {/* 1. PERSONAL DETAILS */}
                <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
                  <h3 className="text-[10px] font-black text-secondaryText uppercase tracking-wider px-1">
                    Personal Details
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Gender</span>
                        <span className="text-dark font-extrabold block mt-0.5 uppercase">
                          {student.gender || '–'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiCalendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Date of Birth</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          {formatDate(student.dateOfBirth)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiActivity className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Blood Group</span>
                        <span className="text-dark font-extrabold block mt-0.5 uppercase">
                          {student.bloodGroup || '–'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiMapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Address</span>
                        <span className="text-dark font-extrabold block mt-0.5 leading-relaxed">
                          {student.address || '–'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. PARENT DETAILS */}
                <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
                  <h3 className="text-[10px] font-black text-secondaryText uppercase tracking-wider px-1">
                    Parent Details
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Father</span>
                        <span className="text-dark font-extrabold block mt-0.5 uppercase">
                          {student.parent?.fullName || student.parent?.fatherName || '–'} (PARENT)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiPhone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Father Mobile</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          {student.parent?.phoneNumber || '–'}
                        </span>
                      </div>
                    </div>
                    {student.parent?.motherName && (
                      <>
                        <div className="flex items-center gap-3.5 py-3">
                          <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                            <FiUser className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Mother</span>
                            <span className="text-dark font-extrabold block mt-0.5 uppercase">
                              {student.parent.motherName} (PARENT)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3.5 py-3">
                          <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                            <FiPhone className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Mother Mobile</span>
                            <span className="text-dark font-extrabold block mt-0.5">
                              {student.parent.phoneNumber || '–'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. ACADEMIC DETAILS */}
                <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
                  <h3 className="text-[10px] font-black text-secondaryText uppercase tracking-wider px-1">
                    Academic Details
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiGrid className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Class</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          {student.academicClass?.name || '–'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiGrid className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Section</span>
                        <span className="text-dark font-extrabold block mt-0.5 uppercase">
                          {student.section?.name || '–'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Class Teacher</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          {student.section?.classTeacher?.fullName || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiCalendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Admission Date</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          {formatDate(student.admissionDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. ATTENDANCE SUMMARY */}
                <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
                  <h3 className="text-[10px] font-black text-secondaryText uppercase tracking-wider px-1">
                    Attendance Summary
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiTrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Percentage</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          {attendanceSummary.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Present</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          {attendanceSummary.present}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiX className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Absent</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          {attendanceSummary.absent}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. FEE SUMMARY */}
                <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
                  <h3 className="text-[10px] font-black text-secondaryText uppercase tracking-wider px-1">
                    Fee Summary
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiFileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Fee Plan</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          AY 2026
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiDollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Total Fee</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          Rs {feeSummary.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiDollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Paid Amount</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          Rs {feeSummary.paid.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiDollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Pending Amount</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          Rs {feeSummary.pending.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. DOCUMENTS */}
                <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
                  <h3 className="text-[10px] font-black text-secondaryText uppercase tracking-wider px-1">
                    Documents
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiFileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Aadhaar</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          {student.aadhaarNumber || 'Number not provided'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiFileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">APAAR ID</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          Not provided
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiFileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Transfer Certificate</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          {student.transferCertificateUrl ? 'Uploaded' : 'Not uploaded'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue shrink-0">
                        <FiFileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A0AEC0] font-bold uppercase block">Birth Certificate</span>
                        <span className="text-dark font-extrabold block mt-0.5">
                          {student.birthCertificateUrl ? 'Uploaded' : 'Not uploaded'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );
      }

      // ─── VIEW 2: CLASS STUDENTS LIST (ROSTER) SCREEN ───────────────────────
      if (currentView === 'classStudents') {
        const activeClassObj = dbClasses.find(c => c.id === selectedClassId);
        
        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto select-none"
          >
            {/* Header */}
            <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
              <button
                onClick={() => {
                  setCurrentView('classList');
                  setSelectedClassId(null);
                }}
                className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-sm font-extrabold text-dark mx-auto pr-8">Students</h1>
            </header>

            {/* Subheader breadcrumb */}
            <button
              onClick={() => {
                setCurrentView('classList');
                setSelectedClassId(null);
              }}
              className="flex items-center gap-1.5 text-brand-blue text-xs font-black cursor-pointer hover:underline"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>All Classes</span>
            </button>

            {/* Banner card */}
            <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
              
              <div className="flex items-center justify-between mb-1 relative z-10">
                <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">CLASS</span>
              </div>
              <div className="flex items-center justify-between mb-1 relative z-10">
                <h2 className="text-xl font-black uppercase">
                  {activeClassObj?.name || 'Class'}
                </h2>
                <button
                  onClick={() => navigate('/settings/create-student')}
                  className="bg-white hover:bg-slate-50 text-[#1597E5] px-3.5 py-1.5 rounded-full text-[10px] font-black shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                >
                  <span>+ Add Student</span>
                </button>
              </div>
              <p className="text-xs text-white/85 font-medium relative z-10">
                {classStudentsList.length} students enrolled
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, admission no"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
            </div>

            {/* Status Pills */}
            <div className="flex gap-2 select-none pb-1">
              {['All', 'Active', 'Inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black border transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/20'
                      : 'bg-white border-[#e2e8f0] text-[#A0AEC0] hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Grouped list of students by section */}
            <div className="space-y-6">
              {classStudentsList.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4">
                  <FiInbox className="w-8 h-8 text-secondaryText" />
                  <h4 className="text-sm font-extrabold text-dark">No students found</h4>
                </div>
              ) : (
                studentsBySection.map((sectionGroup) => (
                  <div key={sectionGroup.sectionName} className="space-y-3">
                    <div className="flex items-center gap-2 px-1 text-[10px] font-black text-secondaryText uppercase tracking-wider">
                      <FiFileText className="w-3.5 h-3.5" />
                      <span>
                        Section {sectionGroup.sectionName} · {sectionGroup.items.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {sectionGroup.items.map((s) => {
                        const firstLetter = (s.fullName || 'ST').trim().charAt(0);
                        const isInactive = s.isActive === false || s.status === 'INACTIVE';
                        const displayStatus = isInactive ? 'Inactive' : 'Active';

                        return (
                          <div
                            key={s.id}
                            onClick={() => {
                              setSelectedStudentId(s.id);
                              setPrevView('classStudents');
                              setCurrentView('studentDetails');
                            }}
                            className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer relative group active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-[#EEF5FB] text-brand-blue border border-brand-blue/5 flex items-center justify-center font-bold text-xs select-none">
                                {firstLetter}
                              </div>
                              <div>
                                <h3 className="text-xs font-extrabold text-dark leading-tight uppercase group-hover:text-brand-blue transition-colors">
                                  {s.fullName}
                                </h3>
                                <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                                  #{s.studentId || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <span className={`px-2.5 py-1 rounded-lg text-[8px] font-extrabold tracking-wider shrink-0 ${
                              isInactive ? 'bg-red-50 text-[#E53E3E]' : 'bg-[#E8F8F0] text-[#23C16B]'
                            }`}>
                              {displayStatus.toUpperCase()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        );
      }

      // ─── VIEW 3: ADVANCED SEARCH SCREEN ─────────────────────────────────────
      if (currentView === 'advancedSearch') {
        // Collect all sections in the selected search class (if any) or all branch sections
        const searchSections = targetSections.filter(sec => {
          if (searchClassId && searchClassId !== 'All') {
            return sec.classId === searchClassId;
          }
          return true;
        });

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto select-none"
          >
            {/* Header */}
            <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
              <button
                onClick={() => setCurrentView('classList')}
                className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-sm font-extrabold text-dark mx-auto pr-8">Search Students</h1>
            </header>

            {/* Inputs Box */}
            <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
              {/* Search text */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name, admission number, or parent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]/65"
                />
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
              </div>

              {/* Class Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-secondaryText uppercase tracking-wider block">Class</label>
                <select
                  value={searchClassId}
                  onChange={(e) => {
                    setSearchClassId(e.target.value);
                    setSearchSectionId('All'); // Reset section selection when class changes
                  }}
                  className="w-full px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-[16px] text-xs font-bold text-dark focus:outline-none"
                >
                  <option value="All">All Classes</option>
                  {dbClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Section Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-secondaryText uppercase tracking-wider block">Section</label>
                <select
                  value={searchSectionId}
                  onChange={(e) => setSearchSectionId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-[16px] text-xs font-bold text-dark focus:outline-none"
                >
                  <option value="All">All Sections</option>
                  {searchSections.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-secondaryText uppercase tracking-wider block">Status</label>
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-[16px] text-xs font-bold text-dark focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-3">
              <div className="px-1 text-[9px] font-black text-secondaryText uppercase tracking-wider">
                Results ({searchResults.length})
              </div>

              {searchResults.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-3">
                  <FiInbox className="w-8 h-8 text-secondaryText/60" />
                  <h4 className="text-xs font-black text-dark">No results</h4>
                  <p className="text-[10px] text-secondaryText">Try another search or filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((s) => {
                    const firstLetter = (s.fullName || 'ST').trim().charAt(0);
                    const isInactive = s.isActive === false || s.status === 'INACTIVE';
                    const displayStatus = isInactive ? 'Inactive' : 'Active';

                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setPrevView('advancedSearch');
                          setCurrentView('studentDetails');
                        }}
                        className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer relative group active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#EEF5FB] text-brand-blue border border-brand-blue/5 flex items-center justify-center font-bold text-xs select-none">
                            {firstLetter}
                          </div>
                          <div>
                            <h3 className="text-xs font-extrabold text-dark leading-tight uppercase group-hover:text-brand-blue transition-colors">
                              {s.fullName}
                            </h3>
                            <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                              {s.academicClass?.name || 'Class'} – Section {s.section?.name || 'A'} · #{s.studentId || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-[8px] font-extrabold tracking-wider shrink-0 ${
                          isInactive ? 'bg-red-50 text-[#E53E3E]' : 'bg-[#E8F8F0] text-[#23C16B]'
                        }`}>
                          {displayStatus.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        );
      }

      // ─── VIEW 4: MAIN CLASSES LIST (DEFAULT) ────────────────────────────────
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
            <h1 className="text-sm font-extrabold text-dark mx-auto pr-8">Students</h1>
          </header>

          {/* Banner Card */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            <div className="mb-2 relative z-10">
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">MANAGEMENT</span>
            </div>

            <div className="flex items-center justify-between mb-1 relative z-10">
              <h2 className="text-xl font-black">Students</h2>
              <button
                onClick={() => navigate('/settings/create-student')}
                className="bg-white hover:bg-slate-50 text-[#1597E5] px-3.5 py-1.5 rounded-full text-[10px] font-black shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-1"
              >
                <span>+ Add Student</span>
              </button>
            </div>

            <p className="text-xs text-white/85 font-medium relative z-10">
              Admissions, profiles, status, and section transfers
            </p>
          </div>

          {/* Metrics grids */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 text-center card-shadow">
              <span className="text-xl font-black text-brand-blue block">
                {classSummaryList.length}
              </span>
              <span className="text-[10px] text-secondaryText font-bold uppercase tracking-wider block mt-1">
                Classes
              </span>
            </div>
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 text-center card-shadow">
              <span className="text-xl font-black text-brand-blue block">
                {(rawStudents || []).length}
              </span>
              <span className="text-[10px] text-secondaryText font-bold uppercase tracking-wider block mt-1">
                Total Students
              </span>
            </div>
          </div>

          {/* Select Class Header */}
          <div className="px-1 text-[10px] font-black text-secondaryText tracking-widest uppercase">
            Select a Class
          </div>

          {/* Classes Listing */}
          <div className="space-y-3">
            {studentsLoading && classSummaryList.length === 0 ? (
              <div className="text-center py-12 text-xs font-semibold text-secondaryText">Loading...</div>
            ) : classSummaryList.map((cls, idx) => (
              <div
                key={cls.id}
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setCurrentView('classStudents');
                }}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer relative group active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EEF5FB] text-brand-blue border border-brand-blue/5 flex items-center justify-center font-bold text-xs select-none">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-dark leading-tight uppercase group-hover:text-brand-blue transition-colors">
                      {cls.name}
                    </h3>
                    <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                      Sections: {cls.sections}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-brand-blue">
                    {cls.studentsCount} <span className="text-[8px] text-secondaryText font-bold uppercase">students</span>
                  </span>
                  <FiChevronRight className="w-4 h-4 text-secondaryText" />
                </div>
              </div>
            ))}
          </div>

          {/* More Actions Section */}
          <div className="space-y-3 select-none">
            <div className="px-1 text-[10px] font-black text-secondaryText tracking-widest uppercase">
              More Actions
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setCurrentView('advancedSearch')}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center shrink-0">
                    <FiSearch className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-dark leading-tight">Advanced Search</h3>
                    <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                      Find by class, section, status
                    </p>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-secondaryText" />
              </div>

              <div
                onClick={() => navigate('/settings/create-student')}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center shrink-0">
                    <FiUserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-dark leading-tight">Bulk Import</h3>
                    <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                      Upload students via CSV
                    </p>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-secondaryText" />
              </div>

              <div
                onClick={() => navigate('/settings/promotions')}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center shrink-0">
                    <BiTransfer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-dark leading-tight">Transfer Student</h3>
                    <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                      Move between sections
                    </p>
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-secondaryText" />
              </div>
            </div>
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
        className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative animate-fade-in"
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
        <div className="flex gap-3 select-none pb-1 flex-wrap">
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

          {/* Bulk assignment button */}
          <button
            disabled={selectedStudentIds.length === 0}
            onClick={() => setShowAssignModal(true)}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-[11px] font-extrabold shadow-sm transition-all active:scale-95 ${
              selectedStudentIds.length > 0
                ? 'bg-[#1597E5] text-white border-[#1597E5] cursor-pointer'
                : 'bg-white text-secondaryText border-slate-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <FiGrid className="w-3.5 h-3.5 animate-scale-up" />
            <span>Bulk ({selectedStudentIds.length})</span>
          </button>

          {/* Status update button */}
          <button
            disabled={selectedStudentIds.length === 0}
            onClick={() => setShowStatusModal(true)}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-[11px] font-extrabold shadow-sm transition-all active:scale-95 ${
              selectedStudentIds.length > 0
                ? 'bg-white text-[#D97706] border-[#F59E0B]/30 hover:bg-[#FFFBEB] cursor-pointer'
                : 'bg-white text-secondaryText border-slate-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <FiUserCheck className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Status</span>
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
          {coordinatorStudents.length} Students · {selectedStudentIds.length} Selected
        </div>

        {/* Student list grid */}
        <div className="space-y-3">
          {studentsLoading && filteredCoStudents.length === 0 ? (
            <div className="text-center py-12 text-xs font-semibold text-secondaryText">Loading wing students...</div>
          ) : filteredCoStudents.length > 0 ? (
            filteredCoStudents.map((student, idx) => {
              const namesList = student.name.split(' ');
              const initials = namesList.length > 1 ? `${namesList[0][0]}${namesList[1][0]}` : student.name.charAt(0);
              const isSelected = selectedStudentIds.includes(student.id);

              return (
                <div
                  key={student.id}
                  onClick={() => toggleStudentSelection(student.id)}
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
                        {student.class}-{student.section} · #{student.admissionNo}
                      </p>
                    </div>
                  </div>

                  {/* Selection Check Circle */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStudentSelection(student.id);
                    }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[#1597E5] border-[#1597E5] text-white'
                        : 'border-blue-200 bg-white'
                    }`}
                  >
                    {isSelected && <FiCheck className="w-3 h-3" />}
                  </div>
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

        {/* Modal: Bulk Section Assignment */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#F8FAFC] rounded-[32px] p-6 max-w-sm w-full card-shadow space-y-4 relative"
            >
              <h3 className="text-sm font-black text-[#0F172A]">Bulk Section Assignment</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider">Target Section</label>
                
                <div className="relative">
                  <button
                    onClick={() => setShowSectionDropdown(true)}
                    className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-[20px] focus:outline-none flex items-center justify-between text-xs font-semibold text-[#0F172A] cursor-pointer shadow-sm"
                  >
                    <span>
                      {selectedSectionOption ? selectedSectionOption.name : 'Select'}
                    </span>
                    <FiChevronDown className="w-4 h-4 text-secondaryText" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedSectionOption(null);
                  }}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-secondaryText rounded-full cursor-pointer transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading || !selectedSectionOption}
                  onClick={handleAssignSection}
                  className="px-5 py-2.5 bg-[#1597E5] hover:bg-[#1597E5]/90 text-white text-xs font-bold rounded-full cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Update Student Status */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#F8FAFC] rounded-[32px] p-6 max-w-sm w-full card-shadow space-y-4 relative"
            >
              <h3 className="text-sm font-black text-[#0F172A]">Update Student Status</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider">Status</label>
                
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(true)}
                    className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-[20px] focus:outline-none flex items-center justify-between text-xs font-semibold text-[#0F172A] cursor-pointer shadow-sm"
                  >
                    <span>{selectedStatusOption}</span>
                    <FiChevronDown className="w-4 h-4 text-secondaryText" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-secondaryText rounded-full cursor-pointer transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleUpdateStatus}
                  className="px-5 py-2.5 bg-[#1597E5] hover:bg-[#1597E5]/90 text-white text-xs font-bold rounded-full cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bottom Sheet Dropdown Overlay for Target Sections */}
        <AnimatePresence>
          {showSectionDropdown && (
            <div className="fixed inset-0 bg-[#0F172A]/20 z-[100] flex flex-col justify-end animate-fade-in">
              <div className="absolute inset-0" onClick={() => setShowSectionDropdown(false)} />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="bg-white rounded-t-[32px] p-6 max-h-[70vh] overflow-y-auto space-y-4 relative z-10"
              >
                <div className="flex items-center justify-between border-b border-[#e2e8f0]/45 pb-3">
                  <h4 className="text-sm font-extrabold text-dark">Target Section</h4>
                  <button onClick={() => setShowSectionDropdown(false)} className="p-1 hover:bg-[#EEF5FB] rounded-full text-secondaryText transition-all">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {targetSections.map((sec) => (
                    <div
                      key={sec.id}
                      onClick={() => {
                        setSelectedSectionOption(sec);
                        setShowSectionDropdown(false);
                      }}
                      className="py-3 px-4 hover:bg-[#EEF5FB] text-xs font-semibold text-dark rounded-xl cursor-pointer transition-all flex items-center justify-between"
                    >
                      <span className={selectedSectionOption?.id === sec.id ? 'text-[#1597E5]' : 'text-dark'}>{sec.name}</span>
                      {selectedSectionOption?.id === sec.id && <FiCheck className="w-4 h-4 text-[#1597E5]" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Bottom Sheet Dropdown Overlay for Status */}
        <AnimatePresence>
          {showStatusDropdown && (
            <div className="fixed inset-0 bg-[#0F172A]/20 z-[100] flex flex-col justify-end animate-fade-in">
              <div className="absolute inset-0" onClick={() => setShowStatusDropdown(false)} />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="bg-white rounded-t-[32px] p-6 max-h-[70vh] overflow-y-auto space-y-4 relative z-10"
              >
                <div className="flex items-center justify-between border-b border-[#e2e8f0]/45 pb-3">
                  <h4 className="text-sm font-extrabold text-dark">Status</h4>
                  <button onClick={() => setShowStatusDropdown(false)} className="p-1 hover:bg-[#EEF5FB] rounded-full text-secondaryText transition-all">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {['ACTIVE', 'TRANSFERRED', 'GRADUATED', 'DROPPED'].map((statusOption) => (
                    <div
                      key={statusOption}
                      onClick={() => {
                        setSelectedStatusOption(statusOption);
                        setShowStatusDropdown(false);
                      }}
                      className="py-3 px-4 hover:bg-[#EEF5FB] text-xs font-semibold text-dark rounded-xl cursor-pointer transition-all flex items-center justify-between"
                    >
                      <span className={selectedStatusOption === statusOption ? 'text-[#1597E5]' : 'text-dark'}>
                        {statusOption}
                      </span>
                      {selectedStatusOption === statusOption && <FiCheck className="w-4 h-4 text-[#1597E5]" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
        className="p-4 md:p-8 space-y-6 pb-24 max-w-4xl mx-auto select-none animate-fade-in relative bg-[#EEF5FB] min-h-screen"
      >
        {/* Top Header Bar */}
        <header className="flex items-center py-2 border-b border-[#e2e8f0]/40 shrink-0 select-none">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-white rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-black text-dark ml-2">Due Students</h1>
        </header>

        {/* Top curved blue header card */}
        <div className="relative rounded-[28px] bg-gradient-to-br from-[#00A3FF] to-[#0066FF] p-6 text-white card-shadow overflow-hidden">
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
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03)] placeholder:text-[#A0AEC0]"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
        </div>

        {feesLoading ? (
          <div className="text-center py-12 text-xs font-bold text-secondaryText">
            Loading due students...
          </div>
        ) : filteredDueStudents.length > 0 ? (
          <div className="space-y-4">
            {filteredDueStudents.map((item) => {
              const statusColor = item.status.toUpperCase() === 'PARTIAL' 
                ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]/30' 
                : item.status.toUpperCase() === 'PAID'
                ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]/30'
                : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]/30';
              
              const statusDotColor = item.status.toUpperCase() === 'PARTIAL'
                ? 'bg-[#D97706]'
                : item.status.toUpperCase() === 'PAID'
                ? 'bg-[#065F46]'
                : 'bg-[#991B1B]';

              return (
                <div
                  key={item.id}
                  onClick={() => navigate('/settings/ledger', { state: { studentId: item.id } })}
                  className="bg-white rounded-[24px] border-t-4 border-t-amber-500 p-5 card-shadow flex flex-col gap-3.5 hover:border-blue-200 transition-all cursor-pointer group active:scale-[0.99] relative overflow-hidden"
                >
                  {/* Top row: Name + Class + Status Badge */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-black text-[#0F172A] leading-tight uppercase group-hover:text-[#1597E5] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-[#A0AEC0] font-black mt-1 uppercase tracking-wide">
                        {item.class}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                      {item.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#EEF5FB] h-1.5 rounded-full overflow-hidden mt-1 select-none">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${item.percent}%` }} 
                    />
                  </div>

                  {/* Bottom Stats Row */}
                  <div className="flex justify-between items-end mt-1 font-sans text-xs">
                    <div className="flex gap-6 select-none">
                      <div>
                        <span className="text-[8px] font-black text-[#A0AEC0] uppercase tracking-widest block">Paid</span>
                        <p className="text-xs font-black text-[#23C16B] mt-0.5">Rs {item.paid.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-[#A0AEC0] uppercase tracking-widest block">Due</span>
                        <p className="text-xs font-black text-rose-500 mt-0.5">Rs {item.due.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Percent Indicator Badge */}
                    <div className="px-3 py-1 bg-[#EEF5FB] text-[#1597E5] font-black text-[10px] rounded-xl select-none">
                      {item.percent}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state card */
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <div className="w-18 h-18 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/10 relative">
              <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
              <FiInbox className="w-8 h-8 text-brand-blue" />
            </div>
            <div className="space-y-1.5 max-w-[280px]">
              <h4 className="text-xs font-black text-[#0F172A]">No due students</h4>
              <p className="text-[10px] text-secondaryText font-bold">
                All students have paid their outstanding balance!
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
