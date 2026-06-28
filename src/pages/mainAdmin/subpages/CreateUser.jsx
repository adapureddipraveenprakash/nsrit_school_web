import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUsers, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { useApp } from '../../../context/AppContext';

const CreateUser = ({ isOpen, onClose }) => {
  const { addUser, branches, addLog } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('TEACHER');
  const [branchId, setBranchId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      setError('Please fill in Name, Phone, and Email');
      return;
    }
    if (phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    // Check if role requires branch mapping (everything except MAIN_ADMIN)
    if (role !== 'MAIN_ADMIN' && !branchId) {
      setError('Please select a school branch. Non-admin roles must be mapped to a branch.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await addUser({
        name,
        phone,
        email,
        role,
        branchId: role === 'MAIN_ADMIN' ? null : branchId
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { key: 'MAIN_ADMIN', label: 'Main Admin (Global)' },
    { key: 'BRANCH_ADMIN', label: 'Branch Admin' },
    { key: 'PRINCIPAL', label: 'Principal' },
    { key: 'COORDINATOR', label: 'Coordinator' },
    { key: 'TEACHER', label: 'Teacher' },
    { key: 'PARENT', label: 'Parent' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      {/* Dark Blur Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-dark/70"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ y: '100%', scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="bg-white rounded-t-card sm:rounded-card w-full max-w-[500px] p-6 card-shadow relative overflow-hidden z-10"
      >
        {/* Header bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center">
              <FiUsers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark">Provision User Role</h3>
              <p className="text-[10px] text-secondaryText">Assign new system role and profile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-secondaryText transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner matching screenshot info box */}
        <div className="mb-4 bg-[#EEF5FB] border border-[#1597E5]/20 rounded-xl p-3 flex items-start gap-2 text-xs text-brand-blue font-semibold">
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Creating school users requires mapping to a branch first. Role changes can be applied directly.</span>
        </div>

        {error && (
          <div className="mb-4 bg-accent-red/5 border border-accent-red/20 rounded-xl p-3 flex items-center gap-2 text-xs text-accent-red font-semibold">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-secondaryText tracking-wider uppercase block mb-1.5">User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
              >
                {roles.map(r => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-secondaryText tracking-wider uppercase block mb-1.5">Map to Branch</label>
              <select
                value={branchId}
                disabled={role === 'MAIN_ADMIN'}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold disabled:opacity-50"
              >
                <option value="">-- Choose Branch --</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-secondaryText tracking-wider uppercase block mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-secondaryText tracking-wider uppercase block mb-1.5">Phone Number</label>
              <input
                type="tel"
                maxLength="10"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-secondaryText tracking-wider uppercase block mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="e.g. john@nsrit.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 bg-[#EEF5FB] hover:bg-[#cbd5e1]/30 text-dark rounded-btn font-bold text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-3.5 bg-brand-blue hover:bg-brand-secondary text-white rounded-btn font-bold text-xs shadow-md shadow-brand-blue/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <FiPlus className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateUser;
