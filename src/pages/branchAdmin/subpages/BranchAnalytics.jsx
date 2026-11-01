import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiBarChart2, FiBookOpen, FiCheckCircle, FiEdit2,
  FiRefreshCw, FiUsers, FiUserCheck, FiDollarSign, FiMapPin
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getBranchOverview } from '../../../services/dataService';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const BranchAnalytics = () => {
  const navigate = useNavigate();
  const { currentBranchContext, branches } = useApp();
  const selectedBranch = currentBranchContext || branches[0] || null;
  const branchId = selectedBranch?.id || null;

  const { data, loading, error, refetch } = useDataFetch(
    branchId ? () => getBranchOverview(branchId) : null,
    [branchId],
    { defaultValue: null, skip: !branchId, pollInterval: 15000 }
  );

  const live = data?.branch || selectedBranch || {};
  const students = data?.students || [];
  const sections = data?.sections || [];

  const metrics = useMemo(() => {
    const fees = data?.studentFees || [];
    const attendances = data?.attendances || [];
    const totalFees = fees.reduce((sum, fee) => sum + Number(fee.totalFee || 0), 0);
    const collected = fees.reduce((sum, fee) => sum + Number(fee.paidAmount || 0), 0);
    const pending = fees.reduce((sum, fee) => sum + Number(fee.remainingAmount || 0), 0);
    const present = attendances.filter((a) => String(a.status).toUpperCase() === 'PRESENT').length;
    const attendanceRate = attendances.length ? Math.round((present / attendances.length) * 100) : 0;
    const collectionRate = totalFees ? Math.round((collected / totalFees) * 100) : 0;
    return { totalFees, collected, pending, attendanceRate, collectionRate };
  }, [data]);

  const leadership = {
    principal: live.principal?.fullName || selectedBranch?.principal || 'Unassigned',
    branchAdmin: live.branchAdmin?.fullName || 'Unassigned'
  };

  const statCards = [
    { label: 'Classes', value: data?.academicClasses?.length || 0, icon: <FiBookOpen /> },
    { label: 'Students', value: students.length, icon: <FiUsers /> },
    { label: 'Faculty & Staff', value: data?.branchTeachers?.length || 0, icon: <FiUserCheck /> },
    { label: 'Coordinators', value: data?.branchCoordinators?.length || 0, icon: <FiUsers /> },
    { label: 'Accountants', value: data?.branchAccountants?.length || 0, icon: <FiDollarSign /> },
    { label: 'Attendance', value: `${metrics.attendanceRate}%`, icon: <FiCheckCircle /> }
  ];

  if (!branchId) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <FiMapPin className="h-10 w-10 text-brand-blue" />
        <p className="text-sm font-bold text-dark">Select a branch to view live details.</p>
        <button onClick={() => navigate('/schools')} className="rounded-xl bg-brand-blue px-5 py-3 text-xs font-bold text-white">View Branches</button>
      </div>
    );
  }

  if (loading && !data) {
    return <div className="flex min-h-[70vh] items-center justify-center"><FiRefreshCw className="h-7 w-7 animate-spin text-brand-blue" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-4 p-3 pb-24 sm:p-5 md:p-8 md:pb-10">
      <header className="flex items-center border-b border-slate-200/70 py-2">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="rounded-full p-2 text-dark hover:bg-white"><FiArrowLeft className="h-5 w-5" /></button>
        <h1 className="flex-1 pr-9 text-center text-sm font-extrabold text-dark">Branch Details</h1>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}

      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#087DC2] p-5 text-white shadow-lg shadow-blue-200/60 sm:p-7">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute bottom-[-70px] left-[34%] h-44 w-44 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">{live.branchCode || selectedBranch?.code || 'Branch'}</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">{live.name || selectedBranch?.name}</h2>
            <p className="mt-1 text-[10px] font-medium text-white/70">{live.city || selectedBranch?.location || 'Location unavailable'}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[9px] font-bold">
            <span className={`h-1.5 w-1.5 rounded-full ${live.isActive !== false ? 'bg-emerald-300' : 'bg-red-300'}`} />
            {live.isActive !== false ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="relative mt-6 grid grid-cols-4 divide-x divide-white/15 border-t border-white/15 pt-4 text-center">
          <div><b className="block text-base sm:text-xl">{students.length}</b><span className="text-[7px] font-bold uppercase text-white/65 sm:text-[9px]">Students</span></div>
          <div><b className="block text-base sm:text-xl">{data?.branchTeachers?.length || 0}</b><span className="text-[7px] font-bold uppercase text-white/65 sm:text-[9px]">Faculty</span></div>
          <div><b className="block text-base sm:text-xl">{metrics.attendanceRate}%</b><span className="text-[7px] font-bold uppercase text-white/65 sm:text-[9px]">Attendance</span></div>
          <div><b className="block text-base sm:text-xl">{metrics.collectionRate}%</b><span className="text-[7px] font-bold uppercase text-white/65 sm:text-[9px]">Collection</span></div>
        </div>

        <div className="relative mt-5 flex gap-2">
          <button onClick={() => navigate('/settings/branch-operations')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[10px] font-bold text-brand-blue hover:bg-blue-50"><FiBarChart2 /> Enter Operations</button>
          <button onClick={() => navigate('/settings/edit-branch')} aria-label="Edit branch" className="rounded-xl bg-white/15 p-3 hover:bg-white/25"><FiEdit2 /></button>
          <button onClick={refetch} aria-label="Refresh live data" className="rounded-xl bg-white/15 p-3 hover:bg-white/25"><FiRefreshCw /></button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <InfoCard title="Branch Information" rows={[
            ['Address', live.address], ['City', live.city || selectedBranch?.location], ['State', live.state],
            ['Pincode', live.pincode], ['Phone', live.phone || selectedBranch?.contact], ['Email', live.email || selectedBranch?.email]
          ]} />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-[18px] border border-sky-100 bg-white p-3 text-center shadow-sm shadow-sky-100/80">
                <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-sm text-brand-blue">{card.icon}</span>
                <b className="mt-1.5 block text-base text-brand-blue">{card.value}</b>
                <span className="block text-[7px] font-extrabold uppercase tracking-wide text-secondaryText">{card.label}</span>
              </div>
            ))}
          </div>

          <InfoCard title="Leadership" rows={[["Principal", leadership.principal], ["Branch Admin", leadership.branchAdmin]]} />
        </div>

        <div className="space-y-4">
          <InfoCard title="Fee Collection" rows={[
            ['Total Fees', money(metrics.totalFees)], ['Collected', money(metrics.collected)],
            ['Pending', money(metrics.pending)], ['Collection Rate', `${metrics.collectionRate}%`]
          ]} />

          <section>
            <h3 className="mb-2 px-1 text-[9px] font-extrabold uppercase tracking-wider text-secondaryText">Classes in Branch</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {sections.length ? sections.map((section) => (
                <button
                  type="button"
                  key={section.id}
                  onClick={() => navigate(`/settings/class-details/${section.id}`)}
                  className="group flex w-full items-center justify-between rounded-[18px] border border-sky-100 bg-white px-4 py-3 text-left shadow-sm shadow-sky-100/70 transition-all hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-brand-blue"><FiBookOpen className="h-4 w-4" /></span>
                    <b className="text-xs text-dark">{section.academicClass?.name || 'Class'} {section.name}</b>
                  </div>
                  <span className="flex items-center gap-2 text-[8px] font-bold text-emerald-500">Active <span className="text-sm text-secondaryText transition-transform group-hover:translate-x-0.5">›</span></span>
                </button>
              )) : <p className="rounded-xl bg-white p-4 text-xs text-secondaryText">No active classes found.</p>}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

const InfoCard = ({ title, rows }) => (
  <section className="overflow-hidden rounded-[20px] border border-sky-100 bg-white shadow-sm shadow-sky-100/70">
    <h3 className="border-b border-slate-100 px-4 py-3 text-[9px] font-extrabold uppercase tracking-wider text-secondaryText">{title}</h3>
    <div className="divide-y divide-slate-100 px-4">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[90px_1fr] gap-3 py-2.5 text-[10px] sm:grid-cols-[120px_1fr]">
          <span className="font-medium text-secondaryText">{label}</span>
          <span className="break-words text-right font-bold text-dark">{value || 'Not available'}</span>
        </div>
      ))}
    </div>
  </section>
);

export default BranchAnalytics;
