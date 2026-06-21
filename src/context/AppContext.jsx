import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// Seed data constants matching screenshots
const SEED_BRANCHES = [
  {
    id: 'sontyam-id',
    name: 'Sontyam',
    code: 'SO',
    principal: 'B. Geetha',
    location: 'Visakhapatnam',
    studentsCount: 107,
    facultyCount: 12,
    coordinatorsCount: 2,
    active: true,
    createdAt: '11-06-2026',
  }
];

const SEED_USERS = [
  {
    uid: 'main-admin-uid',
    role: 'MAIN_ADMIN',
    name: 'Main Admin',
    phone: '7670818348',
    email: 'admin@nsrit.edu.in',
    status: 'active',
    createdAt: '2026-06-21T12:00:00Z',
  },
  {
    uid: 'branch-admin-uid',
    role: 'BRANCH_ADMIN',
    name: 'Branch Admin',
    phone: '9505985859',
    email: 'admin.so@nsrit.edu.in',
    status: 'active',
    createdAt: '2026-06-21T12:00:00Z',
  },
  {
    uid: 'principal-uid',
    role: 'PRINCIPAL',
    name: 'B. Geetha',
    phone: '9100046512',
    email: 'principal.so@nsrit.edu.in',
    status: 'active',
    createdAt: '2026-06-21T12:00:00Z',
  },
  {
    uid: 'coordinator-uid',
    role: 'COORDINATOR',
    name: 'C. Rama Rao',
    phone: '8297191669',
    email: 'coordinator.so@nsrit.edu.in',
    status: 'active',
    createdAt: '2026-06-21T12:00:00Z',
  },
  {
    uid: 'teacher-uid',
    role: 'TEACHER',
    name: 'T. Satish Kumar',
    phone: '9347339048',
    email: 'teacher.so@nsrit.edu.in',
    status: 'active',
    createdAt: '2026-06-21T12:00:00Z',
  },
  {
    uid: 'parent-uid',
    role: 'PARENT',
    name: 'P. Prasad',
    phone: '9492801646',
    email: 'parent.so@nsrit.edu.in',
    status: 'active',
    createdAt: '2026-06-21T12:00:00Z',
  },
  {
    uid: 'accountant-uid',
    role: 'ACCOUNTANT',
    name: 'A. Srinivasa Rao',
    phone: '9951335377',
    email: 'accountant.so@nsrit.edu.in',
    status: 'active',
    createdAt: '2026-06-21T12:00:00Z',
  }
];

const SEED_FEES = {
  collected: 10000,
  pending: 4369000,
  concession: 0,
};

const SEED_AUDIT_LOGS = [
  { id: 1, userId: 'main-admin-uid', userName: 'Main Admin', action: 'Created Sontyam Branch', timestamp: '2026-06-21T10:15:00Z' },
  { id: 2, userId: 'main-admin-uid', userName: 'Main Admin', action: 'Configured global class fee structure', timestamp: '2026-06-21T11:30:00Z' },
  { id: 3, userId: 'main-admin-uid', userName: 'Main Admin', action: 'Assigned B. Geetha as Principal', timestamp: '2026-06-21T12:05:00Z' },
];

const SEED_NOTIFICATIONS = [
  { id: 1, title: 'Fee Deadline Extended', message: 'The last date to submit academic term fees has been extended to July 5th.', targetRole: 'ALL', createdAt: '2026-06-21T14:30:00Z' },
  { id: 2, title: 'Staff Meeting Schedule', message: 'All branch coordinators and principals are requested to join the general briefing tomorrow.', targetRole: 'COORDINATOR', createdAt: '2026-06-21T13:00:00Z' },
];

