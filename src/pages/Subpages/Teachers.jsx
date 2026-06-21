import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiChevronUp, FiChevronDown, FiBook, FiLayout, FiUser, FiActivity } from 'react-icons/fi';

const MOCK_TEACHERS = [
  { name: 'Raghupatruni Roopakala', id: '26SOTS003', status: 'Active', staffType: 'Teaching Staff', section: '5-A', subject: 'Telugu' },
  { name: 'Samineni Deepika', id: '26SOTS007', status: 'Active', staffType: 'Teaching Staff', section: '4-A', subject: 'English' },
  { name: 'Mukka Lavanya', id: '26SOTS014', status: 'Active', staffType: 'Teaching Staff', section: '6-A', subject: 'Science' },
  { name: 'T. Satish Kumar', id: '26SOTS001', status: 'Active', staffType: 'Teaching Staff', section: '7-A', subject: 'Maths' },
  { name: 'B. Geetha', id: '26SOTS002', status: 'Active', staffType: 'Principal', section: 'Mid School', subject: 'Social' },
  { name: 'C. Rama Rao', id: '26SOTS004', status: 'Active', staffType: 'Coordinator', section: 'Primary', subject: 'Hindi' },
  { name: 'K. Anitha', id: '26SOTS005', status: 'Active', staffType: 'Teaching Staff', section: '3-A', subject: 'Maths' },
  { name: 'P. Lakshmi', id: '26SOTS006', status: 'Active', staffType: 'Teaching Staff', section: 'LKG-A', subject: 'Drawing' },
  { name: 'M. Srinivasa Rao', id: '26SOTS008', status: 'Active', staffType: 'Teaching Staff', section: 'UKG-A', subject: 'Telugu' },
  { name: 'S. Varalakshmi', id: '26SOTS009', status: 'Inactive', staffType: 'Teaching Staff', section: 'Nursery-A', subject: 'English' },
  { name: 'V. Ravi Kumar', id: '26SOTS010', status: 'Active', staffType: 'Non-Teaching Staff', section: 'Office', subject: 'Physical Education' },
  { name: 'G. Sravani', id: '26SOTS011', status: 'Active', staffType: 'Teaching Staff', section: '1-A', subject: 'Science' },
  { name: 'Ch. Durga', id: '26SOTS012', status: 'Inactive', staffType: 'Teaching Staff', section: '2-A', subject: 'Telugu' },
  { name: 'B. Venkata Rao', id: '26SOTS013', status: 'Active', staffType: 'Non-Teaching Staff', section: 'Security', subject: 'Telugu' },
];

const Teachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState(MOCK_TEACHERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive'
  const [showFilters, setShowFilters] = useState(true);

  // Dropdown filter selections
  const [subject, setSubject] = useState('All Subjects');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [section, setSection] = useState('All Sections');
  const [staffType, setStaffType] = useState('All Staff Types');

  // Filtered teachers logic
  const filtered = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesSubject = subject === 'All Subjects' || t.subject === subject;
    const matchesStaffType = staffType === 'All Staff Types' || t.staffType === staffType;
    
    // Class filter matches class part of section (e.g. 5-A contains 5)
    let matchesClass = true;
    if (selectedClass !== 'All Classes') {
      const clsString = selectedClass.replace('Class ', '');
      matchesClass = t.section.startsWith(clsString) || t.section.includes(clsString);
    }

    // Section filter matches section part (e.g. 5-A has A)
    let matchesSection = true;
    if (section !== 'All Sections') {
      const secString = section.replace('Section ', '');
      matchesSection = t.section.endsWith(`-${secString}`) || t.section === secString;
    }

    return matchesSearch && matchesStatus && matchesSubject && matchesStaffType && matchesClass && matchesSection;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Centered Page Header */}
      <div className="relative flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-dark tracking-tight absolute left-1/2 -translate-x-1/2">
          Teachers
        </h1>
        <div className="w-9 h-9" /> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search bar matching Screenshot 1 */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, employee ID, mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-full card-shadow focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText/60"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
          </div>

          {/* Active Status Pills */}
          <div className="flex gap-2">
            {['All', 'Active', 'Inactive'].map((status) => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-md shadow-purple-500/15'
                      : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          {/* Centered collapsible Filters Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-6 py-2 rounded-full text-xs font-bold text-[#1597E5] bg-[#EEF5FB] hover:bg-[#EEF5FB]/75 transition-colors cursor-pointer select-none"
            >
              <FiActivity className="w-3.5 h-3.5" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              {showFilters ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Toggleable filters panel card */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-[24px] p-6 card-shadow border border-[#e2e8f0]/40 overflow-hidden space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Subject Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                      Filter By Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    >
                      <option>All Subjects</option>
                      <option>Telugu</option>
                      <option>Hindi</option>
                      <option>English</option>
                      <option>Maths</option>
                      <option>Science</option>
                      <option>Social</option>
                      <option>Drawing</option>
                      <option>Physical Education</option>
                    </select>
                  </div>

                  {/* Class Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                      Filter By Class
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    >
                      <option>All Classes</option>
                      <option>Nursery</option>
                      <option>LKG</option>
                      <option>UKG</option>
                      <option>Class 1</option>
                      <option>Class 2</option>
                      <option>Class 3</option>
                      <option>Class 4</option>
                      <option>Class 5</option>
                      <option>Class 6</option>
                      <option>Class 7</option>
                      <option>Class 8</option>
                      <option>Class 9</option>
                      <option>Class 10</option>
                    </select>
                  </div>

                  {/* Section Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                      Filter By Section
                    </label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    >
                      <option>All Sections</option>
                      <option>Section A</option>
                      <option>Section B</option>
                      <option>Section C</option>
                    </select>
                  </div>

                  {/* Staff Type Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                      Filter By Staff Type
                    </label>
                    <select
                      value={staffType}
                      onChange={(e) => setStaffType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                    >
                      <option>All Staff Types</option>
                      <option>Teaching Staff</option>
                      <option>Non-Teaching Staff</option>
                      <option>Coordinator</option>
                      <option>Principal</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Teachers list container */}
          <div className="space-y-3">
            <div className="px-1 text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              {filtered.length} Teachers
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((t) => {
                const initials = t.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
                return (
                  <div
                    key={t.id}
                    className="bg-white rounded-[22px] p-4.5 card-shadow border border-[#e2e8f0]/40 flex flex-col justify-between hover:border-[#7C3AED]/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#e2e8f0]/60">
                      <div className="flex items-center gap-3">
                        {/* Purple initials circle */}
                        <div className="w-10 h-10 rounded-full bg-[#F3E8FF] flex items-center justify-center text-xs font-extrabold text-[#7C3AED] uppercase shrink-0">
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-dark group-hover:text-[#7C3AED] transition-colors">
                            {t.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 select-none">
                            <span className="bg-[#EEF5FB] text-[#1597E5] px-2 py-0.5 rounded text-[8px] font-bold">
                              {t.id}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-bold text-secondaryText">
                              <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Active' ? 'bg-[#23C16B]' : 'bg-slate-300'}`} />
                              {t.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata indicators */}
                    <div className="flex justify-between items-center pt-3 text-[10px] text-secondaryText font-bold">
                      <span className="flex items-center gap-1.5">
                        <FiUser className="w-3.5 h-3.5 text-secondaryText/80" />
                        {t.staffType}
                      </span>
                      <span className="flex items-center gap-1.5 bg-[#EEF5FB] px-2.5 py-1 rounded-full text-brand-blue">
                        <FiLayout className="w-3 h-3 text-[#1597E5]" />
                        {t.section}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          {/* Branch management Purple Hero Card matching Screenshot 1 */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Branch Management</p>
            <div className="flex items-center gap-2.5 mt-1">
              <h2 className="text-2xl font-bold">Teachers</h2>
              <span className="bg-white/20 border border-white/25 px-3 py-0.5 rounded-full text-xs font-bold font-sans">
                {teachers.length}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1 font-semibold leading-relaxed">
              Principal and coordinators manage teacher changes.
            </p>
          </div>

          {/* Quick stats details card */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block">
              Staff Distribution
            </span>
            <div className="divide-y divide-[#e2e8f0]/80">
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Teaching Faculty</span>
                <span className="text-dark font-extrabold">{teachers.filter(t=>t.staffType==='Teaching Staff').length}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Coordinators</span>
                <span className="text-dark font-extrabold">{teachers.filter(t=>t.staffType==='Coordinator').length}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Principals</span>
                <span className="text-dark font-extrabold">{teachers.filter(t=>t.staffType==='Principal').length}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Active Staff</span>
                <span className="text-accent-green font-extrabold">{teachers.filter(t=>t.status==='Active').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Teachers;
