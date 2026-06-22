import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiCheckCircle, FiUsers, FiAward } from 'react-icons/fi';

const MOCK_STUDENTS = [
  { id: '1', fullName: 'P. Sai Kumar', currentClass: 'Class 5', targetClass: 'Class 6', status: 'Pending', studentId: 'NSR26SOT078' },
  { id: '2', fullName: 'P. Divya', currentClass: 'Class 3', targetClass: 'Class 4', status: 'Pending', studentId: 'NSR26SOT104' },
  { id: '3', fullName: 'K. Rakesh', currentClass: 'Class 5', targetClass: 'Class 6', status: 'Promoted', studentId: 'NSR26SOT115' },
  { id: '4', fullName: 'M. Sandeep', currentClass: 'Class 7', targetClass: 'Class 8', status: 'Pending', studentId: 'NSR26SOT120' },
  { id: '5', fullName: 'B. Geethika', currentClass: 'Class 3', targetClass: 'Class 4', status: 'Promoted', studentId: 'NSR26SOT002' }
];

const PromotionManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All'); // 'All' | 'Pending' | 'Promoted'

  const handlePromote = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Promoted' } : s))
    );
  };

  const handlePromoteAll = () => {
    setStudents((prev) =>
      prev.map((s) => (s.status === 'Pending' ? { ...s, status: 'Promoted' } : s))
    );
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

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
          Promotions Management
        </h1>
        <div className="w-9 h-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-full card-shadow focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText/60"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            </div>

            <div className="flex gap-2 shrink-0">
              {['All', 'Pending', 'Promoted'].map((status) => {
                const isActive = filter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FF9F1C] border-[#FF9F1C] text-white shadow-md'
                        : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Roster List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
                {filtered.length} Students Listed
              </span>
              {students.some((s) => s.status === 'Pending') && (
                <button
                  onClick={handlePromoteAll}
                  className="text-xs font-bold text-brand-blue hover:underline cursor-pointer"
                >
                  Promote All Pending
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-[22px] p-5 card-shadow border border-[#e2e8f0]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-amber-500/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF8EE] text-[#FF9F1C] flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      🎓
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-dark">{s.fullName}</h3>
                      <p className="text-[10px] text-secondaryText font-medium mt-0.5">
                        Current: <span className="text-dark font-semibold">{s.currentClass}</span> · Target: <span className="text-brand-blue font-semibold">{s.targetClass}</span>
                      </p>
                      <p className="text-[9px] text-secondaryText/60 font-mono font-bold mt-1">{s.studentId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {s.status === 'Promoted' ? (
                      <span className="inline-flex items-center gap-1 bg-[#E8F8F0] text-accent-green px-3 py-1 rounded-full text-[10px] font-bold">
                        <FiCheckCircle className="w-3.5 h-3.5" /> Promoted
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePromote(s.id)}
                        className="px-4 py-1.5 bg-[#FF9F1C] hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
                      >
                        Promote Student
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          {/* Banner Card */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#FF9F1C] to-[#FFB75E] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <FiAward className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold">Year End Promotions</h2>
            <p className="text-xs text-white/80 mt-2 font-semibold leading-relaxed">
              Promote students to their next academic grade class. Click the promote button to confirm or utilize batch promotion.
            </p>
          </div>

          {/* Stats widget */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block">
              Promotion Statistics
            </span>
            <div className="divide-y divide-[#e2e8f0]/80">
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Total Eligible</span>
                <span className="text-dark font-extrabold">{students.length}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Promoted</span>
                <span className="text-accent-green font-extrabold">{students.filter((s) => s.status === 'Promoted').length}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Pending Approval</span>
                <span className="text-accent-red font-extrabold">{students.filter((s) => s.status === 'Pending').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PromotionManagement;
