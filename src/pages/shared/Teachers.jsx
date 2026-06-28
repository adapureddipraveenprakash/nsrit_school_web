import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiChevronDown, FiLayout, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { useDataFetch } from '../../hooks/useDataFetch';
import { getTeachers } from '../../services/dataService';

const normalizeTeacher = (t) => ({
  id: t.id,
  name: t.user?.fullName || t.fullName || t.name || '',
  staffId: t.employeeId || t.staffId || '',
  status: t.isActive !== false ? 'Active' : 'Inactive',
  staffType: t.staffType === 'SUPPORTING' ? 'Supporting Staff' : 'Teaching Staff',
  section: (t.assignments || t.teacherSectionAssignments_on_teacher || [])
    .map((a) => `${a.section?.academicClass?.name || ''}-${a.section?.name || ''}`.trim().replace(/^-|-$/, ''))
    .filter(Boolean).join(', '),
  subject: (t.subjects || t.teacherSubjects_on_teacher || [])
    .map((s) => s.subject?.name || s.name || '').filter(Boolean).join(', ') || 'None',
});

const Teachers = () => {
  const navigate = useNavigate();
  const { user, currentBranchContext } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subject, setSubject] = useState('All Subjects');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [section, setSection] = useState('All Sections');
  const [staffType, setStaffType] = useState('All Staff Types');

  // Fetch real teachers from Firebase Data Connect
  const branchId = user?.branchId || currentBranchContext?.id || null;
  const { data: rawTeachers, loading: teachersLoading } = useDataFetch(
    () => getTeachers({ branchId, limit: 200 }),
    [branchId],
    { defaultValue: [], pollInterval: 30000 }
  );
  const TEACHERS = useMemo(() => (rawTeachers || []).map(normalizeTeacher), [rawTeachers]);

  // Filtered teachers logic
  const filtered = TEACHERS.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.staffId || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesSubject = subject === 'All Subjects' || t.subject === subject;
    const matchesStaffType = staffType === 'All Staff Types' || t.staffType === staffType;
    
    // Class filter matches class part of section
    let matchesClass = true;
    if (selectedClass !== 'All Classes') {
      const clsString = selectedClass.replace('Class ', '');
      matchesClass = t.section.includes(clsString);
    }

    // Section filter matches section letter
    let matchesSection = true;
    if (section !== 'All Sections') {
      const secString = section.replace('Section ', '');
      matchesSection = t.section.includes(secString);
    }

    return matchesSearch && matchesStatus && matchesSubject && matchesStaffType && matchesClass && matchesSection;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto animate-fade-in animate-fade-in-long"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Teachers</h1>
      </header>

      {/* Top curved blue header card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        {/* Subtitle */}
        <div className="mb-1 relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">STAFF MANAGEMENT</span>
        </div>

        {/* Title and Count Badge */}
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <h2 className="text-xl font-bold">Teachers</h2>
          <span className="bg-white/20 border border-white/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
            {TEACHERS.length}
          </span>
        </div>

        <p className="text-[11px] text-white/80 font-medium relative z-10 mb-4">
          Staff profiles, subjects, and class assignments
        </p>

        {/* Add Teacher Button inside card */}
        <button
          onClick={() => navigate('/settings/create-teacher')}
          className="relative z-10 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#1597E5] bg-white px-4 py-2.5 rounded-full hover:bg-white/90 transition-all cursor-pointer shadow-md"
        >
          <span>+ Add Teacher</span>
        </button>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search teachers, employee ID, mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] shadow-sm focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
        />
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#EBF8FF] flex items-center justify-center text-[#1597E5]">
          <FiSearch className="w-4 h-4" />
        </div>
      </div>

      {/* Spaced Filters Area */}
      <div className="flex gap-2.5 select-none">
        {['All', 'Active', 'Inactive'].map((status) => {
          const isSelected = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-[#1597E5]/20'
                  : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>

      {/* Stacked Dropdowns Filters */}
      <div className="space-y-4 pt-1">
        {/* Filter By Subject */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
            Filter By Subject
          </label>
          <div className="relative">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold text-dark focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer"
            >
              <option>All Subjects</option>
              <option>Telugu</option>
              <option>English</option>
              <option>Maths</option>
              <option>Science</option>
              <option>Social</option>
              <option>Drawing</option>
              <option>Hindi</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText pointer-events-none" />
          </div>
        </div>

        {/* Filter By Class */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
            Filter By Class
          </label>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold text-dark focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer"
            >
              <option>All Classes</option>
              <option>Nursery</option>
              <option>LKG</option>
              <option>UKG</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText pointer-events-none" />
          </div>
        </div>

        {/* Filter By Section */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
            Filter By Section
          </label>
          <div className="relative">
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold text-dark focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer"
            >
              <option>All Sections</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText pointer-events-none" />
          </div>
        </div>

        {/* Filter By Staff Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider block">
            Filter By Staff Type
          </label>
          <div className="relative">
            <select
              value={staffType}
              onChange={(e) => setStaffType(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] rounded-[20px] px-4 py-3.5 text-xs font-semibold text-dark focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer"
            >
              <option>All Staff Types</option>
              <option>Teaching Staff</option>
              <option>Supporting Staff</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText pointer-events-none" />
          </div>
        </div>
      </div>

      {/* List Subheading */}
      <div className="px-1 text-[10px] font-bold text-[#718096] tracking-wider uppercase pt-2 select-none">
        {filtered.length} OF {TEACHERS.length} TEACHERS
      </div>

      {/* Teachers cards list */}
      <div className="space-y-3 pt-1">
        {filtered.map((t) => {
          const initials = t.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
          const hasSection = t.section && t.section.trim() !== '';

          return (
            <div
              key={t.id}
              className="bg-white rounded-[24px] border border-[#e2e8f0]/45 p-4 px-5 shadow-sm flex flex-col justify-between hover:border-[#1597E5]/20 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Initials Avatar */}
                  <div className="w-11 h-11 rounded-full bg-[#EBF8FF] flex items-center justify-center font-bold text-xs select-none text-[#1597E5] border border-blue-50 shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-dark group-hover:text-[#1597E5] transition-colors leading-tight">
                      {t.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 select-none">
                      <span className="bg-[#EBF8FF] text-[#1597E5] px-2 py-0.5 rounded-full text-[9px] font-extrabold border border-blue-100/50">
                        {t.id}
                      </span>
                      <span className="text-[10px] font-semibold text-secondaryText">
                        {t.staffType}
                      </span>
                      {/* Green active dot */}
                      <span className="w-1.5 h-1.5 rounded-full bg-[#23C16B]" />
                    </div>
                  </div>
                </div>

                <FiChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Assigned section row (if exists) */}
              {hasSection && (
                <div className="flex items-center gap-1.5 mt-3.5 pt-3.5 border-t border-[#e2e8f0]/50 text-[10px] text-secondaryText font-bold">
                  <FiLayout className="w-3.5 h-3.5 text-[#A0AEC0]" />
                  <span>{t.section}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Teachers;
