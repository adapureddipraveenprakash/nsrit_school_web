import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiAlertCircle, FiSettings, FiGrid } from 'react-icons/fi';
import { HiOutlineDocumentText } from 'react-icons/hi2';

const SEED_TEMPLATES = [
  { id: ' nursery-2026', className: 'Nursery', academicYear: '2026-27', term1: 12400, term2: 12400, term3: 6200, total: 31000, applyTo: 'Both', futureStudents: true, status: 'Active' },
  { id: 'lkg-2026', className: 'LKG', academicYear: '2026-27', term1: 13200, term2: 13200, term3: 6600, total: 33000, applyTo: 'Both', futureStudents: true, status: 'Active' },
  { id: 'ukg-2026', className: 'UKG', academicYear: '2026-27', term1: 14800, term2: 14800, term3: 7400, total: 37000, applyTo: 'Both', futureStudents: true, status: 'Active' },
  { id: 'class1-2026', className: '1', academicYear: '2026-27', term1: 16400, term2: 16400, term3: 8200, total: 41000, applyTo: 'Both', futureStudents: true, status: 'Active' },
  { id: 'class2-2026', className: '2', academicYear: '2026-27', term1: 17200, term2: 17200, term3: 8600, total: 43000, applyTo: 'Both', futureStudents: true, status: 'Active' },
  { id: 'class3-2026', className: '3', academicYear: '2026-27', term1: 18800, term2: 18800, term3: 9400, total: 47000, applyTo: 'Both', futureStudents: true, status: 'Active' },
  { id: 'class4-2026', className: '4', academicYear: '2026-27', term1: 20000, term2: 20000, term3: 10000, total: 50000, applyTo: 'Both', futureStudents: true, status: 'Active' },
  { id: 'class5-2026', className: '5', academicYear: '2026-27', term1: 20800, term2: 20800, term3: 10400, total: 52000, applyTo: 'Both', futureStudents: true, status: 'Active' },
  { id: 'class6-2026', className: '6', academicYear: '2026-27', term1: 22400, term2: 22400, term3: 11200, total: 56000, applyTo: 'Both', futureStudents: true, status: 'Active' }
];

