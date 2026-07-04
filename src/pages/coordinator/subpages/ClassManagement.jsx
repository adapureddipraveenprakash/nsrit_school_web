import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiBookOpen, FiPlus, FiSearch, FiGrid, FiCheckCircle,
  FiChevronDown, FiX, FiCheck, FiUserCheck, FiInbox
} from 'react-icons/fi';
import { BiTransfer } from 'react-icons/bi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import {
  getCoordinatorStudentsByWing,
  getAcademicClasses,
  getSectionsByClass,
  bulkAssignStudents,
  updateStudentStatus
} from '../../../services/dataService';

const ACADEMIC_CLASSES = [
  { id: 1, name: 'Nursery', category: 'Pre-Primary' },
  { id: 2, name: 'LKG', category: 'Pre-Primary' },
  { id: 3, name: 'UKG', category: 'Pre-Primary' },
  { id: 4, name: '1', category: 'Primary' },
  { id: 5, name: '2', category: 'Primary' },
  { id: 6, name: '3', category: 'Primary' },
  { id: 7, name: '4', category: 'Primary' },
  { id: 8, name: '5', category: 'Primary' },
  { id: 9, name: 'Nursery', category: 'Pre-Primary' },
  { id: 10, name: 'LKG', category: 'Pre-Primary' },
  { id: 11, name: 'UKG', category: 'Pre-Primary' },
  { id: 12, name: '1', category: 'Primary' },
  { id: 13, name: '2', category: 'Primary' },
  { id: 14, name: '3', category: 'Primary' },
  { id: 15, name: '4', category: 'Primary' },
  { id: 16, name: '5', category: 'Primary' },
  { id: 17, name: '6', category: 'Mid School' },
  { id: 18, name: '7', category: 'Mid School' },
  { id: 19, name: '6', category: 'Mid School' },
  { id: 20, name: '7', category: 'Mid School' },
  { id: 21, name: '8', category: 'Higher' },
  { id: 22, name: '9', category: 'Higher' },
  { id: 23, name: '10', category: 'Higher' },
  { id: 24, name: '11', category: 'Higher' },
  { id: 25, name: '12', category: 'Higher' }
];

