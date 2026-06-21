import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { AnimatePresence } from 'framer-motion';
import { FiMenu } from 'react-icons/fi';

// Navigation Components
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Drawer from './components/Drawer';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Subpages / Configurations from school.docx
import BranchContext from './pages/Subpages/BranchContext';
import CreateBranch from './pages/Subpages/CreateBranch';
import StudentRecords from './pages/Subpages/StudentRecords';
import FeeSetup from './pages/Subpages/FeeSetup';
import AuditLogs from './pages/Subpages/AuditLogs';
import RevenueOverview from './pages/Subpages/RevenueOverview';
import GlobalReports from './pages/Subpages/GlobalReports';
import MyProfile from './pages/Subpages/MyProfile';
import Notifications from './pages/Subpages/Notifications';
import SendNotification from './pages/Subpages/SendNotification';
import CreateStudent from './pages/Subpages/CreateStudent';
import BulkUpload from './pages/Subpages/BulkUpload';
import Teachers from './pages/Subpages/Teachers';
import ClassTeachers from './pages/Subpages/ClassTeachers';
import AttendanceOverview from './pages/Subpages/AttendanceOverview';
import FeeOverview from './pages/Subpages/FeeOverview';
import BranchAnalytics from './pages/Subpages/BranchAnalytics';
import BranchSettings from './pages/Subpages/BranchSettings';





const LayoutShell = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useApp();

  return (
    <div className="flex min-h-screen bg-[#EEF5FB]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex justify-between items-center bg-white border-b border-[#e2e8f0]/80 py-3.5 px-4 sticky top-0 z-30 shadow-sm shrink-0">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 hover:bg-[#EEF5FB] rounded-lg text-dark transition-colors cursor-pointer"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-bold text-brand-blue tracking-tight select-none">NSRIT Connect</span>
          
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-8 h-8 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center text-xs font-bold font-sans cursor-pointer hover:bg-brand-blue/20 transition-all select-none"
          >
            {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'MA'}
          </button>
        </header>

        {/* Dynamic Page Rendering */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Profile Drawer Overlay */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { user, activeRole } = useApp();
  const isMainAdmin = activeRole === 'MAIN_ADMIN';

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <LayoutShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schools" element={isMainAdmin ? <Schools /> : <Navigate to="/dashboard" replace />} />
          <Route path="/users" element={isMainAdmin ? <Users /> : <Navigate to="/dashboard" replace />} />
          <Route path="/reports" element={isMainAdmin ? <Reports /> : <Navigate to="/dashboard" replace />} />
          <Route path="/settings" element={isMainAdmin ? <Settings /> : <Navigate to="/dashboard" replace />} />
          
          {/* Subpage configuration routes */}
          <Route path="/settings/branch-context" element={<BranchContext />} />
          <Route path="/settings/create-branch" element={<CreateBranch />} />
          <Route path="/settings/global-students" element={<StudentRecords />} />
          <Route path="/settings/class-fee-templates" element={<FeeSetup />} />
          <Route path="/settings/audit-logs" element={<AuditLogs />} />
          <Route path="/settings/revenue-overview" element={<RevenueOverview />} />
          <Route path="/settings/global-reports" element={<GlobalReports />} />
          <Route path="/settings/profile" element={<MyProfile />} />
          <Route path="/settings/notifications" element={<Notifications />} />
          <Route path="/settings/send-notification" element={<SendNotification />} />
          <Route path="/settings/create-student" element={<CreateStudent />} />
          <Route path="/settings/bulk-upload" element={<BulkUpload />} />
          <Route path="/settings/teachers" element={<Teachers />} />
          <Route path="/settings/class-teachers" element={<ClassTeachers />} />
          <Route path="/settings/attendance-overview" element={<AttendanceOverview />} />
          <Route path="/settings/fee-overview" element={<FeeOverview />} />
          <Route path="/settings/branch-analytics" element={<BranchAnalytics />} />
          <Route path="/settings/branch-settings" element={<BranchSettings />} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </LayoutShell>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}






export default App;
