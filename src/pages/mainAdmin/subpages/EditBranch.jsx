import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import {
  HiOutlineBuildingOffice, HiOutlineBuildingOffice2, HiOutlineMapPin, HiOutlineMap,
  HiOutlinePhone, HiOutlineEnvelope, HiOutlineQrCode
} from 'react-icons/hi2';

const EditBranch = () => {
  const { currentBranchContext, branches, updateBranch, deleteBranch } = useApp();
  const navigate = useNavigate();

  // Fallback to Sontyam if currentBranchContext is null
  const branch = currentBranchContext || branches.find(b => b.name === 'Sontyam') || branches[0] || {
    id: 'sontyam-id',
    name: 'Sontyam',
    code: 'SO',
    location: 'Visakhapatnam',
    address: 'Sontyam village',
    state: 'Andhra Pradesh',
    pincode: '531173',
    contact: '9100046512',
    email: 'nsritschoolprincipal@gmail.com',
    principal: 'B. Geetha',
    active: true
  };

  // Form states pre-populated with selected branch details
  const [name, setName] = useState(branch.name);
  const [code, setCode] = useState(branch.code);
  const [address, setAddress] = useState(branch.address || '');
  const [city, setCity] = useState(branch.location || '');
  const [state, setState] = useState(branch.state || '');
  const [pincode, setPincode] = useState(branch.pincode || '');
  const [contact, setContact] = useState(branch.contact || '');
  const [email, setEmail] = useState(branch.email || '');
  const [status, setStatus] = useState(branch.active ? 'Active' : 'Inactive');
  const [error, setError] = useState('');

  // Sync state if branch changes
  useEffect(() => {
    setName(branch.name);
    setCode(branch.code);
    setAddress(branch.address || '');
    setCity(branch.location || '');
    setState(branch.state || '');
    setPincode(branch.pincode || '');
    setContact(branch.contact || '');
    setEmail(branch.email || '');
    setStatus(branch.active ? 'Active' : 'Inactive');
  }, [branch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !code || !city || !state || !pincode) {
      setError('Please fill in all required identity and location fields');
      return;
    }
    if (code.length !== 2) {
      setError('Branch code must be exactly 2 characters');
      return;
    }
    setError('');
    
    if (status === 'Inactive') {
      deleteBranch(branch.id);
      navigate('/schools');
    } else {
      updateBranch(branch.id, {
        name,
        code: code.toUpperCase(),
        location: city,
        address,
        state,
        pincode,
        contact,
        email,
        active: true
      });
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[600px] mx-auto"
    >
      {/* Top Header Card */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />

        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">MAIN ADMIN</p>
            <h2 className="text-xl font-bold md:text-2xl">{name || 'Edit Branch'}</h2>
          </div>
        </div>

        <p className="text-xs text-white/70 font-medium">Update branch profile and active status</p>
      </div>

      {error && (
        <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-3 flex items-center gap-2 text-xs text-accent-red font-semibold">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BRANCH NAME */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-3">
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider px-1">Branch Name</p>
          
          <div className="relative">
            <input
              type="text"
              required
              placeholder="Branch name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
            />
            <HiOutlineBuildingOffice className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
          </div>

          <div className="relative">
            <input
              type="text"
              required
              maxLength="2"
              placeholder="Branch code (2 chars)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold uppercase"
            />
            <HiOutlineQrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
          </div>
        </div>

        {/* LOCATION */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-3.5">
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider px-1">Location</p>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
            />
            <HiOutlineMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
          </div>

          <div className="relative">
            <input
              type="text"
              required
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
            />
            <HiOutlineBuildingOffice2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
          </div>

          <div className="relative">
            <input
              type="text"
              required
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
            />
            <HiOutlineMap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
          </div>

          <div className="relative">
            <input
              type="text"
              required
              placeholder="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-secondaryText select-none">123</span>
          </div>
        </div>

        {/* CONTACT */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-3.5">
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider px-1">Contact</p>
          
          <div className="relative">
            <input
              type="tel"
              placeholder="Contact number"
              value={contact}
              onChange={(e) => setContact(e.target.value.replace(/\D/g, ''))}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
            />
            <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
          </div>

          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
            />
            <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
          </div>
        </div>

        {/* STATUS */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-3">
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider px-1">Status</p>
          <div className="flex gap-4 pt-1">
            <button
              type="button"
              onClick={() => setStatus('Active')}
              className={`flex-1 py-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex justify-center items-center gap-1.5 ${
                status === 'Active'
                  ? 'bg-brand-blue border-brand-blue text-white shadow-md'
                  : 'bg-white border-slate-200 text-secondaryText hover:bg-slate-50'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatus('Inactive')}
              className={`flex-1 py-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex justify-center items-center gap-1.5 ${
                status === 'Inactive'
                  ? 'bg-brand-blue border-brand-blue text-white shadow-md'
                  : 'bg-white border-slate-200 text-secondaryText hover:bg-slate-50'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-4 bg-brand-blue hover:bg-brand-secondary text-white rounded-btn font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95"
        >
          <FiCheckCircle className="w-5 h-5" />
          Save Changes
        </button>
      </form>
    </motion.div>
  );
};

export default EditBranch;
