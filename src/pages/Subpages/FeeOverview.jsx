import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiSearch, FiBook, FiTrendingUp, FiCheckCircle, FiFileText,
  FiGrid, FiChevronRight, FiCreditCard, FiSliders, FiFile
} from 'react-icons/fi';

const MOCK_LEDGERS = [
  { name: 'KORADA KARTHIKEYA', class: '7', section: 'A', status: 'Due', paid: 0, due: 0, percentage: 0 },
  { name: 'KORADA BHARGAVSAI', class: '5', section: 'A', status: 'Partial', paid: 10000, due: 35000, percentage: 22 },
  { name: 'BOYINA MAHIDHAR', class: '2', section: 'A', status: 'Due', paid: 0, due: 45000, percentage: 0 },
  { name: 'BOYINA AKSHAYRAM', class: '5', section: 'A', status: 'Paid', paid: 45000, due: 0, percentage: 100 },
  { name: 'PALLA DEEKSHIT RAM', class: '1', section: 'A', status: 'Due', paid: 0, due: 45000, percentage: 0 },
  { name: 'DUDI GREESHMANTH', class: '3', section: 'A', status: 'Overdue', paid: 5000, due: 40000, percentage: 11 },
  { name: 'BONTU DHEKSHITH', class: '3', section: 'A', status: 'Paid', paid: 45000, due: 0, percentage: 100 },
  { name: 'PILLA TRIVED', class: 'UKG', section: 'A', status: 'Due', paid: 0, due: 35000, percentage: 0 }
];

