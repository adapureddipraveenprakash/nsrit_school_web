import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiInfo, FiCalendar, FiX, FiFlag, FiChevronDown } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { subscribeHolidays, saveHolidays } from '../../../services/holidayService';

const MOCK_HOLIDAYS = [
  { id: '1', name: 'Janmashtami', desc: 'Festival holiday', type: 'Festival Holiday', date: '2026-08-05' },
  { id: '2', name: 'Independence Day', desc: 'National holiday — Government of India', type: 'National Holiday', date: '2026-08-15' },
  { id: '3', name: 'Gandhi Jayanti', desc: 'National holiday — Government of India', type: 'National Holiday', date: '2026-10-02' },
  { id: '4', name: 'Dussehra', desc: 'Vijaya Dashami', type: 'Festival Holiday', date: '2026-10-19' },
  { id: '5', name: 'AP Formation Day', desc: 'Andhra Pradesh State Formation Day', type: 'State Holiday', date: '2026-11-01' },
  { id: '6', name: 'Diwali', desc: 'Diwali — Festival of Lights', type: 'Festival Holiday', date: '2026-11-08' },
  { id: '7', name: 'Diwali (Day 2)', desc: 'Diwali holiday', type: 'Festival Holiday', date: '2026-11-09' },
  { id: '8', name: 'Guru Nanak Jayanti', desc: 'Festival holiday', type: 'Festival Holiday', date: '2026-11-24' },
  { id: '9', name: 'Christmas Day', desc: 'Festival holiday', type: 'Festival Holiday', date: '2026-12-25' },
  { id: '10', name: 'Republic Day', desc: 'National holiday — Government of India', type: 'National Holiday', date: '2026-01-26' },
  { id: '11', name: 'Holi', desc: 'Festival of colours', type: 'Festival Holiday', date: '2027-03-09' },
  { id: '12', name: 'Good Friday', desc: 'Festival holiday', type: 'Festival Holiday', date: '2027-04-02' },
  { id: '13', name: 'Dr. Ambedkar Jayanti', desc: 'National holiday', type: 'National Holiday', date: '2027-04-14' }
];

