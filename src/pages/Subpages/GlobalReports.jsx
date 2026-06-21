import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiDownload, FiFileText } from 'react-icons/fi';

const GlobalReports = () => {
  const navigate = useNavigate();
  const { branches, fees } = useApp();

  const totalStudents = branches.reduce((sum, b) => sum + b.studentsCount, 0);
  const totalFaculty = branches.reduce((sum, b) => sum + b.facultyCount, 0);
  const totalCoordinators = branches.reduce((sum, b) => sum + b.coordinatorsCount, 0);

  // Functional Exports helper
  const handleExport = (fileType) => {
    // Generate CSV dataset
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Branch,Students,Pending Fees,Concessions\n";
    
    branches.forEach(b => {
      csvContent += `${b.code},${b.studentsCount},Rs ${fees.pending.toLocaleString('en-IN')},Rs ${fees.concession.toLocaleString('en-IN')}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Global_Reports_Summary.${fileType === 'csv' ? 'csv' : 'xls'}`);
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
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Area: Summary & stats */}
        <div className="lg:col-span-2 space-y-6">
      {/* Top Header Card */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">MAIN ADMIN</p>
            <h2 className="text-xl font-bold md:text-2xl">Global Reports</h2>
          </div>
        </div>

        <p className="text-xs text-white/70 font-medium">All-branch strength, attendance & fee snapshot</p>

        {/* Action Export Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => handleExport('csv')}
            className="py-2.5 px-5 bg-white hover:bg-[#EEF5FB] text-brand-blue rounded-full font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <FiFileText className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="py-2.5 px-5 bg-white hover:bg-[#EEF5FB] text-brand-blue rounded-full font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <FiDownload className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Grid of 8 Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* STUDENTS */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow text-center space-y-1">
          <p className="text-xl font-extrabold text-brand-blue">{totalStudents}</p>
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider">Students</p>
        </div>

        {/* TEACHERS */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow text-center space-y-1">
          <p className="text-xl font-extrabold text-brand-blue">{totalFaculty}</p>
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider">Teachers</p>
        </div>

        {/* COORDINATORS */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow text-center space-y-1">
          <p className="text-xl font-extrabold text-brand-blue">{totalCoordinators}</p>
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider">Coordinators</p>
        </div>

        {/* ACCOUNTANTS */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow text-center space-y-1">
          <p className="text-xl font-extrabold text-brand-blue">1</p>
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider">Accountants</p>
        </div>

        {/* ATTENDANCE */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow text-center space-y-1">
          <p className="text-xl font-extrabold text-brand-blue">91%</p>
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider">Attendance</p>
        </div>

        {/* COLLECTED FEES */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow text-center space-y-1">
          <p className="text-xl font-extrabold text-brand-blue">Rs {fees.collected.toLocaleString('en-IN')}</p>
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider">Collected Fees</p>
        </div>

        {/* PENDING FEES */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow text-center space-y-1">
          <p className="text-xl font-extrabold text-brand-blue">Rs {fees.pending.toLocaleString('en-IN')}</p>
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider">Pending Fees</p>
        </div>

        {/* CONCESSIONS */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow text-center space-y-1">
          <p className="text-xl font-extrabold text-brand-blue">Rs {fees.concession.toLocaleString('en-IN')}</p>
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider">Concessions</p>
        </div>
      </div>
        </div> {/* End Left Area */}

        {/* Right Area: Table Summary */}
        <div>
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
        <h3 className="text-xs font-bold text-dark uppercase tracking-wider px-1">BRANCH WISE</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF5FB] border border-[#e2e8f0]/80 font-bold uppercase tracking-wider text-secondaryText">
                <th className="p-3">BRANCH</th>
                <th className="p-3 text-center">STUD.</th>
                <th className="p-3 text-right">PENDING</th>
                <th className="p-3 text-right">CONCESSION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]/80">
              {branches.map(b => (
                <tr key={b.id} className="text-dark font-semibold">
                  <td className="p-3 font-bold uppercase">{b.code}</td>
                  <td className="p-3 text-center">{b.studentsCount}</td>
                  <td className="p-3 text-right text-accent-red">Rs {fees.pending.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right text-accent-purple">Rs {fees.concession.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      </div> {/* End grid layout wrapper */}
    </motion.div>
  );
};

export default GlobalReports;