const FeeSetup = () => {
  const navigate = useNavigate();
  const { addLog } = useApp();

  // Form States
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [selectedClass, setSelectedClass] = useState('');
  const [term1, setTerm1] = useState('');
  const [term2, setTerm2] = useState('');
  const [term3, setTerm3] = useState('');
  const [applyTo, setApplyTo] = useState('Both');
  const [futureStudents, setFutureStudents] = useState(true);
  const [status, setStatus] = useState('Active');
  
  // Validation / Edit states
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Created templates list
  const [templates, setTemplates] = useState(SEED_TEMPLATES);

  // Calculate sum dynamically
  const totalTuition = (parseInt(term1) || 0) + (parseInt(term2) || 0) + (parseInt(term3) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }
    if (totalTuition <= 0) {
      setError('Please configure at least one term fee');
      return;
    }
    setError('');

    const newTemplate = {
      id: editingId || 'fee-tpl-' + Date.now(),
      academicYear,
      className: selectedClass,
      term1: parseInt(term1) || 0,
      term2: parseInt(term2) || 0,
      term3: parseInt(term3) || 0,
      total: totalTuition,
      applyTo,
      futureStudents,
      status
    };

    if (editingId) {
      // Update existing template
      setTemplates(templates.map(t => t.id === editingId ? newTemplate : t));
      addLog(`Updated Class Fee Template for Class ${selectedClass} - Rs ${totalTuition}`);
      setEditingId(null);
    } else {
      // Create new template
      setTemplates([newTemplate, ...templates]);
      addLog(`Created Class Fee Template for Class ${selectedClass} - Rs ${totalTuition}`);
    }
    
    // Reset term fees fields
    setTerm1('');
    setTerm2('');
    setTerm3('');
    setSelectedClass('');
  };

  // Populate form for editing
  const handleEdit = (tpl) => {
    setEditingId(tpl.id);
    setAcademicYear(tpl.academicYear);
    setSelectedClass(tpl.className);
    setTerm1(String(tpl.term1));
    setTerm2(String(tpl.term2));
    setTerm3(String(tpl.term3));
    setApplyTo(tpl.applyTo);
    setFutureStudents(tpl.futureStudents);
    setStatus(tpl.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const classesList = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto"
    >
      {/* Centered Page Header */}
      <div className="relative flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-dark tracking-tight absolute left-1/2 -translate-x-1/2">
          Class Fees
        </h1>
        <div className="w-9 h-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Form Setup Cards (spans 2 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl p-3 flex items-center gap-2 text-xs text-[#EF4444] font-semibold">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* CLASS & YEAR */}
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
              <p className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider px-1">
                Class & Year
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-secondaryText block mb-1.5 uppercase">Academic Year</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-4 py-3 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark"
                  >
                    <option value="2026-27">2026-27</option>
                    <option value="2027-28">2027-28</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-secondaryText block mb-1.5 uppercase">Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-3 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark"
                  >
                    <option value="">Select</option>
                    {classesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* TERM FEES */}
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
              <p className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider px-1">
                Term Fees
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <input
                    type="number"
                    placeholder="1st Term Fee"
                    value={term1}
                    onChange={(e) => setTerm1(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText/50"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-secondaryText select-none">①</span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    placeholder="2nd Term Fee"
                    value={term2}
                    onChange={(e) => setTerm2(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText/50"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-secondaryText select-none">②</span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    placeholder="3rd Term Fee"
                    value={term3}
                    onChange={(e) => setTerm3(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText/50"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-secondaryText select-none">③</span>
                </div>
              </div>
            </div>

            {/* Total Tuition Card */}
            <div className="bg-[#EEF5FB] border border-[#e2e8f0]/40 rounded-[20px] p-4 flex justify-between items-center card-shadow-sm">
              <span className="text-xs font-extrabold text-[#1597E5]">Total Tuition</span>
              <span className="text-sm font-extrabold text-[#1597E5]">Rs {totalTuition.toLocaleString('en-IN')}</span>
            </div>

            {/* APPLY TO */}
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
              <p className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider px-1">
                Apply To
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-secondaryText block mb-1.5 uppercase">Apply To</label>
                  <select
                    value={applyTo}
                    onChange={(e) => setApplyTo(e.target.value)}
                    className="w-full px-4 py-3 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark"
                  >
                    <option value="Both">Both</option>
                    <option value="New Students">New Students Only</option>
                    <option value="Existing Students">Existing Students Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-secondaryText block mb-1.5 uppercase">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Toggle switch for Future Students */}
              <div className="flex items-center justify-between py-3 border-t border-[#e2e8f0]/60 select-none">
                <div>
                  <p className="text-xs font-bold text-dark">Future Students</p>
                  <p className="text-[10px] text-[#A0AEC0] mt-0.5 font-semibold">New students inherit this class fee automatically.</p>
                </div>
                
                {/* Visual toggle checkbox switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={futureStudents}
                    onChange={(e) => setFutureStudents(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1597E5]"></div>
                </label>
              </div>
            </div>

            {/* Create class fee action button */}
            <button
              type="submit"
              className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/15 transition-all cursor-pointer active:scale-95"
            >
              <HiOutlineDocumentText className="w-5 h-5" />
              <span>{editingId ? 'Save Class Fee' : 'Create Class Fee'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Hero Card & Templates Listing (spans 1 on desktop) */}
        <div className="space-y-6">
          
          {/* Class Fee Templates Hero Card matching Screenshot 1 */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Fee</p>
            <h2 className="text-2xl font-bold mt-1">Class Fee Templates</h2>
            <p className="text-xs text-white/80 mt-1 font-semibold leading-relaxed">
              Academic year tuition templates by class.
            </p>
          </div>

          {/* Created Templates List matching Screenshots 2 & 3 */}
          <div className="space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block px-1">
              Existing Class Fees
            </span>

            <div className="space-y-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white rounded-[22px] p-5 card-shadow border border-[#e2e8f0]/40 flex justify-between items-center group hover:border-[#1597E5]/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center shrink-0">
                      <FiGrid className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-dark">
                        {tpl.className} · {tpl.academicYear}
                      </h4>
                      <p className="text-[9px] text-[#A0AEC0] font-bold mt-0.5 leading-tight">
                        T1 Rs {tpl.term1.toLocaleString('en-IN')} · T2 Rs {tpl.term2.toLocaleString('en-IN')} · T3 Rs {tpl.term3.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-brand-blue">Rs {tpl.total.toLocaleString('en-IN')}</p>
                      <span className={`text-[8px] font-bold uppercase mt-0.5 block ${tpl.status === 'Active' ? 'text-accent-green' : 'text-secondaryText'}`}>
                        {tpl.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleEdit(tpl)}
                      className="p-1.5 bg-[#EEF5FB] hover:bg-[#1597E5]/15 text-[#1597E5] rounded-full transition-colors cursor-pointer"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default FeeSetup;
