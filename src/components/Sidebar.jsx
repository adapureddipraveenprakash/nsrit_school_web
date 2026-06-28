import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiUsers, FiSettings, FiHome, FiCalendar, FiBell, FiUser, FiDollarSign, FiLayers, FiMoreVertical } from 'react-icons/fi';
import { BiBuildingHouse, BiReceipt } from 'react-icons/bi';
import { HiOutlinePresentationChartLine } from 'react-icons/hi2';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const { logout, activeRole, user, switchRole } = useApp();
  const navigate = useNavigate();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const filteredItems = (() => {
    if (activeRole === 'COORDINATOR') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: <FiGrid className="w-5 h-5" /> },
        { name: 'Classes', path: '/settings/classes', icon: <FiLayers className="w-5 h-5" /> },
        { name: 'Attendance', path: '/settings/attendance-overview', icon: <FiCalendar className="w-5 h-5" /> },
        { name: 'Events', path: '/settings/events', icon: <FiCalendar className="w-5 h-5" /> },
        { name: 'Profile', path: '/settings/profile', icon: <FiUser className="w-5 h-5" /> },
      ];
    }
    if (activeRole === 'ACCOUNTANT') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: <FiGrid className="w-5 h-5" /> },
        { name: 'Fee Collection', path: '/settings/collection', icon: <BiReceipt className="w-5 h-5" /> },
        { name: 'Expenses', path: '/settings/expenses', icon: <FiDollarSign className="w-5 h-5" /> },
        { name: 'Reports', path: '/settings/fee-reports', icon: <HiOutlinePresentationChartLine className="w-5 h-5" /> },
        { name: 'Profile', path: '/settings/profile', icon: <FiUser className="w-5 h-5" /> },
      ];
    }
    if (activeRole === 'PARENT') {
      return [
        { name: 'Home', path: '/dashboard', icon: <FiHome className="w-5 h-5" /> },
        { name: 'Attendance', path: '/settings/attendance-overview', icon: <FiCalendar className="w-5 h-5" /> },
        { name: 'Notifications', path: '/settings/notifications', icon: <FiBell className="w-5 h-5" /> },
        { name: 'Profile', path: '/settings/profile', icon: <FiUser className="w-5 h-5" /> },
        { name: 'Students', path: '/settings/global-students', icon: <FiUsers className="w-5 h-5" /> },
      ];
    }
    if (activeRole === 'TEACHER' || activeRole === 'CLASS_TEACHER') {
      return [
        { name: 'Home', path: '/dashboard', icon: <FiGrid className="w-5 h-5" /> },
        { name: 'Students', path: '/settings/teacher-students', icon: <FiUsers className="w-5 h-5" /> },
        { name: 'Notifications', path: '/settings/notifications', icon: <FiBell className="w-5 h-5" /> },
        { name: 'Profile', path: '/settings/profile', icon: <FiUser className="w-5 h-5" /> },
      ];
    }
    return [
      { name: 'Dashboard', path: '/dashboard', icon: <FiGrid className="w-5 h-5" /> },
      { name: 'Schools', path: '/schools', icon: <BiBuildingHouse className="w-5 h-5" /> },
      { name: 'Users', path: '/users', icon: <FiUsers className="w-5 h-5" /> },
      { name: 'Reports', path: '/reports', icon: <HiOutlinePresentationChartLine className="w-5 h-5" /> },
      { name: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> },
    ].filter(item => {
      if (activeRole !== 'MAIN_ADMIN' && item.name !== 'Dashboard') {
        return false;
      }
      return true;
    });
  })();

  return (
    <aside className="hidden md:flex flex-col w-72 bg-white border-r border-[#e2e8f0] h-screen sticky top-0 py-6 px-4 shrink-0 z-20">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-[#EEF5FB] flex items-center justify-center border border-[#1597E5]/20 shadow-sm">
          <span className="text-[#1597E5] text-xl font-bold font-sans">🎓</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-dark tracking-tight">NSRIT Connect</h1>
          <p className="text-[11px] text-secondaryText font-medium">Enterprise School Management</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-btn transition-all duration-300 font-medium text-[15px] ${
                isActive
                  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 translate-x-1'
                  : 'text-secondaryText hover:text-dark hover:bg-[#EEF5FB]'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="mt-auto relative select-none">
        <div className="flex items-center justify-between px-4 py-3 bg-[#EEF5FB] rounded-card border border-white/80 shadow-sm">
          <div className="text-left">
            <p className="text-xs font-semibold text-dark">{activeRole.replace('_', ' ')}</p>
            <p className="text-[10px] text-secondaryText mt-0.5">NSRIT Connect ERP v1.0.0</p>
          </div>
          {user?.roles && user.roles.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="p-1.5 hover:bg-slate-200/50 rounded-full text-secondaryText hover:text-dark transition-colors cursor-pointer"
              >
                <FiMoreVertical className="w-4 h-4" />
              </button>
              
              {showSwitchMenu && (
                <div className="absolute bottom-12 right-0 w-48 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-30 py-1.5 overflow-hidden divide-y divide-slate-100">
                  <p className="text-[8px] font-black text-secondaryText tracking-wider uppercase px-3 py-1.5">Switch Role</p>
                  {user.roles.map((role) => (
                    <button
                      key={role}
                      onClick={async () => {
                        setShowSwitchMenu(false);
                        try {
                          await switchRole(role);
                          navigate('/dashboard');
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        role === activeRole 
                          ? 'bg-[#EEF5FB] text-brand-blue' 
                          : 'text-secondaryText hover:text-dark hover:bg-slate-50'
                      }`}
                    >
                      <span>{role.replace('_', ' ')}</span>
                      {role === activeRole && <span className="w-1.5 h-1.5 bg-[#23C16B] rounded-full" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
