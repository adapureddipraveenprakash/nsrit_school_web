import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiActivity, FiUsers } from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend
} from 'recharts';

// Seed chart datasets
const REGISTRATION_DATA = [
  { month: 'Jan', students: 40 },
  { month: 'Feb', students: 55 },
  { month: 'Mar', students: 72 },
  { month: 'Apr', students: 85 },
  { month: 'May', students: 98 },
  { month: 'Jun', students: 107 },
];

const REVENUE_DATA = [
  { term: 'Term 1', Collected: 10000, Pending: 1200000 },
  { term: 'Term 2', Collected: 8000, Pending: 1500000 },
  { term: 'Term 3', Collected: 10000, Pending: 1669000 },
];

const Reports = () => {
  const { branches, users, fees } = useApp();

  // Aggregate counts
  const totalStudents = branches.reduce((sum, b) => sum + b.studentsCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 pb-20 md:pb-8"
    >
      {/* Top Banner */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-brand-blue to-brand-secondary p-6 text-white card-shadow overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
        <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Main Admin</p>
        <h2 className="text-xl font-bold md:text-2xl">Global Analytics</h2>
        <p className="text-xs text-white/70 mt-1 font-medium">Platform performance & growth overview</p>
      </div>

      <p className="text-[10px] font-bold text-secondaryText tracking-widest uppercase">Key Metrics</p>

      {/* Metric Cards matching screenshot layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Branch Growth */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow flex gap-4 hover:border-brand-blue/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <BiBuildingHouse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Branch Growth</p>
            <p className="text-lg font-extrabold text-brand-blue mt-1">+{branches.length} Registered</p>
            <p className="text-[10px] text-secondaryText font-medium mt-1 leading-relaxed">
              All school regions running in stable cloud environments.
            </p>
          </div>
        </div>

        {/* Card 2: Revenue Trend */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow flex gap-4 hover:border-accent-green/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#E8F8F0] text-accent-green flex items-center justify-center shrink-0">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Revenue Trend</p>
            <p className="text-lg font-extrabold text-accent-green mt-1">Rs {fees.collected.toLocaleString('en-IN')} Paid</p>
            <p className="text-[10px] text-secondaryText font-medium mt-1 leading-relaxed">
              Fee collection active with average collections monitored.
            </p>
          </div>
        </div>

        {/* Card 3: User Activity */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow flex gap-4 hover:border-accent-purple/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center shrink-0">
            <FiActivity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">User Activity</p>
            <p className="text-lg font-extrabold text-dark mt-1">{users.length + 147} Users</p>
            <p className="text-[10px] text-secondaryText font-medium mt-1 leading-relaxed">
              Live system connections authenticated without errors.
            </p>
          </div>
        </div>

        {/* Card 4: Total Students */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow flex gap-4 hover:border-[#1e88e5]/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#EEF5FB] text-brand-secondary flex items-center justify-center shrink-0">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondaryText uppercase tracking-wider">Total Students</p>
            <p className="text-lg font-extrabold text-brand-secondary mt-1">{totalStudents}</p>
            <p className="text-[10px] text-secondaryText font-medium mt-1 leading-relaxed">
              Enrolled students across all registered branches.
            </p>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-bold text-secondaryText tracking-widest uppercase mt-8">Analytical Trends</p>

      {/* Recharts Graphical charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Enrollment Area Chart */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow">
          <h3 className="text-sm font-bold text-dark mb-4 uppercase tracking-wider">Student Registration Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REGISTRATION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1597E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1597E5" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="students" stroke="#1597E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fee Collections Bar Chart */}
        <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow">
          <h3 className="text-sm font-bold text-dark mb-4 uppercase tracking-wider">Fee Collection Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="term" tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Collected" fill="#23C16B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;
