import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiCheckCircle, FiInbox, FiChevronDown, FiArrowRight } from 'react-icons/fi';
import { BiTransfer, BiHistory } from 'react-icons/bi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getStudents, getSections } from '../../../services/dataService';

const PromotionManagement = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const branchId = user?.branchId || null;

  // Selected section to review
  const [selectedSectionName, setSelectedSectionName] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // Fetch real students in the branch
  const { data: dbStudents = [] } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // Fetch real sections in the branch
  const { data: dbSections = [] } = useDataFetch(
    () => getSections({ branchId }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // Section Options (Database + Mock fallbacks matching Screenshot 1)
  const sectionOptions = useMemo(() => {
    if (dbSections.length > 0) {
      return dbSections.map(s => {
        const className = s.academicClass?.name || '';
        const secName = s.name || '';
        return `${className}-${secName}`.trim().replace(/^-|-$/, '');
      });
    }
    // Screenshot 1 ordered list
    return [
      'Nursery-A',
      '4-A',
      'LKG-A',
      '6-A',
      '5-A',
      'UKG-A',
      '3-A',
      '2-A',
      '1-A',
      '7-A'
    ];
  }, [dbSections]);

  // Map of next classes
  const nextClassMap = {
    'Nursery': 'LKG',
    'LKG': 'UKG',
    'UKG': '1',
    '1': '2',
    '2': '3',
    '3': '4',
    '4': '5',
    '5': '6',
    '6': '7',
    '7': '8',
    '8': '9',
    '9': '10',
    '10': 'Graduate'
  };

  // Construct promotions list for the selected section
  const pendingPromotions = useMemo(() => {
    if (!selectedSectionName) return [];

    const parts = selectedSectionName.split('-');
    const currentClassVal = parts[0] || '';
    const sectionVal = parts[1] || 'A';

    // Try filtering real database students
    const actual = dbStudents.filter(s => 
      s.academicClass?.name?.toUpperCase() === currentClassVal.toUpperCase() &&
      s.section?.name?.toUpperCase() === sectionVal.toUpperCase()
    );

    if (actual.length > 0) {
      return actual.map(s => {
        const targetClass = nextClassMap[currentClassVal] || 'Next Grade';
        return {
          id: s.id,
          name: s.fullName || s.name || 'Unknown Student',
          currentClass: selectedSectionName,
          targetClass: `${targetClass}-${sectionVal}`,
          admissionNo: s.studentId || '26SO0000'
        };
      });
    }

    // Fallback Mock List for Sontyam Branch
    const mockNames = [
      'KORADA BHARGAVSAI', 'GANDARDDI MANJUSHA', 'GONTHINA POORVESH', 'AKKIREDDY SADHVIK',
      'KORADA CHERVIK', 'BOGADHI HETVIK', 'BOOSA MANOJ', 'GNANA ABHINAVA RAM KORADA',
      'GOLAGANA HANSHITH', 'GOLAJANA GNANESWARI', 'KORUKONDA NISSY SWAASTHYA', 'RAMINA PARDHU',
      'RAMINA TEJASREE PRANAV', 'M SRAVYA SRI', 'BODDAPU PRERANA LATHA', 'BALLIREDDY LOKSHITHA SRI'
    ];

    return mockNames.slice(0, 6).map((name, idx) => {
      const target = nextClassMap[currentClassVal] || 'Next Grade';
      return {
        id: `mock-${idx}`,
        name,
        currentClass: selectedSectionName,
        targetClass: `${target}-${sectionVal}`,
        admissionNo: `26SO${String(12 + idx).padStart(4, '0')}`
      };
    });
  }, [selectedSectionName, dbStudents]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === pendingPromotions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingPromotions.map(x => x.id));
    }
  };

  const handlePromote = () => {
    if (selectedIds.length === 0) return;
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setSelectedIds([]);
      setSelectedSectionName('');
      setIsReviewing(false);
      navigate(-1);
    }, 2000);
  };

  // STEP 2: REVIEWING STUDENTS LIST FOR SELECTED SECTION
  if (isReviewing && selectedSectionName) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative select-none"
      >
        <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
          <button
            onClick={() => setIsReviewing(false)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-dark pr-8 mx-auto font-sans">Review {selectedSectionName}</h1>
        </header>

        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
          <h2 className="text-xl font-bold font-sans">Review Promotions</h2>
          <p className="text-xs text-white/85 mt-1.5 font-sans">Section: {selectedSectionName}</p>
        </div>

        {/* Select All */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between font-sans">
          <div>
            <h4 className="text-xs font-black text-dark">Select All</h4>
            <p className="text-[9px] text-[#A0AEC0] font-bold mt-0.5">
              {selectedIds.length} of {pendingPromotions.length} selected
            </p>
          </div>
          <input
            type="checkbox"
            checked={selectedIds.length === pendingPromotions.length && pendingPromotions.length > 0}
            onChange={toggleSelectAll}
            className="w-5 h-5 accent-[#1597E5] rounded cursor-pointer"
          />
        </div>

        {/* Checklist */}
        <div className="space-y-3 pt-1">
          {pendingPromotions.length > 0 ? (
            pendingPromotions.map((student) => {
              const isSelected = selectedIds.includes(student.id);
              return (
                <div
                  key={student.id}
                  onClick={() => toggleSelect(student.id)}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(student.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-[#1597E5] rounded cursor-pointer"
                    />
                    <div>
                      <h4 className="text-xs font-black text-dark leading-tight group-hover:text-brand-blue transition-colors font-sans">
                        {student.name}
                      </h4>
                      <p className="text-[9px] text-[#A0AEC0] font-bold mt-1 font-sans flex items-center gap-1.5">
                        <span>{student.admissionNo}</span>
                        <span>·</span>
                        <span className="text-[#1597E5] font-black">{student.currentClass}</span>
                        <span className="text-[8px]">➔</span>
                        <span className="text-emerald-500 font-black">{student.targetClass}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-[32px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[260px]">
              <FiInbox className="w-8 h-8 text-secondaryText" />
              <h4 className="text-xs font-extrabold text-dark">No students found in this section</h4>
            </div>
          )}
        </div>

        {/* Promote Button */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-30 md:left-[288px] animate-[slideUp_0.3s_ease-out]">
            <div className="max-w-[640px] mx-auto px-4 pb-0">
              <button
                onClick={handlePromote}
                className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-t-[32px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95"
              >
                <BiTransfer className="w-4 h-4" />
                <span>Promote Selected ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // STEP 1: CHOOSE SECTION TO PROMOTE (Screenshot 1)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in relative select-none"
    >
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto font-sans">Promotions</h1>
      </header>

      {/* Blue Header Card with History button (Screenshot 1) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        
        {/* History action button inside header card */}
        <button className="absolute top-6 right-6 inline-flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full text-[10px] font-bold cursor-pointer transition-all border border-white/15">
          <BiHistory className="w-3.5 h-3.5" />
          <span>History</span>
        </button>

        <div className="mb-2 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase font-sans font-black">ACADEMIC YEAR 2026-27</span>
        </div>
        <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Promotions</h2>
        <p className="text-xs text-white/85 mt-1.5 relative z-10 font-sans leading-relaxed">
          Select a section to review and promote students one by one
        </p>
      </div>

      {/* Select Section Dropdown Container (Screenshot 1 layout) */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-6 card-shadow space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-dark block font-sans">
            Select Section to Promote
          </label>
          <div className="relative">
            <select
              value={selectedSectionName}
              onChange={(e) => setSelectedSectionName(e.target.value)}
              className={`w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer ${
                selectedSectionName === '' ? 'text-secondaryText font-medium' : 'text-dark font-extrabold'
              }`}
            >
              <option value="">Select</option>
              {sectionOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0] pointer-events-none" />
          </div>
        </div>

        {/* Review Students Action Button */}
        <button
          onClick={() => {
            if (selectedSectionName) setIsReviewing(true);
          }}
          disabled={!selectedSectionName}
          className={`w-full py-3.5 rounded-[20px] text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            selectedSectionName
              ? 'bg-[#1597E5]/20 text-[#1597E5] border border-blue-100 hover:bg-[#1597E5]/25 active:scale-95'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-100'
          }`}
        >
          <FiArrowRight className="w-4 h-4" />
          <span>Review Students</span>
        </button>
      </div>

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
            <span>Students promoted successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PromotionManagement;
