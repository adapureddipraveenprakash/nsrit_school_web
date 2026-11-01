import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { useDataFetch } from '../../hooks/useDataFetch';
import { getStudentDetails } from '../../services/dataService';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
const valueOr = (value, fallback = 'Not set') => value || fallback;

const formatDate = (value) => {
  if (!value) return 'Not set';
  const raw = String(value).slice(0, 10);
  const [year, month, day] = raw.split('-');
  return year?.length === 4 ? `${day}-${month}-${year}` : raw;
};

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { activeRole } = useApp();
  const { data, loading, error, refetch } = useDataFetch(
    studentId ? () => getStudentDetails(studentId) : null,
    [studentId],
    { defaultValue: null, skip: !studentId, pollInterval: 15000 }
  );

  const student = data?.student;
  const attendances = data?.attendances || [];
  const feePlans = data?.studentDetailFeePlans || [];

  const attendance = useMemo(() => {
    const records = data?.attendances || [];
    const present = records.filter((item) => String(item.status).toUpperCase() === 'PRESENT').length;
    const absent = records.filter((item) => String(item.status).toUpperCase() === 'ABSENT').length;
    return { present, absent, percentage: records.length ? Math.round((present / records.length) * 100) : 0 };
  }, [data]);

  const fees = useMemo(() => {
    const records = data?.studentFees || [];
    const plans = data?.studentDetailFeePlans || [];
    const total = records.length
      ? records.reduce((sum, item) => sum + Number(item.totalFee || 0), 0)
      : plans.filter((plan) => plan.isActive !== false).reduce((sum, plan) => sum + Number(plan.totalAmount || 0), 0);
    const paid = records.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
    const pending = records.length
      ? records.reduce((sum, item) => sum + Number(item.remainingAmount || 0), 0)
      : Math.max(total - plans.flatMap((plan) => plan.detailFeePayments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0), 0);
    const dueDates = records.filter((item) => Number(item.remainingAmount || 0) > 0 && item.dueDate).map((item) => item.dueDate).sort();
    return { total, paid, pending, nextDueDate: dueDates[0] || null };
  }, [data]);

  if (loading && !data) return <div className="flex min-h-[70vh] items-center justify-center"><FiRefreshCw className="h-8 w-8 animate-spin text-brand-blue" /></div>;

  if (!student) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm font-bold text-dark">{error || 'Student profile not found.'}</p>
        <button onClick={() => navigate(-1)} className="rounded-xl bg-brand-blue px-5 py-2.5 text-xs font-bold text-white">Go Back</button>
      </div>
    );
  }

  const initials = student.fullName?.split(/\s+/).map((name) => name[0]).join('').slice(0, 2).toUpperCase() || 'ST';
  const linkedParents = student.linkedParents || [];
  const father = linkedParents.find((item) => String(item.relationship).toUpperCase() === 'FATHER');
  const mother = linkedParents.find((item) => String(item.relationship).toUpperCase() === 'MOTHER');
  const parent = student.parent || {};
  const canEdit = ['MAIN_ADMIN', 'BRANCH_ADMIN', 'PRINCIPAL', 'COORDINATOR'].includes(activeRole);
  const academicYear = student.section?.academicYear || feePlans[0]?.academicYear;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-4 p-3 pb-24 sm:p-5 md:p-8 md:pb-10">
      <header className="flex items-center border-b border-slate-200/70 py-2">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="rounded-full p-2 hover:bg-white"><FiArrowLeft className="h-5 w-5" /></button>
        <h1 className="flex-1 pr-9 text-center text-base font-extrabold text-dark">Student Profile</h1>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}

      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#087FC3] p-5 text-white shadow-lg shadow-blue-200/60 sm:p-7">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-black">{initials}</span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-black uppercase sm:text-xl">{student.fullName}</h2>
              <p className="mt-1 text-[9px] font-bold text-white/65 sm:text-[10px]">#{student.studentId} · {student.branch?.name || student.branchCode}</p>
            </div>
          </div>
          {canEdit && <button onClick={() => navigate(`/settings/edit-student/${studentId}`)} aria-label="Edit student" className="rounded-xl bg-white/15 p-3 hover:bg-white/25"><FiEdit2 /></button>}
        </div>
        <div className="relative mt-6 grid grid-cols-3 divide-x divide-white/15 border-t border-white/15 pt-4 text-center">
          <div><b className="block text-base sm:text-lg">{attendance.percentage}%</b><span className="text-[7px] font-bold uppercase text-white/65 sm:text-[9px]">Attendance</span></div>
          <div><b className="block text-base sm:text-lg">{money(fees.pending)}</b><span className="text-[7px] font-bold uppercase text-white/65 sm:text-[9px]">Fee Due</span></div>
          <div><b className="block text-base uppercase text-emerald-200 sm:text-lg">{student.isActive !== false ? 'Active' : 'Inactive'}</b><span className="text-[7px] font-bold uppercase text-white/65 sm:text-[9px]">Status</span></div>
        </div>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <ProfileCard title="Personal Details" rows={[
            ['Date of Birth', formatDate(student.dateOfBirth)], ['Gender', valueOr(student.gender)], ['Blood Group', valueOr(student.bloodGroup)],
            ['Phone', valueOr(`${student.countryCode || ''}${student.phoneNumber || ''}`.trim())], ['Address', valueOr(student.address)]
          ]} />

          <ProfileCard title="Parent Details" rows={[
            ['Father', valueOr(father?.user?.fullName || parent.fatherName)],
            ['Father Mobile', valueOr(father?.user?.phoneNumber || parent.phoneNumber)],
            ['Mother', valueOr(mother?.user?.fullName || parent.motherName)],
            ['Mother Mobile', valueOr(mother?.user?.phoneNumber || parent.phoneNumber)]
          ]} />

          <ProfileCard title="Academic Details" rows={[
            ['Branch', valueOr(student.branch?.name)], ['Class', valueOr(student.academicClass?.name)],
            ['Wing', valueOr(student.academicClass?.wing?.name || student.academicClass?.wing?.code)], ['Section', valueOr(student.section?.name)],
            ['Roll Number', valueOr(student.rollNumber)], ['Admission Date', formatDate(student.admissionDate)],
            ['Class Teacher', valueOr(student.section?.classTeacher?.fullName, 'Unassigned')]
          ]} />
        </div>

        <div className="space-y-4">
          <ProfileCard title="Attendance Summary" rows={[
            ['Present Days', attendances.length ? attendance.present : 'Not set'],
            ['Absent Days', attendances.length ? attendance.absent : 'Not set'], ['Overall', `${attendance.percentage}%`]
          ]} />

          <ProfileCard title="Fee Information" rows={[
            ['Total Fees', money(fees.total)], ['Paid Amount', money(fees.paid)], ['Pending Amount', money(fees.pending)],
            ['Next Due Date', formatDate(fees.nextDueDate)]
          ]} />

          <section className="overflow-hidden rounded-[20px] border border-sky-100 bg-white shadow-sm shadow-sky-100/80">
            <h3 className="border-b border-slate-100 px-4 py-3 text-[9px] font-extrabold uppercase tracking-wider text-secondaryText">Fee Plans</h3>
            <div className="space-y-2 p-3">
              {feePlans.length ? feePlans.map((plan) => (
                <div key={plan.id} className="flex items-center gap-3 rounded-[15px] bg-sky-50/70 p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-blue"><FiFileText /></span>
                  <div><b className="block text-[10px] text-dark">AY {plan.academicYear || academicYear || '—'}</b><span className="text-[8px] font-medium text-secondaryText">{money(plan.totalAmount)} · {plan.isActive !== false ? 'Active' : 'Inactive'}</span></div>
                </div>
              )) : <p className="p-2 text-[10px] text-secondaryText">No fee plan assigned.</p>}
            </div>
          </section>

          <ProfileCard title="Documents" rows={[
            ['Aadhaar', student.aadhaarDocumentUrl ? 'Uploaded' : 'Not uploaded'],
            ['Transfer Certificate', student.transferCertificateUrl ? 'Uploaded' : 'Not uploaded'],
            ['Birth Certificate', student.birthCertificateUrl ? 'Uploaded' : 'Not uploaded']
          ]} />
        </div>
      </div>

      <button onClick={refetch} className="mx-auto flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-bold text-brand-blue hover:bg-white"><FiRefreshCw /> Refresh live data</button>
    </motion.div>
  );
};

const ProfileCard = ({ title, rows }) => (
  <section className="overflow-hidden rounded-[20px] border border-sky-100 bg-white shadow-sm shadow-sky-100/80">
    <h3 className="border-b border-slate-100 px-4 py-3 text-[9px] font-extrabold uppercase tracking-wider text-secondaryText">{title}</h3>
    <div className="divide-y divide-slate-100 px-4">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[110px_1fr] gap-3 py-3 text-[10px] sm:grid-cols-[140px_1fr]">
          <span className="font-medium text-secondaryText">{label}</span>
          <span className="break-words text-right font-bold text-dark">{value}</span>
        </div>
      ))}
    </div>
  </section>
);

export default StudentDetails;
