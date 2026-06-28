import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiX } from 'react-icons/fi';

const STUDENT_ROSTER = [
  { name: 'BALIVADA TEJEASH MAHIDHAR', roll: '26SO0049' },
  { name: 'CHANDAPARAPU VED ARYAN', roll: '26SO0057' },
  { name: 'G JENISHA ANVI', roll: '26SO0063' },
  { name: 'GOLAGANA HANSHITH', roll: '26SO0017' },
  { name: 'GOLAJANA GNANESWARI', roll: '26SO0019' },
  { name: 'GURLA HONNEYSHA', roll: '26SO0045' },
  { name: 'K LOKSHA HIMANYA', roll: '26SO0082' },
  { name: 'KORUKONDA NISSY SWAASTHYA', roll: '26SO0021' },
  { name: 'PALLA DEEKSHIT RAM', roll: '26SO0105' },
  { name: 'BOYINA MAHIDHAR', roll: '26SO0107' },
  { name: 'BOYINA AKSHAYRAM', roll: '26SO0106' },
  { name: 'DUDI GREESHMANTH', roll: '26SO0104' },
  { name: 'BONTU DHEKSHITH', roll: '26SO0103' },
  { name: 'PILLA TRIVED', roll: '26SO0102' }
];

const getParentDetails = (studentName) => {
  const parts = studentName.split(' ');
  const lastName = parts[0] || 'Student';
  const firstName = parts.slice(1).join(' ') || 'Student';
  
  return {
    father: `${lastName} Srinivasa Rao`,
    fatherPhone: '+91 98480 22338',
    mother: `${lastName} Lakshmi`,
    motherPhone: '+91 98480 22339',
    email: `${firstName.toLowerCase().replace(/\s+/g, '')}.parent@nsrit.edu.in`,
    address: 'Sontyam Main Road, Sontyam, Visakhapatnam, AP - 531173'
  };
};

const TeacherStudents = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filtered = STUDENT_ROSTER.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Top Blue Header Panel Banner matching Screenshot 3 */}
      <div className="bg-gradient-to-br from-[#1597E5] to-[#00A1FF] text-white p-6 rounded-[28px] card-shadow relative overflow-hidden shrink-0 select-none">
        {/* Floating decorative circles */}
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        {/* Back arrow & Title row */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <span className="inline-flex items-center px-2.5 py-0.5 bg-white/20 border border-white/25 rounded-md text-[9px] font-extrabold tracking-wide uppercase">
            Teacher View
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <h2 className="text-2xl font-bold">Student Roster</h2>
          <span className="bg-white/20 border border-white/25 px-2.5 py-0.5 rounded-full text-xs font-bold font-sans">
            {STUDENT_ROSTER.length}
          </span>
        </div>
        <p className="text-xs text-white/80 mt-1 font-semibold leading-relaxed">
          1 section assigned.
        </p>
      </div>

      <div className="space-y-6">
        {/* Search Bar matching Screenshot 3 */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, ID, or class"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-full card-shadow focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText/60"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1597E5]" />
        </div>

        {/* Student Roster Feed */}
        <div className="space-y-3.5">
          <div className="px-1 text-[10px] font-extrabold text-secondaryText uppercase tracking-widest">
            {filtered.length} Students
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered.map((s, idx) => {
              const initials = s.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedStudent(s)}
                  className="bg-white rounded-[20px] p-4.5 card-shadow border border-[#e2e8f0]/40 border-l-[4px] border-l-[#EF4444] flex items-center gap-4 hover:border-brand-blue/20 transition-all cursor-pointer group"
                >
                  {/* Pink/Red circular initials avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center text-xs font-extrabold text-[#EF4444] uppercase shrink-0 select-none">
                    {initials}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-dark group-hover:text-[#1597E5] transition-colors leading-tight">
                      {s.name}
                    </h3>
                    <p className="text-[10px] text-secondaryText mt-1 font-semibold leading-none">
                      Roll {s.roll}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Student Details / Parent Info Slide-over Drawer */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-dark/80 z-50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 md:w-96 bg-white z-50 flex flex-col shadow-2xl h-full overflow-hidden p-6 select-none"
            >
              <div className="flex justify-between items-center border-b border-[#e2e8f0]/60 pb-4">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 bg-[#EEF5FB] text-[#1597E5] border border-blue-50 rounded-md">
                    Student Profile
                  </span>
                  <h3 className="text-sm font-extrabold text-dark mt-2.5 max-w-[200px] md:max-w-none truncate leading-none">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-[10px] text-secondaryText font-bold mt-1.5 leading-none">
                    Roll Number: {selectedStudent.roll}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 hover:bg-[#EEF5FB] rounded-full text-secondaryText hover:text-dark transition-all cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 space-y-6">
                {/* Parent Information Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-secondaryText uppercase tracking-widest px-1">
                    Parent / Guardian Contacts
                  </h4>
                  
                  <div className="bg-[#EEF5FB]/35 border border-[#e2e8f0]/40 rounded-2xl p-4.5 space-y-4">
                    {/* Father Details */}
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0">👨</span>
                      <div>
                        <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider">Father</p>
                        <p className="text-xs font-bold text-dark mt-0.5">{getParentDetails(selectedStudent.name).father}</p>
                        <p className="text-[10px] text-[#1597E5] font-bold mt-1 select-all font-sans">{getParentDetails(selectedStudent.name).fatherPhone}</p>
                      </div>
                    </div>

                    <div className="border-t border-[#e2e8f0]/60" />

                    {/* Mother Details */}
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0">👩</span>
                      <div>
                        <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider">Mother</p>
                        <p className="text-xs font-bold text-dark mt-0.5">{getParentDetails(selectedStudent.name).mother}</p>
                        <p className="text-[10px] text-[#1597E5] font-bold mt-1 select-all font-sans">{getParentDetails(selectedStudent.name).motherPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-secondaryText uppercase tracking-widest px-1">
                    Other Details
                  </h4>
                  
                  <div className="bg-white rounded-2xl border border-[#e2e8f0]/40 p-4 space-y-3.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-secondaryText font-bold">Email Contact</span>
                      <span className="text-dark font-extrabold text-[10px] select-all truncate max-w-[150px] font-sans">{getParentDetails(selectedStudent.name).email}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-secondaryText font-bold shrink-0">Residential Address</span>
                      <span className="text-dark font-extrabold text-[10px] text-right leading-normal">{getParentDetails(selectedStudent.name).address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e2e8f0]/60 pt-4">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-full py-3 bg-[#EEF5FB] hover:bg-[#e2e8f0]/60 text-secondaryText hover:text-dark rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeacherStudents;
