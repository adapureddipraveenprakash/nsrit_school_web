import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiChevronRight, FiLayers, FiX } from 'react-icons/fi';

const INITIAL_SECTIONS = [
  { id: 1, name: 'Nursery-A', teacher: 'No class teacher assigned', students: 9 },
  { id: 2, name: '4-A', teacher: 'Samineni Deepika', students: 10 },
  { id: 3, name: 'LKG-A', teacher: 'No class teacher assigned', students: 19 },
  { id: 4, name: '6-A', teacher: 'Mukka Lavanya', students: 7 },
  { id: 5, name: '5-A', teacher: 'Raghupatruni Roopakala', students: 5 },
  { id: 6, name: 'UKG-A', teacher: 'Kunapareddy Vuha Latha', students: 12 },
  { id: 7, name: '3-A', teacher: 'Kotana V Padma Rama Lakshmi', students: 14 },
  { id: 8, name: '2-A', teacher: 'Lingupuram Srija', students: 15 },
  { id: 9, name: '1-A', teacher: 'Salapu Vasanthi', students: 14 },
  { id: 10, name: '7-A', teacher: 'Narava Srihitha', students: 2 }
];

const Sections = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTeacher, setNewTeacher] = useState('');
  const [newStudents, setNewStudents] = useState(0);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName) return;
    const newSec = {
      id: Date.now(),
      name: newName,
      teacher: newTeacher || 'No class teacher assigned',
      students: Number(newStudents) || 0
    };
    setSections([newSec, ...sections]);
    setNewName('');
    setNewTeacher('');
    setNewStudents(0);
    setShowCreateModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto"
    >
      {/* Curved Blue Header */}
      <div className="relative -mx-4 -mt-4 md:-mx-8 md:-mt-8 rounded-b-[40px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
        
        {/* Back and Subtitle */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-white/15 rounded-full text-white/90 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">PRINCIPAL</span>
        </div>

        {/* Title and Badge */}
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold">Sections</h2>
          <span className="bg-white/25 border border-white/20 rounded-full px-3 py-0.5 text-xs font-bold font-sans">
            {sections.length}
          </span>
        </div>

        <p className="text-xs text-white/80 font-medium mb-5">2026 academic year</p>

        {/* Create Section Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-6 py-3 bg-white text-[#1597E5] rounded-full font-bold text-xs hover:bg-[#EEF5FB] transition-all cursor-pointer shadow-md active:scale-95"
        >
          <FiPlus className="w-4 h-4 font-bold" />
          <span>Create Section</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-3.5 pt-2">
        {sections.map((sec) => (
          <div
            key={sec.id}
            className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow flex items-center justify-between hover:border-[#1597E5]/30 transition-all cursor-pointer relative group"
            onClick={() => navigate('/settings/class-teachers')}
          >
            <div className="flex items-center gap-3.5">
              {/* Left Icon Container */}
              <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] text-brand-blue flex items-center justify-center shrink-0 border border-brand-blue/10">
                <FiLayers className="w-5 h-5 text-[#1597E5]" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-dark group-hover:text-brand-blue transition-colors leading-tight">
                  {sec.name}
                </h3>
                <p className="text-[9px] text-[#A0AEC0] font-bold mt-1">
                  {sec.teacher}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-[#1597E5] bg-[#EEF5FB] px-2 py-0.5 rounded-md">
                <span className="text-sm font-black mr-0.5">{sec.students}</span> students
              </span>
              <FiChevronRight className="w-4 h-4 text-secondaryText group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Create Section Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 max-w-sm w-full card-shadow space-y-6"
            >
              <div className="flex justify-between items-center pb-2">
                <h3 className="text-base font-extrabold text-dark">Create Section</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-secondaryText transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Section Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. 5-A"
                    className="w-full px-4 py-3 bg-[#EEF5FB]/50 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Class Teacher</label>
                  <input
                    type="text"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    placeholder="e.g. Samineni Deepika"
                    className="w-full px-4 py-3 bg-[#EEF5FB]/50 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Number of Students</label>
                  <input
                    type="number"
                    value={newStudents}
                    onChange={(e) => setNewStudents(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full px-4 py-3 bg-[#EEF5FB]/50 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-blue hover:bg-brand-secondary text-white rounded-xl font-bold text-xs shadow-md shadow-brand-blue/20 transition-all cursor-pointer active:scale-95 mt-4"
                >
                  Create Section
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Sections;