const FeeOverview = () => {
  const navigate = useNavigate();
  const [ledgers, setLedgers] = useState(MOCK_LEDGERS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Paid' | 'Partial' | 'Due' | 'Overdue'

  const totalFee = 4379000;
  const paidFee = 10000;
  const dueFee = 4369000;
  const collectionRate = 0; // 0% Collection Rate matching Screenshot 5

  // Filtered ledgers
  const filtered = ledgers.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || `${item.class}-${item.section}`.includes(search);
    const matchesTab = activeTab === 'All' || item.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto space-y-6"
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
          Fees
        </h1>
        <div className="w-9 h-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Collection Rate & stats box matching Screenshot 5 */}
          <div className="bg-white rounded-[24px] p-6 card-shadow border border-[#e2e8f0]/40 space-y-5">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                  Collection Rate
                </span>
                <p className="text-[10px] text-[#A0AEC0] font-bold">
                  0 paid · 105 pending
                </p>
              </div>
              <span className="text-2xl font-extrabold text-[#FF9F1C]">{collectionRate}%</span>
            </div>

            {/* Collection Progress Bar (thin orange line) */}
            <div className="w-full bg-[#EEF5FB] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#FF9F1C] h-full rounded-full transition-all duration-500" style={{ width: '0.2%' }} />
            </div>

            {/* Grid stats row */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center divide-x divide-[#e2e8f0]/80">
              <div className="space-y-0.5">
                <p className="text-sm font-extrabold text-dark">Rs {totalFee.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">Total</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-extrabold text-[#23C16B]">Rs {paidFee.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">Paid</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-extrabold text-[#EF4444]">Rs {dueFee.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-[#A0AEC0] font-bold uppercase tracking-wider">Due</p>
              </div>
            </div>
          </div>

          {/* Quick Action Links grid matching Screenshot 5 */}
          <div className="grid grid-cols-4 gap-3 select-none">
            {[
              { label: 'Class Fees', sub: 'Setup', icon: <FiGrid className="w-4 h-4" />, color: 'text-brand-blue bg-[#EEF5FB]' },
              { label: 'Fee Plans', sub: 'Manage', icon: <FiSliders className="w-4 h-4" />, color: 'text-accent-purple bg-[#F3E8FF]' },
              { label: 'Ledger', sub: 'Open', icon: <FiBook className="w-4 h-4" />, color: 'text-[#FF9F1C] bg-[#FFF8EE]' },
              { label: 'Reports', sub: 'View', icon: <FiFileText className="w-4 h-4" />, color: 'text-[#23C16B] bg-[#E8F8F0]' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[22px] p-3 border border-[#e2e8f0]/40 card-shadow flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-blue/30 active:scale-95 transition-all"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${item.color}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-extrabold text-dark block leading-tight">{item.label}</span>
                <span className="text-[8px] text-[#A0AEC0] font-bold uppercase mt-0.5 block">{item.sub}</span>
              </div>
            ))}
          </div>

          {/* Student Ledgers Section */}
          <div className="space-y-4">
            <div className="px-1 text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              Student Ledgers
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search student fees"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-full card-shadow focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText/60"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none select-none">
              {['All', 'Paid', 'Partial', 'Due', 'Overdue'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-brand-blue/15'
                        : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Ledgers List */}
            <div className="space-y-3">
              {filtered.map((item, idx) => {
                // Color badges matching status
                let badgeClass = 'bg-[#FFF8EE] text-[#FF9F1C]'; // Partial
                if (item.status === 'Paid') badgeClass = 'bg-[#E8F8F0] text-[#23C16B]';
                if (item.status === 'Due') badgeClass = 'bg-[#FEE2E2] text-[#EF4444]';
                if (item.status === 'Overdue') badgeClass = 'bg-[#FEE2E2] text-[#DC2626] border border-red-200';

                // Bar color matching status
                let barColor = 'bg-[#FF9F1C]';
                if (item.status === 'Paid') barColor = 'bg-[#23C16B]';
                if (item.status === 'Due') barColor = 'bg-[#EF4444]';

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-[24px] p-5 card-shadow border border-[#e2e8f0]/40 flex flex-col justify-between hover:border-brand-blue/20 transition-all cursor-pointer group"
                  >
                    {/* Header line */}
                    <div className="flex justify-between items-start pb-3.5 border-b border-[#e2e8f0]/50">
                      <div>
                        <h3 className="text-xs font-bold text-dark group-hover:text-[#1597E5] transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-secondaryText mt-0.5 font-bold">
                          {item.class} · {item.section}
                        </p>
                      </div>
                      <span className={`px-3 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${badgeClass}`}>
                        • {item.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#EEF5FB] h-1.5 rounded-full overflow-hidden mt-3.5">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    {/* Foot details */}
                    <div className="flex justify-between items-center pt-3 text-[10px] font-bold text-[#A0AEC0] select-none">
                      <div className="flex gap-4">
                        <span>
                          PAID <span className="text-[#23C16B] font-extrabold ml-1">Rs {item.paid.toLocaleString('en-IN')}</span>
                        </span>
                        <span>
                          DUE <span className="text-[#EF4444] font-extrabold ml-1">Rs {item.due.toLocaleString('en-IN')}</span>
                        </span>
                      </div>
                      <span className="bg-[#EEF5FB] text-brand-blue px-2.5 py-1 rounded-full text-[9px] font-extrabold">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          {/* Fee Desk card matching Screenshot 5 */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Fee Desk</p>
            <h2 className="text-2xl font-bold mt-1">Fee Dashboard</h2>
            <p className="text-xs text-white/80 mt-1 font-semibold leading-relaxed">
              Collection, dues, and student ledger overview.
            </p>
          </div>

          {/* Quick Stats overview panel card */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block">
              Student Accounts
            </span>
            <div className="divide-y divide-[#e2e8f0]/80">
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Total Accounts</span>
                <span className="text-dark font-extrabold">105</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Fully Paid</span>
                <span className="text-accent-green font-extrabold">0 Students</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Partial Payments</span>
                <span className="text-[#FF9F1C] font-extrabold">1 Student</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Full Dues Pending</span>
                <span className="text-[#EF4444] font-extrabold">104 Students</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeeOverview;
