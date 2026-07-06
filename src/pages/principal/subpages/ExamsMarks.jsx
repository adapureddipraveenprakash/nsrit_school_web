import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiPlus,
  FiCheckCircle,
  FiSave,
  FiAward,
  FiBook,
  FiMenu,
  FiInfo,
  FiX,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { db } from '../../../services/firebase';
import { doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { getStudents } from '../../../services/dataService';

const EXAM_TYPES = [
  'Unit Test',
  'Monthly Test',
  'Quarterly',
  'Half Yearly',
  'Pre-Final',
  'Annual',
  'Custom'
];

const DEFAULT_EXAMS = [
  { id: '1', name: 'Term 1 Examination', type: 'Half Yearly', startDate: '2026-07-10', endDate: '2026-07-20', remarks: 'Major exam', status: 'PUBLISHED' },
  { id: '2', name: 'Weekly Test 1', type: 'Unit Test', startDate: '2026-06-15', endDate: '2026-06-18', remarks: 'Regular test', status: 'DRAFT' }
];

const ExamsMarks = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const branchId = user?.branchId || 'sontyam-branch-id';

  // Navigation / View State: 'list' | 'create' | 'entry'
  const [view, setView] = useState('list');

  // Database States
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Error simulation for Screenshot 3 (Failed to load exams)
  const [loadError, setLoadError] = useState(true); // Default true to show mockup Screenshot 3 error first

  // Selected Exam for grades entry
  const [activeExam, setActiveExam] = useState(null);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [marksState, setMarksState] = useState({});
  const [success, setSuccess] = useState(false);

  // List filter state: 'All' | 'Draft' | 'Published' | 'Archived'
  const [listFilter, setListFilter] = useState('All');

  // Create Exam form states
  const [examNameInput, setExamNameInput] = useState('');
  const [examTypeInput, setExamTypeInput] = useState('Unit Test');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [remarksInput, setRemarksInput] = useState('');

  // 1. Subscribe to exams from Firestore
  useEffect(() => {
    if (!branchId) return;
    const docRef = doc(db, 'exams', branchId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setExams(snapshot.data().list || []);
      } else {
        // Fallback or seed initial default values
        setExams(DEFAULT_EXAMS);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error loading exams:', err);
      setLoading(false);
    });
    return unsubscribe;
  }, [branchId]);

  // 2. Fetch actual branch students
  useEffect(() => {
    if (!branchId) return;
    const loadStudents = async () => {
      try {
        const list = await getStudents({ branchId, limit: 200 });
        setStudents(list);
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };
    loadStudents();
  }, [branchId]);

  // 3. Load exam marks when exam, class or subject changes
  useEffect(() => {
    if (!activeExam || !selectedClass || !selectedSubject) return;
    const loadMarks = async () => {
      try {
        const docId = `${branchId}_${activeExam.id}_${selectedClass}_${selectedSubject}`;
        const docRef = doc(db, 'exam_marks', docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMarksState(docSnap.data().marks || {});
        } else {
          setMarksState({});
        }
      } catch (err) {
        console.error('Error loading marks:', err);
      }
    };
    loadMarks();
  }, [activeExam, selectedClass, selectedSubject, branchId]);

  // Filter exams by tab status
  const filteredExams = useMemo(() => {
    if (listFilter === 'All') return exams;
    return exams.filter(e => e.status?.toUpperCase() === listFilter.toUpperCase());
  }, [exams, listFilter]);

  // Group classes dynamically from students list
  const classesList = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      const clsName = s.academicClass?.name;
      if (clsName) set.add(clsName);
    });
    return ['All', ...Array.from(set)];
  }, [students]);

  // Filter students for marks sheet
  const filteredStudents = useMemo(() => {
    if (selectedClass === 'All') return students;
    return students.filter(s => s.academicClass?.name === selectedClass);
  }, [students, selectedClass]);

  const publishedCount = useMemo(() => exams.filter(e => e.status === 'PUBLISHED').length, [exams]);
  const draftCount = useMemo(() => exams.filter(e => e.status === 'DRAFT').length, [exams]);

  // Handle mock error retry
  const handleRetryLoad = () => {
    setLoading(true);
    setTimeout(() => {
      setLoadError(false);
      setLoading(false);
    }, 800);
  };

  // Create new exam
  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!examNameInput) return;

    setActionLoading(true);
    const newExam = {
      id: String(Date.now()),
      name: examNameInput.trim(),
      type: examTypeInput,
      startDate: startDateInput || new Date().toISOString().split('T')[0],
      endDate: endDateInput || new Date().toISOString().split('T')[0],
      remarks: remarksInput.trim(),
      status: 'DRAFT'
    };

    const updatedList = [newExam, ...exams];
    try {
      const docRef = doc(db, 'exams', branchId);
      await setDoc(docRef, { branchId, list: updatedList, updatedAt: new Date().toISOString() });
      setExams(updatedList);
      
      // Reset form & go back to list
      setExamNameInput('');
      setStartDateInput('');
      setEndDateInput('');
      setRemarksInput('');
      setExamTypeInput('Unit Test');
      setView('list');
    } catch (err) {
      console.error('Error creating exam:', err);
      alert('Failed to create exam.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Publish Status of an Exam
  const handleTogglePublishExam = async (examObj) => {
    const newStatus = examObj.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const updatedList = exams.map(e => e.id === examObj.id ? { ...e, status: newStatus } : e);
    
    setActionLoading(true);
    try {
      const docRef = doc(db, 'exams', branchId);
      await setDoc(docRef, { branchId, list: updatedList, updatedAt: new Date().toISOString() });
      setExams(updatedList);
      if (activeExam?.id === examObj.id) {
        setActiveExam(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error toggling exam status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Save marks sheet
  const handleSaveMarks = async (e) => {
    e.preventDefault();
    if (!activeExam) return;

    setActionLoading(true);
    try {
      const docId = `${branchId}_${activeExam.id}_${selectedClass}_${selectedSubject}`;
      const docRef = doc(db, 'exam_marks', docId);
      await setDoc(docRef, {
        examId: activeExam.id,
        class: selectedClass,
        subject: selectedSubject,
        marks: marksState,
        updatedAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving marks:', err);
      alert('Failed to save grades.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkChange = (studentId, value) => {
    const parsedVal = parseInt(value, 10);
    if (parsedVal < 0 || parsedVal > 100) return;

    setMarksState(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-16">

      {/* ─── A. EXAMS LIST VIEW (Screenshot 3) ─── */}
      {view === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 md:p-8 space-y-6 max-w-[640px] mx-auto select-none"
        >
          {/* Main Top Header card with Menu & Plus icons */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
            
            <div className="flex justify-between items-start z-10 relative">
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5 cursor-pointer">
                  <FiMenu className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h2 className="text-xl font-bold">Exams & Marks</h2>
                  <p className="text-[10px] text-white/70 font-semibold mt-0.5">
                    Schedule exams and record grades
                  </p>
                </div>
              </div>

              {/* Add Exam Plus Button */}
              <button
                onClick={() => setView('create')}
                className="w-10 h-10 rounded-full bg-white/15 border border-white/20 hover:bg-white/25 flex items-center justify-center cursor-pointer transition-colors"
              >
                <FiPlus className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-6 mt-4 border-t border-white/10 text-center">
              <div>
                <p className="text-base font-extrabold">{exams.length}</p>
                <p className="text-[8px] text-white/75 font-bold uppercase tracking-wider mt-0.5">Total Exams</p>
              </div>
              <div>
                <p className="text-base font-extrabold text-emerald-300">{publishedCount}</p>
                <p className="text-[8px] text-white/75 font-bold uppercase tracking-wider mt-0.5">Published</p>
              </div>
              <div>
                <p className="text-base font-extrabold text-amber-300">{draftCount}</p>
                <p className="text-[8px] text-white/75 font-bold uppercase tracking-wider mt-0.5">Drafts</p>
              </div>
            </div>
          </div>

          {/* Filter Status Tabs (Screenshot 3 style) */}
          <div className="flex gap-2.5 px-0.5 select-none overflow-x-auto">
            {['All', 'Draft', 'Published', 'Archived'].map((tab) => (
              <button
                key={tab}
                onClick={() => setListFilter(tab)}
                className={`py-2 px-6 rounded-full text-[10.5px] font-black border transition-all cursor-pointer ${
                  listFilter === tab
                    ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-sm'
                    : 'bg-white border-blue-100 text-secondaryText hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mock Error State (Screenshot 3 replication) */}
          {loadError ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[28px] border border-red-100 p-8 card-shadow flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100/60">
                <FiAlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-dark">Failed to load exams</h3>
                <p className="text-[10px] text-secondaryText font-bold">Pull down to retry</p>
              </div>
              <button
                onClick={handleRetryLoad}
                disabled={loading}
                className="px-8 py-2.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white text-xs font-black rounded-full transition-all active:scale-95 shadow-md shadow-[#1597E5]/20 cursor-pointer flex items-center gap-1.5"
              >
                {loading ? (
                  <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Retry</span>
                )}
              </button>
            </motion.div>
          ) : (
            /* Actual Exams List Container */
            <div className="space-y-3.5">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex justify-between items-center hover:border-brand-blue/15 transition-all cursor-pointer group"
                >
                  <div
                    onClick={() => {
                      setActiveExam(exam);
                      setView('entry');
                    }}
                    className="flex-1 min-w-0 flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#EEF5FB] text-brand-blue border border-brand-blue/5 flex items-center justify-center shrink-0">
                      <FiAward className="w-5 h-5 text-[#1597E5]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-dark group-hover:text-brand-blue transition-colors truncate">
                        {exam.name}
                      </h4>
                      <p className="text-[9.5px] text-[#A0AEC0] font-bold uppercase tracking-wide mt-1">
                        {exam.type} · {exam.startDate} ~ {exam.endDate}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Status badges */}
                  <div className="flex items-center gap-3.5 select-none shrink-0">
                    <span
                      onClick={() => handleTogglePublishExam(exam)}
                      className={`px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wide border cursor-pointer hover:bg-slate-50 transition-colors ${
                        exam.status === 'PUBLISHED'
                          ? 'bg-blue-50 text-[#1597E5] border-blue-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}
                    >
                      {exam.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                    <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}

              {filteredExams.length === 0 && (
                <div className="bg-white rounded-[24px] border border-dashed border-[#e2e8f0] p-10 text-center text-xs font-bold text-[#A0AEC0]">
                  No exams found for tab "{listFilter}".
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* ─── B. CREATE EXAM VIEW (Screenshot 4) ─── */}
      {view === 'create' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 md:p-8 space-y-6 max-w-[640px] mx-auto select-none"
        >
          {/* Header Bar */}
          <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
            <button
              onClick={() => setView('list')}
              className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-black text-dark pr-8 mx-auto tracking-tight">Create Exam</h1>
          </header>

          {/* Form Container Card */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-6 card-shadow">
            <form onSubmit={handleCreateExam} className="space-y-6 font-sans text-xs">
              {/* Exam Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">
                  Exam Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 1"
                  value={examNameInput}
                  onChange={(e) => setExamNameInput(e.target.value)}
                  className="w-full bg-white border border-[#e2e8f0] focus:border-[#1597E5] rounded-[18px] px-4 py-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Exam Type Category Pills (Screenshot 4 layout) */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">
                  Exam Type *
                </label>
                <div className="flex flex-wrap gap-2 pt-1 select-none">
                  {EXAM_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setExamTypeInput(type)}
                      className={`py-2 px-4 rounded-full text-[10px] font-black border transition-all cursor-pointer ${
                        examTypeInput === type
                          ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-sm'
                          : 'bg-white border-blue-100 text-secondaryText hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Date & End Date fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">
                    Start Date
                  </label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={startDateInput}
                    onChange={(e) => setStartDateInput(e.target.value)}
                    className="w-full bg-white border border-[#e2e8f0] focus:border-[#1597E5] rounded-[18px] px-4 py-3 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">
                    End Date
                  </label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={endDateInput}
                    onChange={(e) => setEndDateInput(e.target.value)}
                    className="w-full bg-white border border-[#e2e8f0] focus:border-[#1597E5] rounded-[18px] px-4 py-3 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondaryText uppercase tracking-wider block">
                  Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional remarks..."
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                  className="w-full bg-white border border-[#e2e8f0] focus:border-[#1597E5] rounded-[18px] px-4 py-3 text-xs font-semibold focus:outline-none resize-none"
                />
              </div>

              {/* Form submit button */}
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-black text-xs flex items-center justify-center transition-all cursor-pointer"
              >
                {actionLoading ? (
                  <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Create Exam</span>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* ─── C. GRADES ENTRY SHEET VIEW ─── */}
      {view === 'entry' && activeExam && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto"
        >
          {/* Header Bar */}
          <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans select-none">
            <button
              onClick={() => setView('list')}
              className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
              disabled={actionLoading}
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center mx-auto pr-8">
              <h1 className="text-sm font-black text-dark font-sans leading-none truncate max-w-[200px]">
                {activeExam.name}
              </h1>
              <p className="text-[10px] text-secondaryText font-bold mt-1">
                {activeExam.type} · Grades Registry Sheet
              </p>
            </div>
          </header>

          {/* Success Notification */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#23C16B] font-bold"
              >
                <FiCheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
                <span>Student marks saved and updated persistently!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Config card showing details and status */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow flex justify-between items-center select-none">
            <div className="space-y-1">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#A0AEC0]">Examination Status</span>
              <h4 className="text-xs font-black text-dark">
                {activeExam.status === 'PUBLISHED' ? '🟢 Published & Live' : '🟠 Save as Draft'}
              </h4>
            </div>

            <button
              onClick={() => handleTogglePublishExam(activeExam)}
              className="px-4 py-2 bg-[#EEF5FB] hover:bg-[#1597E5]/10 text-[#1597E5] text-[10.5px] font-black rounded-full flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <span>{activeExam.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</span>
            </button>
          </div>

          {/* Class and Subject Selectors Row */}
          <div className="grid grid-cols-2 gap-4 select-none">
            {/* Class Select */}
            <div className="bg-white rounded-[20px] border border-[#e2e8f0]/45 p-4 card-shadow space-y-1.5">
              <label className="text-[9.5px] font-extrabold text-secondaryText uppercase tracking-wide flex items-center gap-1 px-1">
                <FiAward className="w-3 h-3 text-[#1597E5]" />
                <span>Selected Class</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-dark outline-none border-none cursor-pointer"
              >
                {classesList.map(cls => (
                  <option key={cls} value={cls}>{cls === 'All' ? 'All Classes' : `Class ${cls}`}</option>
                ))}
              </select>
            </div>

            {/* Subject Select */}
            <div className="bg-white rounded-[20px] border border-[#e2e8f0]/45 p-4 card-shadow space-y-1.5">
              <label className="text-[9.5px] font-extrabold text-secondaryText uppercase tracking-wide flex items-center gap-1 px-1">
                <FiBook className="w-3 h-3 text-purple-500" />
                <span>Subject</span>
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-dark outline-none border-none cursor-pointer"
              >
                {['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi', 'Telugu'].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Marks Registry Sheet */}
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-4">
            <div className="flex justify-between items-center px-1 select-none">
              <h3 className="text-[10.5px] font-extrabold text-secondaryText uppercase tracking-widest">
                Grades Entry Sheet
              </h3>
              <span className="text-[10px] font-black text-brand-blue bg-[#EEF5FB] px-2.5 py-1 rounded-full">
                {filteredStudents.length} Students
              </span>
            </div>

            <form onSubmit={handleSaveMarks} className="space-y-5">
              <div className="divide-y divide-[#e2e8f0]/60 max-h-[400px] overflow-y-auto pr-1">
                {filteredStudents.map((s, idx) => (
                  <div key={s.id} className="flex justify-between items-center py-3.5 first:pt-1 last:pb-1">
                    <div>
                      <h4 className="text-xs font-extrabold text-dark">{s.fullName}</h4>
                      <p className="text-[10px] text-secondaryText font-medium mt-0.5">
                        Class {s.academicClass?.name || 'Unassigned'} · Roll {idx + 1}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 select-none">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Marks"
                        value={marksState[s.id] ?? ''}
                        onChange={(e) => handleMarkChange(s.id, e.target.value)}
                        disabled={actionLoading}
                        className="w-20 text-center text-xs font-bold border border-[#e2e8f0] focus:border-[#1597E5] rounded-xl px-2 py-2 outline-none"
                      />
                      <span className="text-[10px] text-secondaryText font-bold">
                        / 100
                      </span>
                    </div>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="py-12 text-center text-[#A0AEC0] text-xs font-bold select-none">
                    No active students registered under selected class.
                  </div>
                )}
              </div>

              {filteredStudents.length > 0 && (
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] disabled:bg-slate-200 text-white rounded-[20px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1597E5]/30 transition-all cursor-pointer active:scale-95"
                >
                  {actionLoading ? (
                    <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiSave className="w-4.5 h-4.5" />
                      <span>Save Examination Grades</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExamsMarks;
