import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { getAuditLogs } from '../../../services/dataService';

const AuditLogs = () => {
  const navigate = useNavigate();
  const { currentBranchContext } = useApp();

  const branchId = currentBranchContext?.id || null;
  const { data: displayLogs, loading, error, refetch } = useDataFetch(
    () => getAuditLogs({ branchId, limit: 100 }),
    [branchId],
    { defaultValue: [], pollInterval: 10000 }
  );

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
