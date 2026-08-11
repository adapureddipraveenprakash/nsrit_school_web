import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiInfo, FiCheck } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getTeacherDashboard, getFeeReports } from '../../../services/dataService';

const StudentsWithDueFees = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const teacherId = user?.teacherId || null;
  const { data: dashboardData, loading: teacherLoading } = useDataFetch(
    () => teacherId ? getTeacherDashboard({ teacherId }) : Promise.resolve(null),
    [teacherId]
  );

  const teacher = dashboardData?.teacher;
  const assignments = useMemo(() => (teacher?.assignments || []).filter(a => a.isActive), [teacher]);
  const classTeacherAssignment = assignments.find(a => a.isClassTeacher) || assignments[0];
  const activeSectionId = classTeacherAssignment?.section?.id || classTeacherAssignment?.sectionId;

  const branchId = user?.branchId || null;
  const { data: rawFeeReports, loading: feeLoading } = useDataFetch(
    () => branchId ? getFeeReports({ branchId }) : Promise.resolve(null),
    [branchId],
    { defaultValue: { students: [] } }
  );

  // Filter students in section and calculate due fees
  const dueStudents = useMemo(() => {
    if (!activeSectionId || !rawFeeReports?.students) return [];

    const sectionStudents = rawFeeReports.students.filter(
      s => s.sectionId === activeSectionId || s.section?.id === activeSectionId
    );

    const list = [];
    sectionStudents.forEach(s => {
      const activePlans = (s.reportFeePlans || []).filter(fp => fp.isActive !== false);
      let totalAmount = 0;
      let paidAmount = 0;

      activePlans.forEach(plan => {
        totalAmount += plan.totalAmount || 0;
        paidAmount += (plan.reportFeePayments || [])
          .filter(p => String(p.status || 'RECORDED').toUpperCase() !== 'REVERSED')
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      });

      const dueAmount = Math.max(totalAmount - paidAmount, 0);
      if (dueAmount > 0) {
        list.push({
          id: s.id,
          name: s.fullName || 'Unknown Student',
          roll: s.studentId || 'N/A',
          className: s.academicClass?.name || '',
          sectionName: s.section?.name || '',
          totalAmount,
          paidAmount,
          dueAmount
        });
      }
    });

    return list;
  }, [activeSectionId, rawFeeReports]);

  // Filter list by search query
  const filteredDueStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return dueStudents;
    return dueStudents.filter(
      s => s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q)
    );
  }, [dueStudents, search]);

  const pageLoading = teacherLoading || feeLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-24 max-w-[640px] mx-auto select-none animate-fade-in font-sans"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Students with Due Fees</h1>
      </header>

      {/* Red Header Card matching Screenshot 2 */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#FF4D4D] to-[#EF4444] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        {/* Subtitle Badge */}
        <div className="mb-2 relative z-10">
          <span className="text-[9px] text-white/70 font-black tracking-wider uppercase">
            CLASS TEACHER · READ-ONLY
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-1 relative z-10 font-sans">Students with Due Fees</h2>
        <p className="text-xs text-white/90 font-semibold relative z-10">
          {dueStudents.length} {dueStudents.length === 1 ? 'student' : 'students'} with outstanding dues
        </p>
      </div>

      {/* Info Card matching Screenshot 2 */}
      <div className="bg-[#EEF7FF] border border-[#1597E5]/20 rounded-[20px] p-4 flex gap-3 text-xs text-[#1597E5] font-semibold leading-normal shadow-sm">
        <FiInfo className="w-4.5 h-4.5 shrink-0 text-[#1597E5] mt-0.5" />
        <p>
          Read-only view. Contact the accountant or coordinator to record payments.
        </p>
      </div>

      {/* Search Input Box matching Screenshot 2 */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name or roll number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-secondaryText"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
      </div>

      {/* Main Content Area */}
      {pageLoading ? (
        <div className="text-center py-10 text-xs font-semibold text-secondaryText">
          Loading student fee dues...
        </div>
      ) : filteredDueStudents.length > 0 ? (
        <div className="space-y-3">
          {filteredDueStudents.map((st) => {
            const initials = (st.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

            return (
              <div
                key={st.id}
                className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 card-shadow flex items-center justify-between hover:border-[#1597E5]/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-red-50 text-[#FF3B30] border border-red-100 flex items-center justify-center font-black text-xs shrink-0 select-none">
                    {initials}
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold text-dark leading-tight group-hover:text-[#1597E5] transition-colors">
                      {st.name}
                    </h3>
                    <p className="text-[9.5px] text-[#A0AEC0] font-bold mt-1 font-sans">
                      Roll {st.roll} · Total: Rs {st.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Due Badge */}
                <div className="text-right shrink-0">
                  <span className="px-3 py-1.5 bg-red-50 text-[#FF3B30] rounded-xl text-xs font-black border border-red-100 tracking-tight inline-block font-sans">
                    Due: Rs {st.dueAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State matching Screenshot 2: All fees cleared! */
        <div className="bg-white rounded-[32px] border border-[#e2e8f0]/45 p-8 py-12 card-shadow flex flex-col items-center justify-center text-center space-y-4 select-none">
          <div className="w-20 h-20 rounded-full bg-[#EEF5FB] flex items-center justify-center text-[#1597E5]">
            <div className="w-12 h-12 rounded-full border-2 border-[#1597E5] flex items-center justify-center text-[#1597E5]">
              <FiCheck className="w-6 h-6 stroke-[3]" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              All fees cleared!
            </h3>
            <p className="text-xs text-secondaryText font-semibold mt-1.5 max-w-[260px] leading-relaxed mx-auto">
              No students in your section have outstanding dues. Great work!
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentsWithDueFees;
