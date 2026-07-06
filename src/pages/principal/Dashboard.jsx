import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useDataFetch } from '../../hooks/useDataFetch';
import { getPrincipalDashboard, getFeeReports, reversePayment } from '../../services/dataService';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiArrowRight, FiUsers, FiCalendar, FiActivity,
  FiSettings, FiDollarSign, FiBookOpen, FiClock, FiAlertCircle,
  FiGrid, FiSliders, FiList, FiFileText, FiTag, FiTrendingUp, FiMoreVertical
} from 'react-icons/fi';
import {
  HiOutlineUserPlus, HiOutlineAcademicCap, HiOutlineClipboardDocumentList
} from 'react-icons/hi2';
import { BiReceipt } from 'react-icons/bi';
import Drawer from '../../components/Drawer';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

const PrincipalDashboard = () => {
  const { user, feeRefreshTrigger } = useApp();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);
  const [firestorePayments, setFirestorePayments] = useState({});

  const branchId = user?.branchId || null;
  const { data: stats } = useDataFetch(
    () => getPrincipalDashboard(branchId),
    [branchId, feeRefreshTrigger],
    { defaultValue: null, pollInterval: 15000, skip: !branchId }
  );

  const { data: rawFeePlans } = useDataFetch(
    () => getFeeReports({ branchId }),
    [branchId, feeRefreshTrigger],
    { defaultValue: { students: [] }, pollInterval: 15000, skip: !branchId }
  );

  const studentsList = rawFeePlans?.students || [];

  // Fetch Firestore payments in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'fee_payments'), (querySnapshot) => {
      const mapping = {};
      querySnapshot.forEach(docSnap => {
        mapping[docSnap.id] = docSnap.data().list || [];
      });
      setFirestorePayments(mapping);
    }, (err) => {
      console.error('Firestore payments onSnapshot error:', err);
    });
    return () => unsub();
  }, []);

  // Temporary one-time cleanup hook for XYZ / test student payment records
  useEffect(() => {
    if (studentsList.length > 0) {
      const xyzStudent = studentsList.find(s => s.fullName && s.fullName.toLowerCase().includes('xyz'));
      if (xyzStudent) {
        console.log('[Cleanup] Found XYZ student:', xyzStudent);
        
        // 1. Delete Firestore payments document
        const firestoreRef = doc(db, 'fee_payments', xyzStudent.id);
        setDoc(firestoreRef, { list: [] })
          .then(() => console.log('[Cleanup] Cleared XYZ Firestore payments successfully'))
          .catch(err => console.error('[Cleanup] Firestore clear failed:', err));
          
        // 2. Reverse any PostgreSQL payments under their fee plans
        (xyzStudent.reportFeePlans || []).forEach(plan => {
          (plan.reportFeePayments || []).forEach(pay => {
            if (pay.status !== 'REVERSED') {
              console.log('[Cleanup] Reversing PostgreSQL payment:', pay.id);
              reversePayment({
                paymentId: pay.id,
                studentId: xyzStudent.id,
                branchId: branchId,
                reversedById: user?.id || xyzStudent.id,
                reason: 'Cleanup XYZ student payment record'
              });
            }
          });
        });
      }
    }
  }, [studentsList, branchId, user]);

  const feeStats = useMemo(() => {
    let collected = 0;
    let pending = 0;
    let waiver = 0;
    let total = 0;

    studentsList.forEach(s => {
      const fsList = firestorePayments[s.id] || [];
      const fsPaid = fsList.reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const activePlans = (s.reportFeePlans || []).filter(plan => plan.isActive !== false);

      if (activePlans.length === 0) {
        // If they have no active plan but have paid some amount, count it towards total and collected!
        if (fsPaid > 0) {
          collected += fsPaid;
          total += fsPaid;
        }
      } else {
        activePlans.forEach(plan => {
          total += plan.totalAmount || 0;
          waiver += plan.concessionAmount || 0;

          let paidForPlan = 0;
          (plan.reportFeePayments || []).forEach(pay => {
            if (String(pay.status || 'RECORDED').toUpperCase() !== 'REVERSED') {
              paidForPlan += pay.amount || 0;
            }
          });

          const totalPaid = paidForPlan + fsPaid;
          collected += totalPaid;
          pending += Math.max((plan.totalAmount || 0) - totalPaid, 0);
        });
      }
    });

    // Always show actual database values
    if (studentsList.length === 0) {
      return {
        collected: 0,
        pending: 0,
        waiver: 0,
        percent: 0
      };
    }

    const percent = total > 0 ? Math.round((collected / total) * 100) : 0;

    return { collected, pending, waiver, percent };
  }, [studentsList, firestorePayments]);

  React.useEffect(() => {
    console.log('[Principal Dashboard] user:', user);
    console.log('[Principal Dashboard] branchId:', branchId);
    console.log('[Principal Dashboard] rawFeePlans:', rawFeePlans);
    console.log('[Principal Dashboard] stats:', stats);
  }, [user, branchId, rawFeePlans, stats]);

  const studentsCount = stats?.students?.length ?? 107;
  const facultyCount = stats?.teachers?.length ?? 16;
  const sectionsCount = stats?.sections?.length ?? 10;
  const pendingCount = stats?.pendingPromotions?.length ?? 107;

  const coordinatorsCount = stats?.coordinators?.length ?? 2;
  const accountantsCount = 1;

  const handleListItemClick = (title) => {
    if (title === 'Add Student') {
      navigate('/settings/create-student');
    } else if (title === 'Manage Students') {
      navigate('/settings/global-students');
    } else if (title === 'View Attendance') {
      navigate('/settings/attendance-overview');
    } else if (title === 'Academic Structure') {
      navigate('/settings/classes');
    } else if (title === 'Promotion Management') {
      navigate('/settings/promotions');
    } else if (title === 'Graduate Students') {
      navigate('/settings/graduate-students');
    } else if (title === 'Timetable') {
      navigate('/settings/timetable');
    } else if (title === 'Notice Board') {
      navigate('/settings/notice-board');
    } else if (title === 'Holiday Management') {
      navigate('/settings/holidays');
    } else if (title === 'Academic Year') {
      navigate('/settings/academic-year');
    } else if (title === 'Teachers') {
      navigate('/settings/teachers');
    } else if (title === 'Coordinators') {
      navigate('/settings/coordinators');
    } else if (title === 'Accountants') {
      navigate('/settings/accountants');
    } else if (title === 'Assign Class Teacher') {
      navigate('/settings/class-teachers');
    } else if (title === 'Year Management') {
      navigate('/settings/year-management');
    } else if (title === 'Exams & Marks') {
      navigate('/settings/exams-marks');
    }
  };

  const academicItems = [
    { title: 'Add Student', desc: 'Enrol a new student', icon: <HiOutlineUserPlus className="w-5 h-5" />, color: 'text-[#23C16B] bg-[#E8F8F0]' },
    { title: 'Manage Students', desc: 'View and edit records', icon: <FiUsers className="w-5 h-5" />, color: 'text-[#1597E5] bg-[#EEF5FB]' },
    { title: 'View Attendance', desc: 'Branch-wide attendance log', icon: <FiCalendar className="w-5 h-5" />, color: 'text-accent-purple bg-[#F3E8FF]' },
    { title: 'Academic Structure', desc: 'Classes, sections, subjects', icon: <FiGrid className="w-5 h-5" />, color: 'text-brand-blue bg-[#EEF5FB]' },
    { title: 'Promotion Management', desc: 'Year-end student promotions', icon: <FiTrendingUp className="w-5 h-5" />, color: 'text-[#FF9F1C] bg-[#FFF8EE]' },
    { title: 'Graduate Students', desc: 'Mark final-year students graduate', icon: <HiOutlineAcademicCap className="w-5 h-5" />, color: 'text-emerald-500 bg-[#E8F8F0]' },
    { title: 'Timetable', desc: 'Set weekly class schedules', icon: <FiClock className="w-5 h-5" />, color: 'text-brand-blue bg-[#EEF5FB]' },
    { title: 'Notice Board', desc: 'Post notices for parents and staff', icon: <FiFileText className="w-5 h-5" />, color: 'text-cyan-500 bg-cyan-50' },
    { title: 'Holiday Management', desc: 'School holidays & public holidays', icon: <FiCalendar className="w-5 h-5" />, color: 'text-rose-500 bg-rose-50' },
    { title: 'Academic Year', desc: 'Year overview, status & rollover', icon: <FiSliders className="w-5 h-5" />, color: 'text-amber-500 bg-[#FFF8EE]' },
    { title: 'Year Management', desc: 'Create, activate & close years', icon: <FiCalendar className="w-5 h-5" />, color: 'text-sky-500 bg-sky-50' },
    { title: 'Exams & Marks', desc: 'Create exams, enter marks, publish results', icon: <FiList className="w-5 h-5" />, color: 'text-purple-500 bg-purple-50' }
  ];

  const staffItems = [
    { title: 'Teachers', desc: 'Roster, assignments, subjects', icon: <HiOutlineAcademicCap className="w-5 h-5" />, color: 'text-accent-purple bg-[#F3E8FF]' },
    { title: 'Coordinators', desc: 'Wing supervisors', icon: <FiUsers className="w-5 h-5" />, color: 'text-brand-blue bg-[#EEF5FB]' },
    { title: 'Accountants', desc: 'Fee desk operators', icon: <FiTag className="w-5 h-5" />, color: 'text-[#FF9F1C] bg-[#FFF8EE]' },
    { title: 'Assign Class Teacher', desc: 'Assign teacher to section', icon: <HiOutlineClipboardDocumentList className="w-5 h-5" />, color: 'text-brand-blue bg-[#EEF5FB]' }
  ];

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
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Principal</h1>
      </header>

      {/* Hero statistics card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xl font-bold select-none shrink-0"
            >
              <HiOutlineAcademicCap className="w-6 h-6 text-white" />
            </button>
            <div>
              <p className="text-[9px] text-white/70 font-bold tracking-wider uppercase">GOOD EVENING,</p>
              <h2 className="text-lg font-bold">B. Geetha</h2>
              
              {/* Principal Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 border border-white/20 rounded-full text-[9px] font-bold uppercase tracking-wide mt-1.5">
                <span className="w-1 h-1 bg-[#23C16B] rounded-full" />
                Principal
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2.5 relative z-10">
            {/* Settings (3 dots) button for getting the sidebar */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <FiMoreVertical className="w-5 h-5" />
            </button>
            <span className="text-[9px] text-white/80 font-bold block">Tue, 23 Jun</span>
          </div>
        </div>

        {/* Aggregate Stats Row */}
        <div className="grid grid-cols-4 gap-1 pt-5 border-t border-white/15 text-center select-none">
          <div className="border-r border-white/15 last:border-none">
            <p className="text-base font-extrabold">{studentsCount}</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Students</p>
          </div>
          <div className="border-r border-white/15 last:border-none">
            <p className="text-base font-extrabold">{facultyCount}</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Faculty & Staff</p>
          </div>
          <div className="border-r border-white/15 last:border-none">
            <p className="text-base font-extrabold">{sectionsCount}</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Sections</p>
          </div>
          <div>
            <p className="text-base font-extrabold">{pendingCount}</p>
            <p className="text-[8px] text-white/70 font-bold uppercase tracking-wider mt-0.5">Pending</p>
          </div>
        </div>
      </div>

      {/* Fee Health Warning Card */}
      <div
        onClick={() => navigate('/settings/fee-overview')}
        className="bg-white rounded-[28px] p-5 card-shadow border border-[#e2e8f0]/40 space-y-4 cursor-pointer hover:border-brand-blue/20 transition-all active:scale-[0.99]"
      >
        <div className="flex justify-between items-center select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] flex items-center justify-center text-[#1597E5] border border-blue-50">
              <BiReceipt className="w-5 h-5 text-[#1597E5]" />
            </div>
            <h3 className="text-sm font-extrabold text-dark">Fee Health</h3>
          </div>
          <button
            className="text-[10px] font-bold text-brand-blue flex items-center gap-0.5 bg-[#EEF5FB] px-3.5 py-1.5 rounded-full pointer-events-none"
          >
            View All <FiArrowRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {/* Row of stats: Collected, Pending, Waiver */}
        <div className="grid grid-cols-3 gap-1 pt-1 text-center divide-x divide-[#e2e8f0]/70 select-none">
          <div>
            <p className="text-sm font-black text-[#23C16B]">₹{feeStats.collected.toLocaleString()}</p>
            <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider mt-1.5 leading-none">Collected</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#EF4444]">₹{feeStats.pending.toLocaleString()}</p>
            <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider mt-1.5 leading-none">Pending</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#8B5CF6]">₹{feeStats.waiver.toLocaleString()}</p>
            <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider mt-1.5 leading-none">Waiver</p>
          </div>
        </div>

        {/* Collection Rate & Progress Bar */}
        <div className="space-y-2 pt-1 select-none">
          <div className="flex justify-between items-center text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider">
            <span>Collection Rate</span>
            <span className="text-amber-500 font-extrabold">{feeStats.percent}%</span>
          </div>
          <div className="w-full bg-[#EEF5FB] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${feeStats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Staff Overview Card */}
      <div className="bg-white rounded-[28px] p-5 card-shadow border border-[#e2e8f0]/40 space-y-4">
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue border border-brand-blue/5">
            <FiUsers className="w-5 h-5 text-[#1597E5]" />
          </div>
          <h3 className="text-sm font-extrabold text-dark">Staff Overview</h3>
        </div>

        <div className="grid grid-cols-3 gap-1 pt-1 text-center divide-x divide-[#e2e8f0]/70 select-none">
          <div>
            <p className="text-lg font-black text-[#1597E5]">{coordinatorsCount}</p>
            <p className="text-[8px] text-[#A0AEC0] font-bold uppercase tracking-wider mt-0.5">Coordinators</p>
          </div>
          <div>
            <p className="text-lg font-black text-[#FF9F1C]">{accountantsCount}</p>
            <p className="text-[8px] text-[#A0AEC0] font-bold uppercase tracking-wider mt-0.5">Accountants</p>
          </div>
          <div>
            <p className="text-lg font-black text-[#805AD5]">{facultyCount}</p>
            <p className="text-[8px] text-[#A0AEC0] font-bold uppercase tracking-wider mt-0.5">Faculty & Staff</p>
          </div>
        </div>
      </div>

      {/* 4. ACADEMIC List card */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1 select-none">
          <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue">
            <HiOutlineAcademicCap className="w-3.5 h-3.5 text-[#1597E5]" />
          </div>
          <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Academic</h2>
        </div>

        <div className="bg-white rounded-[28px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
          {academicItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleListItemClick(item.title)}
              className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-dark group-hover:text-brand-blue transition-colors">{item.title}</h3>
                  <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                </div>
              </div>
              
              <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-[#1597E5]/10 flex items-center justify-center text-[#1597E5] transition-all">
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. STAFF List card */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1 select-none">
          <div className="w-6 h-6 rounded-full bg-[#EEF5FB] flex items-center justify-center text-brand-blue">
            <FiUsers className="w-3.5 h-3.5 text-[#1597E5]" />
          </div>
          <h2 className="text-[10px] font-bold text-secondaryText tracking-wider uppercase">Staff</h2>
        </div>

        <div className="bg-white rounded-[28px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
          {staffItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleListItemClick(item.title)}
              className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-dark group-hover:text-brand-blue transition-colors">{item.title}</h3>
                  <p className="text-[10px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                </div>
              </div>
              
              <div className="w-7 h-7 rounded-full bg-[#EEF5FB] group-hover:bg-[#1597E5]/10 flex items-center justify-center text-[#1597E5] transition-all">
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drawers */}
      <Drawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <Drawer isOpen={showThreeDotsMenu} onClose={() => setShowThreeDotsMenu(false)} position="right" />
    </motion.div>
  );
};

export default PrincipalDashboard;
