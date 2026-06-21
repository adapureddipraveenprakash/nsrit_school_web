import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiUser, FiPhone, FiImage, FiCreditCard,
  FiDroplet, FiHome, FiMapPin, FiMap, FiHash, FiCalendar,
  FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { HiOutlineUserPlus } from 'react-icons/hi2';

const CreateStudent = () => {
  const navigate = useNavigate();
  const { addLog } = useApp();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form Fields State
  const [studentClass, setStudentClass] = useState('');
  const [section, setSection] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [admissionDate, setAdmissionDate] = useState('21-06-2026');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentClass || !section || !fullName || !gender || !dob || !admissionDate) {
      setError('Please fill in all required (*) fields.');
      return;
    }

    setError('');
    setSuccess(true);
    addLog(`Registered student ${fullName} in Class ${studentClass}-${section}`);

    setTimeout(() => {
      setSuccess(false);
      navigate('/settings/global-students');
    }, 1500);
  };

  const classOptions = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sectionOptions = ['A', 'B', 'C', 'D'];
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
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark"
              >
                <option value="">Select</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-secondaryText tracking-wide">Section *</label>
              <select
                required
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark"
              >
                <option value="">Select</option>
                {sectionOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
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
                    placeholder="DD-MM-YYYY"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark placeholder:text-secondaryText/60"
                  />
                  <FiCalendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondaryText tracking-wide">Admission Date *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Admission Date *"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-brand-blue text-xs font-semibold text-dark"
                  />
                  <FiCalendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
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
          className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95"
        >
          <HiOutlineUserPlus className="w-4 h-4" />
          Add Student
        </button>
      </form>
    </motion.div>
  );
};

export default CreateStudent;
