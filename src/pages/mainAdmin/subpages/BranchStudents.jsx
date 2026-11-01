import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiChevronRight, FiRefreshCw, FiRepeat, FiSearch, FiUpload, FiUserPlus } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getBranchOverview } from '../../../services/dataService';

const palette = [
  'bg-sky-50 text-sky-600',
  'bg-purple-50 text-purple-600',
  'bg-emerald-50 text-emerald-600',
  'bg-amber-50 text-amber-600',
  'bg-rose-50 text-rose-600',
  'bg-cyan-50 text-cyan-600'
];

const moreActions = [
  {
    title: 'Advanced Search',
    description: 'Find by class, section, status',
    route: '/settings/search-students',
    icon: FiSearch
  },
  {
    title: 'Bulk Import',
    description: 'Upload students via CSV',
    route: '/settings/bulk-upload',
    icon: FiUpload
  },
  {
    title: 'Transfer Student',
    description: 'Move between sections',
    route: '/settings/transfer-student',
    icon: FiRepeat
  }
];

const BranchStudents = () => {
  const navigate = useNavigate();
  const { currentBranchContext } = useApp();
  const branchId = currentBranchContext?.id || null;
  const { data, loading, error, refetch } = useDataFetch(
    branchId ? () => getBranchOverview(branchId) : null,
    [branchId],
    { defaultValue: null, skip: !branchId, pollInterval: 15000 }
  );

  const classes = useMemo(() => {
    const academicClasses = data?.academicClasses || [];
    const sections = data?.sections || [];
    const students = data?.students || [];

    return academicClasses
      .map((academicClass) => {
        const classSections = sections.filter((section) => section.academicClassId === academicClass.id);
        const classStudents = students.filter((student) => student.academicClassId === academicClass.id && student.isActive !== false);
        return {
          ...academicClass,
          sections: classSections,
          studentsCount: classStudents.length
        };
      })
      .sort((a, b) => Number(a.displayOrder || 999) - Number(b.displayOrder || 999) || a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [data]);

  const totalStudents = (data?.students || []).filter((student) => student.isActive !== false).length;

  const openClass = (academicClass) => {
    const firstSection = academicClass.sections[0];
    if (firstSection) {
      navigate(`/settings/class-details/${firstSection.id}`);
      return;
    }
    navigate('/settings/sections');
  };

  if (!branchId) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm font-bold text-dark">Select a branch before viewing students.</p>
        <button onClick={() => navigate('/schools')} className="rounded-xl bg-brand-blue px-5 py-3 text-xs font-bold text-white">Select Branch</button>
      </div>
    );
  }

  if (loading && !data) return <div className="flex min-h-[70vh] items-center justify-center"><FiRefreshCw className="h-8 w-8 animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-5 p-3 pb-24 sm:p-5 md:p-8 md:pb-10">
      <header className="flex items-center border-b border-slate-200/70 py-2">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="rounded-full p-2 hover:bg-white"><FiArrowLeft className="h-5 w-5" /></button>
        <h1 className="flex-1 pr-9 text-center text-base font-extrabold text-dark">Students</h1>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}

      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1597E5] to-[#14A8DC] p-6 text-white shadow-lg shadow-blue-200/60 sm:p-8">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <p className="relative text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/65">Management</p>
        <h2 className="relative mt-2 text-2xl font-black sm:text-3xl">Students</h2>
        <p className="relative mt-2 text-xs font-medium text-white/70 sm:text-sm">Admissions, profiles, status, and section transfers</p>
        <button onClick={() => navigate('/settings/create-student')} className="relative mt-5 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-brand-blue shadow-sm transition-all hover:bg-blue-50 active:scale-[0.98]"><FiUserPlus className="h-4 w-4" /> Add Student</button>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Summary value={classes.length} label="Classes" />
        <Summary value={totalStudents} label="Total Students" />
      </div>

      <section className="space-y-3">
        <h2 className="px-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-secondaryText">Select a Class</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {classes.map((academicClass, index) => (
            <button key={academicClass.id} type="button" onClick={() => openClass(academicClass)} className="group flex min-h-[112px] w-full items-center gap-4 rounded-[25px] border border-sky-100 bg-white p-4 text-left shadow-sm shadow-sky-100/80 transition-all hover:-translate-y-0.5 hover:border-brand-blue/25 hover:shadow-md active:scale-[0.99] sm:p-5">
              <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-black ${palette[index % palette.length]}`}>{academicClass.name}</span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-sm font-extrabold text-dark sm:text-base">Class {academicClass.name}</b>
                <span className="mt-1 block truncate text-[10px] font-medium text-secondaryText sm:text-xs">Sections: {academicClass.sections.map((section) => section.name).join(', ') || 'Not assigned'}</span>
              </span>
              <span className="shrink-0 text-right">
                <b className={`block text-xl font-black ${index % 2 ? 'text-purple-500' : 'text-brand-blue'}`}>{academicClass.studentsCount}</b>
                <span className="text-[9px] font-medium text-secondaryText">students</span>
              </span>
              <FiChevronRight className="h-5 w-5 shrink-0 text-secondaryText transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
        {!classes.length && <div className="rounded-[22px] border border-sky-100 bg-white p-8 text-center text-xs font-semibold text-secondaryText">No active classes found for this branch.</div>}
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-secondaryText">More Actions</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {moreActions.map(({ title, description, route, icon: Icon }) => (
            <button
              key={route}
              type="button"
              onClick={() => navigate(route)}
              className="group flex min-h-[96px] w-full items-center gap-4 rounded-[25px] border border-sky-100 bg-white p-4 text-left shadow-sm shadow-sky-100/80 transition-all hover:-translate-y-0.5 hover:border-brand-blue/25 hover:shadow-md active:scale-[0.99] sm:p-5"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-50 text-brand-blue">
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-sm font-extrabold text-dark sm:text-base">{title}</b>
                <span className="mt-1 block text-[10px] font-medium text-secondaryText sm:text-xs">{description}</span>
              </span>
              <FiChevronRight className="h-5 w-5 shrink-0 text-secondaryText transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </section>

      <button onClick={refetch} className="mx-auto flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-bold text-brand-blue hover:bg-white"><FiRefreshCw /> Refresh live data</button>
    </motion.div>
  );
};

const Summary = ({ value, label }) => (
  <div className="rounded-[24px] border border-sky-100 bg-white p-5 text-center shadow-sm shadow-sky-100/80">
    <b className="block text-2xl font-black text-brand-blue">{value}</b>
    <span className="mt-1 block text-xs font-medium text-secondaryText">{label}</span>
  </div>
);

export default BranchStudents;
