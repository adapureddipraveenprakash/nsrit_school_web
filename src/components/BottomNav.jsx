import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiUsers, FiSettings, FiBell, FiHome, FiCalendar, FiUser, FiDollarSign, FiLayers } from 'react-icons/fi';
import { BiBuildingHouse, BiReceipt } from 'react-icons/bi';
import { HiOutlinePresentationChartLine as ChartIcon } from 'react-icons/hi2';
import { useApp } from '../context/AppContext';

const BottomNav = () => {
  const { activeRole } = useApp();
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiGrid className="w-5 h-5" /> },
    { name: 'Schools', path: '/schools', icon: <BiBuildingHouse className="w-5 h-5" /> },
    { name: 'Users', path: '/users', icon: <FiUsers className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <ChartIcon className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

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
        { name: 'Reports', path: '/settings/fee-reports', icon: <ChartIcon className="w-5 h-5" /> },
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
      ];
    }
    return menuItems.filter(item => {
      if (activeRole !== 'MAIN_ADMIN' && item.name !== 'Dashboard') {
        return false;
      }
      return true;
    });
  })();

  const isMatch = filteredItems.some(item => item.path === location.pathname);
  if (!isMatch) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0]/80 px-2 py-2 flex justify-around items-center z-40 shadow-[0_-8px_20px_rgba(15,23,42,0.05)]">
      {filteredItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-300 ${
              isActive
                ? 'text-brand-blue font-bold scale-105'
                : 'text-secondaryText hover:text-dark'
            }`
          }
        >
          {item.icon}
          <span className="text-[10px] tracking-tight">{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
