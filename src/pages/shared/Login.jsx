import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { FiPhone, FiSend, FiArrowRight, FiInfo, FiLock, FiChevronDown, FiRefreshCw, FiUsers, FiUser, FiBriefcase, FiDollarSign, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ROLE_META = {
  MAIN_ADMIN:    { label: 'Main Admin',    bg: 'bg-[#EEF5FB]', text: 'text-brand-blue', desc: 'Full system management and branch oversight', icon: 'MA' },
  BRANCH_ADMIN:  { label: 'Branch Admin',  bg: 'bg-[#F0F4FF]', text: 'text-indigo-600', desc: 'Manage a single school branch', icon: 'BA' },
  PRINCIPAL:     { label: 'Principal',     bg: 'bg-[#E8F8F0]', text: 'text-accent-green', desc: 'Academic and staff management', icon: 'PR' },
  COORDINATOR:   { label: 'Coordinator',   bg: 'bg-[#FFF8EE]', text: 'text-accent-orange', desc: 'Manage academic operations and wings', icon: <FiUsers className="w-5 h-5 text-accent-orange" /> },
  TEACHER:       { label: 'Teacher',       bg: 'bg-[#EBFDF5]', text: 'text-[#23C16B]', desc: 'Mark attendance and manage classes', icon: <FiBriefcase className="w-5 h-5 text-[#23C16B]" /> },
  CLASS_TEACHER: { label: 'Class Teacher', bg: 'bg-[#EBFDF5]', text: 'text-[#23C16B]',  desc: 'Class teacher duties and section management', icon: <span className="text-base font-bold text-[#23C16B]">?</span> },
  PARENT:        { label: 'Parent',        bg: 'bg-[#EEF5FB]', text: 'text-brand-blue', desc: 'View child attendance, fees and homework', icon: <FiUser className="w-5 h-5 text-brand-blue" /> },
  ACCOUNTANT:    { label: 'Accountant',    bg: 'bg-[#FFF3E0]', text: 'text-accent-orange', desc: 'Fee collection and financial records', icon: <FiDollarSign className="w-5 h-5 text-accent-orange" /> },
  FRONT_DESK:    { label: 'Front Desk',    bg: 'bg-[#F5F0FF]', text: 'text-purple-600', desc: 'Reception and student enquiries', icon: 'FD' },
};

const Login = () => {
  const { sendOtp, verifyOtp, switchRole, authLoading, authError, clearAuthError, verificationId, user, roleSelectionPending, setRoleSelectionPending, logout } = useApp();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [localError, setLocalError] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [multiRoleUser, setMultiRoleUser] = useState(null); // user object returned after login with multiple roles

  const error = authError || localError;

  // Auto-advance to OTP screen when verificationId is set
  useEffect(() => {
    if (verificationId) {
      setShowOtpScreen(true);
      setTimer(60);
    }
  }, [verificationId]);

  // OTP countdown timer
  useEffect(() => {
    if (!showOtpScreen || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [showOtpScreen, timer]);

  // If user logged in and has multiple roles, show role selector
  useEffect(() => {
    if (user && Array.isArray(user.roles) && user.roles.length > 1 && !showRoleSelector) {
      setMultiRoleUser(user);
      setShowRoleSelector(true);
    }
  }, [user]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();
    if (!phoneNumber || phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      setLocalError('Please enter a valid 10-digit phone number');
      return;
    }
    await sendOtp({ countryCode: '+91', phoneNumber });
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) {
        prev.focus();
        const newOtp = [...otpCode];
        newOtp[index - 1] = '';
        setOtpCode(newOtp);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();
    const code = otpCode.join('');
    if (code.length !== 6) { setLocalError('Please enter the complete 6-digit code'); return; }
    await verifyOtp({ otp: code });
    // If user has multiple roles → useEffect will trigger role selector
  };

  const handleResendOtp = async () => {
    setOtpCode(['', '', '', '', '', '']);
    setTimer(60);
    clearAuthError();
    setLocalError('');
    await sendOtp({ countryCode: '+91', phoneNumber });
  };

  const handleSelectRole = async (role) => {
    try {
      await switchRole(role);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#EEF5FB] flex flex-col justify-center items-center px-4 py-8 overflow-hidden">
      {/* Invisible reCAPTCHA container — required by Firebase Phone Auth on web */}
      <div id="recaptcha-container" />

      {/* Decorative background circles */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#1597E5]/5 pointer-events-none blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1e88e5]/5 pointer-events-none blur-3xl" />
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#EEF5FB] card-shadow-sm pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center mb-8 z-10 text-center">
        <div className="w-24 h-24 bg-white rounded-[24px] card-shadow flex items-center justify-center mb-4 border border-[#e2e8f0]/40 relative overflow-hidden group">
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-blue" />
          <span className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-brand-blue" />
          <span className="text-brand-blue text-4xl transform group-hover:scale-110 transition-transform">🎓</span>
        </div>
        <h2 className="text-3xl font-extrabold text-[#1597E5] tracking-tight">NSRIT Connect</h2>
        <p className="text-sm text-secondaryText font-medium mt-1">Enterprise School Management</p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F8F0] border border-[#23C16B]/30 rounded-full mt-4 text-[11px] font-bold text-accent-green">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
          Secured with Firebase
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white rounded-card card-shadow border border-[#e2e8f0]/40 p-8 z-10 relative overflow-hidden">
        <div className="absolute top-0 left-8 w-16 h-[4px] bg-brand-blue rounded-b" />

        <AnimatePresence mode="wait">

          {/* ── Role Selector (multi-role user) ──────────────────────────── */}
          {showRoleSelector && multiRoleUser ? (
            <motion.div key="role-selector"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }} className="flex flex-col items-center text-center">

              <div className="w-20 h-20 rounded-full bg-[#1597E5] text-white flex items-center justify-center font-bold text-2xl mb-4 shadow-sm border border-white/20 select-none font-sans">
                {(multiRoleUser.name || multiRoleUser.fullName || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <p className="text-[10px] text-secondaryText font-bold uppercase tracking-wide">Welcome back</p>
              <h2 className="text-xl font-black text-dark tracking-tight mt-0.5">{multiRoleUser.name || multiRoleUser.fullName}</h2>
              <p className="text-xs text-secondaryText leading-relaxed mt-1.5 mb-6 font-medium">
                This account has multiple roles.<br />Select how you want to sign in.
              </p>

              <div className="w-full text-left">
                <p className="text-[9px] font-black text-secondaryText tracking-widest uppercase mb-3 px-1">SELECT AN ACCOUNT</p>
                <div className="bg-white rounded-2xl border border-[#e2e8f0]/70 overflow-hidden divide-y divide-[#e2e8f0]/70 card-shadow-sm">
                  {(multiRoleUser.roles || []).map((role) => {
                    const meta = ROLE_META[role] || { label: role, bg: 'bg-gray-100', text: 'text-gray-600', desc: '' };
                    return (
                      <div key={role} onClick={() => handleSelectRole(role)}
                        className="flex justify-between items-center p-4 hover:bg-[#EEF5FB]/30 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center shrink-0`}>
                            {typeof meta.icon === 'string' ? <span className="text-xs font-black">{meta.icon}</span> : meta.icon}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-dark group-hover:text-[#1597E5] transition-colors">{meta.label}</h4>
                            <p className="text-[9.5px] text-secondaryText mt-0.5 font-medium">{meta.desc}</p>
                          </div>
                        </div>
                        <span className="text-secondaryText text-sm group-hover:translate-x-0.5 transition-transform">›</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {localError && <p className="mt-4 text-xs text-red-500 font-semibold">{localError}</p>}
              
              <button
                type="button"
                onClick={() => {
                  setShowRoleSelector(false);
                  setMultiRoleUser(null);
                  setRoleSelectionPending(false);
                  logout();
                }}
                className="mt-8 flex items-center gap-1.5 text-xs text-secondaryText hover:text-dark font-semibold transition-all cursor-pointer"
              >
                <FiLogOut className="w-3.5 h-3.5" />
                <span>Use a different account</span>
              </button>
            </motion.div>

          ) : !showOtpScreen ? (
            /* ── Phone number entry ──────────────────────────────────────── */
            <motion.div key="phone-input"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}>

              <h3 className="text-2xl font-bold text-dark mb-2">Sign In</h3>
              <p className="text-xs text-secondaryText leading-relaxed mb-6 font-medium">
                Enter your registered phone number to receive a one-time verification code
              </p>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-secondaryText tracking-wider uppercase block mb-2 flex items-center gap-1">
                    <FiPhone className="w-3 h-3" /> Phone Number
                  </label>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 px-3.5 py-3.5 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset font-semibold text-sm select-none">
                      <span className="text-base">🇮🇳</span>
                      <span className="text-dark">+91</span>
                      <FiChevronDown className="w-3.5 h-3.5 text-secondaryText ml-0.5" />
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="tel" maxLength="10" placeholder="10-digit number"
                        value={phoneNumber}
                        onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, '')); setLocalError(''); clearAuthError(); }}
                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-sm font-semibold transition-all"
                      />
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

                <button type="submit" disabled={authLoading}
                  className="w-full py-4 bg-brand-blue hover:bg-brand-secondary text-white rounded-btn font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all text-sm group active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                  {authLoading ? (
                    <><FiRefreshCw className="w-4 h-4 animate-spin" /> Sending OTP…</>
                  ) : (
                    <><FiSend className="w-4 h-4" /> Send OTP <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-secondaryText font-medium">
                <FiInfo className="w-3.5 h-3.5" />
                OTP valid for 60 seconds • Standard rates apply
              </div>
            </motion.div>

          ) : (
            /* ── OTP entry ───────────────────────────────────────────────── */
            <motion.div key="otp-input"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}>

              <h3 className="text-2xl font-bold text-dark mb-2">Verify OTP</h3>
              <p className="text-xs text-secondaryText leading-relaxed mb-6 font-medium">
                Enter the 6-digit code sent to <strong className="text-dark">+91 {phoneNumber}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-between gap-2">
                  {otpCode.map((digit, index) => (
                    <input key={index} id={`otp-${index}`}
                      type="text" maxLength="1" value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-bold border border-[#e2e8f0] rounded-xl bg-white card-shadow-inset focus:outline-none focus:border-brand-blue"
                    />
                  ))}
                </div>

                {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

                <button type="submit" disabled={authLoading}
                  className="w-full py-4 bg-brand-blue hover:bg-brand-secondary text-white rounded-btn font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all text-sm group active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                  {authLoading ? (
                    <><FiRefreshCw className="w-4 h-4 animate-spin" /> Verifying…</>
                  ) : (
                    <><FiLock className="w-4 h-4" /> Verify &amp; Sign In <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                  )}
                </button>
              </form>

              <div className="mt-6 flex justify-between items-center text-xs font-semibold">
                {timer > 0 ? (
                  <p className="text-secondaryText">Resend in <span className="text-dark">{timer}s</span></p>
                ) : (
                  <button onClick={handleResendOtp} disabled={authLoading} className="text-brand-blue hover:underline disabled:opacity-50">
                    Resend OTP
                  </button>
                )}
                <button type="button" onClick={() => { setShowOtpScreen(false); clearAuthError(); setLocalError(''); setOtpCode(['','','','','','']); }}
                  className="text-secondaryText hover:underline">
                  Change Number
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-8 text-xs font-semibold text-secondaryText z-10">
        Having trouble? <a href="#" className="text-[#1597E5] hover:underline">Contact Admin</a>
      </p>
    </div>
  );
};

export default Login;
