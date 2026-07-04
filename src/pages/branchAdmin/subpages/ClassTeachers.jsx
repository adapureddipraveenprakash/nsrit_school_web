import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiEdit2, FiTrash2, FiUser, FiInfo, FiLayers, FiInbox, FiFilter, FiCheck, FiX, FiChevronDown, FiBookOpen, FiSliders } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import {
  getClassTeacherAssignments,
  getTeachers,
  assignClassTeacher,
  removeClassTeacherAssignment
} from '../../../services/dataService';

const COORDINATOR_TEACHERS = [
  { id: '26SOTS003', name: 'Raghupatruni Roopakala', role: 'Coordinator', phone: '+918297191669' },
  { id: '26SOTS007', name: 'Samineni Deepika', role: 'Teacher', phone: '+919988776655' },
  { id: '26SOTS014', name: 'Mukka Lavanya', role: 'Teacher', phone: '+919966554433' },
  { id: '26SOTS001', name: 'T. Satish Kumar', role: 'Teacher', phone: '+919876543210' },
  { id: '26SOTS005', name: 'K. Anitha', role: 'Teacher', phone: '+918765432109' },
  { id: '26SOTS006', name: 'P. Lakshmi', role: 'Teacher', phone: '+917654321098' },
  { id: '26SOTS008', name: 'M. Srinivasa Rao', role: 'Teacher', phone: '+916543210987' },
  { id: '26SOTS011', name: 'G. Sravani', role: 'Teacher', phone: '+915432109876' }
];

const MOCK_ASSIGNMENTS = [
  {
    id: 'nursery-a',
    className: 'Nursery',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 9,
    wing: 'PRE_PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '4-a',
    className: '4',
    section: 'A',
    teacherName: 'Samineni Deepika',
    teacherRole: 'Teacher',
    teacherId: '26SOTS007',
    studentsCount: 10,
    wing: 'PRIMARY',
    assignedDate: '19-06-2026',
    assignedBy: 'B. Geetha'
  },
  {
    id: 'lkg-a',
    className: 'LKG',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 19,
    wing: 'PRE_PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '6-a',
    className: '6',
    section: 'A',
    teacherName: 'Mukka Lavanya',
    teacherRole: 'Teacher',
    teacherId: '26SOTS014',
    studentsCount: 7,
    wing: 'MID_SCHOOL',
    assignedDate: '16-06-2026',
    assignedBy: 'B. Geetha'
  },
  {
    id: '5-a',
    className: '5',
    section: 'A',
    teacherName: 'Raghupatruni Roopakala',
    teacherRole: 'Coordinator',
    teacherId: '26SOTS003',
    studentsCount: 5,
    wing: 'PRIMARY',
    assignedDate: '15-06-2026',
    assignedBy: 'B. Geetha'
  },
  {
    id: 'ukg-a',
    className: 'UKG',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 12,
    wing: 'PRE_PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '1-a',
    className: '1',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 15,
    wing: 'PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '2-a',
    className: '2',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 11,
    wing: 'PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '3-a',
    className: '3',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 14,
    wing: 'PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '7-a',
    className: '7',
    section: 'A',
    teacherName: 'T. Satish Kumar',
    teacherRole: 'Teacher',
    teacherId: '26SOTS001',
    studentsCount: 8,
    wing: 'MID_SCHOOL',
    assignedDate: '12-06-2026',
    assignedBy: 'B. Geetha'
  }
];

const TEACHERS_LIST = [
  { name: 'Raghupatruni Roopakala', id: '26SOTS003', role: 'Coordinator' },
  { name: 'Samineni Deepika', id: '26SOTS007', role: 'Teacher' },
  { name: 'Mukka Lavanya', id: '26SOTS014', role: 'Teacher' },
  { name: 'T. Satish Kumar', id: '26SOTS001', role: 'Teacher' },
  { name: 'K. Anitha', id: '26SOTS005', role: 'Teacher' },
  { name: 'P. Lakshmi', id: '26SOTS006', role: 'Teacher' },
  { name: 'M. Srinivasa Rao', id: '26SOTS008', role: 'Teacher' },
  { name: 'G. Sravani', id: '26SOTS011', role: 'Teacher' }
];

