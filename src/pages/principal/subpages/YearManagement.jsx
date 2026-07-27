import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiCheckCircle, FiAlertTriangle, FiCalendar, FiEdit2, FiX, FiInbox, FiClock } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { subscribeAcademicYears, saveAcademicYears } from '../../../services/yearService';

const DEFAULT_YEARS = [
  { id: '2', year: '2027-28', status: 'PLANNING', startDate: '2027-06-01', endDate: '2028-04-30', startYear: '2027' },
  { id: '1', year: '2026-27', status: 'ACTIVE', startDate: '2026-06-12', endDate: '2027-04-24', startYear: '2026' }
];

const formatDateString = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

const YearManagement = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const branchId = user?.branchId || 'sontyam-branch-id';

  const [dbYears, setDbYears] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Year modal state (Screenshot 2 bottom sheet)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createYearName, setCreateYearName] = useState('2026-27');
  const [createStartYear, setCreateStartYear] = useState('2026');
  const [createStartDate, setCreateStartDate] = useState('2026-06-01');
  const [createEndDate, setCreateEndDate] = useState('2027-04-30');

  // Edit states
  const [editingYear, setEditingYear] = useState(null);
  const [yearName, setYearName] = useState('');
  const [startYearVal, setStartYearVal] = useState('');
  const [startDateVal, setStartDateVal] = useState('');
  const [endDateVal, setEndDateVal] = useState('');

  const [showActivateConfirm, setShowActivateConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
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

  // Create academic year (Screenshot 2 drawer submit)
  const handleCreateYear = async (e) => {
    e.preventDefault();
    if (!createYearName || !createStartYear) return;

    const newYearObj = {
      id: String(Date.now()),
      year: createYearName.trim(),
      startYear: createStartYear.trim(),
      startDate: createStartDate,
      endDate: createEndDate,
      status: activeYearsList.length === 0 ? 'ACTIVE' : 'PLANNING'
    };

    const newList = [newYearObj, ...activeYearsList];
    try {
      await saveAcademicYears(branchId, newList);
      setShowCreateModal(false);
      setSuccessMessage(`Academic Year ${createYearName} created successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error creating year:', err);
      alert('Failed to create academic year.');
    }
  };

  const handleOpenEdit = (y) => {
    setEditingYear(y);
    setYearName(y.year);
    setStartYearVal(y.startYear || y.year.split('-')[0]);
    setStartDateVal(y.startDate);
    setEndDateVal(y.endDate);
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
    setShowActivateConfirm(true);
  };

  const handleCloseYear = async (y) => {
    setConfirmTarget(y);
    setShowCloseConfirm(true);
  };

  const handleConfirmClose = async () => {
    if (!confirmTarget) return;
    setShowCloseConfirm(false);

    const newList = activeYearsList.map(item => item.id === confirmTarget.id ? {
      ...item,
      status: 'CLOSED'
    } : item);
    try {
      await saveAcademicYears(branchId, newList);
      setSuccessMessage(`Closed academic year ${confirmTarget.year}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error closing year:', err);
    }
  };

  const handleConfirmActivate = async () => {
    if (!confirmTarget) return;
    setShowActivateConfirm(false);

    // Rollover logic: archive active years and activate target
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="w-10 h-10 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        <h1 className="text-sm font-black text-dark pr-8 mx-auto tracking-tight">Year Management</h1>
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

      {/* Blue Header Card (Screenshot 2) */}
      {/* Blue Header Card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden font-sans">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        {/* Action Button: + Upcoming Set */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="absolute top-6 right-6 inline-flex items-center gap-1 text-[10px] font-black text-white bg-white/15 border border-white/25 px-4 py-2 rounded-full hover:bg-white/25 transition-all cursor-pointer shadow-sm select-none"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>Upcoming Set</span>
        </button>

        {/* Subtitle */}
        <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase font-black">Academic Year</span>
        <h2 className="text-xl font-bold mt-1">Year Management</h2>
        
        {activeYearObj.year && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/10 rounded-full mt-3.5 text-[9.5px] font-black uppercase tracking-wider select-none text-white">
            <span className="w-1.5 h-1.5 bg-[#48BB78] rounded-full animate-pulse" />
            <span>Active: {activeYearObj.year}</span>
          </div>
        )}
      </div>

      {/* Empty State Card */}
      {activeYearsList.length === 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-12 flex flex-col items-center justify-center text-center space-y-4 card-shadow font-sans select-none">
          <div className="w-16 h-16 rounded-full bg-slate-100/70 border border-slate-200/50 flex items-center justify-center text-brand-blue">
            <FiInbox className="w-7 h-7 text-[#1597E5]/70" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-black text-dark">No academic years</h3>
            <p className="text-xs text-secondaryText font-medium max-w-[280px]">
              Create your first academic year to get started.
            </p>
          </div>
        </div>
      )}

      {/* Year Registry List */}
      {activeYearsList.length > 0 && (
        <div className="space-y-3.5 select-none font-sans">
          {activeYearsList.map((y) => {
            const isPlanning = y.status === 'PLANNING';
            const isActive = y.status === 'ACTIVE';

            return (
              <div
                key={y.id}
                className={`bg-white rounded-[24px] border p-4 px-5 card-shadow flex justify-between items-center hover:border-brand-blue/10 transition-all ${
                  isActive ? 'border-[#23C16B] shadow-sm shadow-emerald-50' : 'border-[#e2e8f0]/45'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Year Indicator Dot */}
                  <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                    isActive ? 'bg-[#23C16B]' : isPlanning ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />

                  <div>
                    <h4 className="text-sm font-black text-dark font-sans leading-none">{y.year}</h4>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-[10px] text-[#A0AEC0] font-bold font-sans">
                        {formatDateString(y.startDate)} – {formatDateString(y.endDate)}
                      </p>
                      {isPlanning && (
                        <button
                          onClick={() => handleOpenEdit(y)}
                          className="p-1 hover:bg-[#EEF5FB] rounded-full text-slate-400 hover:text-[#1597E5] transition-all cursor-pointer animate-fade-in"
                          title="Edit year"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-2.5">
                      {isActive ? (
                        <div className="flex items-center gap-1.5 text-[8.5px] font-black text-emerald-500 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>ACTIVE</span>
                        </div>
                      ) : isPlanning ? (
                        <div className="flex items-center gap-1.5 text-[8.5px] font-black text-amber-500 uppercase tracking-wider">
                          <FiClock className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>PLANNING</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[8.5px] font-black text-slate-400 uppercase tracking-wider">
                          <span>CLOSED</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {isPlanning && (
                    <button
                      onClick={() => handleOpenActivateConfirm(y)}
                      className="px-5 py-2 border border-[#1597E5] text-[#1597E5] hover:bg-[#EEF5FB] hover:border-[#00A1FF] hover:text-[#00A1FF] rounded-full text-[10.5px] font-black tracking-wide transition-all cursor-pointer active:scale-95 bg-white select-none"
                    >
                      Activate
                    </button>
                  )}
                  {isActive && (
                    <button
                      onClick={() => handleCloseYear(y)}
                      className="px-5 py-2 border border-red-500/80 text-red-500 hover:bg-red-50 rounded-full text-[10.5px] font-black tracking-wide transition-all cursor-pointer active:scale-95 bg-white select-none"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Academic Year Slide-up Modal Drawer Overlay */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="absolute inset-0" onClick={() => setShowCreateModal(false)} />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-[32px] w-full max-w-[640px] p-6 shadow-2xl z-10 relative space-y-5"
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3" />

              <div className="flex justify-between items-center pb-2 select-none">
                <h3 className="text-base font-black text-dark font-sans leading-none">Create Academic Year</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-[#A0AEC0] transition-colors"
                >
                  <FiX className="w-5.5 h-5.5" />
                </button>
              </div>

              <form onSubmit={handleCreateYear} className="space-y-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">YEAR NAME (E.G. 2026-27)</label>
                  <input
                    type="text"
                    required
                    value={createYearName}
                    onChange={(e) => setCreateYearName(e.target.value)}
                    placeholder="2026-27"
                    className="w-full bg-slate-50/30 border border-blue-100 rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">START YEAR (E.G. 2026)</label>
                  <input
                    type="text"
                    required
                    value={createStartYear}
                    onChange={(e) => setCreateStartYear(e.target.value)}
                    placeholder="2026"
                    className="w-full bg-slate-50/30 border border-blue-100 rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Start Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={createStartDate}
                      onChange={(e) => setCreateStartDate(e.target.value)}
                      className="w-full bg-slate-50/30 border border-blue-100 rounded-[20px] px-4 py-3.5 pr-10 text-xs font-semibold focus:outline-none focus:border-[#1597E5] focus:bg-white cursor-pointer"
                    />
                    <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">End Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={createEndDate}
                      onChange={(e) => setCreateEndDate(e.target.value)}
                      className="w-full bg-slate-50/30 border border-blue-100 rounded-[20px] px-4 py-3.5 pr-10 text-xs font-semibold focus:outline-none focus:border-[#1597E5] focus:bg-white cursor-pointer"
                    />
                    <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 select-none">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3.5 bg-white border border-[#e2e8f0] hover:bg-slate-50 text-slate-500 rounded-full font-black text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-black text-xs transition-all shadow-md shadow-brand-blue/20 cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Academic Year Slide-up Modal Panel */}
      <AnimatePresence>
        {editingYear && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="absolute inset-0" onClick={() => setEditingYear(null)} />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-[32px] w-full max-w-[640px] p-6 shadow-2xl z-10 relative space-y-5"
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3" />

              <div className="flex justify-between items-center pb-2 select-none">
                <h3 className="text-base font-black text-dark font-sans leading-none">Edit Academic Year</h3>
                <button
                  onClick={() => setEditingYear(null)}
                  className="p-1 hover:bg-slate-100 rounded-full text-secondaryText transition-colors"
                >
                  <FiX className="w-5.5 h-5.5" />
                </button>
              </div>

              <form onSubmit={handleUpdateYear} className="space-y-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">YEAR NAME (E.G. 2026-27)</label>
                  <input
                    type="text"
                    required
                    value={yearName}
                    onChange={(e) => setYearName(e.target.value)}
                    placeholder="2027-28"
                    className="w-full bg-slate-50/30 border border-blue-100 rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">START YEAR (E.G. 2026)</label>
                  <input
                    type="text"
                    required
                    value={startYearVal}
                    onChange={(e) => setStartYearVal(e.target.value)}
                    placeholder="2027"
                    className="w-full bg-slate-50/30 border border-blue-100 rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Start Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={startDateVal}
                      onChange={(e) => setStartDateVal(e.target.value)}
                      className="w-full bg-slate-50/30 border border-blue-100 rounded-[20px] px-4 py-3.5 pr-10 text-xs font-semibold focus:outline-none focus:border-[#1597E5] focus:bg-white cursor-pointer"
                    />
                    <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">End Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={endDateVal}
                      onChange={(e) => setEndDateVal(e.target.value)}
                      className="w-full bg-slate-50/30 border border-blue-100 rounded-[20px] px-4 py-3.5 pr-10 text-xs font-semibold focus:outline-none focus:border-[#1597E5] focus:bg-white cursor-pointer"
                    />
                    <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 select-none">
                  <button
                    type="button"
                    onClick={() => setEditingYear(null)}
                    className="flex-1 py-3.5 bg-white border border-[#e2e8f0] hover:bg-slate-50 text-slate-500 rounded-full font-black text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-black text-xs transition-all shadow-md shadow-brand-blue/20 cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Activate Academic Year Confirmation Modal */}
      <AnimatePresence>
        {showActivateConfirm && confirmTarget && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] max-w-sm w-full p-6 text-center space-y-6 card-shadow font-sans select-none relative flex flex-col items-center justify-center border border-[#e2e8f0]/40"
            >
              <button
                onClick={() => setShowActivateConfirm(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-[#A0AEC0] cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-full bg-blue-50/50 flex items-center justify-center mt-2">
                <div className="w-12 h-12 rounded-full bg-[#00A1FF] flex items-center justify-center text-white text-xl font-bold select-none">
                  ?
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black text-dark font-sans">
                  Activate Academic Year?
                </h3>
                <p className="text-xs text-secondaryText leading-relaxed font-semibold max-w-[280px]">
                  Activating "{confirmTarget.year}" will deactivate the current active year. Attendance and other features will use this year from now on.
                </p>
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setShowActivateConfirm(false)}
                  className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-xs font-black text-[#A0AEC0] rounded-[20px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmActivate}
                  className="flex-1 py-3.5 bg-[#00A1FF] hover:bg-[#0088ff] text-white text-xs font-black rounded-[20px] transition-colors cursor-pointer shadow-md shadow-brand-blue/20"
                >
                  Activate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Close Academic Year Confirmation Modal */}
      <AnimatePresence>
        {showCloseConfirm && confirmTarget && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] max-w-sm w-full p-6 text-center space-y-6 card-shadow font-sans select-none relative flex flex-col items-center justify-center border border-[#e2e8f0]/40"
            >
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-[#A0AEC0] cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-full bg-blue-50/50 flex items-center justify-center mt-2">
                <div className="w-12 h-12 rounded-full bg-[#00A1FF] flex items-center justify-center text-white text-xl font-bold select-none">
                  ?
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black text-dark font-sans">
                  Close Academic Year?
                </h3>
                <p className="text-xs text-secondaryText leading-relaxed font-semibold max-w-[280px]">
                  Closing "{confirmTarget.year}" will stop all attendance for this year. Make sure all promotions are processed before closing.
                </p>
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-xs font-black text-[#A0AEC0] rounded-[20px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClose}
                  className="flex-1 py-3.5 bg-[#00A1FF] hover:bg-[#0088ff] text-white text-xs font-black rounded-[20px] transition-colors cursor-pointer shadow-md shadow-brand-blue/20"
                >
                  Close Year
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default YearManagement;
