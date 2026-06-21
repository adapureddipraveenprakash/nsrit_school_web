import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiEdit2, FiTrash2, FiUser, FiInfo, FiLayers } from 'react-icons/fi';

const MOCK_ASSIGNMENTS = [
  {
    id: 'nursery-a',
    className: 'Nursery',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 9,
    wing: 'PRE_PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '4-a',
    className: '4',
    section: 'A',
    teacherName: 'Samineni Deepika',
    teacherRole: 'Teacher',
    teacherId: '26SOTS007',
    studentsCount: 10,
    wing: 'PRIMARY',
    assignedDate: '19-06-2026',
    assignedBy: 'B. Geetha'
  },
  {
    id: 'lkg-a',
    className: 'LKG',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 19,
    wing: 'PRE_PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '6-a',
    className: '6',
    section: 'A',
    teacherName: 'Mukka Lavanya',
    teacherRole: 'Teacher',
    teacherId: '26SOTS014',
    studentsCount: 7,
    wing: 'MID_SCHOOL',
    assignedDate: '16-06-2026',
    assignedBy: 'B. Geetha'
  },
  {
    id: '5-a',
    className: '5',
    section: 'A',
    teacherName: 'Raghupatruni Roopakala',
    teacherRole: 'Coordinator',
    teacherId: '26SOTS003',
    studentsCount: 5,
    wing: 'PRIMARY',
    assignedDate: '15-06-2026',
    assignedBy: 'B. Geetha'
  },
  {
    id: 'ukg-a',
    className: 'UKG',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 12,
    wing: 'PRE_PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '1-a',
    className: '1',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 15,
    wing: 'PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '2-a',
    className: '2',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 11,
    wing: 'PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '3-a',
    className: '3',
    section: 'A',
    teacherName: '',
    teacherRole: '',
    teacherId: '',
    studentsCount: 14,
    wing: 'PRIMARY',
    assignedDate: '',
    assignedBy: ''
  },
  {
    id: '7-a',
    className: '7',
    section: 'A',
    teacherName: 'T. Satish Kumar',
    teacherRole: 'Teacher',
    teacherId: '26SOTS001',
    studentsCount: 8,
    wing: 'MID_SCHOOL',
    assignedDate: '12-06-2026',
    assignedBy: 'B. Geetha'
  }
];

const TEACHERS_LIST = [
  { name: 'Raghupatruni Roopakala', id: '26SOTS003', role: 'Coordinator' },
  { name: 'Samineni Deepika', id: '26SOTS007', role: 'Teacher' },
  { name: 'Mukka Lavanya', id: '26SOTS014', role: 'Teacher' },
  { name: 'T. Satish Kumar', id: '26SOTS001', role: 'Teacher' },
  { name: 'K. Anitha', id: '26SOTS005', role: 'Teacher' },
  { name: 'P. Lakshmi', id: '26SOTS006', role: 'Teacher' },
  { name: 'M. Srinivasa Rao', id: '26SOTS008', role: 'Teacher' },
  { name: 'G. Sravani', id: '26SOTS011', role: 'Teacher' }
];

const WING_MAPPING = {
  'Nursery': 'PRE_PRIMARY',
  'LKG': 'PRE_PRIMARY',
  'UKG': 'PRE_PRIMARY',
  '1': 'PRIMARY',
  '2': 'PRIMARY',
  '3': 'PRIMARY',
  '4': 'PRIMARY',
  '5': 'PRIMARY',
  '6': 'MID_SCHOOL',
  '7': 'MID_SCHOOL',
  '8': 'MID_SCHOOL',
  '9': 'HIGH_SCHOOL',
  '10': 'HIGH_SCHOOL'
};