const WING_MAPPING = {
  'Nursery': 'PRE_PRIMARY',
  'LKG': 'PRE_PRIMARY',
  'UKG': 'PRE_PRIMARY',
  '1': 'PRIMARY',
  '2': 'PRIMARY',
  '3': 'PRIMARY',
  '4': 'PRIMARY',
  '5': 'PRIMARY',
  '6': 'MID_SCHOOL',
  '7': 'MID_SCHOOL',
  '8': 'MID_SCHOOL',
  '9': 'HIGH_SCHOOL',
  '10': 'HIGH_SCHOOL'
};

const ClassTeachers = () => {
  const navigate = useNavigate();
  const { activeRole } = useApp();
  
  const { currentBranchContext, user } = useApp();
  const branchId = user?.branchId || currentBranchContext?.id || null;
  const isCoordinator = activeRole === 'COORDINATOR';

  // 1. Fetch Class Teacher Assignments (sections + assignments)
  const { data: assignmentData, loading: assignmentsLoading, refetch: refetchAssignments } = useDataFetch(
    isCoordinator && branchId ? () => getClassTeacherAssignments({ branchId, academicYear: 2026 }) : null,
    [branchId, isCoordinator],
    { defaultValue: { sections: [], teacherSectionAssignments: [] }, skip: !isCoordinator || !branchId }
  );

  const sections = assignmentData?.sections || [];
  const teacherSectionAssignments = assignmentData?.teacherSectionAssignments || [];

  // 2. Fetch Teachers in the branch
  const { data: dbTeachers = [], loading: teachersLoading } = useDataFetch(
    isCoordinator && branchId ? () => getTeachers({ branchId, limit: 500 }) : null,
    [branchId, isCoordinator],
    { defaultValue: [], skip: !isCoordinator || !branchId }
  );

  // Coordinator specific state
  const [coSelectedSectionId, setCoSelectedSectionId] = useState('');
  const [coSearch, setCoSearch] = useState('');
  const [coFilter, setCoFilter] = useState('All'); // 'All' | 'Available' | 'Assigned'
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [showAssignConfirmModal, setShowAssignConfirmModal] = useState(false);
  const [selectedTeacherToAssign, setSelectedTeacherToAssign] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Assigned' | 'Unassigned'
  
  // New Assignment Form State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  
  // Inline filters
  const [classFilter, setClassFilter] = useState('All Classes');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [teacherFilter, setTeacherFilter] = useState('All Teachers / Coordinators');

  const selectedSectionObj = useMemo(() => {
    return sections.find(s => s.id === coSelectedSectionId) || null;
  }, [sections, coSelectedSectionId]);

  const alreadyAssignedCount = selectedSectionObj?.classTeacher ? 1 : 0;

  const filteredTeachers = useMemo(() => {
    if (!isCoordinator) return [];
    
    // Normalize teachers
    const teachersList = dbTeachers.map(teacher => {
      const teacherUserId = teacher.userId || teacher.user?.id;
      const assignedSectionObj = teacherUserId 
        ? sections.find(s => s.classTeacherId === teacherUserId) 
        : null;
      const isAssignedToThis = coSelectedSectionId && assignedSectionObj?.id === coSelectedSectionId;

      return {
        ...teacher,
        isAssignedToThis,
        assignedSectionObj
      };
    });

    // Apply search filter
    let result = teachersList.filter(t => {
      const name = t.user?.fullName || '';
      return name.toLowerCase().includes(coSearch.toLowerCase());
    });

    // Apply dropdown filters ('All' | 'Available' | 'Assigned')
    if (coFilter === 'Available') {
      result = result.filter(t => !t.assignedSectionObj);
    } else if (coFilter === 'Assigned') {
      result = result.filter(t => t.assignedSectionObj);
    }

    return result;
  }, [dbTeachers, sections, coSelectedSectionId, coSearch, coFilter, isCoordinator]);

  if (activeRole === 'COORDINATOR') {
    const isSectionSelected = coSelectedSectionId !== '';

    const handleCoAssign = async () => {
      if (!selectedTeacherToAssign || !selectedSectionObj) return;
      setActionLoading(true);
      try {
        const currentAssignment = teacherSectionAssignments.find(
          a => a.sectionId === selectedSectionObj.id
        );

        if (currentAssignment) {
          await removeClassTeacherAssignment({
            assignmentId: currentAssignment.id,
            sectionId: selectedSectionObj.id,
            teacherId: currentAssignment.teacherId,
            branchId,
            sectionAuditId: `sec-rm-${Date.now()}`,
            teacherAuditId: `teach-rm-${Date.now()}`
          });
        }

        await assignClassTeacher({
          sectionId: selectedSectionObj.id,
          teacherId: selectedTeacherToAssign.id,
          teacherUserId: selectedTeacherToAssign.userId,
          branchId,
          sectionAuditId: `sec-add-${Date.now()}`,
          teacherAuditId: `teach-add-${Date.now()}`
        });

        await refetchAssignments();
        setShowAssignConfirmModal(false);
        setSelectedTeacherToAssign(null);
      } catch (err) {
        console.error('Error assigning class teacher:', err);
      } finally {
        setActionLoading(false);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-[640px] mx-auto animate-fade-in relative select-none animate-fade-in-long"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Assign Teachers</h1>
        </header>

        {/* Top curved blue header card */}
        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] to-[#4076FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full border-[16px] border-white/5" />
          <div className="absolute top-[-20px] right-[-20px] w-36 h-36 rounded-full border-[12px] border-white/10" />

          <div className="mb-2 relative z-10">
            <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Coordinator · AY 2026-2027</span>
          </div>

          <h2 className="text-xl font-bold mb-1 relative z-10">Assign Teachers</h2>
          <p className="text-xs text-white/85 font-medium relative z-10">
            Select a section, then pick an available teacher
          </p>
        </div>

        {/* Select Section block */}
        <div className="space-y-1.5">
          <label className="text-[10.5px] font-black text-[#0F172A] uppercase tracking-wide block">
            Select Section
          </label>
          <div className="relative">
            <button
              onClick={() => setShowSectionDropdown(true)}
              className="w-full px-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] text-xs font-semibold text-dark flex items-center justify-between focus:outline-none focus:border-brand-blue"
            >
              <span>
                {selectedSectionObj
                  ? `${selectedSectionObj.academicClass?.name} - ${selectedSectionObj.name} (${selectedSectionObj.academicClass?.wing?.code || 'N/A'})`
                  : 'Choose a section...'}
              </span>
              <FiChevronDown className="w-4 h-4 text-[#A0AEC0]" />
            </button>
          </div>
          
          {selectedSectionObj && (
            <div className="flex items-center gap-2 mt-2 px-4 py-2.5 bg-[#F8FAFC] border border-[#e2e8f0]/45 rounded-2xl text-[9px] font-black text-secondaryText uppercase tracking-wide select-none">
              <FiBookOpen className="w-3.5 h-3.5 text-[#1E56EC]" />
              <span>
                Wing: {selectedSectionObj.academicClass?.wing?.name || 'N/A'} · Class Teacher: {selectedSectionObj.classTeacher?.fullName || 'Not Assigned'}
              </span>
            </div>
          )}
        </div>

        {/* Search bar + filter button */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search teachers..."
              value={coSearch}
              onChange={(e) => setCoSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1.5 px-5 py-3.5 border border-[#1597E5] text-[#1597E5] rounded-[20px] text-xs font-bold bg-[#EEF5FB]/30 hover:bg-[#EEF5FB]/70 transition-all select-none cursor-pointer"
            >
              <FiSliders className="w-3.5 h-3.5" />
              <span>{coFilter}</span>
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-[#e2e8f0] rounded-2xl shadow-lg py-2 z-30">
                {['All', 'Available', 'Assigned'].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setCoFilter(f);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-all ${
                      coFilter === f ? 'text-brand-blue bg-[#EEF5FB]' : 'text-dark hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* List Header */}
        <div className="flex justify-between px-1 text-[9px] font-extrabold text-secondaryText tracking-widest uppercase">
          <span>{filteredTeachers.length} teachers</span>
          {isSectionSelected && (
            <span className="text-[#D97706]">
              {alreadyAssignedCount} already assigned to this section
            </span>
          )}
        </div>

        {/* Teachers list or Empty State */}
        {assignmentsLoading || teachersLoading ? (
          <div className="text-center py-12 text-xs font-bold text-secondaryText">Loading...</div>
        ) : filteredTeachers.length > 0 ? (
          <div className="space-y-3">
            {filteredTeachers.map((teacher) => {
              const teacherName = teacher.user?.fullName || 'Unnamed Teacher';
              const namesList = teacherName.split(' ');
              const initials = namesList.length > 1 ? `${namesList[0][0]}${namesList[1][0]}` : teacherName.charAt(0);
              
              return (
                <div
                  key={teacher.id}
                  className={`bg-white rounded-[24px] border p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all group ${
                    teacher.isAssignedToThis ? 'border-[#23C16B]/50' : 'border-[#e2e8f0]/45'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-brand-blue border border-brand-blue/5 flex items-center justify-center font-bold text-xs select-none">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                        {teacherName}
                      </h3>
                      <p className="text-[9px] text-[#A0AEC0] font-bold mt-1 uppercase">
                        {teacher.designation || 'Teacher'} · #{teacher.employeeId || teacher.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  {teacher.isAssignedToThis ? (
                    <span className="px-2.5 py-1 bg-[#E8F8F0] text-[#23C16B] text-[8px] font-extrabold rounded-lg uppercase tracking-wider flex items-center gap-1">
                      <FiCheck className="w-3 h-3" /> Assigned
                    </span>
                  ) : teacher.assignedSectionObj ? (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-500 text-[8px] font-extrabold rounded-lg uppercase tracking-wider">
                      Assigned to {teacher.assignedSectionObj.academicClass?.name}-{teacher.assignedSectionObj.name} ({teacher.assignedSectionObj.academicClass?.wing?.code || 'N/A'})
                    </span>
                  ) : (
                    <button
                      disabled={!isSectionSelected}
                      onClick={() => {
                        setSelectedTeacherToAssign(teacher);
                        setShowAssignConfirmModal(true);
                      }}
                      className={`px-3.5 py-1.5 text-[10px] font-extrabold rounded-full transition-all ${
                        isSectionSelected
                          ? 'bg-[#EEF5FB] hover:bg-brand-blue hover:text-white text-brand-blue cursor-pointer'
                          : 'bg-[#EEF5FB]/50 text-brand-blue/40 cursor-not-allowed'
                      }`}
                    >
                      Assign
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[260px] select-none animate-fade-in">
            <div className="w-18 h-18 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] border border-brand-blue/10">
              <FiInbox className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-dark">No teachers found</h4>
              <p className="text-[10.5px] text-secondaryText font-bold">
                {isSectionSelected 
                  ? 'Try a different search term.'
                  : 'Please select a section above to view available teachers.'
                }
              </p>
            </div>
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
                  <h4 className="text-sm font-extrabold text-dark">Select Section</h4>
                  <button onClick={() => setShowSectionDropdown(false)} className="p-1 hover:bg-[#EEF5FB] rounded-full text-secondaryText transition-all">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div
                    onClick={() => {
                      setCoSelectedSectionId('');
                      setShowSectionDropdown(false);
                    }}
                    className="py-3 px-4 hover:bg-[#EEF5FB] text-xs font-semibold text-dark rounded-xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className={coSelectedSectionId === '' ? 'text-[#1597E5]' : 'text-dark'}>Choose a section...</span>
                    {coSelectedSectionId === '' && <FiCheck className="w-4 h-4 text-[#1597E5]" />}
                  </div>
                  {sections.map((sec) => {
                    const secLabel = `${sec.academicClass?.name} - ${sec.name} (${sec.academicClass?.wing?.code || 'N/A'})`;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => {
                          setCoSelectedSectionId(sec.id);
                          setShowSectionDropdown(false);
                        }}
                        className="py-3 px-4 hover:bg-[#EEF5FB] text-xs font-semibold text-dark rounded-xl cursor-pointer transition-all flex items-center justify-between"
                      >
                        <span className={coSelectedSectionId === sec.id ? 'text-[#1597E5]' : 'text-dark'}>{secLabel}</span>
                        {coSelectedSectionId === sec.id && <FiCheck className="w-4 h-4 text-[#1597E5]" />}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Confirm Assign Class Teacher */}
        <AnimatePresence>
          {showAssignConfirmModal && (
            <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[32px] p-6 max-w-sm w-full card-shadow space-y-4 relative"
              >
                <h3 className="text-sm font-extrabold text-dark">Assign Class Teacher</h3>
                <p className="text-xs text-secondaryText leading-relaxed">
                  Are you sure you want to assign <strong>{selectedTeacherToAssign?.user?.fullName}</strong> as the Class Teacher for <strong>{selectedSectionObj?.academicClass?.name} - {selectedSectionObj?.name}</strong>?
                </p>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => {
                      setShowAssignConfirmModal(false);
                      setSelectedTeacherToAssign(null);
                    }}
                    className="px-4 py-2 border rounded-full text-xs font-bold text-secondaryText hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={handleCoAssign}
                    className="px-5 py-2 bg-brand-blue text-white rounded-full text-xs font-bold shadow-md hover:bg-brand-blue/90 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {actionLoading ? 'Assigning...' : 'Confirm'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Submit new assignment
  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection || !selectedTeacherId) return;

    const teacher = TEACHERS_LIST.find((t) => t.id === selectedTeacherId);
    if (!teacher) return;

    // Check if section exists in list
    const existingIdx = assignments.findIndex(
      (a) => a.className === selectedClass && a.section === selectedSection
    );

    const updated = [...assignments];
    if (existingIdx > -1) {
      // Update existing section assignment
      updated[existingIdx] = {
        ...updated[existingIdx],
        teacherName: teacher.name,
        teacherRole: teacher.role,
        teacherId: teacher.id,
        assignedDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        assignedBy: 'B. Geetha'
      };
    } else {
      // Add new section
      const wing = WING_MAPPING[selectedClass] || 'PRIMARY';
      updated.push({
        id: `${selectedClass}-${selectedSection}`.toLowerCase(),
        className: selectedClass,
        section: selectedSection,
        teacherName: teacher.name,
        teacherRole: teacher.role,
        teacherId: teacher.id,
        studentsCount: 10,
        wing: wing,
        assignedDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        assignedBy: 'B. Geetha'
      });
    }

    setAssignments(updated);
    
    // Clear inputs
    setSelectedClass('');
    setSelectedSection('');
    setSelectedTeacherId('');
  };

  // Remove assignment
  const handleRemove = (id) => {
    setAssignments(
      assignments.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            teacherName: '',
            teacherRole: '',
            teacherId: '',
            assignedDate: '',
            assignedBy: ''
          };
        }
        return a;
      })
    );
  };

  // Edit assignment: populate form controls
  const handleEdit = (a) => {
    setSelectedClass(a.className);
    setSelectedSection(a.section);
    if (a.teacherId) {
      setSelectedTeacherId(a.teacherId);
    }
    // Scroll smoothly to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered logic
  const filtered = assignments.filter((a) => {
    // Tab filters
    if (filterTab === 'Assigned' && !a.teacherName) return false;
    if (filterTab === 'Unassigned' && a.teacherName) return false;

    // Search bar matching
    const searchLower = search.toLowerCase();
    const matchesSearch =
      a.className.toLowerCase().includes(searchLower) ||
      a.section.toLowerCase().includes(searchLower) ||
      (a.teacherName && a.teacherName.toLowerCase().includes(searchLower));

    // Inline select dropdown filters
    const matchesClass = classFilter === 'All Classes' || a.className === classFilter.replace('Class ', '');
    const matchesSection = sectionFilter === 'All Sections' || a.section === sectionFilter.replace('Section ', '');
    
    let matchesTeacher = true;
    if (teacherFilter !== 'All Teachers / Coordinators') {
      matchesTeacher = a.teacherName === teacherFilter;
    }

    return matchesSearch && matchesClass && matchesSection && matchesTeacher;
  });

  const assignedCount = assignments.filter((a) => a.teacherName).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Centered Page Header */}
      <div className="relative flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-dark tracking-tight absolute left-1/2 -translate-x-1/2">
          Class Teachers
        </h1>
        <div className="w-9 h-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Assignment Form Card matching Screenshot 2 */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-widest block">
              New Assignment
            </span>

            <form onSubmit={handleAssign} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Class */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Class
                  </label>
                  <select
                    required
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option value="">Select</option>
                    <option>Nursery</option>
                    <option>LKG</option>
                    <option>UKG</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                    <option>7</option>
                    <option>8</option>
                    <option>9</option>
                    <option>10</option>
                  </select>
                </div>

                {/* Section */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Section
                  </label>
                  <select
                    required
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option value="">Select</option>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </div>

                {/* Teacher */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Teacher
                  </label>
                  <select
                    required
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option value="">Select</option>
                    {TEACHERS_LIST.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit button placed at the end of the form */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs transition-all shadow-md shadow-brand-blue/10 active:scale-[0.99] cursor-pointer"
              >
                Assign Class Teacher
              </button>
            </form>
          </div>

          {/* List Section Title */}
          <div className="space-y-4">
            <div className="px-1 flex justify-between items-center text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              <span>Class Teacher Overview</span>
              <span>{assignments.length} Sections</span>
            </div>

            {/* Search filter matches Screenshot 2 */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search teacher, class, section"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-full card-shadow focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText/60"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            </div>

            {/* Assigned Status Pills */}
            <div className="flex gap-2">
              {['All', 'Assigned', 'Unassigned'].map((tab) => {
                const isActive = filterTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-brand-blue/15'
                        : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Filters block matching Screenshot 2/3 */}
            <div className="bg-white rounded-[24px] p-5 card-shadow border border-[#e2e8f0]/40 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Filter By Class */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Filter By Class
                  </label>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl text-xs font-bold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option>All Classes</option>
                    <option>Nursery</option>
                    <option>LKG</option>
                    <option>UKG</option>
                    <option>Class 1</option>
                    <option>Class 2</option>
                    <option>Class 3</option>
                    <option>Class 4</option>
                    <option>Class 5</option>
                    <option>Class 6</option>
                    <option>Class 7</option>
                    <option>Class 8</option>
                    <option>Class 9</option>
                    <option>Class 10</option>
                  </select>
                </div>

                {/* Filter By Section */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Filter By Section
                  </label>
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl text-xs font-bold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option>All Sections</option>
                    <option>Section A</option>
                    <option>Section B</option>
                    <option>Section C</option>
                  </select>
                </div>

                {/* Filter By Teacher */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Filter By Teacher
                  </label>
                  <select
                    value={teacherFilter}
                    onChange={(e) => setTeacherFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl text-xs font-bold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option>All Teachers / Coordinators</option>
                    {TEACHERS_LIST.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Assignments List Grid */}
            <div className="space-y-3">
              <div className="px-1 text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
                Assignments
              </div>

              {filtered.map((a) => {
                const isAssigned = !!a.teacherName;
                return (
                  <div
                    key={a.id}
                    className={`bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden flex transition-all hover:shadow-md ${
                      isAssigned ? 'border-l-[6px] border-l-[#23C16B]' : 'border-l-[6px] border-l-[#FF9F1C]'
                    }`}
                  >
                    <div className="flex-1 p-5 flex items-start gap-4">
                      {/* Left status badge icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isAssigned ? 'bg-[#E8F8F0] text-[#23C16B]' : 'bg-[#FFF8EE] text-[#FF9F1C]'
                      }`}>
                        <FiUser className="w-5 h-5" />
                      </div>

                      {/* Main card description */}
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-dark">
                            {a.className}-{a.section}
                          </h3>
                          <span className={`text-[10px] font-bold ${isAssigned ? 'text-[#1597E5]' : 'text-[#FF9F1C]'}`}>
                            {isAssigned ? a.teacherName + ` (${a.teacherRole})` : 'Not assigned'}
                          </span>
                        </div>

                        <p className="text-[10px] text-[#A0AEC0] font-bold">
                          {a.studentsCount} students · Wing: {a.wing}
                        </p>

                        {isAssigned ? (
                          <div className="space-y-1.5 pt-2">
                            <p className="text-[10px] text-secondaryText font-medium">
                              Additional Roles: Class Teacher
                            </p>
                            <p className="text-[9px] text-[#A0AEC0] font-bold">
                              ID: {a.teacherId} · Assigned {a.assignedDate} by {a.assignedBy}
                            </p>
                            
                            {/* Actions panel */}
                            <div className="flex items-center gap-4 pt-2 select-none">
                              <button
                                onClick={() => handleEdit(a)}
                                className="flex items-center gap-1 text-[10px] font-extrabold text-[#1597E5] hover:text-[#00A1FF] transition-colors cursor-pointer"
                              >
                                <FiEdit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemove(a.id)}
                                className="flex items-center gap-1 text-[10px] font-extrabold text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-[#FF9F1C] font-semibold pt-1">
                            No class teacher assigned
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          {/* Blue Hero card matching Screenshot 2 */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Principal</p>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-bold">Class Teacher Assignment</h2>
              <span className="bg-white/20 border border-white/25 px-2.5 py-0.5 rounded-full text-xs font-bold font-sans">
                {assignments.length}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1 font-semibold leading-relaxed">
              View, assign, edit, and remove class teachers.
            </p>
          </div>

          {/* Quick Stats overview panel card */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block">
              Assignment Overview
            </span>
            <div className="divide-y divide-[#e2e8f0]/80">
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Total Sections</span>
                <span className="text-dark font-extrabold">{assignments.length}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Assigned</span>
                <span className="text-accent-green font-extrabold">{assignedCount} Sections</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Unassigned</span>
                <span className="text-[#FF9F1C] font-extrabold">{assignments.length - assignedCount} Sections</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Coverage Rate</span>
                <span className="text-brand-blue font-extrabold">
                  {Math.round((assignedCount / assignments.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClassTeachers;
