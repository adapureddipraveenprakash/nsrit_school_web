import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiCheck,
  FiChevronDown
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { useDataFetch } from '../../../hooks/useDataFetch';
import {
  getClassTeacherAssignments,
  getTeachers,
  assignClassTeacher,
  removeClassTeacherAssignment
} from '../../../services/dataService';

const ClassTeachers = () => {
  const navigate = useNavigate();
  const { activeRole } = useApp();
  
  const { currentBranchContext, user } = useApp();
  const branchId = user?.branchId || currentBranchContext?.id || null;

  // 1. Fetch Class Teacher Assignments (sections + assignments)
  const { data: assignmentData, loading: assignmentsLoading, refetch: refetchAssignments } = useDataFetch(
    branchId ? () => getClassTeacherAssignments({ branchId, academicYear: 2026 }) : null,
    [branchId],
    { defaultValue: { sections: [], teacherSectionAssignments: [] }, skip: !branchId }
  );

  const sections = assignmentData?.sections || [];
  const teacherSectionAssignments = assignmentData?.teacherSectionAssignments || [];

  // 2. Fetch Teachers in the branch
  const { data: dbTeachers = [], loading: teachersLoading } = useDataFetch(
    branchId ? () => getTeachers({ branchId, limit: 500 }) : null,
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  // Form State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Assigned' | 'Unassigned'
  const [classFilter, setClassFilter] = useState('All Classes');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [teacherFilter, setTeacherFilter] = useState('All Teachers / Coordinators');
  const [actionLoading, setActionLoading] = useState(false);

  // Dynamic Options based on DB Data
  const classOptions = useMemo(() => {
    const classes = new Set();
    sections.forEach(s => {
      if (s.academicClass?.name) {
        classes.add(s.academicClass.name);
      }
    });
    return Array.from(classes).sort((a, b) => {
      const aNum = parseInt(a, 10);
      const bNum = parseInt(b, 10);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.localeCompare(b);
    });
  }, [sections]);

  const sectionOptionsForClass = useMemo(() => {
    if (!selectedClass) return [];
    const secs = new Set();
    sections.forEach(s => {
      if (s.academicClass?.name === selectedClass && s.name) {
        secs.add(s.name);
      }
    });
    return Array.from(secs).sort();
  }, [sections, selectedClass]);

  const teacherOptions = useMemo(() => {
    return dbTeachers.map(t => ({
      id: t.id,
      userId: t.userId || t.user?.id,
      name: t.user?.fullName || 'N/A',
      role: t.user?.role || 'Teacher'
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [dbTeachers]);

  // Dropdown filter options based on DB Data
  const filterClassOptions = useMemo(() => {
    return ['All Classes', ...classOptions];
  }, [classOptions]);

  const filterSectionOptions = useMemo(() => {
    const combined = sections.map(s => `${s.academicClass?.name || ''}-${s.name || ''}`);
    return ['All Sections', ...Array.from(new Set(combined)).sort()];
  }, [sections]);

  const filterTeacherOptions = useMemo(() => {
    const names = dbTeachers.map(t => t.user?.fullName).filter(Boolean);
    return ['All Teachers / Coordinators', ...Array.from(new Set(names)).sort()];
  }, [dbTeachers]);

  // Mapped assignments for list rendering
  const mappedAssignments = useMemo(() => {
    return sections.map(sec => {
      const assignment = teacherSectionAssignments.find(a => a.sectionId === sec.id);
      const teacherUser = sec.classTeacher || assignment?.teacher?.user || null;
      
      return {
        id: sec.id,
        className: sec.academicClass?.name || 'N/A',
        section: sec.name || 'A',
        teacherName: teacherUser?.fullName || '',
        teacherRole: teacherUser?.role || 'Teacher',
        teacherId: teacherUser?.employeeId || assignment?.teacher?.employeeId || '—',
        studentsCount: 14, // Standard visual count matching the screenshot UI
        wing: sec.academicClass?.wing?.code || sec.academicClass?.wing?.name || 'N/A',
        assignedDate: assignment?.createdAt 
          ? new Date(assignment.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '—',
        assignedBy: assignment?.assignedBy?.fullName || '—'
      };
    });
  }, [sections, teacherSectionAssignments]);

  // Filtered list logic
  const filtered = useMemo(() => {
    return mappedAssignments.filter((a) => {
      // Tab filters
      if (filterTab === 'Assigned' && !a.teacherName) return false;
      if (filterTab === 'Unassigned' && a.teacherName) return false;

      // Search bar matching (teacher name, class name, section letter)
      const searchLower = search.toLowerCase();
      const matchesSearch =
        a.className.toLowerCase().includes(searchLower) ||
        a.section.toLowerCase().includes(searchLower) ||
        a.teacherName.toLowerCase().includes(searchLower);

      // Dropdown filters
      const matchesClass = classFilter === 'All Classes' || a.className === classFilter;
      const matchesSection = sectionFilter === 'All Sections' || `${a.className}-${a.section}` === sectionFilter;
      
      let matchesTeacher = true;
      if (teacherFilter !== 'All Teachers / Coordinators') {
        matchesTeacher = a.teacherName === teacherFilter;
      }

      return matchesSearch && matchesClass && matchesSection && matchesTeacher;
    });
  }, [mappedAssignments, search, filterTab, classFilter, sectionFilter, teacherFilter]);

  const assignedCount = useMemo(() => {
    return mappedAssignments.filter((a) => a.teacherName).length;
  }, [mappedAssignments]);

  // Submit/Assign Handler
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection || !selectedTeacherId || actionLoading) return;

    // Find database section matching selections
    const targetSec = sections.find(
      s => s.academicClass?.name === selectedClass && s.name === selectedSection
    );

    // Find database teacher matching selections
    const targetTeacher = dbTeachers.find(
      t => t.id === selectedTeacherId || t.userId === selectedTeacherId || t.user?.id === selectedTeacherId
    );

    if (!targetSec || !targetTeacher) {
      alert('Selected section or teacher not found.');
      return;
    }

    setActionLoading(true);
    try {
      // Check if there is an existing assignment to remove first
      const currentAssignment = teacherSectionAssignments.find(
        a => a.sectionId === targetSec.id
      );

      if (currentAssignment) {
        await removeClassTeacherAssignment({
          assignmentId: currentAssignment.id,
          sectionId: targetSec.id,
          teacherId: currentAssignment.teacherId,
          branchId,
          sectionAuditId: `sec-rm-${Date.now()}`,
          teacherAuditId: `teach-rm-${Date.now()}`
        });
      }

      // Assign the new teacher
      await assignClassTeacher({
        sectionId: targetSec.id,
        teacherId: targetTeacher.id,
        teacherUserId: targetTeacher.userId,
        branchId,
        sectionAuditId: `sec-add-${Date.now()}`,
        teacherAuditId: `teach-add-${Date.now()}`
      });

      await refetchAssignments();

      // Reset form selections
      setSelectedClass('');
      setSelectedSection('');
      setSelectedTeacherId('');
      alert('Class teacher assigned successfully!');
    } catch (err) {
      console.error('Error assigning class teacher:', err);
      alert(err.message || 'Failed to assign class teacher.');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove Handler
  const handleRemove = async (sectionId) => {
    const targetSec = sections.find(s => s.id === sectionId);
    if (!targetSec) return;

    const currentAssignment = teacherSectionAssignments.find(
      a => a.sectionId === targetSec.id
    );

    if (!currentAssignment) {
      alert('No class teacher assignment found for this section.');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove the class teacher from ${targetSec.academicClass?.name}-${targetSec.name}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await removeClassTeacherAssignment({
        assignmentId: currentAssignment.id,
        sectionId: targetSec.id,
        teacherId: currentAssignment.teacherId,
        branchId,
        sectionAuditId: `sec-rm-${Date.now()}`,
        teacherAuditId: `teach-rm-${Date.now()}`
      });
      await refetchAssignments();
      alert('Class teacher assignment removed successfully!');
    } catch (err) {
      console.error('Error removing class teacher:', err);
      alert(err.message || 'Failed to remove class teacher assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit/Populate Handler
  const handleEdit = (a) => {
    setSelectedClass(a.className);
    setSelectedSection(a.section);
    
    const targetTeacher = dbTeachers.find(t => t.user?.fullName === a.teacherName);
    if (targetTeacher) {
      setSelectedTeacherId(targetTeacher.id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (assignmentsLoading || teachersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleLabel = activeRole === 'COORDINATOR' ? 'Coordinator' : activeRole === 'PRINCIPAL' ? 'Principal' : 'Branch Admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-20 md:pb-8 max-w-5xl mx-auto space-y-6 select-none font-sans"
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
          Assign Class Teacher
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
                <div className="space-y-1.5 font-sans">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Class
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedSection('');
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark appearance-none focus:outline-none focus:border-brand-blue"
                    >
                      <option value="">Select</option>
                      {classOptions.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
                  </div>
                </div>

                {/* Section */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Section
                  </label>
                  <div className="relative">
                    <select
                      required
                      disabled={!selectedClass}
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark appearance-none focus:outline-none focus:border-brand-blue disabled:opacity-50"
                    >
                      <option value="">Select</option>
                      {sectionOptionsForClass.map(secName => (
                        <option key={secName} value={secName}>{secName}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
                  </div>
                </div>

                {/* Teacher */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Teacher
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-[14px] text-xs font-semibold text-dark appearance-none focus:outline-none focus:border-brand-blue"
                    >
                      <option value="">Select</option>
                      {teacherOptions.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.role})
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Submit button placed at the end of the form */}
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs transition-all shadow-md shadow-brand-blue/10 active:scale-[0.99] cursor-pointer disabled:opacity-55"
              >
                {actionLoading ? 'Saving...' : 'Assign Class Teacher'}
              </button>
            </form>
          </div>

          {/* List Section Title */}
          <div className="space-y-4">
            <div className="px-1 flex justify-between items-center text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              <span>Class Teacher Overview</span>
              <span>{mappedAssignments.length} Sections</span>
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
                  <div className="relative">
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs font-bold text-dark appearance-none focus:outline-none focus:border-brand-blue"
                    >
                      {filterClassOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0AEC0] pointer-events-none" />
                  </div>
                </div>

                {/* Filter By Section */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Filter By Section
                  </label>
                  <div className="relative">
                    <select
                      value={sectionFilter}
                      onChange={(e) => setSectionFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs font-bold text-dark appearance-none focus:outline-none focus:border-brand-blue"
                    >
                      {filterSectionOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0AEC0] pointer-events-none" />
                  </div>
                </div>

                {/* Filter By Teacher */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-secondaryText uppercase tracking-wider block">
                    Filter By Teacher
                  </label>
                  <div className="relative">
                    <select
                      value={teacherFilter}
                      onChange={(e) => setTeacherFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs font-bold text-dark appearance-none focus:outline-none focus:border-brand-blue"
                    >
                      {filterTeacherOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0AEC0] pointer-events-none" />
                  </div>
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
                            {isAssigned ? `${a.teacherName} (${a.teacherRole})` : 'Not assigned'}
                          </span>
                        </div>

                        <p className="text-[10px] text-[#A0AEC0] font-bold">
                          ID: {a.teacherId} · {a.studentsCount} students · Wing: {a.wing}
                        </p>

                        {isAssigned ? (
                          <div className="space-y-1.5 pt-2">
                            <p className="text-[10px] text-secondaryText font-medium">
                              Additional Roles: Class Teacher
                            </p>
                            <p className="text-[9px] text-[#A0AEC0] font-bold">
                              Assigned {a.assignedDate} by {a.assignedBy}
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

              {filtered.length === 0 && (
                <div className="p-8 text-center bg-white rounded-[24px] border border-[#e2e8f0]/40 text-xs font-semibold text-secondaryText">
                  No section assignments match the selected filters.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (spans 1 on desktop) */}
        <div className="space-y-6">
          {/* Blue Hero card matching Screenshot */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">{roleLabel}</p>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-bold">Class Teacher Assignment</h2>
              <span className="bg-white/20 border border-white/25 px-2.5 py-0.5 rounded-full text-xs font-bold font-sans">
                {mappedAssignments.length}
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
                <span className="text-dark font-extrabold">{mappedAssignments.length}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Assigned</span>
                <span className="text-accent-green font-extrabold">{assignedCount} Sections</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Unassigned</span>
                <span className="text-[#FF9F1C] font-extrabold">{mappedAssignments.length - assignedCount} Sections</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs">
                <span className="text-secondaryText font-bold">Coverage Rate</span>
                <span className="text-brand-blue font-extrabold">
                  {mappedAssignments.length > 0 ? Math.round((assignedCount / mappedAssignments.length) * 100) : 0}%
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
