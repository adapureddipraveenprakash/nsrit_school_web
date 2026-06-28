import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiAlertCircle, FiShield, FiUsers, FiEdit3, FiX, FiCheck } from 'react-icons/fi';
import CreateUserModal from './subpages/CreateUser';

const Users = () => {
  const { changeUserRole, users, dataService } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [defaultRole, setDefaultRole] = useState('BRANCH_ADMIN');
  const [isChangeOpen, setIsChangeOpen] = useState(false);

  // Change Role Modal Local Form States
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('TEACHER');
  const [changeError, setChangeError] = useState('');

  const handleOpenCreate = (role) => {
    setDefaultRole(role);
    setIsCreateOpen(true);
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    setChangeError('');
    try {
      const fullPhone = searchPhone.startsWith('+') ? searchPhone : `+91${searchPhone}`;
      const found = await dataService.getUserByPhone(fullPhone);
      if (!found) {
        setChangeError('No user found with that phone number');
        setSelectedUser(null);
      } else {
        setSelectedUser({ ...found, name: found.fullName });
        setNewRole(found.role);
        setChangeError('');
      }
    } catch (err) {
      setChangeError(err.message || 'Error searching user');
    }
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    try {
      await changeUserRole(selectedUser.phoneNumber || selectedUser.phone, newRole);
      setIsChangeOpen(false);
      setSelectedUser(null);
      setSearchPhone('');
    } catch (err) {
      setChangeError(err.message || 'Failed to save role change');
    }
  };

  const roles = [
    { key: 'MAIN_ADMIN', label: 'Main Admin' },
    { key: 'BRANCH_ADMIN', label: 'Branch Admin' },
    { key: 'PRINCIPAL', label: 'Principal' },
    { key: 'COORDINATOR', label: 'Coordinator' },
    { key: 'TEACHER', label: 'Teacher' },
    { key: 'PARENT', label: 'Parent' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8"
    >
      {/* Top Banner */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
        <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Main Admin</p>
        <h2 className="text-xl font-bold md:text-2xl">Manage Users</h2>
        <p className="text-xs text-white/70 mt-1 font-medium">Provision branch admins, school users, and fix role assignments</p>
      </div>

      {/* Info warning bar */}
      <div className="bg-[#EEF5FB] border border-[#1597E5]/20 rounded-xl p-4 flex items-start gap-2.5 text-xs text-brand-blue font-semibold card-shadow-sm">
        <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Creating users requires selecting a branch first. Role changes can be applied directly without a branch selection.
        </span>
      </div>

      {/* Card Grid */}
      <div className="space-y-6 max-w-[640px] mx-auto">
        {/* Card 1: Branch Admin */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">Branch Admin</h3>
                <p className="text-[10px] text-secondaryText mt-1">Create administrators for specific branches</p>
              </div>
            </div>
            <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
          </div>

          <button
            onClick={() => handleOpenCreate('BRANCH_ADMIN')}
            className="w-full py-3.5 bg-brand-blue hover:bg-brand-secondary text-white rounded-btn font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-blue/15 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            Create Branch Admin
          </button>
        </div>

        {/* Card 2: School Roles */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EEF5FB] text-brand-blue flex items-center justify-center shrink-0">
                <FiUsers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-dark leading-tight group-hover:text-brand-blue transition-colors">School Roles</h3>
                <p className="text-[10px] text-secondaryText mt-1">Create Principals, Coordinators, Teachers, and Parents</p>
              </div>
            </div>
            <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
          </div>

          <button
            onClick={() => handleOpenCreate('TEACHER')}
            className="w-full py-3.5 bg-brand-secondary hover:bg-brand-blue text-white rounded-btn font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-secondary/15 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            Create School User
          </button>
        </div>

        {/* Card 3: Change User Role */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-red/10 text-accent-red flex items-center justify-center shrink-0">
                <FiEdit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-dark leading-tight group-hover:text-accent-red transition-colors">Change User Role</h3>
                <p className="text-[10px] text-secondaryText mt-1 leading-relaxed">
                  Fix a user whose role is wrong — updates users.role and cleans stale user_roles entries
                </p>
              </div>
            </div>
            <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
          </div>

          <button
            onClick={() => setIsChangeOpen(true)}
            className="w-full py-3.5 bg-accent-red hover:bg-red-600 text-white rounded-btn font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-accent-red/15 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            Change Role
          </button>
        </div>
      </div>

      {/* Role Creation Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <CreateUserModal
            isOpen={true}
            onClose={() => setIsCreateOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Change User Role Modal */}
      <AnimatePresence>
        {isChangeOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChangeOpen(false)}
              className="fixed inset-0 bg-dark/70"
            />
            <motion.div
              initial={{ y: '100%', scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 0.95 }}
              className="bg-white rounded-t-card sm:rounded-card w-full max-w-[440px] p-6 card-shadow relative overflow-hidden z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <FiEdit3 className="text-accent-red w-5 h-5" />
                  <h3 className="text-base font-bold text-dark">Modify User Role</h3>
                </div>
                <button onClick={() => setIsChangeOpen(false)} className="p-1 hover:bg-[#EEF5FB] rounded-full text-secondaryText">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Form Search User by Phone */}
              {!selectedUser ? (
                <form onSubmit={handleSearchUser} className="space-y-4">
                  <p className="text-xs text-secondaryText leading-relaxed">
                    Enter the phone number of the registered user whose role needs configuration:
                  </p>
                  <div>
                    <label className="text-[10px] font-bold text-secondaryText tracking-wider uppercase block mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 7670818348"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none text-xs font-semibold"
                    />
                  </div>
                  {changeError && <p className="text-xs text-accent-red font-semibold">{changeError}</p>}
                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-blue text-white font-bold text-xs rounded-btn shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    Search Profile
                  </button>
                </form>
              ) : (
                /* Edit user role once found */
                <div className="space-y-4">
                  <div className="p-3 bg-[#EEF5FB] border border-[#1597E5]/10 rounded-xl text-xs font-semibold text-dark">
                    <p>User Found: <strong className="text-brand-blue">{selectedUser.name}</strong></p>
                    <p className="mt-1 opacity-70">Current Role: {selectedUser.role}</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-secondaryText tracking-wider uppercase block mb-1.5">Select New Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none text-xs font-semibold"
                    >
                      {roles.map(r => (
                        <option key={r.key} value={r.key}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="py-3 bg-[#EEF5FB] rounded-btn font-bold text-xs"
                    >
                      Search Again
                    </button>
                    <button
                      onClick={handleSaveRole}
                      className="py-3 bg-accent-green hover:bg-[#1fa95d] text-white rounded-btn font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <FiCheck className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Users;
