import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBookOpen, FiPlus, FiSearch, FiGrid, FiCheckCircle } from 'react-icons/fi';
import { BiTransfer } from 'react-icons/bi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getAcademicClasses } from '../../../services/dataService';

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

  // Coordinator specific mock selection state matching Screenshot 2
  const [selectedIds, setSelectedIds] = useState([1, 2, 3, 4, 11, 12]);

  if (activeRole === 'COORDINATOR') {
    const coordinatorStudents = [
      { id: 1, name: 'KORADA BHARGAVSAI', class: '5-A', admissionNo: '#26SO0002' },
      { id: 2, name: 'GANDARDDI MANJUSHA', class: '4-A', admissionNo: '#26SO0003' },
      { id: 3, name: 'GONTHINA POORVESH', class: '4-A', admissionNo: '#26SO0004' },
      { id: 4, name: 'AKKIREDDY SADHVIK', class: '4-A', admissionNo: '#26SO0006' },
      { id: 5, name: 'KORADA CHERVIK', class: '3-A', admissionNo: '#26SO0007' },
      { id: 6, name: 'BOGADHI HETVIK', class: '2-A', admissionNo: '#26SO0008' },
      { id: 7, name: 'BOOSA MANOJ', class: '4-A', admissionNo: '#26SO0011' },
      { id: 8, name: 'GNANA ABHINAVA RAM KORADA', class: '3-A', admissionNo: '#26SO0014' },
      { id: 9, name: 'GOLAGANA HANSHITH', class: '1-A', admissionNo: '#26SO0017' },
      { id: 10, name: 'GOLAJANA GNANESWARI', class: '1-A', admissionNo: '#26SO0019' },
      { id: 11, name: 'KORUKONDA NISSY SWAASTHYA', class: '1-A', admissionNo: '#26SO0021' },
      { id: 12, name: 'RAMINA PARDHU', class: '2-A', admissionNo: '#26SO0022' },
      { id: 13, name: 'RAMINA TEJASREE PRANAV', class: '3-A', admissionNo: '#26SO0024' },
      { id: 14, name: 'M SRAVYA SRI', class: '2-A', admissionNo: '#26SO0025' },
      { id: 15, name: 'BODDAPU PRERANA LATHA', class: '3-A', admissionNo: '#26SO0027' },
      { id: 16, name: 'BALLIREDDY LOKSHITHA SRI', class: '2-A', admissionNo: '#26SO0031' },
      { id: 17, name: 'CHANDAPARAPU GNANWITH', class: '2-A', admissionNo: '#26SO0037' },
      ...Array.from({ length: 33 }, (_, i) => {
        const names = ['KORADA BHARGAVSAI', 'GANDARDDI MANJUSHA', 'GONTHINA POORVESH', 'AKKIREDDY SADHVIK', 'BOGADHI HETVIK', 'RAMINA PARDHU', 'M SRAVYA SRI'];
        const classes = ['1-A', '2-A', '3-A', '4-A', '5-A'];
        const baseName = names[i % names.length];
        const admissionNum = 38 + i;
        return {
          id: 18 + i,
          name: `${baseName} JR ${i + 1}`,
          class: classes[i % classes.length],
          admissionNo: `#26SO${String(admissionNum).padStart(5, '0')}`
        };
      })
    ];

    const toggleSelect = (id) => {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(x => x !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    };

    const filteredStudents = coordinatorStudents.filter(s => {
      return s.name.toLowerCase().includes(search.toLowerCase()) ||
             s.class.toLowerCase().includes(search.toLowerCase()) ||
             s.admissionNo.toLowerCase().includes(search.toLowerCase());
    });

    const wingName = user?.wing || 'PRIMARY';

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
        <div className="flex gap-3 select-none pb-1 items-center">
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
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#00a6ff] hover:bg-[#0088ff] text-white rounded-full text-[11px] font-extrabold shadow-md cursor-pointer transition-all active:scale-95 ml-auto">
            <FiGrid className="w-3.5 h-3.5" />
            <span>Bulk ({selectedIds.length})</span>
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
                      {student.class} · {student.admissionNo}
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
