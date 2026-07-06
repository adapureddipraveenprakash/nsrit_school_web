import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiUser, FiPhone, FiMail, FiChevronDown, FiUserPlus, FiCheckCircle
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { createCoordinator } from '../../../services/dataService';
import dataConnectClient from '../../../services/dataConnectClient';

const CreateCoordinator = () => {
  const navigate = useNavigate();
  const { user, currentBranchContext } = useApp();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [wing, setWing] = useState('Pre-Primary');

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isFormValid =
    fullName.trim() !== '' &&
    mobileNumber.trim() !== '' &&
    gender !== '' &&
    wing !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    const branchId = user?.branchId || currentBranchContext?.id || 'sontyam-branch-id';
    const branchCode = user?.branchCode || currentBranchContext?.code || 'SO';
    const joiningYear = new Date().getFullYear();

    try {
      // 1. Fetch sequence number
      const seqRes = await dataConnectClient.query('GetEmployeeSequence', {
        year: joiningYear,
        branchCode,
        staffType: 'TEACHING'
      });
      const lastSequence = seqRes?.employeeSequences?.[0]?.lastSequence || 0;
      const serialNumber = lastSequence + 1;

      // 2. Generate employeeId & firebaseUID
      const yearShort = joiningYear.toString().slice(-2);
      const employeeId = `${yearShort}${branchCode}CO${String(serialNumber).padStart(3, '0')}`;
      const firebaseUID = `COORD-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

      // 3. Create payload
      const payload = {
        firebaseUID,
        fullName: fullName.trim(),
        countryCode: '+91',
        phoneNumber: mobileNumber.trim(),
        email: email.trim() || null,
        gender,
        employeeId,
        staffType: 'TEACHING',
        joiningYear,
        branchCode,
        serialNumber,
        branchId,
        wing: wing.toUpperCase().replace('-', '_') // e.g. PRE_PRIMARY or PRIMARY
      };

      // 4. Save to database
      await createCoordinator(payload);

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error('Error creating coordinator:', err);
      alert('Failed to register coordinator: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto animate-fade-in animate-fade-in-long relative select-none font-sans"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Create Coordinator</h1>
      </header>

      {/* Top curved blue header card (Screenshot 2 Match) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 select-none">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase block mb-0.5">PRINCIPAL</span>
          <h2 className="text-xl font-bold">Create Coordinator</h2>
          <p className="text-[11px] text-white/80 font-medium mt-1">Coordinator inherits your branch automatically</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PERSONAL INFO CARD (Screenshot 2 Match) */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow select-none">
          <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
            <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">PERSONAL INFO</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Full Name */}
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Full Name *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0]" />
            </div>

            {/* Mobile Number */}
            <div className="relative">
              <input
                type="tel"
                required
                maxLength="10"
                placeholder="Mobile Number *"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0]" />
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0]" />
            </div>
          </div>
        </div>

        {/* ASSIGNMENT CARD (Screenshot 2 Match) */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow select-none">
          <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
            <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">ASSIGNMENT</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Gender Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-dark block px-1">Gender *</label>
              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`w-full bg-white border border-blue-100 rounded-[20px] pl-4 pr-10 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer ${
                    gender === '' ? 'text-[#A0AEC0]' : 'text-dark'
                  }`}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0] pointer-events-none" />
              </div>
            </div>

            {/* Wing Assignment */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-dark block px-1">Wing Assignment *</label>
              <div className="relative">
                <select
                  value={wing}
                  onChange={(e) => setWing(e.target.value)}
                  className="w-full bg-white border border-blue-100 rounded-[20px] pl-4 pr-10 py-3.5 text-xs font-semibold focus:outline-none focus:border-[#1597E5]/60 appearance-none cursor-pointer text-dark"
                >
                  <option value="Pre-Primary">Pre-Primary</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 left-4 right-4 z-50 md:left-[calc(50%-200px)] md:right-auto md:w-[400px] bg-white border border-[#23C16B]/30 rounded-2xl p-4 card-shadow flex items-start gap-3.5 select-none"
            >
              <div className="w-9 h-9 rounded-full bg-[#E8F8F0] text-[#23C16B] flex items-center justify-center shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-dark">Coordinator Created</h4>
                <p className="text-[10px] text-secondaryText mt-0.5 font-semibold leading-relaxed">
                  Successfully registered coordinator {fullName} in the system.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky Bottom Create Coordinator Button Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 md:left-[288px]">
          <div className="max-w-[640px] mx-auto px-4 pb-0">
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full py-4 rounded-t-[32px] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isFormValid && !loading
                  ? 'bg-[#80D0FF] hover:bg-[#1597E5] text-white shadow-[#1597E5]/20 active:scale-95'
                  : 'bg-[#bfe6ff] text-white cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-5.5 h-5.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiUserPlus className="w-4.5 h-4.5 text-white" />
                  <span>Create Coordinator</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateCoordinator;
