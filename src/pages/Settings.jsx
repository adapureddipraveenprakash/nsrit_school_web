import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSettings, FiBriefcase, FiUsers, FiDollarSign, FiClock, FiLayers,
  FiBookOpen, FiActivity, FiInfo, FiShield, FiHelpCircle, FiX, FiCheck
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Import action views
import BranchContextModal from './Subpages/BranchContext';
import CreateBranchModal from './Subpages/CreateBranch';
import CreateUserModal from './Subpages/CreateUser';
import StudentRecordsModal from './Subpages/StudentRecords';
import FeeSetupModal from './Subpages/FeeSetup';
import AuditLogsModal from './Subpages/AuditLogs';

const Settings = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  // Modal Control States
  const [activeModal, setActiveModal] = useState(null); // reuse existing subpage modals
  const [showAbout, setShowAbout] = useState(false);

  const handleItemClick = (title) => {
    if (title === 'Manage Branches') navigate('/schools');
    else if (title === 'Manage Users') navigate('/users');
    else if (title === 'Revenue Overview') navigate('/settings/revenue-overview');
    else if (title === 'Audit Logs') navigate('/settings/audit-logs');
    else if (title === 'Student Records') navigate('/settings/global-students');
    else if (title === 'Global Reports') navigate('/settings/global-reports');
    else if (title === 'Classes & Wings') navigate('/settings/class-fee-templates');
    else if (title === 'About') setShowAbout(true);
    else {
      alert(`${title} configuration view simulated.`);
    }
  };

  const sections = [
    {
      title: 'System Management',
      items: [
        { title: 'Manage Branches', desc: 'Add, edit or deactivate school branches', icon: <FiBriefcase className="w-4 h-4 text-brand-blue" />, bg: 'bg-brand-blue/10' },
        { title: 'Manage Users', desc: 'Create and assign role-based user accounts', icon: <FiUsers className="w-4 h-4 text-accent-purple" />, bg: 'bg-accent-purple/10' },
        { title: 'Revenue Overview', desc: 'Fee collection and financial summary', icon: <FiDollarSign className="w-4 h-4 text-accent-green" />, bg: 'bg-accent-green/10' },
        { title: 'Audit Logs', desc: 'Track system changes and admin actions', icon: <FiClock className="w-4 h-4 text-accent-orange" />, bg: 'bg-accent-orange/10' },
      ]
    },
    {
      title: 'Academic Configuration',
      items: [
        { title: 'Classes & Wings', desc: 'Global academic class structure', icon: <FiLayers className="w-4 h-4 text-brand-blue" />, bg: 'bg-brand-blue/10' },
        { title: 'Student Records', desc: 'View and manage all students globally', icon: <FiBookOpen className="w-4 h-4 text-brand-secondary" />, bg: 'bg-brand-secondary/10' },
        { title: 'Global Reports', desc: 'Cross-branch analytics and reports', icon: <FiActivity className="w-4 h-4 text-accent-purple" />, bg: 'bg-accent-purple/10' },
      ]
    },
    {
      title: 'Application',
      items: [
        { title: 'About', desc: 'NSRIT Connect • Version 1.0.0 (100)', icon: <FiInfo className="w-4 h-4 text-secondaryText" />, bg: 'bg-[#EEF5FB]', badge: 'v1.0' },
        { title: 'Privacy Policy', desc: 'Data handling and privacy practices', icon: <FiShield className="w-4 h-4 text-secondaryText" />, bg: 'bg-[#EEF5FB]' },
        { title: 'Support', desc: 'Contact technical support team', icon: <FiHelpCircle className="w-4 h-4 text-secondaryText" />, bg: 'bg-[#EEF5FB]' },
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-7xl mx-auto"
    >
      {/* Top Banner Card */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />

        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Main Admin</p>
            <h2 className="text-xl font-bold md:text-2xl">Settings</h2>
            <p className="text-xs text-white/70 mt-1 font-medium">System configuration and administration</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
            <FiSettings className="w-6 h-6 animate-[spin_8s_linear_infinite]" />
          </div>
        </div>
      </div>

      {/* Admin Profile Card */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-4 card-shadow flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center text-lg font-bold font-sans select-none shrink-0 border border-brand-blue/20">
          {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'MA'}
        </div>
        <div>
          <h3 className="text-sm font-bold text-dark leading-tight">{user?.name || 'Main Admin'}</h3>
          <p className="text-[10px] text-secondaryText mt-1">Main Administrator • NSRIT Connect</p>
        </div>
      </div>

      {/* Section Listing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-3">
          <p className="text-[10px] font-bold text-secondaryText tracking-widest uppercase px-1">
            {section.title}
          </p>

          <div className="bg-white rounded-[24px] card-shadow border border-[#e2e8f0]/40 overflow-hidden divide-y divide-[#e2e8f0]/80">
            {section.items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleItemClick(item.title)}
                className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/35 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-dark group-hover:text-brand-blue transition-colors">{item.title}</h4>
                    <p className="text-[9px] text-secondaryText mt-0.5 font-medium">{item.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="bg-[#EEF5FB] text-brand-blue text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#1597E5]/15">
                      {item.badge}
                    </span>
                  )}
                  {item.title !== 'About' && (
                    <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">&gt;</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>

      {/* Modals & Subpages overlay controller */}
      <AnimatePresence>
        {activeModal === 'create_branch' && (
          <CreateBranchModal isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'create_user' && (
          <CreateUserModal isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'students' && (
          <StudentRecordsModal isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'fee_setup' && (
          <FeeSetupModal isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'audit_logs' && (
          <AuditLogsModal isOpen={true} onClose={() => setActiveModal(null)} />
        )}
        
        {/* About App Modal Details */}
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="fixed inset-0 bg-dark/70"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-card w-full max-w-[360px] p-6 card-shadow relative overflow-hidden z-10 text-center"
            >
              <div className="w-16 h-16 bg-[#EEF5FB] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#e2e8f0]/40">
                <span className="text-3xl">🎓</span>
              </div>
              <h3 className="text-base font-extrabold text-dark">NSRIT Connect</h3>
              <p className="text-xs text-secondaryText mt-1">Enterprise School Management</p>
              
              <div className="my-6 py-2 px-4 bg-[#EEF5FB]/70 border border-[#e2e8f0]/40 rounded-xl inline-block text-[11px] font-bold text-brand-blue">
                Version 1.0.0 (Build 100)
              </div>

              <button
                onClick={() => setShowAbout(false)}
                className="w-full py-3 bg-[#EEF5FB] hover:bg-[#cbd5e1]/30 text-dark rounded-btn font-bold text-xs transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
