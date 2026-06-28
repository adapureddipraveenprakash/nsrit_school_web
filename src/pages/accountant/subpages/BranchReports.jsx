import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiFileText, FiDownload, FiSearch } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getFeeRecordsByBranch } from '../../../services/dataService';

const BranchReports = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const branchId = user?.branchId || 'sontyam-branch-id';
  const tabs = ['All', 'Paid', 'Partial', 'Due', 'Concession'];

  // Fetch real fee structures
  const { data: rawFees, loading: feesLoading } = useDataFetch(
    () => getFeeRecordsByBranch({ branchId }),
    [branchId],
    { defaultValue: { studentFees: [] }, pollInterval: 15000 }
  );

  const studentFees = rawFees?.studentFees || [];

  // Compute stats
  const stats = useMemo(() => {
    let total = 0;
    let collected = 0;
    let pending = 0;
    let concession = 0;

    studentFees.forEach(f => {
      total += f.totalFee || 0;
      collected += f.paidAmount || 0;
      pending += f.remainingAmount || 0;
      // Calculate concession if any discrepancy exists
      const diff = (f.totalFee || 0) - (f.paidAmount || 0) - (f.remainingAmount || 0);
      if (diff > 0) concession += diff;
    });

    return { total, collected, pending, concession };
  }, [studentFees]);

  // Normalize list
  const normalizedRecords = useMemo(() => {
    return studentFees.map(f => {
      const conc = (f.totalFee || 0) - (f.paidAmount || 0) - (f.remainingAmount || 0);
      return {
        id: f.id,
        name: f.student?.fullName || 'Unknown Student',
        class: `${f.student?.academicClassId || '1'}-${f.student?.sectionId || 'A'}`.toUpperCase(),
        admissionNo: f.student?.studentId || 'N/A',
        total: f.totalFee || 0,
        paid: f.paidAmount || 0,
        due: f.remainingAmount || 0,
        concession: conc > 0 ? conc : 0,
        status: f.status || (f.remainingAmount > 0 ? 'DUE' : 'PAID')
      };
    });
  }, [studentFees]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return normalizedRecords.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                            r.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
                            r.class.toLowerCase().includes(search.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === 'Paid') matchesTab = r.status.toUpperCase() === 'PAID';
      else if (activeTab === 'Partial') matchesTab = r.status.toUpperCase() === 'PARTIAL';
      else if (activeTab === 'Due') matchesTab = r.status.toUpperCase() === 'DUE';
      else if (activeTab === 'Concession') matchesTab = r.concession > 0;

      return matchesSearch && matchesTab;
    });
  }, [normalizedRecords, search, activeTab]);

  const handleExport = (fileType) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Amount\n";
    csvContent += `Total,${stats.total}\n`;
    csvContent += `Collected,${stats.collected}\n`;
    csvContent += `Pending,${stats.pending}\n`;
    csvContent += `Concession,${stats.concession}\n\n`;
    csvContent += "Student Name,Admission No,Class,Total Fee,Paid Amount,Remaining Due,Concession,Status\n";
    
    filteredRecords.forEach(r => {
      csvContent += `"${r.name}","${r.admissionNo}","${r.class}",${r.total},${r.paid},${r.due},${r.concession},"${r.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Branch_Fee_Report.${fileType}`);
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
      className="p-4 md:p-8 space-y-6 pb-24 max-w-4xl mx-auto select-none animate-fade-in relative"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Reports</h1>
      </header>

      {/* Top curved blue header card with CSV/Excel inside */}
      <div className="relative rounded-[28px] bg-gradient-to-br from-[#00a6ff] to-[#0077ff] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="mb-1 relative z-10 select-none">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">FEE</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Reports</h2>
        <p className="text-[11px] text-white/80 font-bold relative z-10 mb-5">
          Branch financial statements and student details
        </p>

        {/* Export buttons inside card */}
        <div className="flex gap-2.5 relative z-10 select-none">
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 text-[10px] font-black text-dark bg-white px-4 py-2 rounded-full hover:bg-white/90 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <FiFileText className="w-3.5 h-3.5 text-[#0088ff]" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport('xls')}
            className="inline-flex items-center gap-1.5 text-[10px] font-black text-dark bg-white px-4 py-2 rounded-full hover:bg-white/90 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <FiDownload className="w-3.5 h-3.5 text-[#0088ff]" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Multi Stats row below header */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-5 card-shadow grid grid-cols-4 gap-2 text-center divide-x divide-[#e2e8f0]/80 select-none">
        <div className="min-w-0">
          <p className="text-sm font-black text-dark truncate">₹{stats.total.toLocaleString()}</p>
          <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider mt-1.5 leading-none truncate">Total</p>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-[#23C16B] truncate">₹{stats.collected.toLocaleString()}</p>
          <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider mt-1.5 leading-none truncate">Collected</p>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-[#E53E3E] truncate">₹{stats.pending.toLocaleString()}</p>
          <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider mt-1.5 leading-none truncate">Pending</p>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-[#FF9F1C] truncate">₹{stats.concession.toLocaleString()}</p>
          <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider mt-1.5 leading-none truncate">Concession</p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Filter by student, class"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
      </div>

      {/* Filter Chips row */}
      <div className="flex gap-2.5 pb-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-[10.5px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/20'
                  : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Report list container */}
      <div className="space-y-4">
        <div className="px-1 text-[10px] font-extrabold text-secondaryText tracking-widest uppercase">
          STUDENT-WISE REPORT ({filteredRecords.length})
        </div>

        {feesLoading ? (
          <div className="text-center py-12 text-xs font-bold text-secondaryText">
            Loading reports...
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="space-y-3">
            {filteredRecords.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 shadow-sm flex flex-col gap-2.5 hover:border-brand-blue/15 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-dark">{r.name}</h3>
                    <p className="text-[9.5px] text-secondaryText font-bold mt-0.5">
                      Class: {r.class} · ID: {r.admissionNo}
                    </p>
                  </div>
                  <span className={`text-[8.5px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                    r.status.toUpperCase() === 'PAID' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {r.status}
                  </span>
                </div>
                
                {/* Financial breakdown row */}
                <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-[#e2e8f0]/40 text-center text-[9px] font-bold text-secondaryText">
                  <div>
                    <span className="block text-dark font-extrabold text-[10.5px]">₹{r.total.toLocaleString()}</span>
                    <span>Total</span>
                  </div>
                  <div>
                    <span className="block text-[#23C16B] font-extrabold text-[10.5px]">₹{r.paid.toLocaleString()}</span>
                    <span>Paid</span>
                  </div>
                  <div>
                    <span className="block text-[#E53E3E] font-extrabold text-[10.5px]">₹{r.due.toLocaleString()}</span>
                    <span>Due</span>
                  </div>
                  <div>
                    <span className="block text-[#FF9F1C] font-extrabold text-[10.5px]">₹{r.concession.toLocaleString()}</span>
                    <span>Concession</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state error Card matching new screenshot */
          <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-12 card-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <div className="w-18 h-18 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/10 relative">
              <div className="absolute inset-[-4px] rounded-full border border-brand-blue/5" />
              <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="space-y-1.5 max-w-[280px]">
              <h4 className="text-xs font-black text-dark">No report records</h4>
              <p className="text-[10px] text-[#A0AEC0] font-semibold leading-relaxed">
                Fee plans and payments matching this filter will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BranchReports;
