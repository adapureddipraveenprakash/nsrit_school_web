import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiChevronDown, FiCheckCircle } from 'react-icons/fi';
import { BiTransfer } from 'react-icons/bi';

const COORDINATOR_STUDENTS = [
  { name: 'KORADA BHARGAVSAI', rollNo: '26S00002' },
  { name: 'GANDARDDI MANJUSHA', rollNo: '26S00003' },
  { name: 'GONTHINA POORVESH', rollNo: '26S00004' },
  { name: 'AKKIREDDY SADHVIK', rollNo: '26S00006' },
  { name: 'KORADA CHERVIK', rollNo: '26S00007' },
  { name: 'BOGADHI HETVIK', rollNo: '26S00008' },
  { name: 'BOOSA MANOJ', rollNo: '26S00011' },
  { name: 'GNANA ABHINAVA RAM KORADA', rollNo: '26S00014' },
  { name: 'GOLAGANA HANSHITH', rollNo: '26S00017' },
  { name: 'GOLAJANA GNANESWARI', rollNo: '26S00019' },
  { name: 'KORUKONDA NISSY SWAASTHYA', rollNo: '26S00021' },
  { name: 'RAMINA PARDHU', rollNo: '26S00022' },
  { name: 'RAMINA TEJASREE PRANAV', rollNo: '26S00024' },
  { name: 'M SRAVYA SRI', rollNo: '26S00025' },
  { name: 'BODDAPU PRERANA LATHA', rollNo: '26S00027' },
  { name: 'BALLIREDDY LOKSHITHA SRI', rollNo: '26S00031' },
  { name: 'CHANDAPARAPU GNANWITH', rollNo: '26S00037' }
];

const SECTIONS = [
  'LKG-A', 'UKG-A', '1-A', '2-A', '3-A', '4-A', '5-A', '6-A', '7-A'
];

const PromotionManagement = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [newSection, setNewSection] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleTransfer = () => {
    if (!selectedStudent || !newSection) return;
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setSelectedStudent('');
      setNewSection('');
      navigate(-1);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in animate-fade-in-long relative"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Transfer Student</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 select-none">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase block mb-0.5">STUDENTS</span>
          <h2 className="text-xl font-bold">Transfer Student</h2>
          <p className="text-[11px] text-white/80 font-medium mt-1">Move a student between permitted sections</p>
        </div>
      </div>

      {/* Promotion Form container */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow select-none">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[10px] font-bold text-[#A0AEC0] tracking-wider uppercase">SELECT STUDENT & TARGET</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Student select Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-dark block">
              Student
            </label>
            <div className="relative">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className={`w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer ${
                  selectedStudent === '' ? 'text-secondaryText' : 'text-dark'
                }`}
              >
                <option value="">Select</option>
                {COORDINATOR_STUDENTS.map((stud) => (
                  <option key={stud.rollNo} value={stud.name}>
                    {stud.name} - {stud.rollNo}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#e2e8f0]/50 my-2" />

          {/* Target Section Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-dark block">
              New Section
            </label>
            <div className="relative">
              <select
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                className={`w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer ${
                  newSection === '' ? 'text-secondaryText' : 'text-dark'
                }`}
              >
                <option value="">Select</option>
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-4 right-4 z-50 md:left-[calc(50%-200px)] md:right-auto md:w-[400px] bg-white border border-[#23C16B]/30 rounded-2xl p-4 card-shadow flex items-start gap-3.5 select-none"
          >
            <div className="w-9 h-9 rounded-full bg-[#E8F8F0] text-[#23C16B] flex items-center justify-center shrink-0">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-dark">Transfer Successful</h4>
              <p className="text-[10px] text-secondaryText mt-0.5 font-semibold leading-relaxed">
                Successfully transferred {selectedStudent} to section {newSection}.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Bottom Transfer Student Button Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:left-[288px]">
        <div className="max-w-[640px] mx-auto px-4 pb-0">
          <button
            disabled={!selectedStudent || !newSection}
            onClick={handleTransfer}
            className={`w-full py-4 rounded-t-[32px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              selectedStudent && newSection
                ? 'bg-[#1597E5] hover:bg-[#00A1FF] text-white shadow-[#1597E5]/35 active:scale-95'
                : 'bg-[#80D0FF] text-white cursor-not-allowed'
            }`}
          >
            <BiTransfer className="w-4.5 h-4.5 text-white" />
            <span>Transfer Student</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PromotionManagement;
