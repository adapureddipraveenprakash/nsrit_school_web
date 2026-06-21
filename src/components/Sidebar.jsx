import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiUsers, FiSettings } from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import { HiOutlinePresentationChartLine } from 'react-icons/hi2';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const { logout, activeRole } = useApp();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiGrid className="w-5 h-5" /> },
    { name: 'Schools', path: '/schools', icon: <BiBuildingHouse className="w-5 h-5" /> },
    { name: 'Users', path: '/users', icon: <FiUsers className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <HiOutlinePresentationChartLine className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  const filteredItems = menuItems.filter(item => {
    if (activeRole !== 'MAIN_ADMIN' && item.name !== 'Dashboard') {
      return false;
    }
    return true;
  });

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
      <div className="mt-auto px-4 py-3 bg-[#EEF5FB] rounded-card border border-white/80 shadow-sm text-center">
        <p className="text-xs font-semibold text-dark">{activeRole.replace('_', ' ')}</p>
        <p className="text-[10px] text-secondaryText mt-0.5">NSRIT Connect ERP v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
