import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FiPhone, FiSend, FiArrowRight, FiInfo, FiLock, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const { login } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);

  // Timer countdown for OTP
  useEffect(() => {
    let interval;
    if (showOtpScreen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpScreen, timer]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setShowOtpScreen(true);
    setTimer(60);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otpCode];
        newOtp[index - 1] = '';
        setOtpCode(newOtp);
      }
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    // Simulation bypass: allow any 6-digit OTP code to log in
    setError('');
    login(phoneNumber);
  };

  return (
    <div className="relative min-h-screen bg-[#EEF5FB] flex flex-col justify-center items-center px-4 py-8 overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#1597E5]/5 pointer-events-none blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1e88e5]/5 pointer-events-none blur-3xl" />
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#EEF5FB] card-shadow-sm pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col items-center mb-8 z-10 text-center">
        {/* Graduation cap logo card */}
        <div className="w-24 h-24 bg-white rounded-[24px] card-shadow flex items-center justify-center mb-4 border border-[#e2e8f0]/40 relative overflow-hidden group">
          {/* Decorative blue dot indicators */}
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-blue" />
          <span className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-brand-blue" />
          <span className="text-brand-blue text-4xl transform group-hover:scale-110 transition-transform">🎓</span>
        </div>
        
        <h2 className="text-3xl font-extrabold text-[#1597E5] tracking-tight">NSRIT Connect</h2>
        <p className="text-sm text-secondaryText font-medium mt-1">Enterprise School Management</p>

        {/* Secured with Firebase Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F8F0] border border-[#23C16B]/30 rounded-full mt-4 text-[11px] font-bold text-accent-green">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
          Secured with Firebase
        </div>
      </div>

      {/* Main Login / OTP Card */}
      <div className="w-full max-w-[420px] bg-white rounded-card card-shadow border border-[#e2e8f0]/40 p-8 z-10 relative overflow-hidden">
        {/* Left top accent bar */}
        <div className="absolute top-0 left-8 w-16 h-[4px] bg-brand-blue rounded-b" />

        <AnimatePresence mode="wait">
          {!showOtpScreen ? (
            <motion.div
              key="phone-input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
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
                    {/* Country Code Selector */}
                    <div className="flex items-center gap-1.5 px-3.5 py-3.5 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset cursor-pointer font-semibold text-sm select-none">
                      <span className="text-base">🇮🇳</span>
                      <span className="text-dark">+91</span>
                      <FiChevronDown className="w-3.5 h-3.5 text-secondaryText ml-0.5" />
                    </div>

                    {/* Phone Input */}
                    <div className="flex-1 relative">
                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="10-digit number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#e2e8f0] rounded-input card-shadow-inset focus:outline-none focus:border-brand-blue/60 text-sm font-semibold transition-all"
                      />
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-accent-red font-semibold">{error}</p>}

                {/* Send OTP Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-brand-blue hover:bg-brand-secondary text-white rounded-btn font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all text-sm group active:scale-95"
                >
                  <FiSend className="w-4 h-4" />
                  Send OTP
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>

              {/* Card Footer */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-secondaryText font-medium">
                <FiInfo className="w-3.5 h-3.5 text-secondaryText" />
                OTP valid for 60 seconds • Standard rates apply
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp-input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-dark mb-2">Verify OTP</h3>
              <p className="text-xs text-secondaryText leading-relaxed mb-6 font-medium">
                Enter the 6-digit one-time password code sent to <strong className="text-dark">+91 {phoneNumber}</strong>
              </p>

              {/* Developer Tip */}
              <div className="bg-[#EEF5FB] border border-brand-blue/20 rounded-xl p-3 mb-6 text-xs text-brand-blue font-semibold flex items-center gap-2">
                <FiLock className="w-4 h-4" />
                <span>Simulation code: <strong>123456</strong> (or any 6 digits)</span>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-between gap-2">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-bold border border-[#e2e8f0] rounded-xl bg-white card-shadow-inset focus:outline-none focus:border-brand-blue"
                    />
                  ))}
                </div>

                {error && <p className="text-xs text-accent-red font-semibold">{error}</p>}

                {/* Verify Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-brand-blue hover:bg-brand-secondary text-white rounded-btn font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all text-sm group active:scale-95"
                >
                  <FiLock className="w-4 h-4" />
                  Verify & Sign In
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>

              {/* Timer/Resend Option */}
              <div className="mt-6 flex justify-between items-center text-xs font-semibold">
                {timer > 0 ? (
                  <p className="text-secondaryText">Resend code in <span className="text-dark">{timer}s</span></p>
                ) : (
                  <button
                    onClick={() => {
                      setTimer(60);
                      setError('');
                    }}
                    className="text-brand-blue hover:underline"
                  >
                    Resend OTP Code
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpScreen(false);
                    setError('');
                  }}
                  className="text-secondaryText hover:underline"
                >
                  Change Number
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Troubleshoot footer link */}
      <p className="mt-8 text-xs font-semibold text-secondaryText z-10">
        Having trouble? <a href="#" className="text-[#1597E5] hover:underline">Contact Admin</a>
      </p>
    </div>
  );
};

export default Login;
