import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiCalendar,
  FiInfo,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiFlag,
  FiBookOpen
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import {
  getHolidaysByBranch,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  createPublicHoliday,
  getActiveAcademicYear
} from '../../../services/dataService';

const STANDARD_PUBLIC_HOLIDAYS = [
  { name: 'Janmashtami', date: '2026-08-05', type: 'Festival Holiday', description: 'Festival holiday' },
  { name: 'Independence Day', date: '2026-08-15', type: 'National Holiday', description: 'National holiday – Government of India' },
  { name: 'Gandhi Jayanti', date: '2026-10-02', type: 'National Holiday', description: 'National holiday – Government of India' },
  { name: 'Dussehra', date: '2026-10-19', type: 'Festival Holiday', description: 'Vijaya Dashami' },
  { name: 'AP Formation Day', date: '2026-11-01', type: 'National Holiday', description: 'Andhra Pradesh State Formation Day' }
];

const HolidayManagement = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const branchId = user?.branchId;
  const createdById = user?.id;

  const [academicYear, setAcademicYear] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [typeInput, setTypeInput] = useState('School Holiday');
  const [descInput, setDescInput] = useState('');

  // Fetch initial academic year and holidays
  useEffect(() => {
    if (!branchId) return;

    const initialize = async () => {
      setLoading(true);
      try {
        const ay = await getActiveAcademicYear({ branchId });
        setAcademicYear(ay);

        const fromDate = ay?.startDate || '2026-06-12';
        const toDate = ay?.endDate || '2027-04-24';
        const list = await getHolidaysByBranch({ branchId, fromDate, toDate });
        setHolidays(list);
      } catch (err) {
        console.error('Error loading holiday data:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [branchId]);

  const loadHolidays = async () => {
    if (!branchId) return;
    try {
      const fromDate = academicYear?.startDate || '2026-06-12';
      const toDate = academicYear?.endDate || '2027-04-24';
      const list = await getHolidaysByBranch({ branchId, fromDate, toDate });
      setHolidays(list);
    } catch (err) {
      console.error('Error refetching holidays:', err);
    }
  };

  // Group holidays chronologically by Month/Year
  const groupedHolidays = useMemo(() => {
    const list = [];
    holidays.forEach((h) => {
      const dateObj = new Date(h.date);
      const monthName = dateObj.toLocaleString('en-US', { month: 'long' }).toUpperCase();
      const year = dateObj.getFullYear();
      const groupKey = `${monthName} ${year}`;

      let existing = list.find((g) => g.key === groupKey);
      if (!existing) {
        existing = { key: groupKey, items: [] };
        list.push(existing);
      }
      existing.items.push(h);
    });
    return list;
  }, [holidays]);

  // Determine standard public holidays not yet seeded in the branch
  const missingPublicHolidays = useMemo(() => {
    return STANDARD_PUBLIC_HOLIDAYS.filter(
      (std) => !holidays.some((h) => h.date === std.date)
    );
  }, [holidays]);

  // Seed standard public holidays
  const handleSeedPublic = async () => {
    if (!branchId || !createdById || missingPublicHolidays.length === 0) return;
    setActionLoading(true);
    try {
      for (const std of missingPublicHolidays) {
        await createPublicHoliday({
          branchId,
          name: std.name,
          date: std.date,
          type: std.type,
          description: std.description,
          createdById,
          isPublicHoliday: true,
          isSeeded: true
        });
      }
      await loadHolidays();
    } catch (err) {
      console.error('Error seeding public holidays:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Add modal
  const handleOpenAddModal = () => {
    setNameInput('');
    setDateInput(academicYear?.startDate || '2026-07-03');
    setTypeInput('School Holiday');
    setDescInput('');
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  // Add holiday submit
  const handleAddHolidaySubmit = async (e) => {
    e.preventDefault();
    if (!nameInput || !dateInput || !branchId || !createdById) return;

    setActionLoading(true);
    try {
      await createHoliday({
        branchId,
        name: nameInput,
        date: dateInput,
        type: typeInput,
        description: descInput || null,
        createdById
      });
      await loadHolidays();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating holiday:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit modal
  const handleOpenEditModal = (h) => {
    setEditingHoliday(h);
    setNameInput(h.name);
    setDateInput(h.date);
    setTypeInput(h.type);
    setDescInput(h.description || '');
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingHoliday(null);
  };

  // Edit holiday submit
  const handleEditHolidaySubmit = async (e) => {
    e.preventDefault();
    if (!editingHoliday || !nameInput || !dateInput || !createdById) return;

    setActionLoading(true);
    try {
      await updateHoliday({
        id: editingHoliday.id,
        name: nameInput,
        date: dateInput,
        type: typeInput,
        description: descInput || null,
        updatedById: createdById
      });
      await loadHolidays();
      setShowEditModal(false);
      setEditingHoliday(null);
    } catch (err) {
      console.error('Error updating holiday:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete holiday
  const handleDelete = async (id) => {
    if (!createdById) return;
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;

    setActionLoading(true);
    try {
      await deleteHoliday({ id, deletedById: createdById });
      await loadHolidays();
    } catch (err) {
      console.error('Error deleting holiday:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-[640px] mx-auto animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="relative flex items-center justify-between py-3 border-b border-[#e2e8f0]/40 shrink-0 select-none">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-dark tracking-tight absolute left-1/2 -translate-x-1/2">
          Holiday Management
        </h1>
        <div className="w-9 h-9" />
      </header>

      {/* Academic Year range header bar */}
      <div className="flex justify-between items-center py-1 px-1 text-xs select-none">
        <div className="flex items-center gap-1.5 text-[#1597E5] font-bold">
          <FiCalendar className="w-4 h-4" />
          <span>
            {academicYear?.name || '2026-27'} · {academicYear?.startDate || '2026-06-12'} – {academicYear?.endDate || '2027-04-24'}
          </span>
        </div>
        <span className="text-secondaryText font-bold">{holidays.length} holidays</span>
      </div>

      {/* Seed Public Banner */}
      {!loading && missingPublicHolidays.length > 0 && (
        <div className="bg-[#EEF5FB] rounded-[24px] px-5 py-4 flex justify-between items-center select-none border border-[#1597E5]/10">
          <div className="flex items-center gap-2">
            <FiInfo className="w-4.5 h-4.5 text-[#1597E5]" />
            <span className="text-xs font-bold text-dark">
              {missingPublicHolidays.length} public holidays can be added
            </span>
          </div>
          <button
            onClick={handleSeedPublic}
            disabled={actionLoading}
            className="px-5 py-2 border border-[#1597E5] text-[#1597E5] hover:bg-[#1597E5] hover:text-white text-[11px] font-extrabold rounded-full transition-all cursor-pointer disabled:opacity-50"
          >
            Seed Public
          </button>
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : holidays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <p className="text-sm font-bold text-secondaryText">No holidays added yet.</p>
          <p className="text-xs text-secondaryText/60">Click the "+ Add Holiday" button to create one.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedHolidays.map((group) => (
            <div key={group.key} className="space-y-3">
              <h2 className="text-[10px] font-black text-secondaryText tracking-wider uppercase px-1">
                {group.key}
              </h2>
              <div className="space-y-3">
                {group.items.map((h) => {
                  const dateObj = new Date(h.date);
                  const dayNum = dateObj.getDate();
                  const monthName = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();

                  // Styling based on holiday type
                  let tagBg = 'bg-blue-50 text-blue-500';
                  let tagIcon = <FiBookOpen className="w-3 h-3" />;
                  if (h.type === 'Festival Holiday') {
                    tagBg = 'bg-purple-50 text-purple-500';
                    tagIcon = <FiCalendar className="w-3 h-3" />;
                  } else if (h.type === 'National Holiday') {
                    tagBg = 'bg-red-50 text-red-500';
                    tagIcon = <FiFlag className="w-3 h-3" />;
                  }

                  return (
                    <div
                      key={h.id}
                      className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow flex items-center justify-between transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Date Badge */}
                        <div className="w-14 h-14 rounded-[20px] bg-[#EEF5FB] border border-[#1597E5]/5 flex flex-col items-center justify-center shrink-0">
                          <span className="text-lg font-black text-[#1597E5] leading-none">{dayNum}</span>
                          <span className="text-[9px] font-extrabold text-[#1597E5]/70 mt-1">{monthName}</span>
                        </div>

                        {/* Name & Desc */}
                        <div className="space-y-1.5 min-w-0">
                          <h3 className="text-xs font-black text-dark truncate">{h.name}</h3>
                          {h.description && (
                            <p className="text-[10px] font-bold text-secondaryText truncate leading-tight">
                              {h.description}
                            </p>
                          )}
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wide ${tagBg}`}
                            >
                              {tagIcon}
                              {h.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(h)}
                          className="p-2 hover:bg-[#EEF5FB] rounded-full text-[#1597E5] transition-colors cursor-pointer"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="p-2 hover:bg-red-50/50 rounded-full text-[#EF4444] transition-colors cursor-pointer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Add Holiday Button */}
      {!loading && (
        <button
          onClick={handleOpenAddModal}
          className="fixed bottom-6 right-6 bg-[#1597E5] hover:bg-[#00A1FF] text-white px-6 py-3.5 rounded-full font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-brand-blue/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] z-40"
        >
          <FiPlus className="w-4 h-4" />
          Add Holiday
        </button>
      )}

      {/* Add Holiday Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] w-full max-w-md p-6 card-shadow space-y-4 border border-[#e2e8f0]/40 relative"
            >
              <button
                onClick={handleCloseAddModal}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-secondaryText transition-colors cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h2 className="text-base font-black text-dark">Add Holiday</h2>

              <form onSubmit={handleAddHolidaySubmit} className="space-y-4 pt-2">
                {/* Holiday Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Holiday Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwali, Sports Day"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  />
                  <p className="text-[9px] text-[#A0AEC0] font-bold">
                    AY range: {academicYear?.startDate || '2026-06-12'} – {academicYear?.endDate || '2027-04-24'}
                  </p>
                </div>

                {/* Holiday Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Holiday Type *
                  </label>
                  <select
                    required
                    value={typeInput}
                    onChange={(e) => setTypeInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option value="School Holiday">School Holiday</option>
                    <option value="Festival Holiday">Festival Holiday</option>
                    <option value="National Holiday">National Holiday</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Add a note about this holiday"
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="flex-1 py-3 border border-[#e2e8f0] hover:bg-slate-50 text-xs font-bold text-secondaryText rounded-full transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !nameInput || !dateInput}
                    className="flex-1 py-3 bg-[#1597E5] hover:bg-[#00A1FF] disabled:bg-[#1597E5]/40 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                  >
                    Add Holiday
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Holiday Modal */}
      <AnimatePresence>
        {showEditModal && editingHoliday && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] w-full max-w-md p-6 card-shadow space-y-4 border border-[#e2e8f0]/40 relative"
            >
              <button
                onClick={handleCloseEditModal}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-secondaryText transition-colors cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h2 className="text-base font-black text-dark">Edit Holiday</h2>

              <form onSubmit={handleEditHolidaySubmit} className="space-y-4 pt-2">
                {/* Holiday Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Holiday Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  />
                  <p className="text-[9px] text-[#A0AEC0] font-bold">
                    AY range: {academicYear?.startDate || '2026-06-12'} – {academicYear?.endDate || '2027-04-24'}
                  </p>
                </div>

                {/* Holiday Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Holiday Type *
                  </label>
                  <select
                    required
                    value={typeInput}
                    onChange={(e) => setTypeInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option value="School Holiday">School Holiday</option>
                    <option value="Festival Holiday">Festival Holiday</option>
                    <option value="National Holiday">National Holiday</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[16px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="flex-1 py-3 border border-[#e2e8f0] hover:bg-slate-50 text-xs font-bold text-secondaryText rounded-full transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !nameInput || !dateInput}
                    className="flex-1 py-3 bg-[#1597E5] hover:bg-[#00A1FF] disabled:bg-[#1597E5]/40 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HolidayManagement;
