import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrendingUp, FiTrendingDown, FiUsers, FiTag, FiDownload, FiFileText } from 'react-icons/fi';

const CLASS_DATA = [
  { className: '3', studentsCount: 14, rate: 0, due: 658000 },
  { className: '2', studentsCount: 15, rate: 0, due: 645000 },
  { className: 'LKG', studentsCount: 19, rate: 0, due: 627000 },
  { className: 'UKG', studentsCount: 12, rate: 0, due: 550000 },
  { className: '1', studentsCount: 15, rate: 0, due: 512000 },
  { className: '4', studentsCount: 10, rate: 0, due: 495000 },
  { className: '5', studentsCount: 5, rate: 0, due: 450000 },
  { className: '6', studentsCount: 7, rate: 0, due: 432000 }
];

const BranchAnalytics = () => {
  const navigate = useNavigate();

  // Hardcoded matching screenshot 1
  const collectionRate = 0;
  const totalCollected = 10000;
  const totalOutstanding = 4369000;
  const concessions = 0;
  const studentsCount = 0; // matching "STUDENTS 0 With fee records" in Screenshot 1

  const handleExport = (fileType) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Class,Students,Collection Rate,Pending Due\n";
    CLASS_DATA.forEach(c => {
      csvContent += `${c.className},${c.studentsCount},${c.rate}%,Rs ${c.due.toLocaleString('en-IN')}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sontyam_Branch_Analytics.${fileType === 'csv' ? 'csv' : 'xls'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          Branch Analytics
        </h1>
        <div className="w-9 h-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Grid of 4 stats cards matching Screenshot 1 */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Collected Card */}
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F8F0] text-[#23C16B] flex items-center justify-center">
                  <FiTrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
                  Collected
                </span>
              </div>
              <div>
                <p className="text-lg font-extrabold text-[#23C16B]">Rs {totalCollected.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-[#A0AEC0] font-bold mt-0.5">0% of fees</p>
              </div>
            </div>

            {/* Outstanding Card */}
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center">
                  <FiTrendingDown className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
                  Outstanding
                </span>
              </div>
              <div>
                <p className="text-lg font-extrabold text-[#EF4444]">Rs {totalOutstanding.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-[#A0AEC0] font-bold mt-0.5">Pending dues</p>
              </div>
            </div>

            {/* Students Card */}
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5FB] text-brand-blue flex items-center justify-center">
                  <FiUsers className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
                  Students
                </span>
              </div>
              <div>
                <p className="text-lg font-extrabold text-brand-blue">{studentsCount}</p>
                <p className="text-[9px] text-[#A0AEC0] font-bold mt-0.5">With fee records</p>
              </div>
            </div>

            {/* Concessions Card */}
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF8EE] text-[#FF9F1C] flex items-center justify-center">
                  <FiTag className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
                  Concessions
                </span>
              </div>
              <div>
                <p className="text-lg font-extrabold text-[#FF9F1C]">Rs {concessions.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-[#A0AEC0] font-bold mt-0.5">Waivers granted</p>
              </div>
            </div>

          </div>

          {/* Class-wise Collection Card matching Screenshot 1 */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <h3 className="text-xs font-extrabold text-dark tracking-tight">
              Class-wise Collection
            </h3>

            <div className="divide-y divide-[#e2e8f0]/80">
              {CLASS_DATA.map((item, idx) => (
                <div key={idx} className="py-4 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <div>
                      <span className="text-dark block font-extrabold">{item.className}</span>
                      <span className="text-[10px] text-secondaryText/80 font-semibold">{item.studentsCount} students</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#FF9F1C] block font-extrabold">{item.rate}%</span>
                      <span className="text-[9px] text-[#A0AEC0] font-bold">Rs {item.due.toLocaleString('en-IN')} due</span>
                    </div>
                  </div>

                  {/* Empty/0% progress bar matching Screenshot 1 */}
                  <div className="w-full bg-[#EEF5FB] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#FF9F1C] h-full rounded-full transition-all duration-300" style={{ width: `${item.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          
          {/* Sontyam Analytics Purple Hero Card matching Screenshot 1 */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            
            {/* Top icon and titles */}
            <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>

            <h2 className="text-xl font-extrabold">Sontyam Analytics</h2>
            <p className="text-[11px] text-white/80 mt-1 font-semibold leading-relaxed">
              Fee collection performance overview.
            </p>

            {/* Inner statistics banner */}
            <div className="mt-6 p-4 bg-white/10 border border-white/10 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-[9px] text-white/70 font-extrabold uppercase tracking-wide">Collection Rate</p>
                <p className="text-xl font-black mt-0.5">{collectionRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/70 font-extrabold uppercase tracking-wide">Total Collected</p>
                <p className="text-sm font-extrabold mt-1">Rs {totalCollected.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Export Action Card */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block">
              Reports Export
            </span>
            <div className="space-y-3 select-none">
              <button
                onClick={() => handleExport('csv')}
                className="w-full py-3.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-brand-blue/10 active:scale-95"
              >
                <FiFileText className="w-4 h-4" />
                Export CSV Report
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full py-3.5 border border-[#1597E5]/30 hover:bg-[#EEF5FB]/40 text-[#1597E5] rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <FiDownload className="w-4 h-4" />
                Export Excel Sheet
              </button>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default BranchAnalytics;
