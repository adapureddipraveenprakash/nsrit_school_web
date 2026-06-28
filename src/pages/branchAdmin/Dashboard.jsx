import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useDataFetch } from '../../hooks/useDataFetch';
import { getDashboardStatistics } from '../../services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase, FiMoreVertical, FiCreditCard, FiArrowRight,
  FiUsers, FiCalendar, FiActivity, FiSettings, FiDollarSign,
  FiCheckCircle, FiFileText, FiPlus, FiGrid
} from 'react-icons/fi';
import {
  HiOutlineUserPlus, HiOutlineUserGroup, HiOutlineQuestionMarkCircle,
  HiOutlineClipboardDocumentList, HiOutlineAcademicCap
} from 'react-icons/hi2';
import Drawer from '../../components/Drawer';
import { useNavigate } from 'react-router-dom';

const BranchAdminDashboard = () => {
  const {
    user,
    fees,
    activeRole,
    logout
  } = useApp();

  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvSuccess, setCsvSuccess] = useState(false);

  // Fetch real-time statistics from Firebase Data Connect
  const { data: stats } = useDataFetch(
    () => getDashboardStatistics({ branchId: user?.branchId }),
    [user?.branchId],
    { defaultValue: null, pollInterval: 15000 }
  );

  const studentsCount = stats?.studentsAggregate?.count ?? 105;
  const collectedFee = fees.collected || 10000;
  const pendingFee = fees.pending || 4369000;
  const totalFee = collectedFee + pendingFee;
  const attendanceRate = 0;

  const handleListItemClick = (item) => {
    if (item === 'Add Student') {
      navigate('/settings/create-student');
    } else if (item === 'All Students') {
      navigate('/settings/global-students');
    } else if (item === 'Bulk CSV Import') {
      navigate('/settings/bulk-upload');
    } else if (item === 'Manage Teachers') {
      navigate('/settings/teachers');
    } else if (item === 'Assign Class Teacher') {
      navigate('/settings/class-teachers');
    } else if (item === 'Attendance Overview') {
      navigate('/settings/attendance-overview');
    } else if (item === 'Fee Overview') {
      navigate('/settings/fee-overview');
    } else if (item === 'Branch Analytics') {
      navigate('/settings/branch-analytics');
    } else if (item === 'Branch Settings') {
      navigate('/settings/branch-settings');
    }
  };

  const handleCsvSubmit = (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setCsvSuccess(true);
    setTimeout(() => {
      setCsvSuccess(false);
      setShowCsvModal(false);
      setCsvFile(null);
    }, 1500);
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
      <div className="text-center py-2 shrink-0">
        <h1 className="text-lg font-bold text-dark tracking-tight">Branch Admin</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Hero greeting banner matching Screenshot 1 */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 md:p-8 text-white card-shadow overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="w-14 h-14 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xl font-bold font-sans cursor-pointer hover:bg-white/30 transition-all select-none animate-[pulse_3s_infinite]"
                >
                  BA
                </button>
                <div>
                  <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Good Evening,</p>
                  <h2 className="text-2xl font-bold">{user?.name || 'Branch Admin'}</h2>
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/25 rounded-full mt-2 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />
                    Branch Administrator
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                {/* Three dots button */}
                <button
                  onClick={() => setShowThreeDotsMenu(true)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm active:scale-95 z-30"
                >
                  <FiMoreVertical className="w-5 h-5" />
                </button>
                
                {/* Date */}
                <span className="text-[10px] font-bold text-white/70 uppercase">Sun, 21 Jun</span>
              </div>
            </div>

            {/* Bottom aggregate statistics grid */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/15 text-center">
              <div className="border-r border-white/15 last:border-none">
                <p className="text-xl font-bold md:text-2xl">{studentsCount}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Students</p>
              </div>
              <div className="border-r border-white/15 last:border-none">
                <p className="text-xl font-bold md:text-2xl">Rs {collectedFee.toLocaleString('en-IN')}</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Collected</p>
              </div>
              <div>
                <p className="text-xl font-bold md:text-2xl">{attendanceRate}%</p>
                <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Rate</p>
              </div>
            </div>
          </div>

          {/* Fee Collection Progress Card */}
          <div className="bg-white rounded-[24px] p-6 card-shadow border border-[#e2e8f0]/40 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] flex items-center justify-center text-brand-blue">
                  <FiCreditCard className="w-5 h-5 text-[#1597E5]" />
                </div>
                <h3 className="text-sm font-extrabold text-dark">Fee Collection Progress</h3>
              </div>
              <span className="text-xs font-bold text-[#FF9F1C]">0%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#EEF5FB] h-2 rounded-full overflow-hidden">
              <div className="bg-[#FF9F1C] h-full rounded-full transition-all duration-500" style={{ width: '0.2%' }} />
            </div>

            <p className="text-[11px] text-secondaryText font-bold">
              Collected Rs {collectedFee.toLocaleString('en-IN')} of Rs {totalFee.toLocaleString('en-IN')}
            </p>
          </div>

        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          
          {/* STUDENT MANAGEMENT Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue">
                <span className="text-xs font-extrabold text-[#1597E5]">?</span>
              </div>
              <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Student Management</h2>
            </div>

            <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
              {[
                {
                  title: 'Add Student',
                  desc: 'Enrol a new student',
                  icon: <HiOutlineUserPlus className="w-5 h-5" />,
                  color: 'text-[#23C16B] bg-[#E8F8F0]'
                },
                {
                  title: 'All Students',
                  desc: 'View and manage student records',
                  icon: <HiOutlineQuestionMarkCircle className="w-5 h-5" />,
                  color: 'text-[#1597E5] bg-[#EEF5FB]'
                },
                {
                  title: 'Bulk CSV Import',
                  desc: 'Upload multiple students at once',
                  icon: <FiFileText className="w-5 h-5" />,
                  color: 'text-accent-purple bg-[#F3E8FF]'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleListItemClick(item.title)}
                  className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-dark group-hover:text-[#1597E5] transition-colors">{item.title}</h3>
                      <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  
                  {/* Circular Chevron Button */}
                  <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-[#1597E5]/10 flex items-center justify-center text-[#1597E5] transition-all">
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STAFF & ATTENDANCE Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue">
                <FiUsers className="w-3.5 h-3.5 text-[#1597E5]" />
              </div>
              <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Staff & Attendance</h2>
            </div>

            <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
              {[
                {
                  title: 'Manage Teachers',
                  desc: 'Teacher roster for this branch',
                  icon: <HiOutlineAcademicCap className="w-5 h-5" />,
                  color: 'text-accent-purple bg-[#F3E8FF]',
                  chevronColor: 'text-accent-purple bg-[#F3E8FF] group-hover:bg-accent-purple/10'
                },
                {
                  title: 'Assign Class Teacher',
                  desc: 'Link teacher to section',
                  icon: <HiOutlineClipboardDocumentList className="w-5 h-5" />,
                  color: 'text-[#1597E5] bg-[#EEF5FB]',
                  chevronColor: 'text-[#1597E5] bg-[#EEF5FB] group-hover:bg-[#1597E5]/10'
                },
                {
                  title: 'Attendance Overview',
                  desc: 'Branch-wide attendance log',
                  icon: <FiCalendar className="w-5 h-5" />,
                  color: 'text-accent-purple bg-[#F3E8FF]',
                  chevronColor: 'text-accent-purple bg-[#F3E8FF] group-hover:bg-accent-purple/10'
                },
                {
                  title: 'Fee Overview',
                  desc: 'Branch fee collection desk',
                  icon: <FiActivity className="w-5 h-5" />,
                  color: 'text-[#FF9F1C] bg-[#FFF8EE]',
                  chevronColor: 'text-[#FF9F1C] bg-[#FFF8EE] group-hover:bg-[#FF9F1C]/10',
                  isOrange: true
                },
                {
                  title: 'Branch Analytics',
                  desc: 'Fee collection and performance data',
                  icon: <FiGrid className="w-5 h-5" />,
                  color: 'text-accent-purple bg-[#F3E8FF]',
                  chevronColor: 'text-accent-purple bg-[#F3E8FF] group-hover:bg-accent-purple/10'
                },
                {
                  title: 'Branch Settings',
                  desc: 'Configuration and preferences',
                  icon: <FiSettings className="w-5 h-5" />,
                  color: 'text-secondaryText bg-[#F1F5F9]',
                  chevronColor: 'text-secondaryText bg-[#F1F5F9] group-hover:bg-slate-200'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleListItemClick(item.title)}
                  className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-dark group-hover:text-[#1597E5] transition-colors">{item.title}</h3>
                      <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  
                  {/* Chevron Button */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    item.isOrange ? 'bg-[#FFF8EE] text-[#FF9F1C] group-hover:bg-[#FF9F1C]/10' : item.chevronColor
                  }`}>
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Drawers */}
      <Drawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <Drawer isOpen={showThreeDotsMenu} onClose={() => setShowThreeDotsMenu(false)} position="right" />

      {/* CSV Import Modal Overlay */}
      <AnimatePresence>
        {showCsvModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCsvModal(false)}
              className="fixed inset-0 bg-dark/70"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] w-full max-w-[400px] p-6 card-shadow relative overflow-hidden z-10 space-y-4"
            >
              <h3 className="text-sm font-extrabold text-dark">Bulk CSV Import</h3>
              <p className="text-[11px] text-secondaryText font-medium">Select a student record CSV list file to register multiple students in this branch at once.</p>

              {csvSuccess ? (
                <div className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-3 flex items-center gap-2 text-xs text-accent-green font-bold">
                  <FiCheckCircle className="w-4 h-4 shrink-0" />
                  <span>CSV File imported successfully!</span>
                </div>
              ) : (
                <form onSubmit={handleCsvSubmit} className="space-y-4">
                  <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-6 text-center hover:border-brand-blue/60 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      required
                      onChange={(e) => setCsvFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FiFileText className="w-8 h-8 text-secondaryText mx-auto mb-2" />
                    <p className="text-xs font-semibold text-dark">{csvFile ? csvFile.name : 'Select or drag CSV file here'}</p>
                    <p className="text-[10px] text-secondaryText mt-1">Accepts UTF-8 .csv files up to 5MB</p>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCsvModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-dark transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1597E5] hover:bg-brand-blue rounded-lg text-xs font-bold text-white transition-colors"
                    >
                      Upload
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default BranchAdminDashboard;
