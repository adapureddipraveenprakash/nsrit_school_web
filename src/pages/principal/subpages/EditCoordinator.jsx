import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiUser, FiPhone, FiMail, FiChevronDown, FiSave, FiCheckCircle
} from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';
import { getCoordinatorDetails, updateCoordinator } from '../../../services/dataService';

const EditCoordinator = () => {
  const navigate = useNavigate();
  const { coordinatorId } = useParams();
  const { user } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Field states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [wing, setWing] = useState('Pre-Primary');
  const [isActive, setIsActive] = useState(true);
  const [userId, setUserId] = useState('');
  const [branchId, setBranchId] = useState('');

  useEffect(() => {
    if (!coordinatorId) return;
    const fetchProfile = async () => {
      try {
        const data = await getCoordinatorDetails(coordinatorId);
        if (data) {
          setFullName(data.user?.fullName || '');
          setMobileNumber(data.user?.phoneNumber || '');
          setEmail(data.email || '');
          setGender(data.gender || '');
          
          // Normalize wing: PRE_PRIMARY -> Pre-Primary
          let wingVal = 'Pre-Primary';
          if (data.wing) {
            const clean = data.wing.replace('_', '-').toLowerCase();
            wingVal = clean.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
          }
          setWing(wingVal);
          setIsActive(data.isActive !== false);
          setUserId(data.userId || '');
          setBranchId(data.branchId || '');
        }
      } catch (err) {
        console.error('Error fetching coordinator profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [coordinatorId]);

  const isFormValid =
    fullName.trim() !== '' &&
    mobileNumber.trim() !== '' &&
    gender !== '' &&
    wing !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || saving) return;

    setSaving(true);
    try {
      const payload = {
        coordinatorId,
        userId,
        branchId,
        fullName: fullName.trim(),
        countryCode: '+91',
        phoneNumber: mobileNumber.trim(),
        email: email.trim() || null,
        gender,
        wing: wing.toUpperCase().replace('-', '_'),
        isActive
      };

      await updateCoordinator(payload);

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error('Error updating coordinator:', err);
      alert('Failed to update coordinator: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-28 md:pb-24 max-w-[640px] mx-auto select-none font-sans bg-gradient-to-b from-[#F3F8FC] to-[#F7FAFD] min-h-screen"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-dark pr-8 mx-auto">Edit Coordinator</h1>
      </header>

      {/* Hero card */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase block mb-0.5">PRINCIPAL</span>
          <h2 className="text-xl font-bold">Edit Coordinator Details</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal info */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
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

        {/* Assignment info */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
          <div className="px-5 py-4 border-b border-[#e2e8f0]/50 bg-slate-50/50">
            <span className="text-[9.5px] font-black text-[#A0AEC0] tracking-wider uppercase">ASSIGNMENT & STATUS</span>
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

            {/* Status Switch */}
            <div className="flex items-center justify-between pt-2 px-1">
              <div>
                <label className="text-[10px] font-black text-dark block">Coordinator Status</label>
                <span className="text-[9px] text-[#A0AEC0] font-bold">Inactive coordinators cannot log in</span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                  isActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || saving}
          className={`w-full py-4 rounded-[20px] text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
            isFormValid && !saving
              ? 'bg-[#1597E5] text-white hover:bg-[#1070A3] active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FiSave className="w-4.5 h-4.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </form>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[320px] bg-emerald-500 text-white px-5 py-4 rounded-[20px] shadow-lg flex items-center gap-3.5 z-50 border border-emerald-400/20"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black tracking-tight leading-tight">Details Saved!</p>
              <p className="text-[10px] text-emerald-100 font-bold mt-0.5">Coordinator profile updated in database</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EditCoordinator;
