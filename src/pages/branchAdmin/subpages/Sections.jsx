import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiPlus, FiChevronRight, FiLayers, FiX,
  FiCalendar, FiGrid, FiUser, FiInfo, FiLayers as FiSectionsIcon,
  FiCreditCard, FiPhone, FiUserCheck, FiUsers
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import {
  getAcademicClasses,
  getSectionsDetailed,
  createSection
} from '../../../services/dataService';

const Sections = () => {
  const navigate = useNavigate();
  const { user, activeRole } = useApp();
  const branchId = user?.branchId || null;

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // Modal Fields State
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionLetter, setSelectedSectionLetter] = useState('A');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch sections details
  const { data: sectionsData, loading: loadingSections, error: fetchError } = useDataFetch(
    () => getSectionsDetailed({ branchId }),
    [branchId, refreshTrigger],
    { defaultValue: { sections: [], students: [], attendances: [] }, skip: !branchId }
  );

  // Fetch active classes for the creation dropdown list
  const { data: dbClasses = [] } = useDataFetch(
    () => getAcademicClasses({ branchId }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // Class list options for dropdown (deduplicated by class name)
  const classesOptionsList = useMemo(() => {
    const branchClasses = dbClasses.filter(c => c.branchId === branchId);
    const seen = new Set();
    const unique = [];
    branchClasses.forEach(c => {
      const nameKey = c.name.toUpperCase();
      if (!seen.has(nameKey)) {
        seen.add(nameKey);
        unique.push(c);
      }
    });
    const order = ['NURSERY', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];
    return unique.sort((a, b) => order.indexOf(a.name.toUpperCase()) - order.indexOf(b.name.toUpperCase()));
  }, [dbClasses, branchId]);

  // Normalized list of active sections
  const normalizedSections = useMemo(() => {
    const list = sectionsData?.sections || [];
    const studentsList = sectionsData?.students || [];

    const order = ['NURSERY', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];

    return list
      .map(sec => {
        // Calculate student counts per section
        const studentCount = studentsList.filter(s => s.sectionId === sec.id).length;

        // Class teacher details if assigned
        let teacherName = 'Not assigned';
        let teacherPhone = '—';
        let teacherEmpId = '—';
        let assignedOn = '—';
        let assignedBy = '—';

        if (sec.classTeacherAssignments && sec.classTeacherAssignments.length > 0) {
          const assignment = sec.classTeacherAssignments[0];
          const userObj = assignment.teacher?.user;
          teacherName = userObj?.fullName || 'Not assigned';
          teacherPhone = userObj?.phoneNumber || '—';
          teacherEmpId = userObj?.employeeId || assignment.teacher?.employeeId || '—';
          assignedOn = assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-') : '—';
          assignedBy = assignment.assignedBy?.fullName || '—';
        } else if (sec.classTeacher) {
          teacherName = sec.classTeacher.fullName || 'Not assigned';
          teacherPhone = sec.classTeacher.phoneNumber || '—';
          teacherEmpId = sec.classTeacher.employeeId || '—';
        }

        return {
          ...sec,
          studentCount,
          teacherName,
          teacherPhone,
          teacherEmpId,
          assignedOn,
          assignedBy
        };
      })
      .sort((a, b) => {
        const classA = a.academicClass?.name?.toUpperCase() || '';
        const classB = b.academicClass?.name?.toUpperCase() || '';
        const idxA = order.indexOf(classA);
        const idxB = order.indexOf(classB);
        if (idxA !== -1 && idxB !== -1) {
          if (idxA !== idxB) return idxA - idxB;
          return a.name.localeCompare(b.name);
        }
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return classA.localeCompare(classB);
      });
  }, [sectionsData]);

  // Handle section creation
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSectionLetter) {
      setModalError('Please fill in all fields.');
      return;
    }

    try {
      setCreating(true);
      setModalError('');

      const clsObj = classesOptionsList.find(c => c.id === selectedClassId);
      if (!clsObj) {
        throw new Error('Selected class not found');
      }

      await createSection({
        branchId,
        wingId: clsObj.wingId,
        academicClassId: selectedClassId,
        name: selectedSectionLetter,
        academicYear: 2026
      });

      setShowCreateModal(false);
      setSelectedClassId('');
      setSelectedSectionLetter('A');
      setRefreshTrigger(prev => prev + 1);

    } catch (err) {
      console.error('Error creating section:', err);
      setModalError(err.message || 'An error occurred while creating section.');
    } finally {
      setCreating(false);
    }
  };

  if (selectedSection) {
    const displayName = `${selectedSection.academicClass?.name || ''}-${selectedSection.name}`;
    const wingName = selectedSection.academicClass?.wing?.code || selectedSection.academicClass?.wing?.name || 'PRIMARY';
    const roleLabel = activeRole?.toUpperCase() === 'BRANCH_ADMIN' ? 'ADMIN' : (activeRole || 'PRINCIPAL');

    return (
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -15 }}
        transition={{ duration: 0.25 }}
        className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto min-h-screen bg-[#F8FAFC]"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
          <button
            onClick={() => setSelectedSection(null)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto font-sans">Section Details</h1>
        </header>

        {/* Hero Card matching Screenshot 1 */}
        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
          
          <div className="mb-1 relative z-10 select-none">
            <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase font-sans">{roleLabel.toUpperCase()} - SECTION</span>
          </div>

          <h2 className="text-3xl font-black relative z-10 leading-tight font-sans">{displayName}</h2>
          <p className="text-[10px] text-white/80 font-bold relative z-10 mt-0.5 font-sans">Academic year 2026</p>

          {/* Divided stats row */}
          <div className="grid grid-cols-3 gap-2 border-t border-white/20 mt-6 pt-5 text-center relative z-10 font-sans">
            <div>
              <span className="text-base font-black block leading-none">{selectedSection.studentCount}</span>
              <span className="text-[9px] font-bold text-white/75 tracking-wider uppercase mt-1 block">Students</span>
            </div>
            <div className="border-l border-r border-white/15">
              <span className="text-xs font-black block leading-tight truncate px-1">{wingName}</span>
              <span className="text-[9px] font-bold text-white/75 tracking-wider uppercase mt-1 block">Wing</span>
            </div>
            <div>
              <span className={`text-base font-black block leading-none ${selectedSection.teacherName !== 'Not assigned' ? 'text-[#23C16B]' : 'text-white/60'}`}>
                {selectedSection.teacherName !== 'Not assigned' ? '✓' : '—'}
              </span>
              <span className="text-[9px] font-bold text-white/75 tracking-wider uppercase mt-1 block">Class Teacher</span>
            </div>
          </div>
        </div>

        {/* SECTION INFO Card */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden card-shadow font-sans">
          <div className="bg-[#EEF5FB]/40 px-6 py-3.5 border-b border-[#e2e8f0]/60">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              Section Info
            </span>
          </div>
          
          <div className="divide-y divide-[#e2e8f0]/40">
            {/* Class Row */}
            <div className="p-4 px-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center shrink-0 border border-brand-blue/5">
                <FiLayers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-secondaryText tracking-wide uppercase block">Class</span>
                <span className="text-xs font-extrabold text-dark mt-0.5 block">{selectedSection.academicClass?.name}</span>
              </div>
            </div>

            {/* Section Row */}
            <div className="p-4 px-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center shrink-0 border border-brand-blue/5">
                <FiGrid className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-secondaryText tracking-wide uppercase block">Section</span>
                <span className="text-xs font-extrabold text-dark mt-0.5 block">{selectedSection.name}</span>
              </div>
            </div>

            {/* Attendance Row */}
            <div className="p-4 px-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center shrink-0 border border-brand-blue/5">
                <FiCalendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-secondaryText tracking-wide uppercase block">Attendance</span>
                <span className="text-xs font-extrabold text-dark mt-0.5 block">Use attendance reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* CLASS TEACHER Card */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden card-shadow font-sans">
          <div className="bg-[#EEF5FB]/40 px-6 py-3.5 border-b border-[#e2e8f0]/60">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              Class Teacher
            </span>
          </div>
          
          <div className="divide-y divide-[#e2e8f0]/40">
            {/* Name Row */}
            <div className="p-4 px-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center shrink-0 border border-brand-blue/5">
                <FiUser className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-secondaryText tracking-wide uppercase block">Name</span>
                <span className="text-xs font-extrabold text-dark mt-0.5 block">{selectedSection.teacherName}</span>
              </div>
            </div>

            {/* Employee ID Row */}
            <div className="p-4 px-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center shrink-0 border border-brand-blue/5">
                <FiCreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-secondaryText tracking-wide uppercase block">Employee ID</span>
                <span className="text-xs font-extrabold text-dark mt-0.5 block">{selectedSection.teacherEmpId}</span>
              </div>
            </div>

            {/* Mobile Row */}
            <div className="p-4 px-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center shrink-0 border border-brand-blue/5">
                <FiPhone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-secondaryText tracking-wide uppercase block">Mobile</span>
                <span className="text-xs font-extrabold text-dark mt-0.5 block">{selectedSection.teacherPhone}</span>
              </div>
            </div>

            {/* Assigned On Row */}
            <div className="p-4 px-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center shrink-0 border border-brand-blue/5">
                <FiCalendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-secondaryText tracking-wide uppercase block">Assigned On</span>
                <span className="text-xs font-extrabold text-dark mt-0.5 block">{selectedSection.assignedOn}</span>
              </div>
            </div>

            {/* Assigned By Row */}
            <div className="p-4 px-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center shrink-0 border border-brand-blue/5">
                <FiUserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-secondaryText tracking-wide uppercase block">Assigned By</span>
                <span className="text-xs font-extrabold text-dark mt-0.5 block">{selectedSection.assignedBy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/settings/class-teachers')}
          className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95 mt-4"
        >
          <FiUsers className="w-4 h-4" />
          Reassign Class Teacher
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto min-h-screen bg-[#F8FAFC]"
    >
      {/* Curved Blue Header */}
      <div className="relative -mx-4 -mt-4 md:-mx-8 md:-mt-8 rounded-b-[40px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
        
        {/* Back and Subtitle */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-white/15 rounded-full text-white/90 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">PRINCIPAL</span>
        </div>

        {/* Title and Badge */}
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold">Sections</h2>
          <span className="bg-white/25 border border-white/20 rounded-full px-3 py-0.5 text-xs font-bold font-sans">
            {normalizedSections.length}
          </span>
        </div>

        <p className="text-xs text-white/80 font-medium mb-5">2026 academic year</p>

        {/* Create Section Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-6 py-3 bg-white text-[#1597E5] rounded-full font-bold text-xs hover:bg-[#EEF5FB] transition-all cursor-pointer shadow-md active:scale-95"
        >
          <FiPlus className="w-4 h-4 font-bold" />
          <span>Create Section</span>
        </button>
      </div>

      {/* Loading Indicator */}
      {loadingSections && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-secondaryText">Loading sections from database...</span>
        </div>
      )}

      {/* Error Message */}
      {fetchError && (
        <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-4 flex items-center gap-3 text-xs text-accent-red font-bold">
          <FiInfo className="w-4 h-4 shrink-0" />
          <span>Failed to load sections: {fetchError.message}</span>
        </div>
      )}

      {/* Sections List from database */}
      {!loadingSections && (
        <div className="space-y-3.5 pt-2">
          {normalizedSections.map((sec) => {
            const displayName = `${sec.academicClass?.name || ''}–${sec.name}`;
            return (
              <div
                key={sec.id}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow flex items-center justify-between hover:border-[#1597E5]/30 transition-all cursor-pointer relative group"
                onClick={() => setSelectedSection(sec)}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-brand-blue flex items-center justify-center shrink-0 border border-brand-blue/10">
                    <FiSectionsIcon className="w-5 h-5 text-[#1597E5]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-dark group-hover:text-brand-blue transition-colors leading-tight">
                      {displayName}
                    </h3>
                    <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                      {sec.teacherName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-[#1597E5] bg-[#EEF5FB] px-2 py-0.5 rounded-md">
                    <span className="text-sm font-black mr-0.5">{sec.studentCount}</span> students
                  </span>
                  <FiChevronRight className="w-4 h-4 text-secondaryText group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}

          {normalizedSections.length === 0 && (
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-12 text-center card-shadow">
              <span className="text-xs font-bold text-secondaryText">No sections found for this branch. Click "Create Section" to add one.</span>
            </div>
          )}
        </div>
      )}

      {/* Create Section Modal matching Screenshot 2 */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 max-w-sm w-full card-shadow space-y-6"
            >
              <div className="flex justify-between items-center pb-2">
                <h3 className="text-base font-extrabold text-dark">Create Section</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-secondaryText transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {modalError && (
                <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-3 flex items-center gap-2.5 text-[10px] text-accent-red font-bold animate-[shake_0.5s_ease]">
                  <FiInfo className="w-3.5 h-3.5 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Class select dropdown list */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Class</label>
                  <select
                    required
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#EEF5FB]/50 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark cursor-pointer"
                  >
                    <option value="">Select Class</option>
                    {classesOptionsList.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                {/* Section selection dropdown list */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Section</label>
                  <select
                    required
                    value={selectedSectionLetter}
                    onChange={(e) => setSelectedSectionLetter(e.target.value)}
                    className="w-full px-4 py-3 bg-[#EEF5FB]/50 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark cursor-pointer"
                  >
                    {['A', 'B', 'C', 'D'].map(letter => (
                      <option key={letter} value={letter}>{letter}</option>
                    ))}
                  </select>
                </div>

                {/* Academic Year display with Calendar Icon */}
                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value="2026"
                      className="w-full pl-10 pr-4 py-3 bg-[#EEF5FB]/30 border border-[#e2e8f0]/70 rounded-xl text-xs font-semibold text-dark/70 cursor-not-allowed select-none"
                    />
                    <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                  </div>
                </div>

                {/* Cancel and Create Action Buttons Side-by-side (Screenshot 2) */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 border border-[#e2e8f0] text-secondaryText hover:bg-slate-50 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-3 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-xl text-xs font-extrabold shadow-md shadow-brand-blue/20 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    {creating && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Sections;