const ClassManagement = () => {
  const { activeRole, user } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const branchId = user?.branchId || null;
  const wingName = user?.wing || 'PRIMARY';

  const { data: dbClasses = [] } = useDataFetch(
    () => getAcademicClasses({ branchId }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  const finalClasses = useMemo(() => {
    const branchClasses = dbClasses.filter(c => c.branchId === branchId);
    const list = branchClasses.length > 0 ? branchClasses.map(c => ({
      id: c.id,
      name: c.name,
      category: c.wing?.name || 'PRIMARY'
    })) : ACADEMIC_CLASSES;

    const allowedClasses = ['NURSERY', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];
    const seen = new Set();
    const uniqueList = [];
    for (const c of list) {
      const nameKey = c.name.toUpperCase();
      if (!seen.has(nameKey) && allowedClasses.includes(nameKey)) {
        seen.add(nameKey);
        uniqueList.push(c);
      }
    }

    return uniqueList.sort((a, b) => allowedClasses.indexOf(a.name.toUpperCase()) - allowedClasses.indexOf(b.name.toUpperCase()));
  }, [dbClasses]);

  // Coordinator specific selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  const [selectedSectionOption, setSelectedSectionOption] = useState(null);
  const [selectedStatusOption, setSelectedStatusOption] = useState('ACTIVE');
  const [targetSections, setTargetSections] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch real coordinator students
  const { data: rawStudents, loading: studentsLoading, refetch } = useDataFetch(
    activeRole === 'COORDINATOR'
      ? () => getCoordinatorStudentsByWing({ branchId, wing: wingName })
      : null,
    [branchId, wingName, activeRole],
    { defaultValue: [], pollInterval: 30000, skip: activeRole !== 'COORDINATOR' }
  );

  // Fetch target sections for coordinator's wing
  useEffect(() => {
    if (activeRole === 'COORDINATOR' && branchId && targetSections.length === 0) {
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
  }, [activeRole, branchId, targetSections.length, wingName]);

  if (activeRole === 'COORDINATOR') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-[640px] mx-auto animate-fade-in relative select-none"
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
        <div className="flex gap-3 select-none pb-1 items-center flex-wrap">
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
          
          {/* Bulk button pill matching Screenshot 2 */}
          <button
            disabled={selectedIds.length === 0}
            onClick={() => setShowAssignModal(true)}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-[11px] font-extrabold shadow-sm transition-all active:scale-95 ${
              selectedIds.length > 0
                ? 'bg-[#1597E5] text-white border-[#1597E5] cursor-pointer'
                : 'bg-white text-secondaryText border-slate-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <FiGrid className="w-3.5 h-3.5" />
            <span>Bulk ({selectedIds.length})</span>
          </button>

          {/* Status update button */}
          <button
            disabled={selectedIds.length === 0}
            onClick={() => setShowStatusModal(true)}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-[11px] font-extrabold shadow-sm transition-all active:scale-95 ${
              selectedIds.length > 0
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

        {/* Roster Header */}
        <div className="px-1 text-[9px] font-extrabold text-secondaryText tracking-widest uppercase">
          {coordinatorStudents.length} Students · {selectedIds.length} Selected
        </div>

        {/* Students list */}
        {studentsLoading && coordinatorStudents.length === 0 ? (
          <div className="text-center py-12 text-xs font-semibold text-secondaryText">Loading wing students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[260px]">
            <FiInbox className="w-8 h-8 text-secondaryText" />
            <h4 className="text-sm font-extrabold text-dark">No students found</h4>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const isSelected = selectedIds.includes(student.id);
              const namesList = student.name.split(' ');
              const initials = namesList.length > 1 ? `${namesList[0][0]}${namesList[1][0]}` : student.name.charAt(0);

              return (
                <div
                  key={student.id}
                  onClick={() => toggleSelect(student.id)}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    {/* Initials avatar */}
                    <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-brand-blue border border-brand-blue/5 flex items-center justify-center font-bold text-xs select-none">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                        {student.name}
                      </h3>
                      <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                        {student.class} - Section {student.section || 'A'} · {student.admissionNo}
                      </p>
                    </div>
                  </div>

                  {/* Selection Circle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(student.id);
                    }}
                    className="focus:outline-none cursor-pointer shrink-0"
                  >
                    {isSelected ? (
                      <FiCheckCircle className="w-5 h-5 text-brand-blue fill-[#EEF5FB]" />
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-blue-200 block" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

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
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Academic Structure</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        {/* Subtitle */}
        <div className="mb-2 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">PRINCIPAL</span>
        </div>

        {/* Title and Count Badge */}
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <h2 className="text-xl font-bold">Academic Structure</h2>
          <span className="bg-white/20 border border-white/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
            {finalClasses.length}
          </span>
        </div>

        <p className="text-xs text-white/80 font-medium relative z-10 mb-4">
          Classes, wings, and curriculum configuration
        </p>

        {/* Add Section Button inside card */}
        <button
          onClick={() => navigate('/settings/sections')}
          className="relative z-10 inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/15 border border-white/25 px-3.5 py-1.5 rounded-full hover:bg-white/25 transition-all cursor-pointer"
        >
          <span>+ Add Section</span>
        </button>
      </div>

      {/* Vertical list of Class items */}
      <div className="space-y-3 pt-1">
        {finalClasses.map((cls) => {
          return (
            <div
              key={cls.id}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                {/* Academic Hat Icon Container */}
                <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center border border-brand-blue/5">
                  <FiBookOpen className="w-4 h-4 text-[#1597E5]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                    {cls.name}
                  </h3>
                  <p className="text-[9px] text-[#1597E5] font-bold mt-1">
                    {cls.category}
                  </p>
                </div>
              </div>

              {/* Status indicator solid dot */}
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#23C16B]" />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ClassManagement;
