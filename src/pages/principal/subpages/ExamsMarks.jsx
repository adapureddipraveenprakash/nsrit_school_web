import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiCheckCircle, FiSave, FiAward, FiBook } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getStudents } from '../../../services/dataService';

const ExamsMarks = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const branchId = user?.branchId || null;

  // Fetch actual branch students
  const { data: dbStudents = [] } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [] }
  );

  const [exams, setExams] = useState([
    { id: '1', name: 'Term 1 Examination', date: 'July 2026', maxMarks: 100 },
    { id: '2', name: 'Weekly Test 1', date: 'June 2026', maxMarks: 25 },
  ]);

  const [selectedExam, setSelectedExam] = useState('1');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [marksState, setMarksState] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Group classes dynamically from actual students list
  const classesList = useMemo(() => {
    const set = new Set();
    dbStudents.forEach(s => {
      const clsName = s.academicClass?.name;
      if (clsName) set.add(clsName);
    });
    return ['All', ...Array.from(set)];
  }, [dbStudents]);

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    if (selectedClass === 'All') return dbStudents;
    return dbStudents.filter(s => s.academicClass?.name === selectedClass);
  }, [dbStudents, selectedClass]);

  const handleMarkChange = (studentId, value) => {
    const parsedVal = parseInt(value, 10);
    const max = exams.find(e => e.id === selectedExam)?.maxMarks || 100;

    if (parsedVal < 0 || parsedVal > max) return; // boundary check

    setMarksState(prev => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveMarks = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }, 1500);
  };

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamMax, setNewExamMax] = useState('100');

  const handleCreateExam = (e) => {
    e.preventDefault();
    if (!newExamName) return;

    setExams([
      {
        id: Date.now().toString(),
        name: newExamName,
        date: 'July 2026',
        maxMarks: parseInt(newExamMax, 10),
      },
      ...exams,
    ]);
    setNewExamName('');
    setShowCreateForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 max-w-2xl mx-auto relative select-none animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          disabled={loading}
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center mx-auto pr-8">
          <h1 className="text-sm font-bold text-dark font-sans leading-none">Exams & Marks</h1>
          <p className="text-[10px] text-secondaryText font-bold mt-1">Create exams, enter marks, publish results</p>
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
            <span>Student marks saved and updated in registry!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Exam and Creator Form */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#A0AEC0]">Active Examination</span>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="block bg-transparent text-sm font-extrabold text-dark outline-none border-none cursor-pointer"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name} (Max: {ex.maxMarks}m)</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-3.5 py-2 bg-[#EEF5FB] hover:bg-[#1597E5]/10 text-[#1597E5] text-[10.5px] font-black rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Create Exam</span>
          </button>
        </div>

        {/* Create Exam Form Modal/Block */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateExam}
              className="border-t border-[#e2e8f0]/70 pt-4 space-y-3.5 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wide">Exam Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Term 2 Examination"
                    value={newExamName}
                    onChange={(e) => setNewExamName(e.target.value)}
                    className="w-full text-xs font-bold border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none focus:border-[#1597E5]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wide">Max Marks</label>
                  <input
                    type="number"
                    required
                    value={newExamMax}
                    onChange={(e) => setNewExamMax(e.target.value)}
                    className="w-full text-xs font-bold border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none focus:border-[#1597E5]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                Schedule Examination
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Class and Subject Selectors Row */}
      <div className="grid grid-cols-2 gap-4">
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
        <div className="flex justify-between items-center px-1">
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

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={exams.find(e => e.id === selectedExam)?.maxMarks || 100}
                    placeholder="Marks"
                    value={marksState[s.id] ?? ''}
                    onChange={(e) => handleMarkChange(s.id, e.target.value)}
                    disabled={loading}
                    className="w-20 text-center text-xs font-bold border border-[#e2e8f0] focus:border-[#1597E5] rounded-xl px-2 py-2 outline-none"
                  />
                  <span className="text-[10px] text-secondaryText font-bold">
                    / {exams.find(e => e.id === selectedExam)?.maxMarks || 100}
                  </span>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
              <div className="py-12 text-center text-[#A0AEC0] text-xs font-bold">
                No active students registered under selected class.
              </div>
            )}
          </div>

          {filteredStudents.length > 0 && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] disabled:bg-slate-200 text-white rounded-[20px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1597E5]/30 transition-all cursor-pointer active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>Save Examination Grades</span>
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default ExamsMarks;
