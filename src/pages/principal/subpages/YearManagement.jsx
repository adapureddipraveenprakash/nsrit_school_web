import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiCheckCircle, FiAlertTriangle, FiCalendar, FiEdit2, FiX } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { subscribeAcademicYears, saveAcademicYears } from '../../../services/yearService';

const DEFAULT_YEARS = [
  { id: '2', year: '2027-28', status: 'PLANNING', startDate: '2027-06-01', endDate: '2028-04-30', startYear: '2027' },
  { id: '1', year: '2026-27', status: 'ACTIVE', startDate: '2026-06-12', endDate: '2027-04-24', startYear: '2026' }
];

const YearManagement = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const branchId = user?.branchId || 'sontyam-branch-id';

  const [dbYears, setDbYears] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Form state (Screenshot 5 bottom sheet)
  const [editingYear, setEditingYear] = useState(null);
  const [yearName, setYearName] = useState('');
  const [startYearVal, setStartYearVal] = useState('');
  const [startDateVal, setStartDateVal] = useState('');
  const [endDateVal, setEndDateVal] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Subscribe to Firestore academic years
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAcademicYears(branchId,
      (list) => {
        setDbYears(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching academic years:', err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [branchId]);

  const activeYearsList = useMemo(() => {
    return dbYears.length > 0 ? dbYears : DEFAULT_YEARS;
  }, [dbYears]);

  const activeYearObj = useMemo(() => {
    return activeYearsList.find(y => y.status === 'ACTIVE') || { year: '2026-27' };
  }, [activeYearsList]);

  // Seeding initial years if database is empty
  const handleSeedYears = async () => {
    try {
      await saveAcademicYears(branchId, DEFAULT_YEARS);
    } catch (err) {
      console.error('Error seeding years:', err);
    }
  };

  const handleOpenEdit = (y) => {
    setEditingYear(y);
    setYearName(y.year);
    setStartYearVal(y.startYear || y.year.split('-')[0]);
    setStartDateVal(y.startDate);
    setEndDateVal(y.endDate);
  };

  const handleCreateUpcoming = async () => {
    // Generate next year
    const lastYear = activeYearsList[0]?.year || '2027-28';
    const parts = lastYear.split('-');
    const currentStart = parseInt(parts[0]);
    const nextStart = currentStart + 1;
    const nextEnd = (nextStart + 1) % 100;
    
    const newYearStr = `20${nextStart}-${String(nextEnd).padStart(2, '0')}`;
    const newYearObj = {
      id: String(Date.now()),
      year: newYearStr,
      status: 'PLANNING',
      startYear: `20${nextStart}`,
      startDate: `20${nextStart}-06-01`,
      endDate: `20${nextStart + 1}-04-30`
    };

    const newList = [newYearObj, ...activeYearsList];
    try {
      await saveAcademicYears(branchId, newList);
      setSuccessMessage(`Academic Year ${newYearStr} created in Planning!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding year:', err);
    }
  };

  const handleUpdateYear = async (e) => {
    e.preventDefault();
    if (!editingYear) return;

    const newList = activeYearsList.map(y => y.id === editingYear.id ? {
      ...y,
      year: yearName,
      startYear: startYearVal,
      startDate: startDateVal,
      endDate: endDateVal
    } : y);

    try {
      await saveAcademicYears(branchId, newList);
      setEditingYear(null);
      setSuccessMessage('Academic year updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating year:', err);
    }
  };

  const handleOpenActivateConfirm = (y) => {
    setConfirmTarget(y);
    setShowConfirmModal(true);
  };

  const handleCloseYear = async (y) => {
    if (window.confirm(`Are you sure you want to close year ${y.year}?`)) {
      const newList = activeYearsList.map(item => item.id === y.id ? {
        ...item,
        status: 'CLOSED'
      } : item);
      try {
        await saveAcademicYears(branchId, newList);
        setSuccessMessage(`Closed academic year ${y.year}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error closing year:', err);
      }
    }
  };

  const handleConfirmActivate = async () => {
    if (!confirmTarget) return;
    setShowConfirmModal(false);

    // Rollover logic: archive active years and activate the target one
    const newList = activeYearsList.map(y => {
      if (y.id === confirmTarget.id) {
        return { ...y, status: 'ACTIVE' };
      }
      if (y.status === 'ACTIVE') {
        return { ...y, status: 'CLOSED' };
      }
      return y;
    });

    try {
      await saveAcademicYears(branchId, newList);
      setSuccessMessage(`Year ${confirmTarget.year} is now ACTIVE!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error activating year:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 max-w-[640px] mx-auto relative select-none animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Year Management</h1>
      </header>

      {/* Success Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#23C16B] font-bold"
          >
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blue Header Card (Screenshot 5) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        {/* Action Button: Upcoming Set */}
        <button
          onClick={handleCreateUpcoming}
          className="absolute top-6 right-6 inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/15 border border-white/25 px-3.5 py-1.5 rounded-full hover:bg-white/25 transition-all cursor-pointer"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>Upcoming Set</span>
        </button>

        {/* Subtitle */}
        <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase font-sans font-black">Academic Year</span>
        <h2 className="text-xl font-bold mt-1 font-sans">Year Management</h2>
        
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/25 border border-white/20 rounded-full mt-3.5 text-[9px] font-bold uppercase">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Active: {activeYearObj.year}
        </div>
      </div>

      {dbYears.length === 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-4 flex justify-between items-center font-sans">
          <span className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wide">
            Database year registry is empty
          </span>
          <button
            onClick={handleSeedYears}
            className="px-3.5 py-1.5 bg-[#1597E5] text-white hover:bg-[#00A1FF] rounded-full text-[10.5px] font-black cursor-pointer transition-all active:scale-95"
          >
            Seed Years
          </button>
        </div>
      )}

      {/* Year Registry List (Screenshot 5 layout) */}
      <div className="space-y-3.5 select-none">
        {activeYearsList.map((y) => {
          const isPlanning = y.status === 'PLANNING';
          const isActive = y.status === 'ACTIVE';

          return (
            <div
              key={y.id}
              className={`bg-white rounded-[24px] border p-4 px-5 card-shadow flex justify-between items-center hover:border-brand-blue/15 transition-all ${
                isActive ? 'border-emerald-200' : 'border-[#e2e8f0]/45'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Year Indicator Dot */}
                <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                  isActive ? 'bg-emerald-500' : isPlanning ? 'bg-amber-500' : 'bg-slate-300'
                }`} />

                <div>
                  <h4 className="text-xs font-black text-dark font-sans leading-none">{y.year}</h4>
                  
                  {/* Date range formatted: 01-06-2027 - 30-04-2028 */}
                  <p className="text-[9.5px] text-[#A0AEC0] font-bold mt-2 font-sans">
                    {y.startDate ? new Date(y.startDate).toLocaleDateString('en-GB').replace(/\//g, '-') : ''} - {y.endDate ? new Date(y.endDate).toLocaleDateString('en-GB').replace(/\//g, '-') : ''}
                  </p>

                  {/* Status Indicator */}
                  <div className="mt-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider ${
                      isActive ? 'bg-emerald-50 text-emerald-600' :
                      isPlanning ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-50 text-slate-400'
                    }`}>
                      {y.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isPlanning && (
                  <>
                    <button
                      onClick={() => handleOpenEdit(y)}
                      className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-[#1597E5] transition-colors cursor-pointer"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenActivateConfirm(y)}
                      className="px-4 py-2 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full text-[10.5px] font-extrabold transition-all cursor-pointer active:scale-95 shadow-sm shadow-[#1597E5]/15"
                    >
                      Activate
                    </button>
                  </>
                )}
                {isActive && (
                  <button
                    onClick={() => handleCloseYear(y)}
                    className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-full text-[10.5px] font-extrabold transition-all cursor-pointer active:scale-95"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Academic Year Slide-up Modal Panel (Screenshot 5) */}
      <AnimatePresence>
        {editingYear && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-end justify-center">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setEditingYear(null)} />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-[32px] w-full max-w-[640px] p-6 shadow-2xl z-10 relative space-y-5"
            >
              {/* Drag indicator handle */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3" />

              <div className="flex justify-between items-center pb-2 select-none">
                <h3 className="text-sm font-black text-dark font-sans leading-none">Edit Academic Year</h3>
                <button
                  onClick={() => setEditingYear(null)}
                  className="p-1 hover:bg-slate-100 rounded-full text-secondaryText transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateYear} className="space-y-4 font-sans text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Year Name (e.g. 2026-27)</label>
                  <input
                    type="text"
                    required
                    value={yearName}
                    onChange={(e) => setYearName(e.target.value)}
                    placeholder="2027-28"
                    className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Start Year (e.g. 2026)</label>
                  <input
                    type="text"
                    required
                    value={startYearVal}
                    onChange={(e) => setStartYearVal(e.target.value)}
                    placeholder="2027"
                    className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Start Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={startDateVal}
                      onChange={(e) => setStartDateVal(e.target.value)}
                      className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">End Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={endDateVal}
                      onChange={(e) => setEndDateVal(e.target.value)}
                      className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 select-none">
                  <button
                    type="button"
                    onClick={() => setEditingYear(null)}
                    className="flex-1 py-3.5 bg-white border border-[#e2e8f0] hover:bg-slate-50 text-[#1597E5] rounded-[20px] font-extrabold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-[20px] font-extrabold text-xs transition-all shadow-md shadow-brand-blue/20 cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-dark/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 text-center space-y-4 card-shadow animate-fade-in font-sans">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-dark">Confirm System Rollover</h3>
              <p className="text-xs text-[#A0AEC0] font-semibold leading-relaxed">
                This will ARCHIVE the current active year and mark the new year as ACTIVE. All student promotions must be completed prior to activation.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border border-[#e2e8f0] text-secondaryText hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmActivate}
                className="flex-1 py-3 bg-[#EF4444] text-white hover:bg-[#DC2626] text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-red-100"
              >
                Proceed Rollover
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default YearManagement;
