import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiPhone, FiCreditCard, FiBriefcase, FiCalendar, FiChevronRight, FiLayout, FiUser, FiBookOpen } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { getTeacherProfile } from '../../../services/dataService';

const TeacherDetails = () => {
  const navigate = useNavigate();
  const { teacherId } = useParams();
  const { user } = useApp();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    const loadProfile = async () => {
      try {
        const data = await getTeacherProfile(teacherId);
        setTeacher(data);
      } catch (err) {
        console.error('Error loading teacher profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
        <p className="text-sm font-bold text-dark mb-4">Teacher profile not found.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#1597E5] text-white rounded-full text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const fullName = teacher.user?.fullName || '';
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const status = teacher.isActive !== false ? 'Active' : 'Inactive';
  const designation = teacher.designation || 'Teacher';
  const branchName = teacher.branch?.name || 'Sontyam';
  const phoneNumber = teacher.user?.phoneNumber || '';
  const employeeId = teacher.employeeId || '';
  
  // Format joining date to DD-MM-YYYY
  const formatJoiningDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Find class teacher assignment
  const classTeacherAssignment = teacher.assignments?.find(a => a.isClassTeacher && a.isActive);
  const classTeacherText = classTeacherAssignment
    ? `${classTeacherAssignment.section?.academicClass?.name || ''}-${classTeacherAssignment.section?.name || ''}`
    : 'Not assigned';

  // Format subjects list
  const subjectsText = teacher.subjects && teacher.subjects.length > 0
    ? teacher.subjects.map(s => s.subject?.name).filter(Boolean).join(', ')
    : 'No subjects assigned';

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
        <h1 className="text-sm font-black text-dark pr-8 mx-auto tracking-tight">Teacher Details</h1>
      </header>

      {/* Hero Blue Card (Screenshot 1 Match) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1b5dfc] to-[#1597E5] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        
        <div className="flex justify-between items-start z-10 relative">
          <div className="flex items-center gap-4">
            {/* Initials Avatar */}
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-black text-base border border-white/10">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-tight uppercase">
                {fullName}
              </h2>
              <p className="text-[10px] text-white/80 font-bold mt-1 uppercase tracking-wider">
                {designation} · {branchName}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => navigate(`/settings/edit-teacher/${teacherId}`)}
            className="px-4 py-1.5 bg-white text-[#1597E5] text-[10.5px] font-black rounded-full flex items-center gap-1 hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <FiEdit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        {/* Active status indicator bottom left */}
        <div className="mt-6 flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full w-max border border-emerald-400/20">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* Contact & Identity Section (Screenshot 1 Match) */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 overflow-hidden card-shadow select-none">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">CONTACT & IDENTITY</span>
        </div>

        <div className="p-5 divide-y divide-[#e2e8f0]/60">
          {/* Mobile */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiPhone className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Mobile</p>
              <p className="text-xs font-black text-dark mt-0.5">{phoneNumber || '—'}</p>
            </div>
          </div>

          {/* Employee ID */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50 font-bold text-xs font-sans">
              ID
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Employee Id</p>
              <p className="text-xs font-black text-dark mt-0.5">{employeeId}</p>
            </div>
          </div>

          {/* Designation */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiBriefcase className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Designation</p>
              <p className="text-xs font-black text-dark mt-0.5">{designation}</p>
            </div>
          </div>

          {/* Joining Date */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiCalendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Joining Date</p>
              <p className="text-xs font-black text-dark mt-0.5">{formatJoiningDate(teacher.joiningDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Assignments Section (Screenshot 1 Match) */}
      <div className="bg-white rounded-[28px] border border-[#e2e8f0]/45 overflow-hidden card-shadow select-none">
        <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
          <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">ACADEMIC ASSIGNMENTS</span>
        </div>

        <div className="p-5 divide-y divide-[#e2e8f0]/60">
          {/* Subjects */}
          <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
                <FiBookOpen className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Subjects</p>
                <p className="text-xs font-black text-dark mt-0.5">{subjectsText}</p>
              </div>
            </div>
            <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Class Teacher */}
          <div className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
              <FiLayout className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Class Teacher</p>
              <p className="text-xs font-black text-dark mt-0.5">{classTeacherText}</p>
            </div>
          </div>

          {/* Full Profile */}
          <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EBF8FF] text-[#1597E5] flex items-center justify-center shrink-0 border border-blue-50">
                <FiUser className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[8.5px] text-[#A0AEC0] font-black uppercase tracking-wider">Full Profile</p>
                <p className="text-xs font-black text-dark mt-0.5">View detailed profile</p>
              </div>
            </div>
            <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeacherDetails;
