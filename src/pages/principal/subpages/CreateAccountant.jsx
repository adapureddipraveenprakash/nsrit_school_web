import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiUser, FiPhone, FiMail, FiChevronDown, FiUserPlus, FiCheckCircle,
  FiBriefcase, FiCalendar, FiBookOpen, FiClock, FiHome, FiMapPin, FiMap, FiHash
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { createAccountant } from '../../../services/dataService';
import dataConnectClient from '../../../services/dataConnectClient';

const CreateAccountant = () => {
  const navigate = useNavigate();
  const { user, currentBranchContext } = useApp();

  // Personal Info States
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Employment States
  const [joiningDate, setJoiningDate] = useState('2026-07-06');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');

  // Address States
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isFormValid =
    fullName.trim() !== '' &&
    mobileNumber.trim() !== '' &&
    gender !== '' &&
    joiningDate.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    const branchId = user?.branchId || currentBranchContext?.id || 'sontyam-branch-id';
    const branchCode = user?.branchCode || currentBranchContext?.code || 'SO';
    
    try {
      const yearPart = joiningDate.split('-')[0];
      const joiningYear = yearPart ? parseInt(yearPart, 10) : 2026;

      // 1. Fetch sequence number
      const seqRes = await dataConnectClient.query('GetEmployeeSequence', {
        year: joiningYear,
        branchCode,
        staffType: 'SUPPORTING'
      });
      const lastSequence = seqRes?.employeeSequences?.[0]?.lastSequence || 0;
      const serialNumber = lastSequence + 1;

      // 2. Generate employeeId & firebaseUID
      const yearShort = joiningYear.toString().slice(-2);
      const employeeId = `${yearShort}${branchCode}SS${String(serialNumber).padStart(3, '0')}`;
      const firebaseUID = `ACC-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

      // 3. Create payload
      const payload = {
        firebaseUID,
        fullName: fullName.trim(),
        countryCode: '+91',
        phoneNumber: mobileNumber.trim(),
        email: email.trim() || null,
        gender,
        bloodGroup: bloodGroup.trim() || null,
        emergencyContact: emergencyContact.trim() || null,
        joiningDate,
        designation: 'Accountant',
        qualification: qualification.trim() || null,
        experience: experience.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        pincode: pincode.trim() || null,
        employeeId,
        staffType: 'SUPPORTING',
        joiningYear,
        branchCode,
        serialNumber,
        branchId
      };

      // 4. Save to database
      await createAccountant(payload);

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error('Error creating accountant:', err);
      alert('Failed to register accountant: ' + (err.message || err));
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
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Create Accountant</h1>
      </header>

      {/* Top curved blue header card (Screenshot 3 Match) */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1b5dfc] to-[#1597E5] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 select-none">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase block mb-0.5">PRINCIPAL</span>
          <h2 className="text-xl font-bold">Create Accountant</h2>
          <p className="text-[11px] text-white/80 font-medium mt-1">Employee ID is generated automatically</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PERSONAL INFO CARD (Screenshot 3 Match) */}
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

            {/* Gender Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 block px-1">Gender *</label>
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

            {/* Blood Group */}
            <div className="relative">
              <input
                type="text"
                placeholder="Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-4.5 h-4.5 text-[#A0AEC0]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="relative">
              <input
                type="tel"
                maxLength="10"
                placeholder="Emergency Contact"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0]" />
            </div>
          </div>
        </div>

        {/* EMPLOYMENT CARD (Screenshot 3 Match) */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow select-none">
          <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
            <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">EMPLOYMENT</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Designation */}
            <div className="relative">
              <input
                type="text"
                disabled
                value="Accountant"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-[#e2e8f0] rounded-[20px] text-xs font-semibold text-slate-500 cursor-not-allowed"
              />
              <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0]" />
            </div>

            {/* Joining Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 block px-1">Joining Date *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-white border border-blue-100 rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark cursor-pointer"
                />
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0] pointer-events-none" />
              </div>
            </div>

            {/* Qualification */}
            <div className="relative">
              <input
                type="text"
                placeholder="Qualification"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0]" />
            </div>

            {/* Experience */}
            <div className="relative">
              <input
                type="text"
                placeholder="Experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0]" />
            </div>
          </div>
        </div>

        {/* ADDRESS CARD (Screenshot 3 Match) */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow select-none">
          <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
            <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">ADDRESS</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Address */}
            <div className="relative">
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0]" />
            </div>

            {/* City */}
            <div className="relative">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0]" />
            </div>

            {/* State */}
            <div className="relative">
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <FiMap className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0]" />
            </div>

            {/* Pincode */}
            <div className="relative">
              <input
                type="text"
                maxLength="6"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-[20px] focus:outline-none focus:border-[#1597E5]/60 text-xs font-semibold text-dark placeholder:text-[#A0AEC0]"
              />
              <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#A0AEC0]" />
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
                <h4 className="text-xs font-bold text-dark">Accountant Created</h4>
                <p className="text-[10px] text-secondaryText mt-0.5 font-semibold leading-relaxed">
                  Successfully registered accountant {fullName} in the system.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky Bottom Create Accountant Button Bar */}
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
                  <span>Create Accountant</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateAccountant;
