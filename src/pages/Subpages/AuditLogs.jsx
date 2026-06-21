import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

const AuditLogs = () => {
  const navigate = useNavigate();
  const { auditLogs } = useApp();

  // Mapped audit logs styled exactly like image8.jpeg
  const seedLogs = [
    {
      id: 1,
      action: 'ROLE_SWITCHED',
      timestamp: '2026-06-21T10:48:25.485431Z',
      by: 'Ofa7dda8-c7bb-453f-8489-dde1aa59b65d',
      role: 'TEACHER',
      branch: 'Global',
      entity: 'USER Ofa7dda8-c7bb-453f-8489-dde1aa59b65d'
    },
    {
      id: 2,
      action: 'ROLE_SWITCHED',
      timestamp: '2026-06-21T10:48:10.245601Z',
      by: 'Ofa7dda8-c7bb-453f-8489-dde1aa59b65d',
      role: 'CLASS_TEACHER',
      branch: 'Global',
      entity: 'USER Ofa7dda8-c7bb-453f-8489-dde1aa59b65d'
    },
    {
      id: 3,
      action: 'EnsureCurrentUserLegacyRole',
      timestamp: '2026-06-21T09:13:11.501135Z',
      by: 'Main Admin',
      role: 'MAIN_ADMIN',
      branch: 'Global',
      entity: 'ENSURE_CURRENT_USER_LEGACY_ROLE'
    },
    {
      id: 4,
      action: 'ROLE_SWITCHED',
      timestamp: '2026-06-21T05:19:32.579242Z',
      by: 'cab00d8d-bab3-43b5-b14e-b1bb273a229e',
      role: 'COORDINATOR',
      branch: 'Global',
      entity: 'USER cab00d8d-bab3-43b5-b14e-b1bb273a229e'
    },
    {
      id: 5,
      action: 'ROLE_SWITCHED',
      timestamp: '2026-06-21T05:17:38.356013Z',
      by: 'cab00d8d-bab3-43b5-b14e-b1bb273a229e',
      role: 'CLASS_TEACHER',
      branch: 'Global',
      entity: 'USER cab00d8d-bab3-43b5-b14e-b1bb273a229e'
    },
    {
      id: 6,
      action: 'EnsureCurrentUserLegacyRole',
      timestamp: '2026-06-21T04:29:31.928543Z',
      by: 'Main Admin',
      role: 'MAIN_ADMIN',
      branch: 'Global',
      entity: 'ENSURE_CURRENT_USER_LEGACY_ROLE'
    }
  ];

  // Combine seed logs and dynamic session logs
  const displayLogs = [
    ...auditLogs.map((l, idx) => ({
      id: 'dynamic-' + idx,
      action: 'MOCK_OPERATION',
      timestamp: l.timestamp,
      by: l.userName,
      role: 'ADMIN',
      branch: 'Global',
      entity: l.action
    })),
    ...seedLogs
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8 max-w-[640px] mx-auto"
    >
      {/* Top Header Card */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">MAIN ADMIN</p>
            <h2 className="text-xl font-bold md:text-2xl">Audit Logs</h2>
          </div>
        </div>

        <p className="text-xs text-white/70 font-medium">Actions across all branches</p>
      </div>

      {/* Logs Card List */}
      <div className="space-y-4">
        {displayLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-5 card-shadow space-y-3.5"
          >
            {/* Card Header: Dot indicator, Title, and monospaced timestamp */}
            <div className="flex justify-between items-start gap-4 pb-2 border-b border-[#e2e8f0]/60">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-secondaryText/60 shrink-0" />
                <h4 className="text-xs font-extrabold text-dark truncate uppercase tracking-wide">
                  {log.action}
                </h4>
              </div>
              <span className="text-[9px] font-semibold text-secondaryText font-mono whitespace-nowrap shrink-0">
                {log.timestamp}
              </span>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-12 gap-y-1.5 text-[10px] font-semibold">
              <div className="col-span-3 text-secondaryText uppercase tracking-wider">BY</div>
              <div className="col-span-9 text-dark font-mono break-all">{log.by}</div>

              <div className="col-span-3 text-secondaryText uppercase tracking-wider">ROLE</div>
              <div className="col-span-9 text-dark">{log.role}</div>

              <div className="col-span-3 text-secondaryText uppercase tracking-wider">BRANCH</div>
              <div className="col-span-9 text-dark">{log.branch}</div>

              <div className="col-span-3 text-secondaryText uppercase tracking-wider">ENTITY</div>
              <div className="col-span-9 text-dark font-mono break-all leading-tight">{log.entity}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AuditLogs;
