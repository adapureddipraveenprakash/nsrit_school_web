import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiFolder, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { HiOutlineDocumentText } from 'react-icons/hi2';

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
  const [error, setError] = useState('');

  // Created templates list
  const [templates, setTemplates] = useState([]);

  // Calculate sum dynamically
  const totalTuition = (parseInt(term1) || 0) + (parseInt(term2) || 0) + (parseInt(term3) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClass) {
      setError('Please select an academic class');
      return;
    }
    if (totalTuition <= 0) {
      setError('Please configure at least one term fee');
      return;
    }
    setError('');

    const newTemplate = {
      id: 'fee-tpl-' + Date.now(),
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

    setTemplates(prev => [newTemplate, ...prev]);
    addLog(`Created Class Fee Template for Class ${selectedClass} - Rs ${totalTuition}`);
    
    // Reset term fees fields
    setTerm1('');
    setTerm2('');
    setTerm3('');
    setSelectedClass('');
  };

  const classesList = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[600px] mx-auto"
    >
      {/* Top Header Card */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEE</p>
            <h2 className="text-xl font-bold md:text-2xl">Class Fee Templates</h2>
          </div>
        </div>

        <p className="text-xs text-white/70 font-medium">Academic year tuition templates by class</p>
      </div>

      {error && (
        <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-3 flex items-center gap-2 text-xs text-accent-red font-semibold">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Setup */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CLASS & YEAR */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider px-1">Class & Year</p>
          
          <div>
            <label className="text-[10px] font-bold text-secondaryText block mb-1.5">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none text-xs font-semibold"
            >
              <option value="2026-27">2026-27</option>
              <option value="2027-28">2027-28</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-secondaryText block mb-1.5">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none text-xs font-semibold"
            >
              <option value="">Select</option>
              {classesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TERM FEES */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider px-1">Term Fees</p>
          
          <div className="relative">
            <input
              type="number"
              placeholder="1st Term Fee"
              value={term1}
              onChange={(e) => setTerm1(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-secondaryText select-none">①</span>
          </div>

          <div className="relative">
            <input
              type="number"
              placeholder="2nd Term Fee"
              value={term2}
              onChange={(e) => setTerm2(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-secondaryText select-none">②</span>
          </div>

          <div className="relative">
            <input
              type="number"
              placeholder="3rd Term Fee"
              value={term3}
              onChange={(e) => setTerm3(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-secondaryText select-none">③</span>
          </div>
        </div>

        {/* Total Tuition Card */}
        <div className="bg-[#EEF5FB]/70 border border-[#e2e8f0]/40 rounded-[20px] p-4 flex justify-between items-center card-shadow-sm">
          <span className="text-xs font-extrabold text-brand-blue">Total Tuition</span>
          <span className="text-sm font-extrabold text-brand-blue">Rs {totalTuition.toLocaleString('en-IN')}</span>
        </div>

        {/* APPLY TO */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider px-1">Apply To</p>
          
          <div>
            <label className="text-[10px] font-bold text-secondaryText block mb-1.5">Apply To</label>
            <select
              value={applyTo}
              onChange={(e) => setApplyTo(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none text-xs font-semibold"
            >
              <option value="Both">Both</option>
              <option value="Male Only">Male Only</option>
              <option value="Female Only">Female Only</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/60">
            <div>
              <p className="text-xs font-bold text-dark">Future Students</p>
              <p className="text-[9px] text-secondaryText mt-0.5 font-medium">New students inherit this class fee automatically.</p>
            </div>
            <input
              type="checkbox"
              checked={futureStudents}
              onChange={(e) => setFutureStudents(e.target.checked)}
              className="w-9 h-5 bg-slate-200 checked:bg-brand-blue rounded-full appearance-none transition-colors relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform border border-slate-300"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-secondaryText block mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none text-xs font-semibold"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full py-4 bg-brand-blue hover:bg-brand-secondary text-white rounded-btn font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95"
        >
          <HiOutlineDocumentText className="w-5 h-5" />
          Create Class Fee
        </button>
      </form>

      {/* Templates Output Listing */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow flex flex-col items-center justify-center min-h-[160px]">
        {templates.length === 0 ? (
          /* Empty State matching image10.png */
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EEF5FB] text-brand-blue flex items-center justify-center mx-auto border border-brand-blue/10">
              <HiOutlineDocumentText className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-dark uppercase tracking-wider">No class fees</h4>
            <p className="text-[10px] text-secondaryText font-medium">Create class fee templates for the academic year.</p>
          </div>
        ) : (
          /* Created Templates List */
          <div className="w-full divide-y divide-[#e2e8f0]/80">
            {templates.map((tpl) => (
              <div key={tpl.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                <div>
                  <h4 className="text-xs font-extrabold text-dark">Class: {tpl.className}</h4>
                  <p className="text-[9px] text-secondaryText mt-0.5 font-medium">
                    Term 1: Rs {tpl.term1.toLocaleString('en-IN')} • Term 2: Rs {tpl.term2.toLocaleString('en-IN')} • Term 3: Rs {tpl.term3.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-brand-blue">Rs {tpl.total.toLocaleString('en-IN')}</span>
                  <p className="text-[9px] text-accent-green font-bold uppercase mt-0.5">{tpl.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FeeSetup;
