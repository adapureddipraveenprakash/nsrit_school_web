import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiSearch, FiCalendar, FiBookOpen, FiTruck,
  FiChevronDown, FiPlus, FiFolder, FiSave, FiCreditCard
} from 'react-icons/fi';

const CreateFeePlan = () => {
  const navigate = useNavigate();

  // Component local states
  const [studentSearch, setStudentSearch] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-06-23');
  const [concessionType, setConcessionType] = useState('No Concession');
  const [additionalCategory, setAdditionalCategory] = useState('Select');
  const [additionalAmount, setAdditionalAmount] = useState('');
  const [addedItems, setAddedItems] = useState([]);

  // States for tuition term fees
  const [term1Amount, setTerm1Amount] = useState('');
  const [term2Amount, setTerm2Amount] = useState('');
  const [term3Amount, setTerm3Amount] = useState('');

  // States for custom fees
  const [booksAmount, setBooksAmount] = useState('');
  const [transportAmount, setTransportAmount] = useState('');

  // Add additional fee category item
  const handleAddFeeItem = () => {
    if (additionalCategory === 'Select' || !additionalAmount || parseFloat(additionalAmount) <= 0) return;
    setAddedItems([...addedItems, { category: additionalCategory, amount: parseFloat(additionalAmount) }]);
    setAdditionalCategory('Select');
    setAdditionalAmount('');
  };

  // Dynamic Final Payable calculation
  const totalPayable = 
    (parseFloat(term1Amount) || 0) +
    (parseFloat(term2Amount) || 0) +
    (parseFloat(term3Amount) || 0) +
    (parseFloat(booksAmount) || 0) +
    (parseFloat(transportAmount) || 0) +
    addedItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-5 pb-24 md:pb-8 max-w-[640px] mx-auto animate-fade-in"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Create Fee Plan</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="mb-2 relative z-10 select-none">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEE</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10">Create Fee Plan</h2>
        <p className="text-xs text-white/80 font-medium relative z-10">
          Assign category-wise fees to a student
        </p>
      </div>

      {/* 1. Student Finder Card */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3">
        <span className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
          Student
        </span>
        <div className="relative">
          <input
            type="text"
            placeholder="Search student by name"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[18px] focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
        </div>
      </div>

      {/* 2. Academic Year Card with Date Input Picker */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3">
        <span className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
          Academic Year
        </span>
        <div className="relative">
          <input
            type="date"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[18px] focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark cursor-pointer"
          />
          <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
        </div>
      </div>

      {/* 3. Tuition Structure Card with inputs */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3">
        <span className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
          Tuition Structure
        </span>
        
        <div className="divide-y divide-[#e2e8f0]/60 text-xs">
          {[
            { label: '1st Term Fee', step: '1', value: term1Amount, setValue: setTerm1Amount },
            { label: '2nd Term Fee', step: '2', value: term2Amount, setValue: setTerm2Amount },
            { label: '3rd Term Fee', step: '3', value: term3Amount, setValue: setTerm3Amount }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 first:pt-1 last:pb-1 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#EEF5FB] text-brand-blue text-[9px] flex items-center justify-center font-extrabold select-none border border-brand-blue/10 shrink-0">
                  {item.step}
                </div>
                <span className="font-extrabold text-dark">{item.label}</span>
              </div>
              
              {/* Input for Term Amount */}
              <div className="relative max-w-[140px]">
                <input
                  type="number"
                  placeholder="Rs 0"
                  value={item.value}
                  onChange={(e) => item.setValue(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-bold text-dark text-right"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-secondaryText">₹</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Custom Fees Card with inputs */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3">
        <span className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
          Custom Fees
        </span>

        <div className="divide-y divide-[#e2e8f0]/60 text-xs">
          <div className="flex items-center justify-between py-3 pt-1 gap-4">
            <div className="flex items-center gap-3.5">
              <FiBookOpen className="w-4 h-4 text-secondaryText shrink-0" />
              <span className="font-extrabold text-dark">Books Fee</span>
            </div>
            
            {/* Input for Books Fee */}
            <div className="relative max-w-[140px]">
              <input
                type="number"
                placeholder="Rs 0"
                value={booksAmount}
                onChange={(e) => setBooksAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-bold text-dark text-right"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-secondaryText">₹</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 pb-1 gap-4">
            <div className="flex items-center gap-3.5">
              <FiTruck className="w-4 h-4 text-secondaryText shrink-0" />
              <span className="font-extrabold text-dark">Transport Fee</span>
            </div>

            {/* Input for Transport Fee */}
            <div className="relative max-w-[140px]">
              <input
                type="number"
                placeholder="Rs 0"
                value={transportAmount}
                onChange={(e) => setTransportAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-bold text-dark text-right"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-secondaryText">₹</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Concession Type Card */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-2 select-none">
        <label className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block mb-1">
          Concession Type
        </label>
        <div className="relative">
          <select
            value={concessionType}
            onChange={(e) => setConcessionType(e.target.value)}
            className="w-full pl-4 pr-10 py-3.5 bg-white border border-[#e2e8f0] rounded-[18px] focus:outline-none focus:border-brand-blue/60 text-xs font-extrabold text-dark appearance-none cursor-pointer"
          >
            <option value="No Concession">No Concession</option>
            <option value="Merit-based">Merit-based</option>
            <option value="Sibling Concession">Sibling Concession</option>
            <option value="Staff Concession">Staff Concession</option>
          </select>
          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText pointer-events-none" />
        </div>
      </div>

      {/* 6. Additional Categories Card */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-4 select-none">
        <span className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
          Additional Categories
        </span>

        {/* Fee Category */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-dark block">
            Fee Category
          </label>
          <div className="relative">
            <select
              value={additionalCategory}
              onChange={(e) => setAdditionalCategory(e.target.value)}
              className="w-full pl-4 pr-10 py-3.5 bg-white border border-[#e2e8f0] rounded-[18px] focus:outline-none focus:border-brand-blue/60 text-xs font-extrabold text-[#A0AEC0] appearance-none cursor-pointer"
            >
              <option value="Select">Select</option>
              <option value="Lab Fee">Lab Fee</option>
              <option value="Exam Fee">Exam Fee</option>
              <option value="Uniform Fee">Uniform Fee</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText pointer-events-none" />
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-dark block">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="Amount"
              value={additionalAmount}
              onChange={(e) => setAdditionalAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[18px] focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText/60"
            />
            <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
          </div>
        </div>

        {/* Add Fee Item Action */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleAddFeeItem}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-blue hover:text-brand-secondary transition-colors cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Fee Item</span>
          </button>
        </div>
      </div>

      {/* 7. Final Payable Card */}
      <div className="bg-[#EBF8FF] rounded-[20px] border border-[#BEE3F8]/30 p-4 px-5 card-shadow flex items-center justify-between select-none">
        <span className="text-xs font-extrabold text-brand-blue">
          Final Payable
        </span>
        <span className="text-sm font-black text-brand-blue">
          Rs {totalPayable.toLocaleString('en-IN')}
        </span>
      </div>

      {/* 8. Fee Items Summary list / Empty state placeholder card */}
      {totalPayable === 0 ? (
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-8 px-10 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[160px] select-none">
          <div className="w-14 h-14 rounded-full bg-[#EBF8FF] border border-[#BEE3F8]/30 flex items-center justify-center text-[#1597E5]">
            <FiFolder className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-[240px]">
            <h4 className="text-xs font-extrabold text-dark">No fee items</h4>
            <p className="text-[10px] text-secondaryText font-bold leading-normal">
              Add fee categories and amounts above.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-3">
          <span className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
            Fee Items Breakdown
          </span>
          <div className="divide-y divide-[#e2e8f0]/60 text-xs">
            {parseFloat(term1Amount) > 0 && (
              <div className="flex justify-between py-2 font-semibold">
                <span className="text-secondaryText">1st Term Fee</span>
                <span className="text-dark font-extrabold">Rs {parseFloat(term1Amount).toLocaleString('en-IN')}</span>
              </div>
            )}
            {parseFloat(term2Amount) > 0 && (
              <div className="flex justify-between py-2 font-semibold">
                <span className="text-secondaryText">2nd Term Fee</span>
                <span className="text-dark font-extrabold">Rs {parseFloat(term2Amount).toLocaleString('en-IN')}</span>
              </div>
            )}
            {parseFloat(term3Amount) > 0 && (
              <div className="flex justify-between py-2 font-semibold">
                <span className="text-secondaryText">3rd Term Fee</span>
                <span className="text-dark font-extrabold">Rs {parseFloat(term3Amount).toLocaleString('en-IN')}</span>
              </div>
            )}
            {parseFloat(booksAmount) > 0 && (
              <div className="flex justify-between py-2 font-semibold">
                <span className="text-secondaryText">Books Fee</span>
                <span className="text-dark font-extrabold">Rs {parseFloat(booksAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            {parseFloat(transportAmount) > 0 && (
              <div className="flex justify-between py-2 font-semibold">
                <span className="text-secondaryText">Transport Fee</span>
                <span className="text-dark font-extrabold">Rs {parseFloat(transportAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            {addedItems.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 font-semibold items-center">
                <span className="text-secondaryText">{item.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-dark font-extrabold">Rs {item.amount.toLocaleString('en-IN')}</span>
                  <button
                    type="button"
                    onClick={() => setAddedItems(addedItems.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700 font-bold px-1 select-none text-sm leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={!studentSearch.trim() || totalPayable === 0}
          onClick={() => {
            alert('Fee plan saved successfully!');
            navigate(-1);
          }}
          className={`w-full py-4 text-white rounded-[22px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all select-none ${
            studentSearch.trim() && totalPayable > 0
              ? 'bg-[#1597E5] hover:bg-[#00A1FF] cursor-pointer active:scale-[0.98]'
              : 'bg-[#1597E5]/60 cursor-not-allowed'
          }`}
        >
          <FiSave className="w-4 h-4" />
          <span>Save Fee Plan</span>
        </button>
      </div>
    </motion.div>
  );
};

export default CreateFeePlan;
