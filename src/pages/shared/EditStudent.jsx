import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiUser, FiPhone, FiImage, FiCreditCard,
  FiDroplet, FiHome, FiMapPin, FiMap, FiHash, FiCalendar,
  FiCheckCircle, FiAlertCircle, FiShield, FiSave, FiUpload
} from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import {
  getStudentDetails,
  getAcademicClasses,
  getSectionsByClass,
  updateStudent
} from '../../services/dataService';

const EditStudent = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { addLog, user } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Loaded IDs
  const [parentId, setParentId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [studentAdmissionNo, setStudentAdmissionNo] = useState('');

  // Form Fields State
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');

  // Parent Info
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Optional Info
  const [photoUrl, setPhotoUrl] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [transportRequired, setTransportRequired] = useState('No');
  const [apaarId, setApaarId] = useState('');

  // Documents
  const [tcUrl, setTcUrl] = useState('');
  const [birthCertUrl, setBirthCertUrl] = useState('');

  // Address
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [pincode, setPincode] = useState('');

  // Dropdowns lists
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);

  // Date parsing helper: convert DB date (YYYY-MM-DD) to input format (YYYY-MM-DD)
  const parseToInputDate = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  useEffect(() => {
    if (!studentId) return;

    const loadStudentData = async () => {
      try {
        const res = await getStudentDetails(studentId);
        if (res && res.student) {
          const s = res.student;
          setBranchId(s.branchId || '');
          setParentId(s.parentId || '');
          setStudentAdmissionNo(s.studentId || '');

          setFullName(s.fullName || '');
          setGender(s.gender || '');
          setDob(parseToInputDate(s.dateOfBirth));
          setAdmissionDate(parseToInputDate(s.admissionDate));

          setSelectedClassId(s.academicClassId || '');
          setSelectedSectionId(s.sectionId || '');

          setFatherName(s.parent?.fatherName || s.parent?.fullName || '');
          setMotherName(s.parent?.motherName || '');
          setParentPhone(s.parent?.phoneNumber || '');

          setPhotoUrl(s.photoUrl || '');
          setAadhaarNumber(s.aadhaarNumber || '');
          setBloodGroup(s.bloodGroup || '');
          setEmergencyContact(s.emergencyContact || '');
          setTransportRequired(s.transportRequired ? 'Yes' : 'No');

          setTcUrl(s.transferCertificateUrl || '');
          setBirthCertUrl(s.birthCertificateUrl || '');

          setAddress(s.address || '');
          setCity(s.city || '');
          setStateField(s.state || '');
          setPincode(s.pincode || '');

          // Load classes for this branch
          const classes = await getAcademicClasses();
          const branchClasses = classes.filter(c => c.branchId === (s.branchId || user?.branchId));
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

          // Load sections for selected class
          if (s.academicClassId) {
            const sections = await getSectionsByClass(s.academicClassId);
            setSectionsList(sections);
          }
        }
      } catch (err) {
        console.error('Error loading student profile for editing:', err);
        setError('Error loading student profile.');
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [studentId, user]);

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

  const handleFileUpload = (type, fileName) => {
    const mockUrl = `https://example.com/documents/${type}_${fileName}`;
    if (type === 'tc') {
      setTcUrl(mockUrl);
    } else {
      setBirthCertUrl(mockUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please provide student name.');
      return;
    }
    if (!selectedClassId || !selectedSectionId) {
      setError('Please select class and section.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateStudent({
        studentId,
        parentId,
        branchId,
        fullName,
        gender: gender || null,
        dateOfBirth: dob || null,
        photoUrl: photoUrl || null,
        aadhaarNumber: aadhaarNumber || null,
        bloodGroup: bloodGroup || null,
        academicClassId: selectedClassId,
        sectionId: selectedSectionId,
        countryCode: '+91',
        phoneNumber: parentPhone || null,
        address: address || null,
        city: city || null,
        state: stateField || null,
        pincode: pincode || null,
        emergencyContact: emergencyContact || null,
        transportRequired: transportRequired === 'Yes',
        admissionDate: admissionDate || null,
        fatherName: fatherName || null,
        motherName: motherName || null,
        parentPhoneNumber: parentPhone || null
      });

      setSuccess(true);
      addLog(`Updated student profile for ${fullName} (${studentAdmissionNo})`);

      setTimeout(() => {
        setSuccess(false);
        navigate(`/settings/student/${studentId}`);
      }, 1500);

    } catch (err) {
      console.error('Error saving student details:', err);
      setError(err.message || 'An error occurred while saving student details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1597E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const genderOptions = ['Male', 'Female', 'Other'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-24 md:pb-12 max-w-[640px] mx-auto space-y-6 select-none font-sans bg-gradient-to-b from-[#F3F8FC] to-[#F7FAFD] min-h-screen"
    >
      {/* Top Header Bar */}
      <header className="flex items-center gap-4 py-2 border-b border-[#e2e8f0]/45 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black text-dark tracking-tight">Edit Student</h1>
      </header>

      {success && (
        <div className="bg-[#E8F8F0] border border-[#23C16B]/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-accent-green font-bold animate-[bounce_0.5s_ease]">
          <FiCheckCircle className="w-4 h-4 shrink-0" />
          <span>Student profile updated successfully!</span>
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
        <div className="relative rounded-[28px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
          <p className="text-[9.5px] text-white/70 font-extrabold uppercase tracking-wider">Students</p>
          <h2 className="text-2xl font-black mt-1 uppercase">{fullName || 'Edit Student'}</h2>
          <p className="text-[10px] text-white/85 mt-1 font-bold">Admission number cannot be changed</p>
        </div>

        {/* 1. CLASS & SECTION CARD */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/30 px-5 py-3.5 border-b border-[#e2e8f0]/50">
            <span className="text-[9.5px] font-black text-[#A0AEC0] uppercase tracking-wider">
              Class & Section
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Class</label>
              <select
                required
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#1597E5] text-xs font-semibold text-dark cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23718096%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_16px_center] bg-no-repeat"
              >
                <option value="">Select Class</option>
                {classesList.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Section</label>
              <select
                required
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#1597E5] text-xs font-semibold text-dark cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23718096%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_16px_center] bg-no-repeat"
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
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/30 px-5 py-3.5 border-b border-[#e2e8f0]/50">
            <span className="text-[9.5px] font-black text-[#A0AEC0] uppercase tracking-wider">
              Student Info
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Student Name</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiUser className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Student Name *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Gender</label>
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#1597E5] text-xs font-semibold text-dark cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23718096%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_16px_center] bg-no-repeat"
              >
                <option value="">Select Gender</option>
                {genderOptions.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Date of Birth</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full text-xs font-semibold text-dark focus:outline-none bg-transparent cursor-pointer"
                />
                <FiCalendar className="w-4 h-4 text-secondaryText shrink-0 cursor-pointer pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Admission Date</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <input
                  type="date"
                  required
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full text-xs font-semibold text-dark focus:outline-none bg-transparent cursor-pointer"
                />
                <FiCalendar className="w-4 h-4 text-secondaryText shrink-0 cursor-pointer pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. PARENT INFO CARD */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/30 px-5 py-3.5 border-b border-[#e2e8f0]/50">
            <span className="text-[9.5px] font-black text-[#A0AEC0] uppercase tracking-wider">
              Parent Info
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Father Name</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiUser className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Father Name"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Mother Name</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiUser className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Mother Name"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Parent Mobile</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiPhone className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="tel"
                  placeholder="Parent Mobile"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. OPTIONAL DETAILS CARD */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/30 px-5 py-3.5 border-b border-[#e2e8f0]/50">
            <span className="text-[9.5px] font-black text-[#A0AEC0] uppercase tracking-wider">
              Optional
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase font-bold">Photo URL</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiImage className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Student Photo URL"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
              <p className="text-[8.5px] text-[#A0AEC0] font-bold pl-1">Leave blank to keep existing</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Apaar ID</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiShield className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Apaar ID"
                  value={apaarId}
                  onChange={(e) => setApaarId(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Blood Group</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiDroplet className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Blood Group"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Emergency Contact</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiPhone className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="tel"
                  placeholder="Emergency Contact"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Transport Required</label>
              <select
                value={transportRequired}
                onChange={(e) => setTransportRequired(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#1597E5] text-xs font-semibold text-dark cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23718096%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_16px_center] bg-no-repeat"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. DOCUMENTS CARD */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/30 px-5 py-3.5 border-b border-[#e2e8f0]/50">
            <span className="text-[9.5px] font-black text-[#A0AEC0] uppercase tracking-wider">
              Documents
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-[#e2e8f0]/20">
              <div>
                <p className="text-xs font-black text-dark">Transfer Certificate</p>
                <p className="text-[9px] text-secondaryText font-bold mt-0.5">
                  {tcUrl ? 'TC Uploaded' : 'Not uploaded'}
                </p>
              </div>
              <label className="px-4 py-1.5 bg-[#EBF8FF] text-[#1597E5] text-[10px] font-black rounded-lg hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1">
                <FiUpload className="w-3 h-3" />
                <span>Upload</span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload('tc', e.target.files[0].name);
                    }
                  }} 
                />
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-black text-dark">Birth Certificate</p>
                <p className="text-[9px] text-secondaryText font-bold mt-0.5">
                  {birthCertUrl ? 'Birth Certificate Uploaded' : 'Not uploaded'}
                </p>
              </div>
              <label className="px-4 py-1.5 bg-[#EBF8FF] text-[#1597E5] text-[10px] font-black rounded-lg hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1">
                <FiUpload className="w-3 h-3" />
                <span>Upload</span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload('birth', e.target.files[0].name);
                    }
                  }} 
                />
              </label>
            </div>
          </div>
        </div>

        {/* 6. ADDRESS CARD */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/45 overflow-hidden card-shadow">
          <div className="bg-[#EEF5FB]/30 px-5 py-3.5 border-b border-[#e2e8f0]/50">
            <span className="text-[9.5px] font-black text-[#A0AEC0] uppercase tracking-wider">
              Address Details
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Address</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiHome className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">City</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiMapPin className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">State</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiMap className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="State"
                  value={stateField}
                  onChange={(e) => setStateField(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-secondaryText tracking-wide uppercase">Pincode</label>
              <div className="relative flex items-center bg-white border border-[#e2e8f0] rounded-xl px-3 py-3.5 focus-within:border-[#1597E5]">
                <FiHash className="w-4 h-4 text-secondaryText mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full text-xs font-semibold text-dark placeholder:text-[#A0AEC0] focus:outline-none bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-4 text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ${
            saving 
              ? 'bg-[#1597E5]/70 shadow-none cursor-not-allowed'
              : 'bg-[#1597E5] hover:bg-[#00A1FF] shadow-brand-blue/35'
          }`}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiSave className="w-4 h-4" />
          )}
          {saving ? 'Saving Student...' : 'Save Student'}
        </button>
      </form>
    </motion.div>
  );
};

export default EditStudent;
