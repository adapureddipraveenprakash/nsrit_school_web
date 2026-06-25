import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUsers, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';

const CLASSES_LIST = [
  { id: 1, name: 'Class 1' },
  { id: 2, name: 'Class 2' },
  { id: 3, name: 'Class 3' },
  { id: 4, name: 'Class 4' },
  { id: 5, name: 'Class 5' }
];

const STUDENT_ROSTER = {
  'Class 1': [
    { id: 1, name: 'GONTHINA POORVESH', status: 'Present' },
    { id: 2, name: 'GOLAGANA HANSHITH', status: 'Present' },
    { id: 3, name: 'GOLAJANA GNANESWARI', status: 'Absent' },
    { id: 4, name: 'KORUKONDA NISSY SWAASTHYA', status: 'Present' }
  ],
  'Class 2': [
    { id: 1, name: 'BOGADHI HETVIK', status: 'Present' },
    { id: 2, name: 'RAMINA PARDHU', status: 'Present' },
    { id: 3, name: 'M SRAVYA SRI', status: 'Present' },
    { id: 4, name: 'BALLIREDDY LOKSHITHA SRI', status: 'Absent' }
  ],
  'Class 3': [
    { id: 1, name: 'KORADA CHERVIK', status: 'Present' },
    { id: 2, name: 'GNANA ABHINAVA RAM KORADA', status: 'Present' },
    { id: 3, name: 'RAMINA TEJASREE PRANAV', status: 'Present' },
    { id: 4, name: 'BODDAPU PRERANA LATHA', status: 'Present' }
  ],
  'Class 4': [
    { id: 1, name: 'GANDARDDI MANJUSHA', status: 'Present' },
    { id: 2, name: 'AKKIREDDY SADHVIK', status: 'Present' },
    { id: 3, name: 'BOOSA MANOJ', status: 'Present' }
  ],
  'Class 5': [
    { id: 1, name: 'KORADA BHARGAVSAI', status: 'Present' }
  ]
};

const CorrectAttendance = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClassSelect = (clsName) => {
    setSelectedClass(clsName);
    setStudents(STUDENT_ROSTER[clsName] || []);
  };

  const handleStatusToggle = (studentId) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId
          ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' }
          : s
      )
    );
  };

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedClass(null);
    }, 1500);
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          onClick={() => {
            if (selectedClass) {
              setSelectedClass(null);
            } else {
              navigate(-1);
            }
          }}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">
          {selectedClass ? `${selectedClass} Correction` : 'Correct Attendance'}
        </h1>
      </header>

      {showSuccess && (
        <div className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-accent-green font-bold animate-[bounce_0.5s_ease]">
          <FiCheckCircle className="w-4 h-4 shrink-0" />
          <span>Attendance corrected successfully!</span>
        </div>
      )}

      {!selectedClass ? (
        <>
          {/* Top curved blue header card */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] to-[#4076FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full border-[16px] border-white/5" />
            <div className="absolute top-[-20px] right-[-20px] w-36 h-36 rounded-full border-[12px] border-white/10" />

            <div className="mb-2 relative z-10">
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">COORDINATOR</span>
            </div>

            <h2 className="text-xl font-bold mb-1 relative z-10">Correct Attendance</h2>
            <p className="text-xs text-white/80 font-medium relative z-10">
              Select a class to begin
            </p>
          </div>

          {/* List of classes */}
          <div className="space-y-3.5 pt-1">
            {CLASSES_LIST.map((cls) => (
              <div
                key={cls.id}
                onClick={() => handleClassSelect(cls.name)}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow flex items-center gap-4 hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
              >
                {/* Icon matching screenshot layout */}
                <div className="w-11 h-11 rounded-xl bg-[#EEF5FB] text-brand-blue flex items-center justify-center border border-brand-blue/5 shrink-0 select-none">
                  <FiUsers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark group-hover:text-brand-blue transition-colors">
                    {cls.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Class-specific Roster View for correcting attendance */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="mb-1 relative z-10">
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">{selectedClass}</span>
            </div>
            <h2 className="text-xl font-bold mb-1 relative z-10">Correct Attendance</h2>
            <p className="text-xs text-white/85 font-medium relative z-10">
              Tap a student to toggle attendance status
            </p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
          </div>

          {/* Student list */}
          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const isPresent = student.status === 'Present';
              const namesList = student.name.split(' ');
              const initials = namesList.length > 1 ? `${namesList[0][0]}${namesList[1][0]}` : student.name.charAt(0);

              return (
                <div
                  key={student.id}
                  onClick={() => handleStatusToggle(student.id)}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/15 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                      isPresent ? 'bg-[#E8F8F0] text-[#23C16B] border border-emerald-50' : 'bg-red-50 text-[#E53E3E] border border-red-100'
                    }`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                        {student.name}
                      </h3>
                      <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                        Status: {student.status}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1.5 rounded-lg text-[8px] font-extrabold tracking-wider shrink-0 ${
                    isPresent ? 'bg-[#E8F8F0] text-[#23C16B]' : 'bg-red-50 text-[#E53E3E]'
                  }`}>
                    {student.status.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95 mt-4"
          >
            Save Corrections
          </button>
        </>
      )}
    </motion.div>
  );
};

export default CorrectAttendance;
