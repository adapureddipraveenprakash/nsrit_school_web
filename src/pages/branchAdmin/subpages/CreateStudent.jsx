import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiUser, FiPhone, FiImage, FiCreditCard,
  FiDroplet, FiHome, FiMapPin, FiMap, FiHash, FiCalendar,
  FiCheckCircle, FiAlertCircle, FiChevronsLeft, FiChevronsRight,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { HiOutlineUserPlus } from 'react-icons/hi2';
import {
  getAcademicClasses,
  getSectionsByClass,
  getParentByPhone,
  createParentWithoutUser,
  createStudent
} from '../../../services/dataService';
import dataConnectClient from '../../../services/dataConnectClient';

const CreateStudent = () => {
  const navigate = useNavigate();
  const { addLog, user } = useApp();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [admissionDate, setAdmissionDate] = useState('21-06-2026');

  // Lists loaded from database
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);

  const branchId = user?.branchId;
  const branchCode = user?.branchCode || 'SO';

  useEffect(() => {
    if (branchId) {
      getAcademicClasses().then(list => {
        const branchClasses = list.filter(c => c.branchId === branchId);
        const seen = new Set();
        const unique = [];
        branchClasses.forEach(c => {
          const nameKey = c.name.toUpperCase();
          if (!seen.has(nameKey)) {
            seen.add(nameKey);
            unique.push(c);
          }
        });
        const order = ['NURSERY', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'];
        const sorted = unique.sort((a, b) => order.indexOf(a.name.toUpperCase()) - order.indexOf(b.name.toUpperCase()));
        setClassesList(sorted);
      }).catch(err => {
        console.error('Error fetching academic classes:', err);
      });
    }
  }, [branchId]);

  const handleClassChange = async (classId) => {
    setSelectedClassId(classId);
    setSelectedSectionId('');
    setSectionsList([]);
    if (classId) {
      try {
        const list = await getSectionsByClass(classId);
        setSectionsList(list);
      } catch (err) {
        console.error('Error fetching sections for class:', err);
      }
    }
  };

  // Custom Calendar State
  const [activePicker, setActivePicker] = useState(null); // 'dob' | 'admission' | null
  const [viewMonth, setViewMonth] = useState(5); // 0-based, June
  const [viewYear, setViewYear] = useState(2026);
  const [tempDay, setTempDay] = useState(9);

  const parseDateString = (str) => {
    if (!str) return null;
    const parts = str.split('-');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1; // 0-based
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return { day: d, month: m, year: y };
      }
    }
    return null;
  };

  const formatDate = (d, m, y) => {
    const dd = String(d).padStart(2, '0');
    const mm = String(m + 1).padStart(2, '0');
    const yyyy = y;
    return `${dd}-${mm}-${yyyy}`;
  };

  const openCalendar = (field) => {
    const value = field === 'dob' ? dob : admissionDate;
    const parsed = parseDateString(value);
    if (parsed) {
      setViewMonth(parsed.month);
      setViewYear(parsed.year);
      setTempDay(parsed.day);
    } else {
      setViewMonth(5); // June
      setViewYear(2026);
      setTempDay(9);
    }
    setActivePicker(field);
  };

  const selectDay = (day) => {
    const formatted = formatDate(day, viewMonth, viewYear);
    if (activePicker === 'dob') {
      setDob(formatted);
    } else {
      setAdmissionDate(formatted);
    }
    setActivePicker(null);
  };

  const selectToday = () => {
    const formatted = formatDate(23, 5, 2026); // 23-06-2026 (matching June 23, 2026 context)
    if (activePicker === 'dob') {
      setDob(formatted);
    } else {
      setAdmissionDate(formatted);
    }
    setActivePicker(null);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const prevYear = () => {
    setViewYear(prev => prev - 1);
  };

  const nextYear = () => {
    setViewYear(prev => prev + 1);
  };

  const getYearsRange = () => {
    const current = 2026;
    if (activePicker === 'dob') {
      const range = [];
      for (let y = 1995; y <= current; y++) {
        range.push(y);
      }
      return range;
    } else {
      const range = [];
      for (let y = 2015; y <= 2035; y++) {
        range.push(y);
      }
      return range;
    }
  };

  const [fatherName, setFatherName] = useState('');
  const [fatherMobile, setFatherMobile] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherMobile, setMotherMobile] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianMobile, setGuardianMobile] = useState('');

  const [photoUrl, setPhotoUrl] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [transportRequired, setTransportRequired] = useState('No');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [pincode, setPincode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSectionId || !fullName || !gender || !dob || !admissionDate) {
      setError('Please fill in all required (*) fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedClassObj = classesList.find(c => c.id === selectedClassId);
      if (!selectedClassObj) {
        throw new Error('Selected class not found');
      }

      // Step 1: Manage Parent details
      const parentPhone = fatherMobile || motherMobile || guardianMobile;
      if (!parentPhone) {
        throw new Error('Please specify at least one parent/guardian contact number.');
      }

      // Check if parent exists
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
          address: address || null
        });
        parentId = parentRes?.parent_insert?.id;
      }

      if (!parentId) {
        throw new Error('Failed to resolve or create a parent record.');
      }

      // Step 2: Determine Year & Serial Number
      const yearPart = admissionDate.split('-')[2];
      const admissionYear = yearPart ? parseInt(yearPart, 10) : 2026;

      // Fetch last student serial
      const lastSerialRes = await dataConnectClient.query('GetLastStudentSerial', {
        admissionYear,
        branchCode
      });
      const lastSerial = lastSerialRes?.students?.[0]?.serialNumber || 0;
      const serialNumber = lastSerial + 1;

      // Generate student ID
      const yearShort = admissionYear.toString().slice(-2);
      const studentId = `${yearShort}${branchCode}${String(serialNumber).padStart(4, '0')}`;

      // Convert date string from DD-MM-YYYY to YYYY-MM-DD
      const convertDate = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
      };

      // Step 3: Create student record
      await createStudent({
        studentId,
        admissionYear,
        branchCode,
        serialNumber,
        fullName,
        gender,
        dateOfBirth: convertDate(dob),
        photoUrl: photoUrl || null,
        aadhaarNumber: aadhaarNumber || null,
        bloodGroup: bloodGroup || null,
        branchId,
        wingId: selectedClassObj.wingId,
        wingCode: selectedClassObj.wing?.code || null,
        academicClassId: selectedClassId,
        sectionId: selectedSectionId,
        parentId,
        countryCode: '+91',
        phoneNumber: parentPhone,
        address: address || null,
        city: city || null,
        state: stateField || null,
        pincode: pincode || null,
        emergencyContact: emergencyContact || null,
        transportRequired: transportRequired === 'Yes',
        admissionDate: convertDate(admissionDate)
      });

      setSuccess(true);
      addLog(`Registered student ${fullName} with ID ${studentId} in Class ${selectedClassObj.name}`);

      setTimeout(() => {
        setSuccess(false);
        navigate('/settings/global-students');
      }, 1500);

    } catch (err) {
      console.error('Error creating student:', err);
      setError(err.message || 'An error occurred while adding student.');
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = ['Male', 'Female', 'Other'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-24 md:pb-12 max-w-3xl mx-auto space-y-6"
    >
      {/* Header Bar */}
      <header className="flex items-center gap-4 py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-grow">
          <h1 className="text-sm font-bold text-dark">Create Student</h1>
        </div>
      </header>

      {success && (
        <div className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-accent-green font-bold animate-[bounce_0.5s_ease]">
          <FiCheckCircle className="w-4 h-4 shrink-0" />
          <span>Student created successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-accent-red font-bold animate-[shake_0.5s_ease]">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Blue Hero Banner Card */}
        <div className="relative rounded-[24px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
          <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Students</p>
          <h2 className="text-2xl font-bold mt-1">Add Student</h2>
          <p className="text-xs text-white/85 mt-1 font-medium">Branch and admission number are assigned automatically</p>
        </div>

        {/* 1. CLASS & SECTION CARD */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/40 px-6 py-3.5 border-b border-[#e2e8f0]/60">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              Class & Section
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-secondaryText tracking-wide">Class *</label>
              <select
                required
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark"
              >
                <option value="">Select Class</option>
                {classesList.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-secondaryText tracking-wide">Section *</label>
              <select
                required
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark"
                disabled={!selectedClassId}
              >
                <option value="">Select Section</option>
                {sectionsList.map((sec) => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. STUDENT INFO CARD */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/40 px-6 py-3.5 border-b border-[#e2e8f0]/60">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              Student Info
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryText tracking-wide">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
                  />
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryText tracking-wide">Gender *</label>
                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark"
                >
                  <option value="">Select</option>
                  {genderOptions.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryText tracking-wide">Date of Birth *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="DD-MM-YYYY"
                    value={dob}
                    onClick={() => openCalendar('dob')}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60 cursor-pointer"
                  />
                  <FiCalendar 
                    onClick={() => openCalendar('dob')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText cursor-pointer hover:text-brand-blue transition-colors" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryText tracking-wide">Admission Date *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Admission Date *"
                    value={admissionDate}
                    onClick={() => openCalendar('admission')}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark cursor-pointer"
                  />
                  <FiCalendar 
                    onClick={() => openCalendar('admission')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText cursor-pointer hover:text-brand-blue transition-colors" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PARENT INFO CARD */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/40 px-6 py-3.5 border-b border-[#e2e8f0]/60">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              Parent Info
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryText tracking-wide">Father Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Father Name"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
                  />
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryText tracking-wide">Father Mobile</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Father Mobile"
                    value={fatherMobile}
                    onChange={(e) => setFatherMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
                  />
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryText tracking-wide">Mother Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Mother Name"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
                  />
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryText tracking-wide">Mother Mobile</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Mother Mobile"
                    value={motherMobile}
                    onChange={(e) => setMotherMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
                  />
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryText tracking-wide">Guardian Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Guardian Name"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
                  />
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryText tracking-wide">Guardian Mobile</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Guardian Mobile"
                    value={guardianMobile}
                    onChange={(e) => setGuardianMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
                  />
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. OPTIONAL DETAILS CARD (Moved to end of page before Address) */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/40 px-6 py-3.5 border-b border-[#e2e8f0]/60">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              Optional
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Student Photo URL"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
              />
              <FiImage className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Aadhaar Number"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
              />
              <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
              />
              <FiDroplet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            </div>

            <div className="relative">
              <input
                type="tel"
                placeholder="Emergency Contact"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
              />
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-secondaryText tracking-wide">Transport Required</label>
              <select
                value={transportRequired}
                onChange={(e) => setTransportRequired(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. ADDRESS CARD */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/40 px-6 py-3.5 border-b border-[#e2e8f0]/60">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
              Address Details
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
              />
              <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-1">
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
                />
                <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
              </div>

              <div className="relative md:col-span-1">
                <input
                  type="text"
                  placeholder="State"
                  value={stateField}
                  onChange={(e) => setStateField(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
                />
                <FiMap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
              </div>

              <div className="relative md:col-span-1">
                <input
                  type="text"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
                />
                <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit button (At the very end of the page) */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ${
            loading 
              ? 'bg-[#1597E5]/70 shadow-none cursor-not-allowed'
              : 'bg-[#1597E5] hover:bg-[#00A1FF] shadow-brand-blue/35'
          }`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiOutlineUserPlus className="w-4 h-4" />
          )}
          {loading ? 'Adding Student...' : 'Add Student'}
        </button>
      </form>

      {/* Custom Calendar Overlay Modal */}
      {activePicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[32px] w-full max-w-[340px] p-5 shadow-2xl space-y-4 border border-[#e2e8f0]/60 animate-[scaleUp_0.2s_ease-out]">
            {/* Header controls: <<  <  Month  >  >> */}
            <div className="flex items-center justify-between text-dark">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={prevYear}
                  className="p-1.5 hover:bg-[#EEF5FB] rounded-lg transition-colors cursor-pointer text-secondaryText"
                >
                  <FiChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-[#EEF5FB] rounded-lg transition-colors cursor-pointer text-secondaryText"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center">
                <h4 className="text-sm font-extrabold text-dark leading-tight">
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][viewMonth]}
                </h4>
                <p className="text-[10px] text-[#A0AEC0] font-bold mt-0.5">{viewYear}</p>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-[#EEF5FB] rounded-lg transition-colors cursor-pointer text-secondaryText"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextYear}
                  className="p-1.5 hover:bg-[#EEF5FB] rounded-lg transition-colors cursor-pointer text-secondaryText"
                >
                  <FiChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Year Selector */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-secondaryText/80 tracking-wider uppercase block">Year</span>
              <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none select-none">
                {getYearsRange().map((y) => {
                  const isSelected = y === viewYear;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setViewYear(y)}
                      className={`px-3.5 py-1.5 rounded-full text-[10px] font-extrabold shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1597E5] text-white shadow-sm shadow-[#1597E5]/30'
                          : 'bg-[#EEF5FB] text-secondaryText hover:bg-slate-100'
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Month Selector */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-secondaryText/80 tracking-wider uppercase block">Month</span>
              <div className="grid grid-cols-3 gap-1.5">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((mName, idx) => {
                  const isSelected = idx === viewMonth;
                  return (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => setViewMonth(idx)}
                      className={`py-1.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#1597E5] text-white shadow-sm shadow-[#1597E5]/30'
                          : 'bg-[#EEF5FB] text-secondaryText hover:bg-slate-100'
                      }`}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Days Grid */}
            <div className="space-y-1.5 pt-1">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-[#A0AEC0] uppercase tracking-wider">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayChar, i) => (
                  <span key={i}>{dayChar}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty cells before the start of the month */}
                {Array.from({ length: new Date(viewYear, viewMonth, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Days of the month */}
                {Array.from({ length: new Date(viewYear, viewMonth + 1, 0).getDate() }).map((_, i) => {
                  const dayNum = i + 1;
                  const isSelected = dayNum === tempDay;
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => selectDay(dayNum)}
                      className={`w-7.5 h-7.5 rounded-full flex items-center justify-center mx-auto text-[10px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1597E5] text-white shadow-md shadow-[#1597E5]/20 font-black'
                          : 'text-dark hover:bg-[#EEF5FB] font-semibold'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2.5 border-t border-[#e2e8f0]/40">
              <button
                type="button"
                onClick={() => setActivePicker(null)}
                className="text-[11px] font-bold text-secondaryText hover:text-dark px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={selectToday}
                className="px-4 py-1.5 border border-[#1597E5] text-[#1597E5] hover:bg-[#1597E5]/5 rounded-xl text-[11px] font-bold active:scale-95 transition-all cursor-pointer"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CreateStudent;
