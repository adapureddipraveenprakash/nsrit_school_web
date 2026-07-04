import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import * as dataService from '../services/dataService';
import { getJSON, setJSON, STORAGE_KEYS } from '../services/storage';

const normalizeBranch = (b) => {
  if (!b) return null;
  return {
    id: b.id,
    name: b.name || '',
    code: b.branchCode || b.code || '',
    location: b.city || b.location || '',
    address: b.address || '',
    state: b.state || '',
    pincode: b.pincode || '',
    contact: b.phone || b.contact || '',
    email: b.email || '',
    active: b.isActive ?? (b.status === 'ACTIVE' || (b.active ?? true)),
    principal: b.principalName || b.principal || 'Unassigned',
    createdAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
    studentsCount: b.studentsCount || 0,
    facultyCount: b.facultyCount || 0,
    coordinatorsCount: b.coordinatorsCount || 0
  };
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ─── Auth State ─────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSwitchingUser, setIsSwitchingUser] = useState(false);
  const [roleSelectionPending, setRoleSelectionPending] = useState(false);

  // ─── Auth Flow State ─────────────────────────────────────────────────────────
  const [verificationId, setVerificationId] = useState(null);
  const [pendingPhone, setPendingPhone] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // ─── Branch Context (Main Admin feature) ─────────────────────────────────────
  const [currentBranchContext, setCurrentBranchContext] = useState(() =>
    getJSON(STORAGE_KEYS.MAIN_ADMIN_BRANCH_CONTEXT)
  );

  // ─── Data Cache (fetched from Firebase Data Connect) ─────────────────────────
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fees, setFees] = useState({ collected: 0, pending: 0, concession: 0 });
  const [feeRefreshTrigger, setFeeRefreshTrigger] = useState(0);
  const triggerFeeRefresh = useCallback(() => {
    setFeeRefreshTrigger(prev => prev + 1);
  }, []);
  const [auditLogs, setAuditLogs] = useState([]);

  // ─── Bootstrap: restore session on page load ─────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const session = await authService.getStoredSession();
        if (session?.user) {
          setUser(session.user);
          setActiveRole(session.user.role);
        }
      } catch (err) {
        console.warn('[AppContext] Bootstrap failed:', err.message);
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  // ─── Fetch branches when user is a Main Admin ─────────────────────────────────
  useEffect(() => {
    if (!user) { setBranches([]); return; }
    if (activeRole === 'MAIN_ADMIN' || activeRole === 'BRANCH_ADMIN') {
      fetchBranches();
    }
  }, [user, activeRole]);

  // ─── Persist branch context to localStorage ────────────────────────────────────
  useEffect(() => {
    if (currentBranchContext) {
      setJSON(STORAGE_KEYS.MAIN_ADMIN_BRANCH_CONTEXT, currentBranchContext);
    } else {
      try { localStorage.removeItem(STORAGE_KEYS.MAIN_ADMIN_BRANCH_CONTEXT); } catch { /* ignore */ }
    }
  }, [currentBranchContext]);

  // ─── Data Fetch Helpers ───────────────────────────────────────────────────────
  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const data = await dataService.getBranches();
      setBranches(data.map(normalizeBranch));
    } catch (err) {
      console.error('[AppContext] Failed to fetch branches:', err.message);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  const fetchGlobalReportsAndFees = useCallback(async () => {
    try {
      if (activeRole === 'MAIN_ADMIN') {
        const data = await dataService.getGlobalReports();
        if (data) {
          let rawUsers = data.users || [];
          let rawStudents = data.students || [];
          let feePlans = data.studentFeePlans || [];

          setUsers(rawUsers);

          // Map branches with counts computed dynamically from global reports data
          const rawBranches = data.branches || [];
          const computedBranches = rawBranches.map(b => {
            const branchStudents = (data.students || []).filter(s => s.branchId === b.id && s.isActive !== false);
            const branchTeachers = (data.users || []).filter(u => u.branchId === b.id && ['TEACHER', 'CLASS_TEACHER'].includes(u.role) && u.isActive !== false);
            const branchCoordinators = (data.users || []).filter(u => u.branchId === b.id && u.role === 'COORDINATOR' && u.isActive !== false);
            
            return {
              ...b,
              studentsCount: branchStudents.length,
              facultyCount: branchTeachers.length,
              coordinatorsCount: branchCoordinators.length
            };
          });

          setBranches(computedBranches.map(normalizeBranch));

          const paidFees = feePlans.reduce(
            (sum, plan) =>
              sum +
              (plan.reportPayments || [])
                .filter(payment => String(payment.status || 'RECORDED').toUpperCase() !== 'REVERSED')
                .reduce((paymentSum, payment) => paymentSum + Number(payment.amount || 0), 0),
            0,
          );
          const totalFees = feePlans.reduce((sum, plan) => sum + Number(plan.totalAmount || 0), 0);
          const concessionFees = feePlans.reduce((sum, plan) => sum + Number(plan.concessionAmount || 0), 0);

          setFees({
            collected: paidFees,
            pending: Math.max(totalFees - paidFees, 0),
            concession: concessionFees
          });
        }
      } else {
        const branchId = user?.branchId || 'sontyam-branch-id';
        const reportData = await dataService.getFeeReports({ branchId });
        if (reportData && reportData.students) {
          let students = reportData.students || [];

          // Wing restrictions for coordinators
          if (activeRole === 'COORDINATOR' && user?.wing) {
            students = students.filter(
              s => s.academicClass?.wing?.code?.toUpperCase() === user.wing.toUpperCase()
            );
          }

          const feePlans = [];
          students.forEach(s => {
            if (s.reportFeePlans) {
              s.reportFeePlans.forEach(fp => {
                if (fp.isActive !== false) {
                  feePlans.push(fp);
                }
              });
            }
          });

          const paidFees = feePlans.reduce(
            (sum, plan) =>
              sum +
              (plan.reportFeePayments || [])
                .filter(payment => String(payment.status || 'RECORDED').toUpperCase() !== 'REVERSED')
                .reduce((paymentSum, payment) => paymentSum + Number(payment.amount || 0), 0),
            0,
          );
          const totalFees = feePlans.reduce((sum, plan) => sum + Number(plan.totalAmount || 0), 0);
          const concessionFees = feePlans.reduce((sum, plan) => sum + Number(plan.concessionAmount || 0), 0);

          setFees({
            collected: paidFees,
            pending: Math.max(totalFees - paidFees, 0),
            concession: concessionFees
          });

          const mappedUsers = students.map(s => {
            const activePlans = (s.reportFeePlans || []).filter(fp => fp.isActive !== false);
            let total = 0;
            let paid = 0;
            activePlans.forEach(plan => {
              total += plan.totalAmount || 0;
              paid += (plan.reportFeePayments || [])
                .filter(p => String(p.status || 'RECORDED').toUpperCase() !== 'REVERSED')
                .reduce((sum, p) => sum + Number(p.amount || 0), 0);
            });
            const due = Math.max(total - paid, 0);
            const feeStatus = due > 0 ? 'DUE' : 'PAID';

            return {
              id: s.id,
              fullName: s.fullName,
              role: 'STUDENT',
              feeStatus,
              branchId: s.branchId
            };
          });
          setUsers(mappedUsers);
        }
      }
    } catch (err) {
      console.error('[AppContext] Failed to fetch global/branch reports:', err.message);
    }
  }, [user, activeRole]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const logs = await dataService.getAuditLogs({ limit: 100 });
      setAuditLogs(logs);
    } catch (err) {
      console.error('[AppContext] Failed to fetch audit logs:', err.message);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setUsers([]);
      setFees({ collected: 0, pending: 0, concession: 0 });
      setAuditLogs([]);
      return;
    }
    const roles = ['MAIN_ADMIN', 'BRANCH_ADMIN', 'ACCOUNTANT', 'COORDINATOR'];
    if (roles.includes(activeRole)) {
      fetchGlobalReportsAndFees();
      if (activeRole === 'MAIN_ADMIN') {
        fetchAuditLogs();
      }
      const interval = setInterval(() => {
        fetchGlobalReportsAndFees();
        if (activeRole === 'MAIN_ADMIN') {
          fetchAuditLogs();
        }
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [user, activeRole, fetchGlobalReportsAndFees, fetchAuditLogs]);

  // ─── Auth Operations ──────────────────────────────────────────────────────────

  // Step 1: Send OTP
  const sendOtp = useCallback(async ({ countryCode = '+91', phoneNumber }) => {
    setAuthLoading(true);
    setAuthError(null);
    const result = await authService.sendOtp({ countryCode, phoneNumber });
    setAuthLoading(false);
    if (result.ok) {
      setVerificationId(result.data.verificationId);
      setPendingPhone(result.data.fullPhoneNumber);
      return { ok: true };
    }
    setAuthError(result.error);
    return { ok: false, error: result.error };
  }, []);

  // Step 2: Verify OTP
  const verifyOtp = useCallback(async ({ otp }) => {
    if (!verificationId) return { ok: false, error: 'No verification ID. Please request OTP again.' };
    setAuthLoading(true);
    setAuthError(null);
    const result = await authService.verifyOtp({
      verificationId,
      otp,
      phoneNumber: pendingPhone,
    });
    setAuthLoading(false);
    if (result.ok) {
      const u = result.data.user;
      setUser(u);
      setActiveRole(u.role);
      setVerificationId(null);
      setPendingPhone(null);
      setIsSwitchingUser(false);
      if (Array.isArray(u.roles) && u.roles.length > 1) {
        setRoleSelectionPending(true);
      } else {
        setRoleSelectionPending(false);
      }
      return { ok: true, user: u };
    }
    setAuthError(result.error);
    return { ok: false, error: result.error };
  }, [verificationId, pendingPhone]);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setActiveRole(null);
    setRoleSelectionPending(false);
    setCurrentBranchContext(null);
    setBranches([]);
    setVerificationId(null);
    setPendingPhone(null);
    setAuthError(null);
    setIsSwitchingUser(false);
  }, []);

  const switchUser = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setActiveRole(null);
    setRoleSelectionPending(false);
    setVerificationId(null);
    setPendingPhone(null);
    setAuthError(null);
    setIsSwitchingUser(true);
    // Keep branch context so Main Admin can re-login without re-selecting
  }, []);

  const switchRole = useCallback(async (newRole) => {
    try {
      const result = await authService.switchRole(newRole);
      setUser(result.user);
      setActiveRole(result.user.role);
      setRoleSelectionPending(false);
    } catch (err) {
      console.error('[AppContext] Role switch failed:', err.message);
      throw err;
    }
  }, []);

  // ─── Branch Context operations ─────────────────────────────────────────────
  const enterBranchContext = useCallback((branch) => {
    setCurrentBranchContext(branch);
  }, []);

  const leaveBranchContext = useCallback(() => {
    setCurrentBranchContext(null);
  }, []);

  // ─── Mutation helpers (delegate to dataService, re-fetch as needed) ──────────
  const addBranch = useCallback(async (payload) => {
    const gqlPayload = {
      name: payload.name,
      branchCode: payload.branchCode || payload.code,
      address: payload.address,
      city: payload.city || payload.location,
      state: payload.state,
      pincode: payload.pincode,
      phone: payload.phone || payload.contact,
      email: payload.email,
      status: payload.status || (payload.active ? 'ACTIVE' : 'INACTIVE')
    };
    const res = await dataService.createBranch(gqlPayload);
    await fetchBranches(); // refresh
    return res;
  }, [fetchBranches]);

  const updateBranch = useCallback(async (id, payload) => {
    const gqlPayload = {
      id: id,
      name: payload.name,
      address: payload.address,
      city: payload.city || payload.location,
      state: payload.state,
      pincode: payload.pincode,
      phone: payload.phone || payload.contact,
      email: payload.email,
      status: payload.status || (payload.active ? 'ACTIVE' : 'INACTIVE'),
      isActive: payload.isActive !== undefined ? payload.isActive : (payload.active !== undefined ? payload.active : true)
    };
    const res = await dataService.updateBranch(gqlPayload);
    await fetchBranches();
    if (currentBranchContext?.id === id) {
      setCurrentBranchContext((prev) => ({ ...prev, ...payload }));
    }
    return res;
  }, [fetchBranches, currentBranchContext]);

  const deleteBranch = useCallback(async (id) => {
    try {
      const branchInfo = await dataService.getBranchDetails(id);
      if (branchInfo) {
        await dataService.updateBranch({
          branchId: id,
          name: branchInfo.name,
          address: branchInfo.address,
          city: branchInfo.city || branchInfo.location,
          state: branchInfo.state,
          pincode: branchInfo.pincode,
          phone: branchInfo.phone || branchInfo.contact,
          email: branchInfo.email,
          status: 'INACTIVE',
          isActive: false
        });
      }
      await fetchBranches();
    } catch (err) {
      console.error('[AppContext] deleteBranch failed:', err);
    }
  }, [fetchBranches]);

  const addUser = useCallback(async ({ name, phone, email, role, branchId }) => {
    const fullPhoneNumber = `+91${phone}`;
    const pendingUid = `pending:${role.toLowerCase()}:${branchId || 'global'}:${phone}`;
    try {
      await dataService.createUser({
        firebaseUID: pendingUid,
        fullName: name,
        countryCode: '+91',
        phoneNumber: fullPhoneNumber,
        role: role,
        employeeId: `EMP-${Date.now().toString().slice(-4)}`,
        staffType: 'TEACHER',
        branchId: branchId || null
      });
      await fetchGlobalReportsAndFees();
    } catch (err) {
      console.error('[AppContext] addUser failed:', err);
      throw err;
    }
  }, [fetchGlobalReportsAndFees]);

  const changeUserRole = useCallback(async (phone, newRole) => {
    try {
      const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const userProfile = await dataService.getUserByPhone(fullPhone);
      if (userProfile) {
        await dataService.changeUserRole({
          userId: userProfile.id,
          oldRole: userProfile.role,
          newRole: newRole
        });
        await fetchGlobalReportsAndFees();
      } else {
        throw new Error('User not found in system.');
      }
    } catch (err) {
      console.error('[AppContext] changeUserRole failed:', err.message);
      throw err;
    }
  }, [fetchGlobalReportsAndFees]);

  const addNotification = useCallback(async ({ title, message, targetRole }) => {
    const branchId = currentBranchContext?.id || user?.branchId;
    if (!branchId) {
      console.warn('[AppContext] Cannot post notice without active branch context.');
      return;
    }
    try {
      await dataService.createNotice({
        branchId,
        authorId: user.id,
        title,
        body: message,
        category: targetRole || 'ACADEMIC',
        pinned: title.startsWith('📌'),
        date: new Date().toISOString().slice(0, 10)
      });
      console.log('[AppContext] Notice created successfully.');
    } catch (err) {
      console.error('[AppContext] Failed to post notice:', err);
    }
  }, [currentBranchContext, user]);

  const addLog = useCallback((action) => {
    console.log('[Audit Log]', action);
  }, []);

  // ─── Context Value ─────────────────────────────────────────────────────────
  const value = {
    // Auth
    user,
    activeRole,
    isBootstrapping,
    isSwitchingUser,
    authLoading,
    authError,
    verificationId,
    pendingPhone,
    sendOtp,
    verifyOtp,
    clearAuthError,
    logout,
    switchUser,
    switchRole,
    roleSelectionPending,
    setRoleSelectionPending,

    // Branch context
    currentBranchContext,
    setCurrentBranchContext: enterBranchContext,
    leaveBranchContext,

    // Data
    branches,
    branchesLoading,
    fetchBranches,
    addBranch,
    updateBranch,
    deleteBranch,
    users,
    fees,
    feeRefreshTrigger,
    triggerFeeRefresh,
    auditLogs,
    addUser,
    changeUserRole,
    addNotification,
    addLog,

    // Expose dataService so pages can use it without extra imports
    dataService,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