const HolidayManagement = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const branchId = user?.branchId || 'sontyam-branch-id';

  const [dbHolidays, setDbHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDesc, setHolidayDesc] = useState('');
  const [holidayType, setHolidayType] = useState('School Holiday'); // 'School Holiday' | 'Festival Holiday' | 'National Holiday' | 'State Holiday'
  const [holidayDate, setHolidayDate] = useState('');

  // Subscribe to realtime database logs
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeHolidays(branchId, 
      (list) => {
        setDbHolidays(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching holidays:', err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [branchId]);

  const activeHolidays = useMemo(() => {
    return dbHolidays.length > 0 ? dbHolidays : MOCK_HOLIDAYS;
  }, [dbHolidays]);

  // Group holidays by month
  const holidaysByMonth = useMemo(() => {
    const months = {};
    const sorted = [...activeHolidays].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sorted.forEach(h => {
      const dateObj = new Date(h.date);
      // Constructing formatting like "AUGUST 2026"
      const monthYear = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!months[monthYear]) {
        months[monthYear] = [];
      }
      months[monthYear].push({
        ...h,
        dayNum: dateObj.getDate(),
        monthShort: dateObj.toLocaleString('default', { month: 'short' }).toUpperCase()
      });
    });
    return months;
  }, [activeHolidays]);

  // Seed default mockup values to DB
  const handleSeedPublic = async () => {
    if (dbHolidays.length > 0) return;
    try {
      await saveHolidays(branchId, MOCK_HOLIDAYS);
    } catch (err) {
      console.error('Error seeding holidays:', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setHolidayName('');
    setHolidayDesc('');
    setHolidayType('School Holiday');
    
    // Set date to today's date dynamically
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setHolidayDate(`${yyyy}-${mm}-${dd}`);
    
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h) => {
    setEditingId(h.id);
    setHolidayName(h.name);
    setHolidayDesc(h.desc || '');
    setHolidayType(h.type || 'Festival Holiday');
    setHolidayDate(h.date);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      const newList = activeHolidays.filter(item => item.id !== id);
      try {
        await saveHolidays(branchId, newList);
      } catch (err) {
        console.error('Error deleting holiday:', err);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!holidayName || !holidayDate) return;

    let newList = [...activeHolidays];
    if (editingId) {
      newList = newList.map(item => item.id === editingId ? {
        ...item,
        name: holidayName,
        desc: holidayDesc,
        type: holidayType,
        date: holidayDate
      } : item);
    } else {
      newList.push({
        id: String(Date.now()),
        name: holidayName,
        desc: holidayDesc,
        type: holidayType,
        date: holidayDate
      });
    }

    try {
      await saveHolidays(branchId, newList);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving holiday:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 max-w-[640px] mx-auto relative select-none animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Holiday Management</h1>
      </header>

      {/* Top banner info row */}
      <div className="flex justify-between items-center bg-[#EEF5FB]/75 rounded-[18px] p-3.5 px-4.5 text-[10px] font-black text-secondaryText font-sans uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <span>📅</span> 2026-27 · 2026-06-12 ~ 2027-04-24
        </span>
        <span className="bg-white border border-[#e2e8f0] rounded-full px-2.5 py-0.5 text-dark font-extrabold lowercase">
          {activeHolidays.length} holidays
        </span>
      </div>

      {/* Seeding Warning Banner Row (Screenshot 1 Layout) */}
      <div className="flex justify-between items-center bg-slate-50 border border-[#e2e8f0]/60 rounded-[20px] p-4 font-sans select-none">
        <div className="flex items-center gap-2">
          <FiInfo className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wide">
            {dbHolidays.length > 0 ? 'All standard public holidays already seeded' : '13 public holidays can be added'}
          </span>
        </div>
        <button
          onClick={handleSeedPublic}
          disabled={dbHolidays.length > 0}
          className={`px-3.5 py-1.5 border rounded-full text-[10.5px] font-black cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shadow-sm ${
            dbHolidays.length > 0
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-white border-[#e2e8f0] text-[#1597E5] hover:bg-[#EEF5FB]'
          }`}
        >
          <FiFlag className="w-3.5 h-3.5" />
          <span>Seed Public</span>
        </button>
      </div>

      {/* Holidays List grouped by Month (Screenshot 1 layout) */}
      <div className="space-y-6 pt-1 select-none">
        {Object.keys(holidaysByMonth).map(monthYear => (
          <div key={monthYear} className="space-y-3.5">
            <h3 className="text-[10.5px] font-extrabold text-[#718096] uppercase tracking-wider px-1 font-sans">
              {monthYear}
            </h3>

            <div className="space-y-3">
              {holidaysByMonth[monthYear].map((holiday) => (
                <div
                  key={holiday.id}
                  className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex justify-between items-center hover:border-brand-blue/15 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Month Date Block */}
                    <div className="w-11 h-11 rounded-2xl bg-[#EEF5FB] flex flex-col items-center justify-center shrink-0 border border-brand-blue/5">
                      <span className="text-sm font-black text-[#1597E5] leading-none">{holiday.dayNum}</span>
                      <span className="text-[7.5px] font-extrabold text-[#A0AEC0] uppercase tracking-wider mt-1">{holiday.monthShort}</span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-dark leading-tight font-sans">
                        {holiday.name}
                      </h4>
                      {holiday.desc && (
                        <p className="text-[9.5px] text-secondaryText font-bold mt-1 font-sans">
                          {holiday.desc}
                        </p>
                      )}

                      {/* Type Badge */}
                      <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider border ${
                        holiday.type === 'National Holiday' ? 'bg-red-50 text-red-600 border-red-100' :
                        holiday.type === 'State Holiday' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        holiday.type === 'School Holiday' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-purple-50 text-purple-600 border-purple-100'
                      }`}>
                        {holiday.type === 'National Holiday' && '🚩 '}
                        {holiday.type === 'Festival Holiday' && '✨ '}
                        {holiday.type === 'State Holiday' && '🏛 '}
                        {holiday.type === 'School Holiday' && '🏫 '}
                        {holiday.type || 'Holiday'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(holiday)}
                      className="p-1.5 hover:bg-slate-50 rounded-full text-[#A0AEC0] hover:text-[#1597E5] transition-colors cursor-pointer"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(holiday.id)}
                      className="p-1.5 hover:bg-red-50 rounded-full text-[#A0AEC0] hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button: Add Holiday */}
      <button
        onClick={handleOpenAdd}
        className="fixed bottom-6 right-6 py-3.5 px-6 bg-[#00A1FF] hover:bg-[#0088ff] text-white rounded-full font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer hover:scale-105 active:scale-95 z-45"
      >
        <FiPlus className="w-4.5 h-4.5 text-white" />
        <span>Add Holiday</span>
      </button>

      {/* Modal Dialog for Add/Edit Holiday (Screenshots 2 & 3) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] w-full max-w-md p-6 card-shadow space-y-5"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 select-none">
                <h3 className="text-sm font-black text-dark font-sans">
                  {editingId ? 'Edit Holiday' : 'Add Holiday'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-secondaryText transition-colors cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-dark block">Holiday Name *</label>
                  <input
                    type="text"
                    required
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                    placeholder="e.g. Diwali, Sports Day"
                    className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-dark block">Date *</label>
                  <input
                    type="date"
                    required
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5] cursor-pointer"
                  />
                  <span className="text-[9px] text-[#A0AEC0] font-bold block mt-1 select-none">
                    AY range: 2026-06-12 - 2027-04-24
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-dark block">Holiday Type *</label>
                  <div className="relative">
                    <select
                      value={holidayType}
                      onChange={(e) => setHolidayType(e.target.value)}
                      className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5] appearance-none cursor-pointer text-dark font-extrabold"
                    >
                      <option value="School Holiday">School Holiday</option>
                      <option value="Festival Holiday">Festival Holiday</option>
                      <option value="National Holiday">National Holiday</option>
                      <option value="State Holiday">State Holiday</option>
                    </select>
                    <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-dark block">Description (optional)</label>
                  <input
                    type="text"
                    value={holidayDesc}
                    onChange={(e) => setHolidayDesc(e.target.value)}
                    placeholder="Add a note about this holiday"
                    className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-dark rounded-[20px] font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!holidayName || !holidayDate}
                    className={`flex-1 py-3.5 rounded-[20px] font-bold transition-all shadow-md ${
                      (!holidayName || !holidayDate)
                        ? 'bg-[#EEF5FB] text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-[#00A1FF] hover:bg-[#0088ff] text-white cursor-pointer shadow-brand-blue/20'
                    }`}
                  >
                    {editingId ? 'Update' : 'Add Holiday'}
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
