import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiInfo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { HiOutlineDocumentArrowUp } from 'react-icons/hi2';
import { useDataFetch } from '../../../hooks/useDataFetch';
import {
  getAcademicClasses,
  getSections,
  getParentByPhone,
  createParentWithoutUser,
  createStudent
} from '../../../services/dataService';
import { dataConnectClient } from '../../../services/dataConnectClient';

const BulkUpload = () => {
  const navigate = useNavigate();
  const { user, addLog } = useApp();
  const branchId = user?.branchId || null;
  const branchCode = user?.branchCode || 'SO';

  const defaultCsvHeaders = 'Full Name,Gender,DOB,Father Name,Father Mobile,Mother Name,Mother Mobile,Guardian Name,Guardian Mobile,Class,Section,Admission Date';
  const [csvContent, setCsvContent] = useState(
    defaultCsvHeaders + '\n' +
    'Student One,Male,15-08-2015,Rajesh Kumar,9876543210,,,,,2,A,01-06-2026\n'
  );
  const [error, setError] = useState('');

  // Dropdowns lists & loading state
  const [classesList, setClassesList] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  // Results State
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ success: 0, failed: 0, failuresList: [] });

  // Fetch classes catalog and filter locally by branchId
  useEffect(() => {
    if (branchId) {
      getAcademicClasses().then(list => {
        const branchClasses = list.filter(c => c.branchId === branchId);
        setClassesList(branchClasses);
      }).catch(err => {
        console.error('Error fetching academic classes:', err);
      });
    }
  }, [branchId]);

  // Fetch real sections in the branch
  const { data: dbSections = [] } = useDataFetch(
    () => getSections({ branchId }),
    [branchId],
    { defaultValue: [], skip: !branchId }
  );

  const parseCsvRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const convertDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleImport = async (e) => {
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
    setImporting(true);
    setProgressMsg('Initializing bulk import...');

    let successCount = 0;
    let failedCount = 0;
    const failuresList = [];
    const nextSerialMap = {};

    const getNextSerial = async (year) => {
      if (nextSerialMap[year] !== undefined) {
        const current = nextSerialMap[year];
        nextSerialMap[year] = current + 1;
        return current;
      }
      const lastSerialRes = await dataConnectClient.query('GetLastStudentSerial', {
        admissionYear: year,
        branchCode
      });
      const lastSerial = lastSerialRes?.students?.[0]?.serialNumber || 0;
      nextSerialMap[year] = lastSerial + 2;
      return lastSerial + 1;
    };

    // Iterate through lines starting from index 1 (skipping headers)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const rowNum = i + 1;
      setProgressMsg(`Importing row ${i} of ${lines.length - 1}...`);

      try {
        const cols = parseCsvRow(line);
        const fullName = cols[0]?.trim();
        const gender = cols[1]?.trim() || 'Male';
        const dobStr = cols[2]?.trim();
        const fatherName = cols[3]?.trim();
        const fatherMobile = cols[4]?.trim();
        const motherName = cols[5]?.trim();
        const motherMobile = cols[6]?.trim();
        const guardianName = cols[7]?.trim();
        const guardianMobile = cols[8]?.trim();
        const studentClass = cols[9]?.trim();
        const section = cols[10]?.trim();
        const admissionDateStr = cols[11]?.trim() || '21-06-2026';

        // 1. Validation Checks
        if (!fullName) {
          throw new Error('Full Name is required');
        }
        if (!studentClass) {
          throw new Error('Class level is required');
        }
        if (!section) {
          throw new Error('Section is required');
        }

        const parentPhone = fatherMobile || motherMobile || guardianMobile;
        if (!parentPhone) {
          throw new Error('Please specify at least one parent/guardian mobile number');
        }

        // 2. Class & Section mapping checks
        const matchedClass = classesList.find(c => c.name.toUpperCase() === studentClass.toUpperCase());
        if (!matchedClass) {
          throw new Error(`Class '${studentClass}' is not configured for this branch`);
        }

        const matchedSection = dbSections.find(
          s => s.academicClassId === matchedClass.id && s.name.toUpperCase() === section.toUpperCase()
        );
        if (!matchedSection) {
          throw new Error(`Section '${section}' for Class '${studentClass}' is not configured for this branch`);
        }

        // 3. Resolve Parent record
        let parentId = null;
        const existingParent = await getParentByPhone({ branchId, phoneNumber: parentPhone });
        if (existingParent) {
          parentId = existingParent.id;
        } else {
          // Create new parent
          const firebaseUID = `pending:parent:${branchId || 'global'}:${parentPhone}`;
          const parentRes = await createParentWithoutUser({
            firebaseUID,
            branchId,
            fullName: fatherName || motherName || guardianName || `${fullName}'s Parent`,
            fatherName: fatherName || null,
            motherName: motherName || null,
            countryCode: '+91',
            phoneNumber: parentPhone,
            address: null
          });
          parentId = parentRes?.parent_insert?.id;
        }

        if (!parentId) {
          throw new Error('Failed to resolve or create a parent record');
        }

        // 4. Generate Student serial & ID
        const yearPart = admissionDateStr.split('-')[2];
        const admissionYear = yearPart ? parseInt(yearPart, 10) : 2026;
        const serialNumber = await getNextSerial(admissionYear);

        const yearShort = admissionYear.toString().slice(-2);
        const studentId = `${yearShort}${branchCode}${String(serialNumber).padStart(4, '0')}`;

        // 5. Run mutation to persist Student
        await createStudent({
          studentId,
          admissionYear,
          branchCode,
          serialNumber,
          fullName,
          gender,
          dateOfBirth: convertDate(dobStr),
          branchId,
          wingId: matchedClass.wingId || null,
          wingCode: matchedClass.wing?.code || null,
          academicClassId: matchedClass.id,
          sectionId: matchedSection.id,
          parentId,
          phoneNumber: parentPhone,
          admissionDate: convertDate(admissionDateStr)
        });

        successCount++;
      } catch (err) {
        failedCount++;
        failuresList.push(`Row ${rowNum}: ${err.message || 'Unknown insertion error'}`);
      }
    }

    setResults({
      success: successCount,
      failed: failedCount,
      failuresList: failuresList
    });
    
    setShowResults(true);
    setImporting(false);
    addLog(`Bulk import completed: ${successCount} succeeded, ${failedCount} failed`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-24 md:pb-12 max-w-5xl mx-auto space-y-6 select-none font-sans"
    >
      {/* Header bar */}
      <header className="flex items-center gap-4 py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          disabled={importing}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer disabled:opacity-50"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-grow">
          <h1 className="text-sm font-black text-dark font-sans tracking-wide">Bulk Upload</h1>
        </div>
      </header>

      {error && (
        <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-accent-red font-bold animate-[shake_0.5s_ease]">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-sans">
        {/* Left Column: Hero, info and action button */}
        <div className="space-y-6">
          {/* Blue Hero Card */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase font-black">Students</p>
            <h2 className="text-2xl font-bold mt-1 font-sans">Bulk Import</h2>
            <p className="text-xs text-white/85 mt-1 font-medium font-sans leading-relaxed">Paste CSV content exported from your sheet</p>
          </div>

          {/* Required columns info banner */}
          <div className="flex flex-col gap-3.5 p-5 bg-[#EEF5FB] border border-[#1597E5]/15 rounded-[24px] text-[10px] leading-relaxed text-[#1597E5] font-bold">
            <div className="flex gap-3">
              <FiInfo className="w-4 h-4 shrink-0 mt-0.5 text-[#1597E5]" />
              <p>
                Required columns: Full Name, Gender, DOB, Class, Section, and at least one of Father Mobile, Mother Mobile, or Guardian Mobile.
              </p>
            </div>
            <div className="border-t border-[#1597E5]/10 pt-3">
              <p className="text-[9px] uppercase tracking-wider text-[#1597E5]/80 mb-1.5 font-extrabold">Example CSV Row:</p>
              <code className="block bg-white/60 p-2.5 rounded-xl font-mono text-[9px] break-all select-all border border-[#1597E5]/10 text-slate-700">
                Student One,Male,15-08-2015,Rajesh Kumar,9876543210,,,,,2,A,01-06-2026
              </code>
              <p className="text-[8.5px] text-[#1597E5]/75 mt-2 font-medium">
                Enter the student rows directly below the headers and example row in the text box.
              </p>
            </div>
          </div>

          {/* Action button */}
          {!showResults && (
            <button
              onClick={handleImport}
              disabled={importing}
              className={`w-full py-4 rounded-full font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg ${
                importing
                  ? 'bg-slate-300 text-slate-500 shadow-slate-100'
                  : 'bg-[#1597E5] hover:bg-[#00A1FF] text-white shadow-brand-blue/35'
              }`}
            >
              {importing ? (
                <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiOutlineDocumentArrowUp className="w-4 h-4" />
              )}
              <span>{importing ? progressMsg : 'Import Students'}</span>
            </button>
          )}
        </div>

        {/* Right Column: Textarea or Results panel */}
        <div className="lg:col-span-2 space-y-6">
          {!showResults ? (
            <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
              <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest">
                  CSV Content
                </span>
                <span className="text-[9px] text-[#A0AEC0] font-bold">
                  Enter your student rows below the headers and the example row.
                </span>
              </div>

              <textarea
                required
                rows="12"
                disabled={importing}
                placeholder="Paste CSV data here..."
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-[#e2e8f0] rounded-[24px] card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-[10px] font-mono text-dark resize-none disabled:opacity-60"
              />
            </div>
          ) : (
            <div className="bg-white rounded-[28px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-base font-extrabold text-dark">CSV Processed</h2>
                <p className="text-xs text-secondaryText font-medium">Here is the detailed breakdown of the import results</p>
              </div>

              <div className="space-y-4">
                {/* Success Box - Green */}
                <div className="bg-[#E8F8F0] border border-[#23C16B]/30 rounded-[20px] p-5 flex flex-col gap-1">
                  <span className="text-xs font-extrabold text-[#23C16B] flex items-center gap-2">
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
                    <span className="text-xs font-extrabold text-[#EF4444] flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" />
                      {results.failed} Records Failed
                    </span>
                    
                    {/* Details List */}
                    <div className="bg-white/70 rounded-xl p-3 border border-[#EF4444]/10 max-h-[200px] overflow-y-auto space-y-1.5 font-mono text-[9px] text-[#EF4444]/90">
                      {results.failuresList.map((err, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <span className="shrink-0 text-[#EF4444] font-bold">•</span>
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