export const AppProvider = ({ children }) => {
  // Load initial data from LocalStorage or seed defaults
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nsrit_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem('nsrit_branches');
    return saved ? JSON.parse(saved) : SEED_BRANCHES;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('nsrit_users');
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [fees, setFees] = useState(() => {
    const saved = localStorage.getItem('nsrit_fees');
    return saved ? JSON.parse(saved) : SEED_FEES;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('nsrit_audit_logs');
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('nsrit_notifications');
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  // Current simulation states
  const [currentBranchContext, setCurrentBranchContext] = useState(null); // null = global context, otherwise a branch object
  const [activeRole, setActiveRole] = useState(() => {
    const saved = localStorage.getItem('nsrit_active_role');
    return saved || 'MAIN_ADMIN';
  });

  // Save changes to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('nsrit_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nsrit_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nsrit_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('nsrit_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('nsrit_fees', JSON.stringify(fees));
  }, [fees]);

  useEffect(() => {
    localStorage.setItem('nsrit_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('nsrit_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('nsrit_active_role', activeRole);
  }, [activeRole]);

  // Migration effect to ensure seed phone numbers are loaded
  useEffect(() => {
    setUsers(prev => {
      const seedMap = new Map(SEED_USERS.map(u => [u.uid, u]));
      let updated = false;
      const newUsers = prev.map(u => {
        if (seedMap.has(u.uid)) {
          const seed = seedMap.get(u.uid);
          if (u.phone !== seed.phone || u.role !== seed.role || u.name !== seed.name) {
            updated = true;
            return { ...u, phone: seed.phone, role: seed.role, name: seed.name, email: seed.email };
          }
        }
        return u;
      });
      SEED_USERS.forEach(seed => {
        if (!prev.some(u => u.uid === seed.uid)) {
          newUsers.push(seed);
          updated = true;
        }
      });
      return updated ? newUsers : prev;
    });
  }, []);

  // Sync active user name / details if they change in SEED_USERS
  useEffect(() => {
    if (user) {
      const match = SEED_USERS.find(u => u.uid === user.uid);
      if (match && (user.name !== match.name || user.phone !== match.phone || user.role !== match.role)) {
        setUser(prev => ({ ...prev, name: match.name, phone: match.phone, role: match.role }));
      }
    }
  }, [user]);

  // Auth Operations
  const login = (phone) => {
    // Standard simulation: log in the user matching phone, or default to Main Admin
    const foundUser = users.find(u => u.phone === phone) || {
      uid: 'simulated-user-' + Date.now(),
      role: 'MAIN_ADMIN',
      name: 'Main Admin',
      phone: phone,
      email: 'admin@nsrit.edu.in',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setUser(foundUser);
    setActiveRole(foundUser.role);
    addLog(`Logged in with phone +91${phone}`);
  };

  const logout = () => {
    setUser(null);
    setCurrentBranchContext(null);
    localStorage.removeItem('nsrit_user');
    localStorage.removeItem('nsrit_active_role');
  };

  const switchRole = (role) => {
    setActiveRole(role);
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
    }
    addLog(`Switched simulation role to ${role}`);
  };

  // Database Operations
  const addBranch = (branchData) => {
    const newBranch = {
      id: 'branch-' + Date.now(),
      studentsCount: 0,
      facultyCount: 0,
      coordinatorsCount: 0,
      active: true,
      createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      ...branchData
    };
    setBranches(prev => [newBranch, ...prev]);
    addLog(`Created new branch: ${branchData.name} (${branchData.code})`);
  };

  const addUser = (userData) => {
    const newUser = {
      uid: 'user-' + Date.now(),
      status: 'active',
      createdAt: new Date().toISOString(),
      ...userData
    };
    setUsers(prev => [newUser, ...prev]);
    addLog(`Created user: ${userData.name} as ${userData.role}`);
    
    // If creating a user in a branch, update the branch counters
    if (userData.branchId) {
      setBranches(prev => prev.map(b => {
        if (b.id === userData.branchId) {
          if (userData.role === 'PRINCIPAL') {
            return { ...b, principal: userData.name };
          }
          if (userData.role === 'COORDINATOR') {
            return { ...b, coordinatorsCount: b.coordinatorsCount + 1 };
          }
          if (userData.role === 'TEACHER') {
            return { ...b, facultyCount: b.facultyCount + 1 };
          }
        }
        return b;
      }));
    }
  };

  const changeUserRole = (phone, newRole) => {
    setUsers(prev => prev.map(u => {
      if (u.phone === phone) {
        addLog(`Changed role of user ${u.name} to ${newRole}`);
        return { ...u, role: newRole };
      }
      return u;
    }));
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      createdAt: new Date().toISOString(),
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
    addLog(`Broadcast notification: "${notif.title}" for ${notif.targetRole}`);
  };

  const updateFees = (updatedFees) => {
    setFees(prev => ({ ...prev, ...updatedFees }));
    addLog(`Updated global fee setup`);
  };

  const clearNotifications = () => {
    setNotifications([]);
    addLog('Cleared all system notifications');
  };

  const updateProfile = (profileData) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, ...profileData } : u));
      addLog(`Updated profile details: ${Object.keys(profileData).join(', ')}`);
    }
  };

  const addLog = (action) => {
    const newLog = {
      id: 'log-' + Date.now(),
      userId: user?.uid || 'anonymous',
      userName: user?.name || 'System',
      action,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      user,
      branches,
      users,
      fees,
      auditLogs,
      notifications,
      currentBranchContext,
      activeRole,
      login,
      logout,
      switchRole,
      setCurrentBranchContext,
      addBranch,
      addUser,
      changeUserRole,
      addNotification,
      clearNotifications,
      updateProfile,
      updateFees,
      addLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
