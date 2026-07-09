import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiChevronDown, FiX, FiCheckCircle } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getSections, getStudents, updateStudentStatus } from '../../../services/dataService';

const GraduateStudents = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const branchId = user?.branchId || null;

  // Fetch real sections in the branch
  const { data: dbSections = [], loading: loadingSections, refetch: refetchSections } = useDataFetch(
    () => getSections({ branchId }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // Fetch real students in the branch
  const { data: dbStudents = [], loading: loadingStudents, refetch: refetchStudents } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // State hooks
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Filter Class 12 sections
  const class12Sections = useMemo(() => {
    return dbSections.filter(
      s => s.academicClass?.name === '12'
    );
  }, [dbSections]);

  // Filter active Class 12 students
  const class12Students = useMemo(() => {
    return dbStudents.filter(
      s => s.academicClass?.name === '12' && s.status === 'ACTIVE'
    );
  }, [dbStudents]);

  // Auto-select first section when loaded
  useEffect(() => {
    if (class12Sections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(class12Sections[0].id);
    }
  }, [class12Sections, selectedSectionId]);

  // Clear selection when section changes
  useEffect(() => {
    setSelectedStudentIds(new Set());
  }, [selectedSectionId]);

  // Memoized active students in the selected section
  const filteredStudents = useMemo(() => {
    if (!selectedSectionId) return [];
    return class12Students.filter(s => s.sectionId === selectedSectionId);
  }, [class12Students, selectedSectionId]);

  // Handlers for individual and select all checkboxes
  const handleToggleSelectStudent = (id) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  // Graduation mutation submission
  const handleGraduateStudents = async () => {
    if (selectedStudentIds.size === 0 || submitting) return;
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      for (const studentId of selectedStudentIds) {
        await updateStudentStatus({
          studentId,
          status: 'GRADUATED'
        });
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setSelectedStudentIds(new Set());
      refetchStudents();
    } catch (err) {
      console.error('Failed to graduate some students:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loadingSections || loadingStudents;

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
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Graduate Students</h1>
      </header>

      {/* Top curved green header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#23C16B] to-[#2ecc71] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        {/* Subtitle */}
        <div className="mb-2 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">PRINCIPAL · CLASS 12</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10">Graduate Students</h2>
        <p className="text-xs text-white/80 font-medium relative z-10 mb-5">
          Mark Class 12 students as graduated. This cannot be undone.
        </p>

        {/* Multi stats widget inside card */}
        <div className="relative z-10 bg-white/15 border border-white/20 rounded-[20px] p-3 py-3.5 flex justify-between items-center text-center divide-x divide-white/20 select-none">
          <div className="flex-1">
            <p className="text-base font-extrabold">{class12Sections.length}</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Sections</p>
          </div>
          <div className="flex-1">
            <p className="text-base font-extrabold">{class12Students.length}</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Active students</p>
          </div>
          <div className="flex-1">
            <p className="text-base font-extrabold">{selectedStudentIds.size}</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Selected</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
          <div className="w-8 h-8 border-2 border-[#23C16B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-secondaryText font-bold">Loading Class 12 records...</span>
        </div>
      ) : class12Sections.length === 0 ? (
        /* Main body empty state card */
        <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-5 min-h-[300px] select-none">
          {/* Cap Icon in light container */}
          <div className="w-20 h-20 rounded-full bg-[#EBF8FF] border border-[#BEE3F8] flex items-center justify-center text-[#3182CE] relative">
            <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
            <HiOutlineAcademicCap className="w-9 h-9 text-[#1597E5]" />
          </div>

          <div className="space-y-2 max-w-[280px]">
            <h3 className="text-sm font-extrabold text-dark">No Class 12 Sections</h3>
            <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed">
              Create Class 12 sections in Academic Structure first.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section Selector Card */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-6 card-shadow space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-dark block font-sans">
                Select Section
              </label>
              <div className="relative">
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer text-dark font-extrabold"
                >
                  {class12Sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.academicClass?.name || 'Class 12'}-{sec.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Student List Card */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-dark tracking-wide uppercase">Students</h3>
              {filteredStudents.length > 0 && (
                <button
                  onClick={handleToggleSelectAll}
                  className="text-[10px] font-black text-[#1597E5] hover:underline"
                >
                  {selectedStudentIds.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-secondaryText text-xs font-medium font-sans">
                No active students in this section.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                {filteredStudents.map(student => {
                  const isSelected = selectedStudentIds.has(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => handleToggleSelectStudent(student.id)}
                      className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/50 px-2 rounded-xl transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-dark uppercase">{student.fullName || student.name || 'Unknown Student'}</span>
                        <span className="text-[9px] text-[#A0AEC0] font-bold mt-0.5">{student.studentId || 'Admission N/A'}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-[#23C16B] border-[#23C16B] text-white shadow-sm' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Button */}
          {selectedStudentIds.size > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting}
              className="w-full py-4 bg-[#23C16B] hover:bg-[#23C16B]/90 text-white text-xs font-black rounded-[20px] transition-all card-shadow flex items-center justify-center gap-2 active:scale-[0.99] select-none cursor-pointer"
            >
              <HiOutlineAcademicCap className="w-4.5 h-4.5 text-white" />
              <span>Mark {selectedStudentIds.size} Student(s) as Graduated</span>
            </button>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-6 max-w-[400px] w-full card-shadow space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-dark uppercase">Confirm Graduation</h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-secondaryText leading-relaxed font-semibold">
                Are you sure you want to mark <span className="font-extrabold text-dark">{selectedStudentIds.size}</span> student(s) as graduated? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-xs font-black text-secondaryText rounded-[18px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGraduateStudents}
                  className="flex-1 py-3.5 bg-[#23C16B] hover:bg-[#23C16B]/90 text-white text-xs font-black rounded-[18px] transition-colors cursor-pointer"
                >
                  Yes, Graduate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-dark text-white px-6 py-3.5 rounded-full card-shadow flex items-center gap-3 z-50 select-none font-sans text-xs font-bold"
          >
            <FiCheckCircle className="text-emerald-500 w-5 h-5" />
            <span>Students marked as graduated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GraduateStudents;
