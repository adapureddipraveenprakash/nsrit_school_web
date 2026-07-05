import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiChevronDown, FiCheck, FiInbox, FiSearch } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getFeeReports } from '../../../services/dataService';

const ClassWiseReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();

  const initialClassName = location.state?.className || 'NURSERY';
  const branchId = user?.branchId || 'sontyam-branch-id';

  // Filters state
  const [selectedClass, setSelectedClass] = useState(initialClassName);
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  // Selector bottom sheets
  const [activeSheet, setActiveSheet] = useState(null); // 'class' | 'section' | 'year' | null
  const tabs = ['All', 'Paid', 'Partial', 'Due'];

  // Fetch live fee reports data
  const { data: rawFees, loading: feesLoading } = useDataFetch(
    () => getFeeReports({ branchId }),
    [branchId],
    { defaultValue: { students: [] }, pollInterval: 15000 }
  );

  const feeStudents = rawFees?.students || [];

  // Extract unique classes, sections, and years from live data for selector options
  const filterOptions = useMemo(() => {
    const classes = new Set();
    const sections = new Set();
    const years = new Set(['2026', '2025', '2027']); // Default mock years

    feeStudents.forEach(s => {
      if (s.academicClass?.name) classes.add(s.academicClass.name);
      if (s.section?.name) sections.add(s.section.name);
      (s.reportFeePlans || []).forEach(p => {
        if (p.academicYear) years.add(String(p.academicYear));
      });
    });

    return {
      classes: Array.from(classes).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      sections: ['All', ...Array.from(sections).sort()],
      years: Array.from(years).sort().reverse()
    };
  }, [feeStudents]);

  // Compute normalized report records for students
  const studentRecords = useMemo(() => {
    return feeStudents.map(s => {
      const plans = s.reportFeePlans || [];
      // Find plan for selected year
      const activePlan = plans.find(p => String(p.academicYear) === selectedYear && p.isActive !== false) || 
                         plans.find(p => p.isActive !== false) || 
                         plans[0];

      const total = activePlan ? (activePlan.totalAmount || 0) : 0;
      const payments = activePlan ? (activePlan.reportFeePayments || []) : [];
      const paid = payments
        .filter(p => String(p.status || 'RECORDED').toUpperCase() !== 'REVERSED')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const due = Math.max(total - paid, 0);
      const percent = total > 0 ? Math.round((paid / total) * 100) : 0;

      let status = 'DUE';
      if (total > 0) {
        if (percent === 100) status = 'PAID';
        else if (percent > 0) status = 'PARTIAL';
      } else {
        status = 'PAID'; // Default to paid if no plan assigned
      }

      return {
        id: s.id,
        name: s.fullName || 'Unknown Student',
        class: s.academicClass?.name || '1',
        section: s.section?.name || 'A',
        admissionNo: s.studentId || 'N/A',
        total,
        paid,
        due,
        status
      };
    });
  }, [feeStudents, selectedYear]);

  // Filter records based on selected class, section, status tab, and search
  const filteredStudents = useMemo(() => {
    return studentRecords.filter(s => {
      // Class filter
      if (s.class.toLowerCase() !== selectedClass.toLowerCase()) return false;

      // Section filter
      if (selectedSection !== 'All' && s.section.toLowerCase() !== selectedSection.toLowerCase()) return false;

      // Status tab filter
      if (activeTab === 'Paid' && s.status !== 'PAID') return false;
      if (activeTab === 'Partial' && s.status !== 'PARTIAL') return false;
      if (activeTab === 'Due' && s.status !== 'DUE') return false;

      // Search filter
      if (search) {
        const query = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(query) ||
          s.admissionNo.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [studentRecords, selectedClass, selectedSection, activeTab, search]);

  // Export functions (CSV)
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      alert('No data available to export.');
      return;
    }

    const csvRows = [
      ["Student Name", "Admission No", "Class", "Section", "Total Fee (Rs)", "Paid Fee (Rs)", "Due Fee (Rs)", "Status"],
      ...filteredStudents.map(s => [
        s.name,
        s.admissionNo,
        s.class,
        s.section,
        s.total,
        s.paid,
        s.due,
        s.status
      ])
    ];

    const csvContent = "\uFEFF" + csvRows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedClass}_Section_${selectedSection}_Fee_Report_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export functions (Excel)
  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = [
      ["Student Name", "Admission No", "Class", "Section", "Total Fee (Rs)", "Paid Fee (Rs)", "Due Fee (Rs)", "Status"]
    ];

    const rows = [
      ...headers,
      ...filteredStudents.map(s => [
        s.name,
        s.admissionNo,
        s.class,
        s.section,
        s.total,
        s.paid,
        s.due,
        s.status
      ])
    ];

    const csvContent = "\uFEFF" + rows.map(e => e.map(val => {
      const cleanVal = String(val).replace(/"/g, '""');
      return `"${cleanVal}"`;
    }).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedClass}_Section_${selectedSection}_Fee_Report_${selectedYear}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openSheet = (type) => {
    setActiveSheet(type);
  };

  const closeSheet = () => {
    setActiveSheet(null);
  };

  const selectOption = (type, val) => {
    if (type === 'class') setSelectedClass(val);
    if (type === 'section') setSelectedSection(val);
    if (type === 'year') setSelectedYear(val);
    closeSheet();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 relative">
      {/* Top Header */}
      <div className="bg-white px-5 py-4 border-b border-[#e2e8f0]/60 flex items-center gap-4 sticky top-0 z-30 card-shadow">
        <button
          onClick={() => navigate('/settings/branch-reports')}
          className="p-1.5 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-dark" />
        </button>
        <h1 className="text-sm font-black text-[#0F172A]">Class-wise Report</h1>
      </div>

      <div className="p-5 space-y-5 max-w-md mx-auto">
        {/* Page title and year */}
        <div>
          <h2 className="text-[10px] font-black tracking-widest text-[#0F172A] uppercase leading-none">
            {filteredStudents.length} Fee Report{filteredStudents.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-[10px] text-secondaryText font-black mt-1">
            Academic Year {selectedYear}
          </p>
        </div>

        {/* Dropdown Selectors */}
        <div className="bg-white rounded-[24px] p-5 card-shadow grid grid-cols-3 gap-3 border border-[#e2e8f0]/40">
          {/* Class Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-[#0F172A] pl-1">Class</span>
            <button
              onClick={() => openSheet('class')}
              className="flex items-center justify-between px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs font-black text-dark focus:outline-none"
            >
              <span className="truncate">{selectedClass}</span>
              <FiChevronDown className="w-4 h-4 text-secondaryText shrink-0" />
            </button>
          </div>

          {/* Section Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-[#0F172A] pl-1">Section</span>
            <button
              onClick={() => openSheet('section')}
              className="flex items-center justify-between px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs font-black text-dark focus:outline-none"
            >
              <span className="truncate">{selectedSection === 'All' ? 'All' : `${selectedClass}-${selectedSection}`}</span>
              <FiChevronDown className="w-4 h-4 text-secondaryText shrink-0" />
            </button>
          </div>

          {/* Year Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-[#0F172A] pl-1">Year</span>
            <button
              onClick={() => openSheet('year')}
              className="flex items-center justify-between px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs font-black text-dark focus:outline-none"
            >
              <span className="truncate">{selectedYear}</span>
              <FiChevronDown className="w-4 h-4 text-secondaryText shrink-0" />
            </button>
          </div>
        </div>

        {/* Search filter */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-bold text-dark shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02)] placeholder:text-[#A0AEC0]"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
        </div>

        {/* Horizontal Status Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-xs font-black transition-all border shrink-0 ${
                  isActive
                    ? 'bg-[#1597E5] text-white border-[#1597E5] shadow-sm'
                    : 'bg-white text-secondaryText border-[#e2e8f0] hover:border-slate-300'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* 2 Export Button Pills */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleExportCSV}
            className="h-12 rounded-full bg-[#1597E5] shadow-md border-0 focus:outline-none hover:opacity-90 active:scale-[0.98] transition-all text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer"
            title="Export CSV"
          >
            CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="h-12 rounded-full bg-[#1597E5] shadow-md border-0 focus:outline-none hover:opacity-90 active:scale-[0.98] transition-all text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer"
            title="Export Excel"
          >
            Excel
          </button>
        </div>

        {/* Student Cards List */}
        {feesLoading ? (
          <div className="text-center py-12 text-xs font-bold text-[#A0AEC0]">
            Loading student list...
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="space-y-4">
            {filteredStudents.map((item) => {
              const statusColor = item.status === 'PARTIAL'
                ? 'bg-[#FEF3C7] text-[#D97706]'
                : item.status === 'PAID'
                ? 'bg-[#D1FAE5] text-[#065F46]'
                : 'bg-[#FEE2E2] text-[#991B1B]';

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/settings/fee-profile/${item.id}`)}
                  className="bg-white rounded-[24px] p-5 card-shadow border border-[#e2e8f0]/40 flex flex-col gap-4 hover:border-blue-100 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-black text-[#0F172A] leading-tight uppercase group-hover:text-[#1597E5] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[9.5px] text-[#A0AEC0] font-black mt-1 uppercase">
                        {item.admissionNo} | Section {item.section}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${statusColor}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      {item.status}
                    </span>
                  </div>

                  <hr className="border-t border-[#f1f5f9]" />

                  {/* Amounts row */}
                  <div className="grid grid-cols-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[9.5px] text-[#A0AEC0] font-bold">Total Fee</span>
                      <span className="text-[11px] font-black text-[#0F172A] mt-1">
                        RS {item.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex flex-col items-center border-x border-[#f1f5f9]">
                      <span className="text-[9.5px] text-[#A0AEC0] font-bold">Paid</span>
                      <span className="text-[11px] font-black text-[#23C16B] mt-1">
                        RS {item.paid.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9.5px] text-[#A0AEC0] font-bold">Due</span>
                      <span className="text-[11px] font-black text-rose-500 mt-1">
                        RS {item.due.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Bottom circular blue button decoration */}
                  <div className="flex justify-center mt-1">
                    <div className="w-9 h-9 rounded-full bg-[#1597E5] shadow-md flex items-center justify-center text-white border border-[#1597E5]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 flex flex-col items-center justify-center p-6">
            <FiInbox className="w-8 h-8 text-[#A0AEC0] mb-2" />
            <p className="text-xs font-bold text-secondaryText">No students found matching filters.</p>
          </div>
        )}
      </div>

      {/* Selector Bottom Sheet Modal */}
      <AnimatePresence>
        {activeSheet && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Bottom Sheet wrapper */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] z-50 overflow-hidden shadow-2xl pb-8"
            >
              {/* Header drag-indicator bar */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 bg-[#E2E8F0] rounded-full" />
              </div>

              {/* Title */}
              <div className="px-6 py-2 border-b border-[#f1f5f9]">
                <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
                  Select {activeSheet}
                </h3>
              </div>

              {/* Options list */}
              <div className="px-4 py-2 max-h-[300px] overflow-y-auto">
                {activeSheet === 'class' && filterOptions.classes.map((cls) => {
                  const isSelected = selectedClass === cls;
                  return (
                    <button
                      key={cls}
                      onClick={() => selectOption('class', cls)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
                    >
                      <span className={`text-xs font-black ${isSelected ? 'text-[#1597E5]' : 'text-dark'}`}>
                        Class {cls}
                      </span>
                      {isSelected && <FiCheck className="w-4.5 h-4.5 text-[#1597E5]" />}
                    </button>
                  );
                })}

                {activeSheet === 'section' && filterOptions.sections.map((sec) => {
                  const isSelected = selectedSection === sec;
                  return (
                    <button
                      key={sec}
                      onClick={() => selectOption('section', sec)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
                    >
                      <span className={`text-xs font-black ${isSelected ? 'text-[#1597E5]' : 'text-dark'}`}>
                        {sec === 'All' ? 'All Sections' : `Section ${sec}`}
                      </span>
                      {isSelected && <FiCheck className="w-4.5 h-4.5 text-[#1597E5]" />}
                    </button>
                  );
                })}

                {activeSheet === 'year' && filterOptions.years.map((yr) => {
                  const isSelected = selectedYear === yr;
                  return (
                    <button
                      key={yr}
                      onClick={() => selectOption('year', yr)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
                    >
                      <span className={`text-xs font-black ${isSelected ? 'text-[#1597E5]' : 'text-dark'}`}>
                        {yr}
                      </span>
                      {isSelected && <FiCheck className="w-4.5 h-4.5 text-[#1597E5]" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassWiseReport;
