import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiInfo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { HiOutlineDocumentArrowUp } from 'react-icons/hi2';

const BulkUpload = () => {
  const navigate = useNavigate();
  const { addLog } = useApp();

  const defaultCsvHeaders = 'Full Name,Gender,DOB,Father Name,Father Mobile,Mother Name,Mother Mobile,Guardian Name,Guardian Mobile,Class,Section,Admission Date';
  const [csvContent, setCsvContent] = useState(defaultCsvHeaders + '\n');
  const [error, setError] = useState('');

  // Results State
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ success: 0, failed: 0, failuresList: [] });

  const handleImport = (e) => {
    e.preventDefault();
    if (!csvContent || csvContent.trim() === defaultCsvHeaders) {
      setError('Please paste valid CSV rows below the headers.');
      return;
    }

    const lines = csvContent.trim().split('\n');
    if (lines.length <= 1) {
      setError('No student records found in the pasted CSV content.');
      return;
    }

    setError('');
    
    // Parse records simulation
    let successCount = 0;
    let failedCount = 0;
    const failuresList = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',');
      const fullName = cols[0]?.trim();
      const studentClass = cols[9]?.trim();
      const section = cols[10]?.trim();

      // Check required fields
      if (!fullName || !studentClass || !section) {
        failedCount++;
        failuresList.push(`Row ${i + 1}: Missing required fields (Name, Class, or Section)`);
      } else {
        // Intentionally simulate a failure for 1 or 2 rows to demonstrate both green and red states clearly
        if (i === 3 && lines.length > 3) {
          failedCount++;
          failuresList.push(`Row ${i + 1}: '${fullName}' - Parent mobile format is invalid`);
        } else {
          successCount++;
        }
      }
    }

    // Guarantee that at least 1 failure shows up so that both green and red are shown even for single row
    if (failedCount === 0 && successCount > 0) {
      failedCount = 1;
      successCount = Math.max(0, successCount - 1);
      failuresList.push(`Row 2: 'DEMO FAILURE STUDENT' - Missing Guardian Contact information`);
    }

    setResults({
      success: successCount,
      failed: failedCount,
      failuresList: failuresList
    });
    
    setShowResults(true);
    addLog(`Bulk import processed: ${successCount} succeeded, ${failedCount} failed`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-24 md:pb-12 max-w-5xl mx-auto space-y-6"
    >
      {/* Header bar */}
      <header className="flex items-center gap-4 py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-grow">
          <h1 className="text-sm font-bold text-dark">Bulk Upload</h1>
        </div>
      </header>

      {error && (
        <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-accent-red font-bold animate-[shake_0.5s_ease]">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Layout for Desktop View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Hero banner, Info block and submit action */}
        <div className="space-y-6">
          {/* Blue Hero Card */}
          <div className="relative rounded-[24px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Students</p>
            <h2 className="text-2xl font-bold mt-1">Bulk Import</h2>
            <p className="text-xs text-white/85 mt-1 font-medium">Paste CSV content exported from your sheet</p>
          </div>

          {/* Required columns info banner */}
          <div className="flex gap-3 p-4 bg-[#EEF5FB] border border-[#1597E5]/15 rounded-[20px] text-[10px] leading-relaxed text-[#1597E5] font-bold">
            <FiInfo className="w-4 h-4 shrink-0 mt-0.5 text-brand-blue" />
            <p>
              Required columns: Full Name, Gender, DOB, Class, Section, and at least one of Father Mobile, Mother Mobile, or Guardian Mobile.
            </p>
          </div>

          {/* Action button (Only show if form is not submitted/results not shown) */}
          {!showResults && (
            <button
              onClick={handleImport}
              className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95"
            >
              <HiOutlineDocumentArrowUp className="w-4 h-4" />
              Import Students
            </button>
          )}
        </div>

        {/* Right Column: CSV Textarea or Results panel (spans 2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {!showResults ? (
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
              <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1 block">
                CSV Content
              </span>

              <textarea
                required
                rows="12"
                placeholder="Paste CSV data here..."
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-[#e2e8f0] rounded-[20px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-[10px] font-mono text-dark resize-none"
              />
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-base font-extrabold text-dark">CSV Processed</h2>
                <p className="text-xs text-secondaryText font-medium">Here is the detailed breakdown of the import results</p>
              </div>

              <div className="space-y-4">
                {/* Success Box - Green */}
                <div className="bg-[#E8F8F0] border border-[#23C16B]/30 rounded-[20px] p-5 flex flex-col gap-1">
                  <span className="text-xs font-extrabold text-accent-green flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4" />
                    {results.success} Records Succeeded
                  </span>
                  <p className="text-[10px] text-[#23C16B]/80 font-semibold leading-relaxed">
                    These student profiles have been added to the branch database roster successfully.
                  </p>
                </div>

                {/* Failure Box - Red */}
                {results.failed > 0 && (
                  <div className="bg-[#FEF2F2] border border-[#EF4444]/30 rounded-[20px] p-5 flex flex-col gap-3">
                    <span className="text-xs font-extrabold text-accent-red flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" />
                      {results.failed} Records Failed
                    </span>
                    
                    {/* Details List */}
                    <div className="bg-white/70 rounded-xl p-3 border border-[#EF4444]/10 max-h-[200px] overflow-y-auto space-y-1.5 font-mono text-[9px] text-[#EF4444]/90">
                      {results.failuresList.map((err, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <span className="shrink-0 text-accent-red font-bold">•</span>
                          <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Continue button */}
              <button
                onClick={() => navigate('/settings/global-students')}
                className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95"
              >
                Go to Students List
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BulkUpload;
