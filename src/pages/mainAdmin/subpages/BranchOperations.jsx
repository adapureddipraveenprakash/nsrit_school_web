import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiBarChart2, FiBookOpen, FiCalendar, FiDollarSign, FiGrid,
  FiLogOut, FiRefreshCw, FiSettings, FiUserCheck, FiUsers
} from 'react-icons/fi';
import { HiOutlineAcademicCap, HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getBranchOverview } from '../../../services/dataService';

const BranchOperations = () => {
  const navigate = useNavigate();
  const { currentBranchContext, setCurrentBranchContext } = useApp();
  const branchId = currentBranchContext?.id || null;
  const { data, loading, error, refetch } = useDataFetch(
    branchId ? () => getBranchOverview(branchId) : null,
    [branchId],
    { defaultValue: null, skip: !branchId, pollInterval: 15000 }
  );

  const branch = data?.branch || currentBranchContext || {};
  const metrics = useMemo(() => {
    const attendance = data?.attendances || [];
    const present = attendance.filter((item) => String(item.status).toUpperCase() === 'PRESENT').length;
    return {
      students: data?.students?.length || 0,
      staff: data?.branchTeachers?.length || 0,
      attendance: attendance.length ? Math.round((present / attendance.length) * 100) : 0,
      pending: (data?.studentFees || []).reduce((sum, fee) => sum + Number(fee.remainingAmount || 0), 0)
    };
  }, [data]);

  const modules = [
    { label: 'Overview', route: '/settings/branch-analytics', icon: FiGrid, color: 'text-sky-500 bg-sky-50' },
    { label: 'Students', route: '/settings/branch-students', icon: FiUsers, color: 'text-cyan-500 bg-cyan-50' },
    { label: 'Teachers', route: '/settings/teachers', icon: HiOutlineAcademicCap, color: 'text-indigo-500 bg-indigo-50' },
    { label: 'Class Teachers', route: '/settings/class-teachers', icon: HiOutlineClipboardDocumentList, color: 'text-blue-500 bg-blue-50' },
    { label: 'Coordinators', route: '/settings/coordinators', icon: FiUsers, color: 'text-purple-500 bg-purple-50' },
    { label: 'Accountants', route: '/settings/accountants', icon: FiDollarSign, color: 'text-amber-500 bg-amber-50' },
    { label: 'Attendance', route: '/settings/attendance-overview', icon: FiCalendar, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Fees', route: '/settings/fee-overview', icon: FiDollarSign, color: 'text-rose-500 bg-rose-50' },
    { label: 'Sections', route: '/settings/sections', icon: FiGrid, color: 'text-cyan-500 bg-cyan-50' },
    { label: 'Classes', route: '/settings/classes', icon: FiBookOpen, color: 'text-sky-600 bg-sky-50' },
    { label: 'Reports', route: '/settings/branch-reports', icon: FiBarChart2, color: 'text-indigo-500 bg-indigo-50' },
    { label: 'Branch Settings', route: '/settings/branch-settings', icon: FiSettings, color: 'text-slate-500 bg-slate-100' },
    { label: 'Parent Data', route: '/settings/search-students', icon: FiUserCheck, color: 'text-purple-500 bg-purple-50', wide: true }
  ];

  const leaveContext = () => {
    setCurrentBranchContext(null);
    navigate('/schools');
  };

  if (!branchId) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm font-bold text-dark">Select a branch before entering operations.</p>
        <button onClick={() => navigate('/schools')} className="rounded-xl bg-brand-blue px-5 py-3 text-xs font-bold text-white">Select Branch</button>
      </div>
    );
  }

  if (loading && !data) return <div className="flex min-h-[70vh] items-center justify-center"><FiRefreshCw className="h-8 w-8 animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-5 p-3 pb-24 sm:p-5 md:p-8 md:pb-10">
      <header className="flex items-center border-b border-slate-200/70 py-2">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="rounded-full p-2 hover:bg-white"><FiArrowLeft className="h-5 w-5" /></button>
        <h1 className="flex-1 pr-9 text-center text-base font-extrabold text-dark">Branch Operations</h1>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}

      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1597E5] to-[#087FC3] p-5 text-white shadow-lg shadow-blue-200/60 sm:p-7">
        <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/65">Main Admin · Branch Context</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">{branch.name}</h2>
            <span className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-[9px] font-bold">{branch.branchCode || currentBranchContext?.code}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-[9px] font-bold text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Active</span>
        </div>

        <div className="relative mt-6 grid grid-cols-4 divide-x divide-white/15 border-t border-white/15 pt-5 text-center">
          <Metric value={metrics.students} label="Students" />
          <Metric value={metrics.staff} label="Faculty & Staff" />
          <Metric value={`${metrics.attendance}%`} label="Attendance" />
          <Metric value={`Rs ${metrics.pending.toLocaleString('en-IN')}`} label="Pending Fees" />
        </div>

        <button onClick={leaveContext} className="relative mt-6 flex items-center gap-2 rounded-xl bg-red-500/15 px-4 py-2.5 text-[10px] font-bold text-red-100 transition-colors hover:bg-red-500/25"><FiLogOut /> Leave Context</button>
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-secondaryText">Branch Modules</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {modules.map(({ label, route, icon: Icon, color, wide }) => (
            <button
              type="button"
              key={label}
              onClick={() => navigate(route)}
              className={`group flex min-h-[125px] flex-col items-center justify-center gap-3 rounded-[24px] border border-sky-100 bg-white p-4 text-center shadow-sm shadow-sky-100/80 transition-all hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-md active:scale-[0.98] ${wide ? 'col-span-2 sm:col-span-3 lg:col-span-4' : ''}`}
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${color}`}><Icon /></span>
              <span className="text-xs font-extrabold text-dark transition-colors group-hover:text-brand-blue">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <button onClick={refetch} className="mx-auto flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-bold text-brand-blue hover:bg-white"><FiRefreshCw /> Refresh live data</button>
    </motion.div>
  );
};

const Metric = ({ value, label }) => <div className="min-w-0 px-1"><b className="block truncate text-sm sm:text-xl">{value}</b><span className="mt-1 block text-[6px] font-bold uppercase leading-tight text-white/65 sm:text-[9px]">{label}</span></div>;

export default BranchOperations;
