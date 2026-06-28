import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import {
  HiOutlineBuildingOffice, HiOutlineBuildingOffice2, HiOutlineMapPin, HiOutlineMap,
  HiOutlinePhone, HiOutlineEnvelope, HiOutlineQrCode
} from 'react-icons/hi2';

const CreateBranch = ({ isOpen, onClose }) => {
  const { addBranch } = useApp();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Active');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (e) => {
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
    setLoading(true);
    try {
      await addBranch({
        name,
        code: code.toUpperCase(),
        principal: 'Unassigned',
        location: city,
        address,
        state,
        pincode,
        contact,
        email,
        active: status === 'Active'
      });
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to create branch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#EEF5FB] overflow-y-auto">
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
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">MAIN ADMIN</p>
              <h2 className="text-xl font-bold md:text-2xl">Create Branch</h2>
            </div>
          </div>

          <p className="text-xs text-white/70 font-medium">Add a campus and make it available for branch admins</p>
        </div>

      {error && (
        <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-3 flex items-center gap-2 text-xs text-accent-red font-semibold">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BRANCH IDENTITY */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
          <p className="text-[9px] font-bold text-secondaryText uppercase tracking-wider px-1">Branch Identity</p>
          
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
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
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
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-secondaryText select-none">123</span>
          </div>
        </div>

        {/* CONTACT */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-4">
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
          <label className="text-[10px] font-bold text-secondaryText block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none text-xs font-semibold"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-brand-blue hover:bg-brand-secondary text-white rounded-btn font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <FiCheckCircle className="w-5 h-5" />
          {loading ? 'Saving Branch...' : 'Save Branch'}
        </button>
      </form>
    </motion.div>
  </div>
);
};

export default CreateBranch;
