import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiSettings, FiCalendar, FiBell, FiArrowRight,
  FiClipboard, FiActivity, FiEdit, FiFileText, FiPlus, FiCheckSquare
} from 'react-icons/fi';
import { HiOutlinePresentationChartLine } from 'react-icons/hi2';
import Drawer from '../../components/Drawer';
import { useDataFetch } from '../../hooks/useDataFetch';
import { getStudents, getFeeRecordsByBranch } from '../../services/dataService';

const CoordinatorDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  const branchId = user?.branchId || 'sontyam-branch-id';

  // Fetch branch students count
  const { data: dbStudents = [] } = useDataFetch(
    () => getStudents({ branchId, limit: 500 }),
    [branchId],
    { defaultValue: [] }
  );

  // Fetch branch fee structures to calculate collections
  const { data: rawFees } = useDataFetch(
    () => getFeeRecordsByBranch({ branchId }),
    [branchId],
    { defaultValue: { studentFees: [] }, pollInterval: 15000 }
  );

  const studentFees = rawFees?.studentFees || [];

  const wingStudents = useMemo(() => {
    if (!user?.wing) return dbStudents;
    return dbStudents.filter(s => s.academicClass?.wing?.code?.toUpperCase() === user.wing.toUpperCase());
  }, [dbStudents, user?.wing]);

  const wingId = useMemo(() => {
    const match = dbStudents.find(s => s.academicClass?.wing?.code?.toUpperCase() === user?.wing?.toUpperCase());
    return match?.academicClass?.wing?.id || null;
  }, [dbStudents, user?.wing]);

  const wingFees = useMemo(() => {
    if (!wingId) return studentFees;
    return studentFees.filter(f => f.student?.wingId === wingId);
  }, [studentFees, wingId]);

  // Compute stats
  const stats = useMemo(() => {
    let total = 0;
    let collected = 0;
    let pending = 0;

    wingFees.forEach(f => {
      total += f.totalFee || 0;
      collected += f.paidAmount || 0;
      pending += f.remainingAmount || 0;
    });

    const percent = total > 0 ? Math.round((collected / total) * 100) : 0;

    return { total, collected, pending, percent };
  }, [wingFees]);

  const handleListItemClick = (item) => {
    if (item === 'Wing Attendance') {
      navigate('/settings/attendance-overview');
    } else if (item === 'Correct Attendance') {
      navigate('/settings/correct-attendance');
    } else if (item === 'Wing Students') {
      navigate('/settings/global-students');
    } else if (item === 'Assign Teachers') {
      navigate('/settings/class-teachers');
    } else if (item === 'Holiday Management') {
      navigate('/settings/holidays');
    } else if (item === 'Add Student') {
      navigate('/settings/create-student');
    } else if (item === 'Student Management') {
      navigate('/settings/student-management');
    } else if (item === 'Teacher Management') {
      navigate('/settings/teachers');
    } else if (item === 'Wing Fees') {
      navigate('/settings/fee-overview');
    } else if (item === 'Post Notice') {
      navigate('/settings/post-notice');
    } else if (item === 'View Notices') {
      navigate('/settings/notifications');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto space-y-6 select-none"
    >
      {/* Centered Page Header */}
      <div className="text-center py-1 md:py-2 shrink-0">
        <h1 className="text-lg font-bold text-dark tracking-tight">Coordinator Portal</h1>
      </div>

      {/* Top Banner Card matching Screenshot 1 */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1E56EC] via-[#2F65F8] to-[#4076FF] p-6 text-white card-shadow overflow-hidden">
        {/* Decorative concentric translucent circles */}
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full border-[16px] border-white/5" />
        <div className="absolute top-[-20px] right-[-20px] w-36 h-36 rounded-full border-[12px] border-white/10" />
        
        {/* Banner Header Info */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            {/* Round Avatar Icon with two figure shapes */}
            <div className="w-14 h-14 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 select-none">
              <FiUsers className="w-7 h-7" />
            </div>
            
            <div>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">GOOD AFTERNOON,</p>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight truncate max-w-[200px] md:max-w-none">
                {user?.name || 'Coordinator'}
              </h2>
              
              {/* PRIMARY Coordinator Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 border border-white/25 rounded-full mt-2.5 text-[9px] font-bold uppercase tracking-wide">
                <FiGrid className="w-3 h-3 text-white/95" />
                <span>{user?.wing || 'PRIMARY'} Coordinator</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3.5 select-none shrink-0">
            {/* Translucent circular setting / option button */}
            <button
              onClick={() => setShowThreeDotsMenu(true)}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm active:scale-95 z-10"
            >
              <FiSettings className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-bold text-white/75 uppercase tracking-wide">Wed, 24 Jun</span>
          </div>
        </div>

        {/* Aggregate Stats Section inside Banner */}
        <div className="grid grid-cols-3 gap-2 pt-5 border-t border-white/15 text-center select-none">
          <div className="border-r border-white/15 last:border-none">
            <p className="text-2xl font-black">{wingStudents.length}</p>
            <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest mt-0.5">STUDENTS</p>
          </div>
          <div className="border-r border-white/15 last:border-none">
            <p className="text-2xl font-black">{stats.percent}%</p>
            <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest mt-0.5">COLLECTED</p>
          </div>
          <div>
            <p className="text-2xl font-black">₹{stats.pending.toLocaleString()}</p>
            <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest mt-0.5 font-medium">PENDING</p>
          </div>
        </div>
      </div>

      {/* Wing Fee Collection Progress Card */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 p-5 card-shadow space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue border border-blue-50">
              <HiOutlinePresentationChartLine className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-dark">Wing Fee Collection</h3>
          </div>
          <span className="text-sm font-extrabold text-brand-blue">{stats.percent}%</span>
        </div>

        {/* Dynamic progress bar */}
        <div className="w-full bg-[#EEF5FB] h-2.5 rounded-full overflow-hidden">
          <div className="bg-brand-blue h-full rounded-full transition-all duration-500" style={{ width: `${stats.percent}%` }} />
        </div>

        <p className="text-[11px] text-secondaryText font-bold">
          ₹{stats.collected.toLocaleString()} of ₹{stats.total.toLocaleString()} collected
        </p>
      </div>

      {/* Grid of Menus for Desktop and Single Column on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WING OPERATIONS SECTION */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 px-1">
            <span className="text-sky-500 font-bold text-xs select-none">⚡</span>
            <h2 className="text-[10px] font-bold text-secondaryText tracking-widest uppercase">WING OPERATIONS</h2>
          </div>

          <div className="bg-white rounded-[28px] card-shadow border border-[#e2e8f0]/45 overflow-hidden divide-y divide-[#e2e8f0]/60">
            {[
              {
                title: 'Wing Attendance',
                desc: 'View and mark wing attendance',
                icon: <FiCheckSquare className="w-5 h-5 text-sky-500" />,
                bg: 'bg-sky-50 border-sky-100/30'
              },
              {
                title: 'Correct Attendance',
                desc: 'Edit past attendance records',
                icon: <FiEdit className="w-5 h-5 text-amber-500" />,
                bg: 'bg-amber-50/70 border-amber-100/30'
              },
              {
                title: 'Wing Students',
                desc: 'View students in this wing',
                icon: <span className="text-lg font-extrabold text-blue-500 leading-none select-none">?</span>,
                bg: 'bg-blue-50 border-blue-100/30'
              },
              {
                title: 'Assign Teachers',
                desc: 'Assign teachers to sections',
                icon: <FiUsers className="w-5 h-5 text-indigo-500" />,
                bg: 'bg-indigo-50 border-indigo-100/30'
              },
              {
                title: 'Holiday Management',
                desc: 'School holidays & public holidays',
                icon: <FiCalendar className="w-5 h-5 text-rose-500" />,
                bg: 'bg-rose-50 border-rose-100/30'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleListItemClick(item.title)}
                className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-dark group-hover:text-brand-blue transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                  </div>
                </div>
                
                <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-blue-50 flex items-center justify-center text-brand-blue transition-all shrink-0">
                  <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MANAGEMENT SECTION */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 px-1">
            <span className="text-sky-500 font-bold text-xs select-none">⚙</span>
            <h2 className="text-[10px] font-bold text-secondaryText tracking-widest uppercase">MANAGEMENT</h2>
          </div>

          <div className="bg-white rounded-[28px] card-shadow border border-[#e2e8f0]/45 overflow-hidden divide-y divide-[#e2e8f0]/60">
            {[
              {
                title: 'Add Student',
                desc: 'Enrol a new student',
                icon: <FiPlus className="w-5 h-5 text-emerald-500" />,
                bg: 'bg-emerald-50 border-emerald-100/30'
              },
              {
                title: 'Student Management',
                desc: 'Full student roster',
                icon: <span className="text-lg font-extrabold text-blue-500 leading-none select-none">?</span>,
                bg: 'bg-blue-50 border-blue-100/30'
              },
              {
                title: 'Teacher Management',
                desc: 'Teacher roster and assignments',
                icon: <FiUsers className="w-5 h-5 text-purple-500" />,
                bg: 'bg-purple-50 border-purple-100/30'
              },
              {
                title: 'Wing Fees',
                desc: 'Fee collection desk',
                icon: <HiOutlinePresentationChartLine className="w-5 h-5 text-amber-500" />,
                bg: 'bg-amber-50/70 border-amber-100/30'
              },
              {
                title: 'Post Notice',
                desc: 'Publish announcements for parents',
                icon: <FiFileText className="w-5 h-5 text-sky-500" />,
                bg: 'bg-sky-50 border-sky-100/30'
              },
              {
                title: 'View Notices',
                desc: 'All school announcements',
                icon: <FiBell className="w-5 h-5 text-indigo-500" />,
                bg: 'bg-indigo-50 border-indigo-100/30'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleListItemClick(item.title)}
                className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-dark group-hover:text-brand-blue transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                  </div>
                </div>
                
                <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-blue-50 flex items-center justify-center text-brand-blue transition-all shrink-0">
                  <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Drawer isOpen={showThreeDotsMenu} onClose={() => setShowThreeDotsMenu(false)} position="right" />
    </motion.div>
  );
};

export default CoordinatorDashboard;
