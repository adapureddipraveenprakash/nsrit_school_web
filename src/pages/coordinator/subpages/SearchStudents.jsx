import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiChevronDown, FiFolder, FiCheck, FiX } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getStudents, getAcademicClasses, getSectionsByClass } from '../../../services/dataService';

const SearchStudents = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const branchId = user?.branchId || null;

  // Search filter states
  const [searchText, setSearchText] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Any'); // 'Any' | 'ACTIVE' | 'TRANSFERRED' | 'GRADUATED' | 'DROPPED'

  // Dropdowns lists
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [showStatusDrawer, setShowStatusDrawer] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Fetch classes catalog and filter locally by branchId
  useEffect(() => {
    if (branchId) {
      getAcademicClasses().then(list => {
        const branchClasses = list.filter(c => c.branchId === branchId);
        const seen = new Set();
        const unique = [];
        branchClasses.forEach(c => {
          const nameKey = c.name.toUpperCase();
          if (!seen.has(nameKey)) {
            seen.add(nameKey);
            unique.push(c);
          }
        });
        const order = ['NURSERY', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];
        const sorted = unique.sort((a, b) => order.indexOf(a.name.toUpperCase()) - order.indexOf(b.name.toUpperCase()));
        setClassesList(sorted);
      }).catch(err => {
        console.error('Error fetching academic classes:', err);
      });
    }
  }, [branchId]);

  // Load sections when class is selected
  useEffect(() => {
    setSelectedSectionId('');
    setSectionsList([]);
    if (selectedClassId) {
      getSectionsByClass(selectedClassId).then(list => {
        setSectionsList(list);
      }).catch(err => {
        console.error('Error fetching sections:', err);
      });
    }
  }, [selectedClassId]);

  // Load real students from database
  const { data: dbStudents = [], loading: loadingStudents } = useDataFetch(
    () => getStudents({ branchId, limit: 1000 }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // Hardcoded mock students catalog (excluding AKKIREDDY SADHVIK as requested in previous cleanup)
  const mockStudentsCatalog = useMemo(() => {
    return [
      { id: 'mock-1', fullName: 'KORADA BHARGAVSAI', academicClass: { name: 'LKG' }, section: { name: 'A' }, studentId: '26SO0002', status: 'ACTIVE', parent: { phoneNumber: '9848022338' } },
      { id: 'mock-2', fullName: 'GANDARDDI MANJUSHA', academicClass: { name: 'LKG' }, section: { name: 'A' }, studentId: '26SO0003', status: 'ACTIVE', parent: { phoneNumber: '9908123456' } },
      { id: 'mock-3', fullName: 'GONTHINA POORVESH', academicClass: { name: 'LKG' }, section: { name: 'A' }, studentId: '26SO0004', status: 'ACTIVE', parent: { phoneNumber: '9177234567' } },
      { id: 'mock-4', fullName: 'KORADA CHERVIK', academicClass: { name: 'UKG' }, section: { name: 'A' }, studentId: '26SO0007', status: 'ACTIVE', parent: { phoneNumber: '9391054321' } },
      { id: 'mock-5', fullName: 'BOGADHI HETVIK', academicClass: { name: '2' }, section: { name: 'A' }, studentId: '26SO0008', status: 'ACTIVE', parent: { phoneNumber: '8888999911' } },
      { id: 'mock-6', fullName: 'BOOSA MANOJ', academicClass: { name: '4' }, section: { name: 'A' }, studentId: '26SO0011', status: 'ACTIVE', parent: { phoneNumber: '7777123456' } },
      { id: 'mock-7', fullName: 'GNANA ABHINAVA RAM KORADA', academicClass: { name: '3' }, section: { name: 'A' }, studentId: '26SO0014', status: 'ACTIVE', parent: { phoneNumber: '9440123456' } },
      { id: 'mock-8', fullName: 'GOLAGANA HANSHITH', academicClass: { name: '1' }, section: { name: 'A' }, studentId: '26SO0017', status: 'ACTIVE', parent: { phoneNumber: '9000123456' } },
      { id: 'mock-9', fullName: 'GOLAJANA GNANESWARI', academicClass: { name: '1' }, section: { name: 'A' }, studentId: '26SO0019', status: 'ACTIVE', parent: { phoneNumber: '9111222333' } },
      { id: 'mock-10', fullName: 'KORUKONDA NISSY SWAASTHYA', academicClass: { name: '1' }, section: { name: 'A' }, studentId: '26SO0021', status: 'ACTIVE', parent: { phoneNumber: '9888777666' } },
      { id: 'mock-11', fullName: 'RAMINA PARDHU', academicClass: { name: '2' }, section: { name: 'A' }, studentId: '26SO0022', status: 'ACTIVE', parent: { phoneNumber: '9222333444' } },
      { id: 'mock-12', fullName: 'RAMINA TEJASREE PRANAV', academicClass: { name: '3' }, section: { name: 'A' }, studentId: '26SO0024', status: 'ACTIVE', parent: { phoneNumber: '9333444555' } },
      { id: 'mock-13', fullName: 'M SRAVYA SRI', academicClass: { name: '2' }, section: { name: 'A' }, studentId: '26SO0025', status: 'ACTIVE', parent: { phoneNumber: '9444555666' } },
      { id: 'mock-14', fullName: 'BODDAPU PRERANA LATHA', academicClass: { name: '3' }, section: { name: 'A' }, studentId: '26SO0027', status: 'ACTIVE', parent: { phoneNumber: '9555666777' } },
      { id: 'mock-15', fullName: 'BALLIREDDY LOKSHITHA SRI', academicClass: { name: '2' }, section: { name: 'A' }, studentId: '26SO0031', status: 'ACTIVE', parent: { phoneNumber: '9666777888' } },
      { id: 'mock-16', fullName: 'CHANDAPARAPU GNANWITH', academicClass: { name: '2' }, section: { name: 'A' }, studentId: '26SO0037', status: 'ACTIVE', parent: { phoneNumber: '9777888999' } }
    ];
  }, []);

  const handleSearch = () => {
    setHasSearched(true);

    // Merge database students and mock students
    const normalizedDb = dbStudents.map(s => ({
      id: s.id,
      fullName: s.fullName,
      academicClass: { name: s.academicClass?.name || 'Unassigned' },
      section: { name: s.section?.name || '—' },
      studentId: s.studentId,
      status: s.status || (s.isActive !== false ? 'ACTIVE' : 'INACTIVE'),
      parent: s.parent || { phoneNumber: s.phoneNumber || '' }
    }));

    const allStudents = [...normalizedDb, ...mockStudentsCatalog];

    // Exclude AKKIREDDY SADHVIK
    const cleanList = allStudents.filter(s => s.fullName !== 'AKKIREDDY SADHVIK');

    // Filter list
    const filtered = cleanList.filter(student => {
      // 1. Text Search Filter (name, admission number, or parent mobile)
      if (searchText.trim()) {
        const query = searchText.toLowerCase().trim();
        const matchesName = student.fullName.toLowerCase().includes(query);
        const matchesAdmission = student.studentId.toLowerCase().includes(query);
        const matchesParentPhone = student.parent?.phoneNumber?.toLowerCase().includes(query) || false;

        if (!matchesName && !matchesAdmission && !matchesParentPhone) {
          return false;
        }
      }

      // 2. Class Filter
      if (selectedClassId) {
        const targetClass = classesList.find(c => c.id === selectedClassId);
        if (targetClass && student.academicClass?.name !== targetClass.name) {
          return false;
        }
      }

      // 3. Section Filter
      if (selectedSectionId) {
        const targetSec = sectionsList.find(s => s.id === selectedSectionId);
        if (targetSec && student.section?.name !== targetSec.name) {
          return false;
        }
      }

      // 4. Status Filter
      if (selectedStatus !== 'Any') {
        if (student.status?.toUpperCase() !== selectedStatus.toUpperCase()) {
          return false;
        }
      }

      return true;
    });

    // Deduplicate by admission number to handle overlaps
    const seenAdmissions = new Set();
    const finalFiltered = [];
    filtered.forEach(s => {
      if (!seenAdmissions.has(s.studentId)) {
        seenAdmissions.add(s.studentId);
        finalFiltered.push(s);
      }
    });

    setSearchResults(finalFiltered);
  };

  const statusOptions = ['Any', 'ACTIVE', 'TRANSFERRED', 'GRADUATED', 'DROPPED'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-[640px] mx-auto animate-fade-in relative select-none font-sans"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black text-dark pr-8 mx-auto font-sans tracking-wide">Search Students</h1>
      </header>

      {/* Advanced Filters Card matching Screenshot 1 */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-6 card-shadow space-y-4">
        {/* Search Input field */}
        <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 focus-within:border-[#1597E5] transition-all">
          <FiSearch className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Name, admission number, or parent"
            className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="text-secondaryText hover:text-dark p-0.5"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Class Selector Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider pl-1">Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5] text-xs font-semibold text-dark cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23718096%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_16px_center] bg-no-repeat"
          >
            <option value="">Any</option>
            {classesList.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Section Selector Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider pl-1">Section</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            disabled={!selectedClassId}
            className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5] text-xs font-semibold text-dark disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23718096%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_16px_center] bg-no-repeat"
          >
            <option value="">Any</option>
            {sectionsList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Status Dropdown Trigger mimicking bottom sheet selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider pl-1">Status</label>
          <button
            type="button"
            onClick={() => setShowStatusDrawer(true)}
            className="w-full flex justify-between items-center px-4 py-3 bg-white border border-[#e2e8f0] rounded-[20px] text-xs font-semibold text-dark hover:border-[#e2e8f0] transition-colors"
          >
            <span>{selectedStatus}</span>
            <FiChevronDown className="w-4 h-4 text-secondaryText" />
          </button>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="w-full mt-2 py-3.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-[20px] text-xs font-extrabold shadow-md shadow-brand-blue/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <FiSearch className="w-4 h-4" />
          <span>Search</span>
        </button>
      </div>

      {/* Bottom results container matching Screenshot 1 */}
      <div className="space-y-3">
        {!hasSearched ? (
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 select-none min-h-[220px]">
            <div className="w-14 h-14 rounded-full bg-[#EEF5FB] border border-[#1597E5]/10 flex items-center justify-center">
              <FiFolder className="w-6 h-6 text-[#1597E5]" />
            </div>
            <div className="space-y-1 max-w-[280px]">
              <h3 className="text-xs font-extrabold text-dark font-sans">No results</h3>
              <p className="text-[10px] text-secondaryText font-semibold leading-relaxed font-sans">
                Search students by name, admission number, or parent mobile.
              </p>
            </div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 select-none min-h-[220px]">
            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
              <FiFolder className="w-6 h-6 text-secondaryText" />
            </div>
            <div className="space-y-1 max-w-[280px]">
              <h3 className="text-xs font-extrabold text-dark">No matches found</h3>
              <p className="text-[10px] text-secondaryText font-semibold leading-relaxed">
                Try modifying your filters or search keywords.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-[10px] font-extrabold text-[#718096] uppercase tracking-wider pl-2">
              Results ({searchResults.length})
            </h3>
            <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-2 card-shadow divide-y divide-[#e2e8f0]/30">
              {searchResults.map((student) => {
                const isInactive = student.status?.toUpperCase() !== 'ACTIVE';
                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      if (student.id.startsWith('mock')) {
                        return; // mock item click is disabled
                      }
                      navigate(`/settings/student/${student.id}`);
                    }}
                    className="flex justify-between items-center p-3.5 hover:bg-slate-50 rounded-[20px] transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-extrabold text-dark">{student.fullName}</span>
                      <div className="flex items-center gap-1.5 text-[9px] text-[#A0AEC0] font-semibold">
                        <span>Class {student.academicClass?.name}–{student.section?.name}</span>
                        <span>•</span>
                        <span>Adm: {student.studentId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isInactive
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}
                      >
                        {student.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Status bottom sheet drawer matching Screenshot 2 */}
      <AnimatePresence>
        {showStatusDrawer && (
          <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-50 flex items-end justify-center">
            {/* Backdrop exit click */}
            <div className="absolute inset-0" onClick={() => setShowStatusDrawer(false)} />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-[32px] w-full max-w-[640px] card-shadow z-10 overflow-hidden flex flex-col max-h-[85vh] select-none"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-[#e2e8f0]/40 shrink-0">
                <span className="text-sm font-extrabold text-dark">Status</span>
                <button
                  onClick={() => setShowStatusDrawer(false)}
                  className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-secondaryText transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Options List */}
              <div className="p-3 overflow-y-auto space-y-1 pb-6">
                {statusOptions.map((opt) => {
                  const isSelected = selectedStatus === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedStatus(opt);
                        setShowStatusDrawer(false);
                      }}
                      className="w-full flex justify-between items-center p-3.5 hover:bg-slate-50 rounded-[20px] text-xs font-bold text-left transition-colors cursor-pointer"
                    >
                      <span className={isSelected ? 'text-[#1597E5] font-extrabold' : 'text-dark'}>
                        {opt}
                      </span>
                      {isSelected && <FiCheck className="w-4 h-4 text-[#1597E5] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchStudents;
