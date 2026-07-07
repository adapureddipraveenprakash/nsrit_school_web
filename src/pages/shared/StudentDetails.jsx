import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiEdit2, FiPhone, FiCreditCard, FiCalendar, FiUser, 
  FiMapPin, FiDroplet, FiBookOpen, FiLayers, FiAward, FiActivity, 
  FiCheckCircle, FiXCircle, FiBookmark, FiClock, FiFileText, FiShield 
} from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { getStudentDetails, getStudentFeeProfile } from '../../services/dataService';

const StudentDetails = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { user } = useApp();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const loadDetails = async () => {
      try {
        const [resDetails, resFeeProfile] = await Promise.all([
          getStudentDetails(studentId),
          getStudentFeeProfile(studentId)
        ]);
        setData({
          ...resDetails,
          feeProfile: resFeeProfile
        });
      } catch (err) {
        console.error('Error loading student details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.student) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
        <p className="text-sm font-bold text-dark mb-4">Student profile not found.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#1597E5] text-white rounded-full text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const { student, attendances = [] } = data;

  const fullName = student.fullName || '';
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';
  const status = student.isActive !== false ? 'Active' : 'Inactive';
  const classText = student.academicClass?.name || '—';
  const sectionText = student.section?.name || '—';
  const classTeacherName = student.section?.classTeacher?.fullName || 'Not assigned';

  // Format date helper (YYYY-MM-DD -> DD-MM-YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    }
    return dateStr;
  };

  // Compute Attendance
  const totalDays = attendances.length;
  const presentDays = attendances.filter(a => a.status === 'PRESENT').length;
  const absentDays = attendances.filter(a => a.status === 'ABSENT').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Compute Fees
  const activePlan = data.feeProfile?.student?.profileFeePlans?.find(p => p.isActive !== false);
  const feePlanText = activePlan ? `Academic Year ${activePlan.academicYear}` : 'Not assigned';
  const totalFee = activePlan ? (activePlan.totalAmount || 0) : 0;
  
  const payments = activePlan?.profileFeePayments || [];
  const paidAmount = payments
    .filter(p => String(p.status || 'RECORDED').toUpperCase() !== 'REVERSED')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const pendingAmount = Math.max(totalFee - paidAmount, 0);

  // Show edit option for administrative roles
  const canEdit = ['MAIN_ADMIN', 'BRANCH_ADMIN', 'PRINCIPAL', 'COORDINATOR'].includes(user?.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 max-w-[640px] mx-auto select-none font-sans bg-gradient-to-b from-[#F3F8FC] to-[#F7FAFD] min-h-screen"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black text-dark pr-8 mx-auto tracking-tight">Student Details</h1>
      </header>

      {/* Hero Blue Card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        
        <div className="flex justify-between items-start z-10 relative">
          <div className="flex items-center gap-4">
            {/* Initials Avatar */}
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-black text-base border border-white/10 shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-tight uppercase">
                {fullName}
              </h2>
              <p className="text-[10px] text-white/80 font-bold mt-1 uppercase tracking-wider">
                #{student.studentId || '—'} · {classText}-{sectionText}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 z-10 relative">
          <div className="text-center">
            <p className="text-sm font-black tracking-tight leading-none">{attendancePercentage}%</p>
            <p className="text-[8px] text-white/70 font-extrabold uppercase mt-1 tracking-wider">ATTENDANCE</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-sm font-black tracking-tight leading-none">Rs {pendingAmount}</p>
            <p className="text-[8px] text-white/70 font-extrabold uppercase mt-1 tracking-wider">FEE DUE</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-black tracking-tight leading-none uppercase">{status}</p>
            <p className="text-[8px] text-white/70 font-extrabold uppercase mt-1 tracking-wider">STATUS</p>
          </div>
        </div>

        {/* Edit Button */}
        {canEdit && (
          <div className="mt-6 flex justify-start z-10 relative">
            <button
              onClick={() => navigate(`/settings/edit-student/${studentId}`)}
              className="px-5 py-2 bg-white text-[#1597E5] text-[10.5px] font-black rounded-full flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
              <span>Edit Student</span>
            </button>
          </div>
        )}
      </div>

      {/* PERSONAL DETAILS CARD */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">PERSONAL DETAILS</span>
        </div>
        <div className="p-5 divide-y divide-[#e2e8f0]/60">
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiUser className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">GENDER</p>
              <p className="text-xs font-black text-dark mt-0.5">{student.gender || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiCalendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">DATE OF BIRTH</p>
              <p className="text-xs font-black text-dark mt-0.5">{formatDate(student.dateOfBirth)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiDroplet className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">BLOOD GROUP</p>
              <p className="text-xs font-black text-dark mt-0.5">{student.bloodGroup || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiMapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">ADDRESS</p>
              <p className="text-xs font-black text-dark mt-0.5 leading-relaxed">{student.address || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PARENT DETAILS CARD */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">PARENT DETAILS</span>
        </div>
        <div className="p-5 divide-y divide-[#e2e8f0]/60">
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiUser className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">FATHER</p>
              <p className="text-xs font-black text-dark mt-0.5">{student.parent?.fatherName || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiUser className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">MOTHER</p>
              <p className="text-xs font-black text-dark mt-0.5">{student.parent?.motherName || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiPhone className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">PARENT MOBILE</p>
              <p className="text-xs font-black text-dark mt-0.5">{student.parent?.phoneNumber || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ACADEMIC DETAILS CARD */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">ACADEMIC DETAILS</span>
        </div>
        <div className="p-5 divide-y divide-[#e2e8f0]/60">
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiBookOpen className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">CLASS</p>
              <p className="text-xs font-black text-dark mt-0.5">{classText}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiLayers className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">SECTION</p>
              <p className="text-xs font-black text-dark mt-0.5">{sectionText}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiAward className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">CLASS TEACHER</p>
              <p className="text-xs font-black text-dark mt-0.5">{classTeacherName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiCalendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">ADMISSION DATE</p>
              <p className="text-xs font-black text-dark mt-0.5">{formatDate(student.admissionDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ATTENDANCE SUMMARY CARD */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">ATTENDANCE SUMMARY</span>
        </div>
        <div className="p-5 divide-y divide-[#e2e8f0]/60">
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiActivity className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">PERCENTAGE</p>
              <p className="text-xs font-black text-dark mt-0.5">{attendancePercentage}%</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiCheckCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">PRESENT</p>
              <p className="text-xs font-black text-dark mt-0.5">{presentDays}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiXCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">ABSENT</p>
              <p className="text-xs font-black text-dark mt-0.5">{absentDays}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FEE SUMMARY CARD */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">FEE SUMMARY</span>
        </div>
        <div className="p-5 divide-y divide-[#e2e8f0]/60">
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiBookmark className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">FEE PLAN</p>
              <p className="text-xs font-black text-dark mt-0.5">{feePlanText}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiCreditCard className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">TOTAL FEE</p>
              <p className="text-xs font-black text-dark mt-0.5">Rs {totalFee}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiCheckCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">PAID AMOUNT</p>
              <p className="text-xs font-black text-dark mt-0.5">Rs {paidAmount}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiClock className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">PENDING AMOUNT</p>
              <p className="text-xs font-black text-dark mt-0.5">Rs {pendingAmount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENTS CARD */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">DOCUMENTS</span>
        </div>
        <div className="p-5 divide-y divide-[#e2e8f0]/60">
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiShield className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">AADHAAR</p>
              <p className="text-xs font-black text-dark mt-0.5">
                {student.aadhaarNumber ? student.aadhaarNumber : 'Number not provided'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiShield className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">APAAR ID</p>
              <p className="text-xs font-black text-dark mt-0.5">Not provided</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiFileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">TRANSFER CERTIFICATE</p>
              <p className="text-xs font-black text-dark mt-0.5">
                {student.transferCertificateUrl ? 'TC Uploaded' : 'Not uploaded'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiFileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">BIRTH CERTIFICATE</p>
              <p className="text-xs font-black text-dark mt-0.5">
                {student.birthCertificateUrl ? 'Birth Certificate Uploaded' : 'Not uploaded'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDetails;
