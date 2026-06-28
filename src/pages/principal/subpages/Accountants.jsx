import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiChevronRight, FiPhone, FiPlus, FiX, FiShield } from 'react-icons/fi';

const INITIAL_ACCOUNTANTS = [
  { id: 1, name: 'Patsamatla Padma Manjula', code: '26SOSS002', status: 'Active', phone: '+919951335377' }
];

const Accountants = () => {
  const navigate = useNavigate();
  const [accountants, setAccountants] = useState(INITIAL_ACCOUNTANTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form states for creating an accountant
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    const newAcc = {
      id: Date.now(),
      name: newName,
      code: newCode || '26SOSS' + Math.floor(100 + Math.random() * 900),
      status: 'Active',
      phone: newPhone
    };
    setAccountants([...accountants, newAcc]);
    setNewName('');
    setNewCode('');
    setNewPhone('');
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
        
        {/* Subtitle and Back navigation */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-white/15 rounded-full text-white/90 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">PRINCIPAL</span>
        </div>

        {/* Title and Count Badge */}
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold">Accountants</h2>
          <span className="bg-white/25 border border-white/20 rounded-full px-3 py-0.5 text-xs font-bold font-sans">
            {accountants.length}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-white/80 font-medium mb-5">Branch fee desk users</p>

        {/* Create Accountant Action Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-6 py-3 bg-white text-[#1597E5] rounded-full font-bold text-xs hover:bg-[#EEF5FB] transition-all cursor-pointer shadow-md active:scale-95"
        >
          <FiPlus className="w-4 h-4 font-bold" />
          <span>Add Accountant</span>
        </button>
      </div>

      {/* Accountants Card List */}
      <div className="space-y-4 pt-2">
        {accountants.map((acc) => (
          <div
            key={acc.id}
            className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow flex flex-col justify-between hover:border-[#1597E5]/30 transition-all cursor-pointer relative group"
          >
            <div className="flex justify-between items-center pb-3 border-b border-[#e2e8f0]/50">
              <div className="flex items-center gap-3.5">
                {/* Avatar with Initials */}
                <div className="w-11 h-11 rounded-full bg-[#EEF5FB] text-[#1597E5] flex items-center justify-center font-bold text-sm select-none border border-[#1597E5]/15">
                  {acc.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-dark group-hover:text-[#1597E5] transition-colors leading-tight">
                    {acc.name}
                  </h3>
                  {/* Badges row */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-[#EEF5FB] text-[#1597E5] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FiShield className="w-2.5 h-2.5" />
                      {acc.code}
                    </span>
                    <span className="bg-[#E8F8F0] text-accent-green text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1 h-1 bg-accent-green rounded-full" />
                      {acc.status}
                    </span>
                  </div>
                </div>
              </div>
              <FiChevronRight className="w-4 h-4 text-secondaryText group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Bottom row phone */}
            <div className="flex items-center gap-1.5 pt-3 text-[10px] text-secondaryText font-semibold">
              <FiPhone className="w-3.5 h-3.5 text-secondaryText" />
              <span>{acc.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Accountant Modal */}
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
                <h3 className="text-base font-extrabold text-dark">Add Accountant</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-secondaryText transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Patsamatla Padma Manjula"
                    className="w-full px-4 py-3 bg-[#EEF5FB]/50 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Employee ID / Code</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. 26SOSS002"
                    className="w-full px-4 py-3 bg-[#EEF5FB]/50 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. +919951335377"
                    className="w-full px-4 py-3 bg-[#EEF5FB]/50 border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-blue hover:bg-brand-secondary text-white rounded-xl font-bold text-xs shadow-md shadow-brand-blue/20 transition-all cursor-pointer active:scale-95 mt-4"
                >
                  Add Accountant
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Accountants;