const ClassTeachers = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Assigned' | 'Unassigned'
  
  // New Assignment Form State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  
  // Inline filters
  const [classFilter, setClassFilter] = useState('All Classes');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [teacherFilter, setTeacherFilter] = useState('All Teachers / Coordinators');

  // Submit new assignment
  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection || !selectedTeacherId) return;

    const teacher = TEACHERS_LIST.find((t) => t.id === selectedTeacherId);
    if (!teacher) return;

    // Check if section exists in list
    const existingIdx = assignments.findIndex(
      (a) => a.className === selectedClass && a.section === selectedSection
    );

    const updated = [...assignments];
    if (existingIdx > -1) {
      // Update existing section assignment
      updated[existingIdx] = {
        ...updated[existingIdx],
        teacherName: teacher.name,
        teacherRole: teacher.role,
        teacherId: teacher.id,
        assignedDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        assignedBy: 'B. Geetha'
      };
    } else {
      // Add new section
      const wing = WING_MAPPING[selectedClass] || 'PRIMARY';
      updated.push({
        id: `${selectedClass}-${selectedSection}`.toLowerCase(),
        className: selectedClass,
        section: selectedSection,
        teacherName: teacher.name,
        teacherRole: teacher.role,
        teacherId: teacher.id,
        studentsCount: 10,
        wing: wing,
        assignedDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        assignedBy: 'B. Geetha'
      });
    }

    setAssignments(updated);
    
    // Clear inputs
    setSelectedClass('');
    setSelectedSection('');
    setSelectedTeacherId('');
  };

  // Remove assignment
  const handleRemove = (id) => {
    setAssignments(
      assignments.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            teacherName: '',
            teacherRole: '',
            teacherId: '',
            assignedDate: '',
            assignedBy: ''
          };
        }
        return a;
      })
    );
  };

  // Edit assignment: populate form controls
  const handleEdit = (a) => {
    setSelectedClass(a.className);
    setSelectedSection(a.section);
    if (a.teacherId) {
      setSelectedTeacherId(a.teacherId);
    }
    // Scroll smoothly to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered logic
  const filtered = assignments.filter((a) => {
    // Tab filters
    if (filterTab === 'Assigned' && !a.teacherName) return false;
    if (filterTab === 'Unassigned' && a.teacherName) return false;

    // Search bar matching
    const searchLower = search.toLowerCase();
    const matchesSearch =
      a.className.toLowerCase().includes(searchLower) ||
      a.section.toLowerCase().includes(searchLower) ||
      (a.teacherName && a.teacherName.toLowerCase().includes(searchLower));

    // Inline select dropdown filters
    const matchesClass = classFilter === 'All Classes' || a.className === classFilter.replace('Class ', '');
    const matchesSection = sectionFilter === 'All Sections' || a.section === sectionFilter.replace('Section ', '');
    
    let matchesTeacher = true;
    if (teacherFilter !== 'All Teachers / Coordinators') {
      matchesTeacher = a.teacherName === teacherFilter;
    }

    return matchesSearch && matchesClass && matchesSection && matchesTeacher;
  });

  const assignedCount = assignments.filter((a) => a.teacherName).length;

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
          Class Teachers
        </h1>
        <div className="w-9 h-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (spans 2 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Assignment Form Card matching Screenshot 2 */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-widest block">
              New Assignment
            </span>

            <form onSubmit={handleAssign} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Class */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Class
                  </label>
                  <select
                    required
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option value="">Select</option>
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
                    <option>8</option>
                    <option>9</option>
                    <option>10</option>
                  </select>
                </div>

                {/* Section */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Section
                  </label>
                  <select
                    required
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option value="">Select</option>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </div>

                {/* Teacher */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Teacher
                  </label>
                  <select
                    required
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option value="">Select</option>
                    {TEACHERS_LIST.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit button placed at the end of the form */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs transition-all shadow-md shadow-brand-blue/10 active:scale-[0.99] cursor-pointer"
              >
                Assign Class Teacher
              </button>
            </form>
          </div>

          {/* List Section Title */}
          <div className="space-y-4">
            <div className="px-1 flex justify-between items-center text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              <span>Class Teacher Overview</span>
              <span>{assignments.length} Sections</span>
            </div>

            {/* Search filter matches Screenshot 2 */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search teacher, class, section"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-full card-shadow focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText/60"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            </div>

            {/* Assigned Status Pills */}
            <div className="flex gap-2">
              {['All', 'Assigned', 'Unassigned'].map((tab) => {
                const isActive = filterTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-brand-blue/15'
                        : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Filters block matching Screenshot 2/3 */}
            <div className="bg-white rounded-[24px] p-5 card-shadow border border-[#e2e8f0]/40 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Filter By Class */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Filter By Class
                  </label>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl text-xs font-bold text-dark focus:outline-none focus:border-brand-blue"
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

                {/* Filter By Section */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Filter By Section
                  </label>
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl text-xs font-bold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option>All Sections</option>
                    <option>Section A</option>
                    <option>Section B</option>
                    <option>Section C</option>
                  </select>
                </div>

                {/* Filter By Teacher */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Filter By Teacher
                  </label>
                  <select
                    value={teacherFilter}
                    onChange={(e) => setTeacherFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#EEF5FB]/40 border border-[#e2e8f0] rounded-xl text-xs font-bold text-dark focus:outline-none focus:border-brand-blue"
                  >
                    <option>All Teachers / Coordinators</option>
                    {TEACHERS_LIST.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Assignments List Grid */}
            <div className="space-y-3">
              <div className="px-1 text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
                Assignments
              </div>

              {filtered.map((a) => {
                const isAssigned = !!a.teacherName;
                return (
                  <div
                    key={a.id}
                    className={`bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden flex transition-all hover:shadow-md ${
                      isAssigned ? 'border-l-[6px] border-l-[#23C16B]' : 'border-l-[6px] border-l-[#FF9F1C]'
                    }`}
                  >
                    <div className="flex-1 p-5 flex items-start gap-4">
                      {/* Left status badge icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isAssigned ? 'bg-[#E8F8F0] text-[#23C16B]' : 'bg-[#FFF8EE] text-[#FF9F1C]'
                      }`}>
                        <FiUser className="w-5 h-5" />
                      </div>

                      {/* Main card description */}
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-dark">
                            {a.className}-{a.section}
                          </h3>
                          <span className={`text-[10px] font-bold ${isAssigned ? 'text-[#1597E5]' : 'text-[#FF9F1C]'}`}>
                            {isAssigned ? a.teacherName + ` (${a.teacherRole})` : 'Not assigned'}
                          </span>
                        </div>

                        <p className="text-[10px] text-[#A0AEC0] font-bold">
                          {a.studentsCount} students · Wing: {a.wing}
                        </p>

                        {isAssigned ? (
                          <div className="space-y-1.5 pt-2">
                            <p className="text-[10px] text-secondaryText font-medium">
                              Additional Roles: Class Teacher
                            </p>
                            <p className="text-[9px] text-[#A0AEC0] font-bold">
                              ID: {a.teacherId} · Assigned {a.assignedDate} by {a.assignedBy}
                            </p>
                            
                            {/* Actions panel */}
                            <div className="flex items-center gap-4 pt-2 select-none">
                              <button
                                onClick={() => handleEdit(a)}
                                className="flex items-center gap-1 text-[10px] font-extrabold text-[#1597E5] hover:text-[#00A1FF] transition-colors cursor-pointer"
                              >
                                <FiEdit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemove(a.id)}
                                className="flex items-center gap-1 text-[10px] font-extrabold text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-[#FF9F1C] font-semibold pt-1">
                            No class teacher assigned
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          {/* Blue Hero card matching Screenshot 2 */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Principal</p>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-bold">Class Teacher Assignment</h2>
              <span className="bg-white/20 border border-white/25 px-2.5 py-0.5 rounded-full text-xs font-bold font-sans">
                {assignments.length}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1 font-semibold leading-relaxed">
              View, assign, edit, and remove class teachers.
            </p>
          </div>

          {/* Quick Stats overview panel card */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest block">
              Assignment Overview
            </span>
            <div className="divide-y divide-[#e2e8f0]/80">
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Total Sections</span>
                <span className="text-dark font-extrabold">{assignments.length}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Assigned</span>
                <span className="text-accent-green font-extrabold">{assignedCount} Sections</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Unassigned</span>
                <span className="text-[#FF9F1C] font-extrabold">{assignments.length - assignedCount} Sections</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Coverage Rate</span>
                <span className="text-brand-blue font-extrabold">
                  {Math.round((assignedCount / assignments.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClassTeachers;
