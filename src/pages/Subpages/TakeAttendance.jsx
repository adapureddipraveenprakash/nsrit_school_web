import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiCheck, FiXCircle, FiCheckCircle } from 'react-icons/fi';

const INITIAL_ROSTER = [
  { id: 1, name: 'BALIVADA TEJEASH MAHIDHAR', roll: '26SO0049', initials: 'BT', status: 'Present' },
  { id: 2, name: 'CHANDAPARAPU VED ARYAN', roll: '26SO0057', initials: 'CV', status: 'Present' },
  { id: 3, name: 'G JENISHA ANVI', roll: '26SO0063', initials: 'GJ', status: 'Present' },
  { id: 4, name: 'GOLAGANA HANSHITH', roll: '26SO0017', initials: 'GH', status: 'Present' },
  { id: 5, name: 'GOLAJANA GNANESWARI', roll: '26SO0019', initials: 'GG', status: 'Present' },
  { id: 6, name: 'GURLA HONNEYSHA', roll: '26SO0045', initials: 'GH', status: 'Present' },
  { id: 7, name: 'K LOKSHA HIMANYA', roll: '26SO0082', initials: 'KL', status: 'Present' },
  { id: 8, name: 'KORUKONDA NISSY SWAASTHYA', roll: '26SO0021', initials: 'KN', status: 'Present' },
  { id: 9, name: 'PALLA DEEKSHIT RAM', roll: '26SO0105', initials: 'PD', status: 'Present' },
  { id: 10, name: 'BOYINA MAHIDHAR', roll: '26SO0107', initials: 'BM', status: 'Present' },
  { id: 11, name: 'BOYINA AKSHAYRAM', roll: '26SO0106', initials: 'BA', status: 'Present' },
  { id: 12, name: 'DUDI GREESHMANTH', roll: '26SO0104', initials: 'DG', status: 'Present' },
  { id: 13, name: 'BONTU DHEKSHITH', roll: '26SO0103', initials: 'BD', status: 'Present' },
  { id: 14, name: 'PILLA TRIVED', roll: '26SO0102', initials: 'PT', status: 'Present' }
];

const TakeAttendance = () => {
  const navigate = useNavigate();
  const [roster, setRoster] = useState(INITIAL_ROSTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggleStatus = (id) => {
    setRoster(prev =>
      prev.map(student =>
        student.id === id
          ? { ...student, status: student.status === 'Present' ? 'Absent' : 'Present' }
          : student
      )
    );
  };

  const handleAllPresent = () => {
    setRoster(prev => prev.map(s => ({ ...s, status: 'Present' })));
  };

  const handleAllAbsent = () => {
    setRoster(prev => prev.map(s => ({ ...s, status: 'Absent' })));
  };

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate(-1);
    }, 1500);
  };

  const presentCount = roster.filter(s => s.status === 'Present').length;
  const absentCount = roster.filter(s => s.status === 'Absent').length;
  const totalCount = roster.length;
  const attendancePercentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  const filteredRoster = roster.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 max-w-[640px] mx-auto animate-fade-in relative select-none"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Take Attendance</h1>
      </header>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#23C16B] font-bold z-50 absolute left-4 right-4 top-14"
          >
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>Attendance saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blue Header Card */}
      <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex justify-between items-start mb-6">
          <span className="text-xs text-white/80 font-bold bg-white/15 px-2.5 py-1 rounded-lg">2026-06-24</span>
          <span className="text-[10px] text-white/95 font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/10">1-A</span>
        </div>

        <h2 className="text-2xl font-black mb-2">Today's Attendance</h2>

        {/* Present/Absent status badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 border border-white/15 rounded-full text-xs font-bold mt-1 select-none">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#23C16B]" />
            <span className="text-[#23C16B] font-extrabold">{presentCount}</span> Present
          </span>
          <span className="text-white/30 font-light select-none">|</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="text-[#EF4444] font-extrabold">{absentCount}</span> Absent
          </span>
          <span className="text-white/60 font-semibold pl-1">of {totalCount}</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden mt-6">
          <motion.div
            className="bg-[#23C16B] h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${attendancePercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Class and Section selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-extrabold text-[#A0AEC0] uppercase tracking-wider block mb-1.5 pl-1">Class</label>
          <select disabled className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[18px] text-xs font-bold text-dark opacity-90 cursor-not-allowed">
            <option>1</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-extrabold text-[#A0AEC0] uppercase tracking-wider block mb-1.5 pl-1">Section</label>
          <select disabled className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[18px] text-xs font-bold text-dark opacity-90 cursor-not-allowed">
            <option>A</option>
          </select>
        </div>
      </div>

      {/* Search Field */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search student name or roll number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3.5 select-none">
        <button
          onClick={handleAllPresent}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-[18px] bg-[#E8F8F0] border border-[#23C16B]/20 text-[#23C16B] text-xs font-extrabold hover:bg-[#d6f5e2] active:scale-95 transition-all cursor-pointer"
        >
          <FiCheck className="w-4 h-4" />
          <span>All Present</span>
        </button>
        <button
          onClick={handleAllAbsent}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-[18px] bg-red-50 border border-red-200/50 text-[#EF4444] text-xs font-extrabold hover:bg-red-100/55 active:scale-95 transition-all cursor-pointer"
        >
          <FiXCircle className="w-4 h-4 text-red-400" />
          <span>All Absent</span>
        </button>
      </div>

      {/* Roster Header */}
      <div className="px-1 text-[9.5px] font-extrabold text-secondaryText tracking-widest uppercase">
        Roster — {totalCount} Students
      </div>

      {/* Student Rows */}
      <div className="space-y-3">
        {filteredRoster.map((student) => {
          const isPresent = student.status === 'Present';
          return (
            <div
              key={student.id}
              onClick={() => handleToggleStatus(student.id)}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                {/* Initial Avatar */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                  isPresent
                    ? 'bg-[#E8F8F0] text-[#23C16B] border border-emerald-50'
                    : 'bg-red-50 text-[#EF4444] border border-red-100'
                }`}>
                  {student.initials}
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-[9px] text-[#A0AEC0] font-bold mt-1 font-sans">
                    Roll {student.roll}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`px-2.5 py-1.5 rounded-lg text-[8px] font-extrabold tracking-wider shrink-0 ${
                isPresent ? 'bg-[#E8F8F0] text-[#23C16B]' : 'bg-red-50 text-[#EF4444]'
              }`}>
                {isPresent ? '✓ PRESENT' : '✗ ABSENT'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Save Attendance Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:left-[288px] select-none">
        <div className="max-w-[640px] mx-auto px-4 pb-2.5">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-[24px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1597E5]/35 transition-all cursor-pointer active:scale-95"
          >
            <span>Save Attendance</span>
            <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[10px] font-black">{presentCount}/{totalCount}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TakeAttendance;
