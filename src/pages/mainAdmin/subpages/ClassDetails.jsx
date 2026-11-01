import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiChevronRight, FiDollarSign, FiRefreshCw, FiUsers } from 'react-icons/fi';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getClassDetails } from '../../../services/dataService';

const tabs = [
  { id: 'students', label: 'Students', icon: FiUsers },
  { id: 'attendance', label: 'Attendance', icon: FiCalendar },
  { id: 'fees', label: 'Fees', icon: FiDollarSign }
];

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const ClassDetails = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() => tabs.some((tab) => tab.id === requestedTab) ? requestedTab : 'students');
  const { data, loading, error, refetch } = useDataFetch(
    sectionId ? () => getClassDetails(sectionId) : null,
    [sectionId],
    { defaultValue: null, skip: !sectionId, pollInterval: 15000 }
  );

  const section = data?.section;
  const students = data?.students || [];
  const assignments = data?.teacherAssignments || [];
  const classTeacher = assignments.find((item) => item.isClassTeacher)?.teacher?.fullName || 'Unassigned';

  const attendanceByStudent = useMemo(() => {
    const records = data?.attendances || [];
    return records.reduce((map, record) => {
      const current = map.get(record.studentId) || { present: 0, total: 0, latest: null };
      current.total += 1;
      if (String(record.status).toUpperCase() === 'PRESENT') current.present += 1;
      if (!current.latest || String(record.attendanceDate) > String(current.latest.attendanceDate)) current.latest = record;
      map.set(record.studentId, current);
      return map;
    }, new Map());
  }, [data]);

  const feesByStudent = useMemo(() => {
    return (data?.studentFees || []).reduce((map, fee) => {
      const current = map.get(fee.studentId) || { total: 0, paid: 0, pending: 0 };
      current.total += Number(fee.totalFee || 0);
      current.paid += Number(fee.paidAmount || 0);
      current.pending += Number(fee.remainingAmount || 0);
      map.set(fee.studentId, current);
      return map;
    }, new Map());
  }, [data]);

  if (loading && !data) return <div className="flex min-h-[70vh] items-center justify-center"><FiRefreshCw className="h-7 w-7 animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl space-y-5 p-3 pb-24 sm:p-5 md:p-8 md:pb-10">
      <header className="flex items-center border-b border-slate-200/70 py-2">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="rounded-full p-2 hover:bg-white"><FiArrowLeft className="h-5 w-5" /></button>
        <h1 className="flex-1 pr-9 text-center text-base font-extrabold text-dark">Class Details</h1>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}

      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1597E5] to-[#0781C7] p-6 text-white shadow-lg shadow-blue-200/70 sm:p-8">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
        <p className="relative text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/65">{section?.branch?.name || 'Branch'}</p>
        <h2 className="relative mt-2 text-3xl font-black">{section?.academicClass?.name || 'Class'} {section?.name || ''}</h2>
        <div className="relative mt-6 grid grid-cols-2 divide-x divide-white/20 border-t border-white/15 pt-5 text-center">
          <div><b className="block text-xl">{students.filter((student) => student.isActive !== false).length}</b><span className="text-[9px] font-bold uppercase text-white/65">Students</span></div>
          <div><b className="block truncate px-2 text-lg">{classTeacher}</b><span className="text-[9px] font-bold uppercase text-white/65">Class Teacher</span></div>
        </div>
      </section>

      <nav className="grid grid-cols-3 rounded-[22px] border border-sky-100 bg-white p-1.5 shadow-sm shadow-sky-100">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center justify-center gap-1.5 rounded-[17px] px-2 py-3 text-[10px] font-bold transition-all sm:text-xs ${activeTab === id ? 'bg-sky-50 text-brand-blue' : 'text-secondaryText hover:bg-slate-50'}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </nav>

      <div className="grid gap-3 sm:grid-cols-2">
        {students.map((student) => {
          const attendance = attendanceByStudent.get(student.id) || { present: 0, total: 0, latest: null };
          const attendanceRate = attendance.total ? Math.round((attendance.present / attendance.total) * 100) : 0;
          const fee = feesByStudent.get(student.id) || { total: 0, paid: 0, pending: 0 };

          return (
            <button key={student.id} onClick={() => navigate(`/settings/student/${student.id}`)} className="group flex min-h-[94px] w-full items-center gap-4 rounded-[24px] border border-sky-100 bg-white p-4 text-left shadow-sm shadow-sky-100/80 transition-all hover:-translate-y-0.5 hover:border-brand-blue/25 hover:shadow-md active:scale-[0.99]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-50 text-lg font-black text-brand-blue">{student.fullName?.charAt(0) || '?'}</span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-xs font-extrabold uppercase text-dark sm:text-sm">{student.fullName}</b>
                {activeTab === 'students' && <span className="mt-1 block text-[10px] font-medium text-secondaryText sm:text-xs">{student.studentId || 'No admission ID'} · Roll {student.rollNumber || '—'}</span>}
                {activeTab === 'attendance' && <span className="mt-1 block text-[10px] font-semibold text-secondaryText sm:text-xs">{attendanceRate}% attendance · Latest: <em className="not-italic text-brand-blue">{attendance.latest?.status || 'No records'}</em></span>}
                {activeTab === 'fees' && <span className="mt-1 block text-[10px] font-semibold text-secondaryText sm:text-xs">Paid {money(fee.paid)} · <em className={`not-italic ${fee.pending > 0 ? 'text-red-500' : 'text-emerald-500'}`}>Pending {money(fee.pending)}</em></span>}
              </span>
              <FiChevronRight className="h-4 w-4 shrink-0 text-secondaryText transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>

      {!students.length && <div className="rounded-[22px] border border-sky-100 bg-white p-8 text-center text-xs font-semibold text-secondaryText">No students are assigned to this section.</div>}

      <button onClick={refetch} className="mx-auto flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-bold text-brand-blue hover:bg-white"><FiRefreshCw /> Refresh live data</button>
    </motion.div>
  );
};

export default ClassDetails;
