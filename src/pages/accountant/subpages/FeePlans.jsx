import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiChevronRight, FiPlusCircle, FiGrid } from 'react-icons/fi';

const MOCK_PLANS = [
  { name: 'KORADA KARTHIKEYA', class: '7-A', admissionNo: '#26SO0001', paid: 0, pending: 0, total: 0 },
  { name: 'KORADA BHARGAVSAI', class: '5-A', admissionNo: '#26SO0002', paid: 15000, pending: 37000, total: 52000 },
  { name: 'GANDARDDI MANJUSHA', class: '4-A', admissionNo: '#26SO0003', paid: 0, pending: 50000, total: 50000 },
  { name: 'GONTHINA POORVESH', class: '4-A', admissionNo: '#26SO0004', paid: 0, pending: 50000, total: 50000 },
  { name: 'SHINAGAN KOTISUYA', class: '1-A', admissionNo: '#26SO0005', paid: 10000, pending: 15000, total: 25000 },
  { name: 'BALIVADA TEJASWINI', class: '6-A', admissionNo: '#26SO0006', paid: 25000, pending: 25000, total: 50000 },
  { name: 'RATCHAKONDA LALITHA', class: '7-A', admissionNo: '#26SO0007', paid: 0, pending: 60000, total: 60000 },
  { name: 'PALLA DEEKSHIT RAM', class: '1-A', admissionNo: '#26SO0008', paid: 30000, pending: 0, total: 30000 },
  { name: 'DUDI GREESHMANTH', class: '3-A', admissionNo: '#26SO0009', paid: 15000, pending: 20000, total: 35000 }
];

const FeePlans = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredPlans = MOCK_PLANS.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.class.toLowerCase().includes(search.toLowerCase()) ||
    item.admissionNo.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Fee Plans</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="mb-2 relative z-10 select-none">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEE</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10">Fee Plans</h2>
        <p className="text-xs text-white/80 font-medium relative z-10">
          Assign and review student fee plans
        </p>

        {/* Triple metrics widget inside card */}
        <div className="relative z-10 grid grid-cols-3 gap-1.5 pt-5 border-t border-white/15 text-center mt-5 select-none">
          <div className="border-r border-white/15 last:border-none">
            <p className="text-xs font-black">Rs 43,79,000</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Assigned</p>
          </div>
          <div className="border-r border-white/15 last:border-none">
            <p className="text-xs font-black text-[#23C16B]">Rs 15,000</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Collected</p>
          </div>
          <div>
            <p className="text-xs font-black text-pink-200">Rs 43,64,000</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Pending</p>
          </div>
        </div>

        {/* Progress bar and text */}
        <div className="mt-5 space-y-2 relative z-10 select-none">
          <div className="w-full bg-white/15 h-1 rounded-full overflow-hidden">
            <div className="bg-[#23C16B] h-full rounded-full" style={{ width: '0.3425%' }} />
          </div>
          <p className="text-[9px] text-white/85 font-extrabold leading-none">
            0.003425439598081754% collected
          </p>
        </div>
      </div>

      {/* Create Fee Plan & Class Fees outline buttons */}
      <div className="grid grid-cols-2 gap-3.5 select-none">
        <button
          onClick={() => navigate('/settings/create-fee-plan')}
          className="bg-white hover:bg-slate-50 border border-[#e2e8f0] text-brand-blue rounded-[20px] p-3 px-4 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <FiPlusCircle className="w-4 h-4 text-[#1597E5] shrink-0" />
          <span>Create Fee Plan</span>
        </button>
        <button
          onClick={() => navigate('/settings/class-fee-templates')}
          className="bg-white hover:bg-slate-50 border border-[#e2e8f0] text-brand-blue rounded-[20px] p-3 px-4 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <FiGrid className="w-4 h-4 text-[#1597E5] shrink-0" />
          <span>Class Fees</span>
        </button>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search student, admission no, class"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
      </div>

      {/* Dynamic List Grid */}
      <div className="space-y-3 pt-1">
        {filteredPlans.map((plan, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-brand-blue/20 transition-all cursor-pointer relative group active:scale-[0.99]"
          >
            <div>
              <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">
                {plan.name}
              </h3>
              <p className="text-[9px] text-[#A0AEC0] font-bold mt-1.5">
                {plan.class} · {plan.admissionNo}
              </p>
              <p className="text-[9px] text-secondaryText mt-1 font-semibold">
                Paid Rs {plan.paid.toLocaleString('en-IN')} · Pending Rs {plan.pending.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="flex items-center gap-2 select-none">
              <span className="text-xs font-extrabold text-dark leading-none">
                Rs {plan.total.toLocaleString('en-IN')}
              </span>
              <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}

        {filteredPlans.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[32px] border border-[#e2e8f0]/40 p-8 card-shadow space-y-2 select-none">
            <p className="text-xs font-bold text-dark">No fee plans found</p>
            <p className="text-[10px] text-secondaryText">Try checking your search query or class name.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FeePlans;
