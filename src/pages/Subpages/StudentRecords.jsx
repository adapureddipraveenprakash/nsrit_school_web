import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiChevronRight } from 'react-icons/fi';
import { HiOutlineUserPlus } from 'react-icons/hi2';

const MOCK_NAMES = [
  { name: 'BOYINA MAHIDHAR', class: '2', section: 'A', id: '26SO0107', status: 'Active' },
  { name: 'BOYINA AKSHAYRAM', class: '5', section: 'A', id: '26SO0106', status: 'Active' },
  { name: 'PALLA DEEKSHIT RAM', class: '1', section: 'A', id: '26SO0105', status: 'Active' },
  { name: 'DUDI GREESHMANTH', class: '3', section: 'A', id: '26SO0104', status: 'Active' },
  { name: 'BONTU DHEKSHITH', class: '3', section: 'A', id: '26SO0103', status: 'Active' },
  { name: 'PILLA TRIVED', class: 'UKG', section: 'A', id: '26SO0102', status: 'Active' }
];

const generateMockStudents = () => {
  const list = [...MOCK_NAMES];
  const firstNames = ['Sai', 'Rohan', 'Kalyan', 'Aditya', 'Vikram', 'Anish', 'Sneha', 'Deepak', 'Srinivas', 'Charan', 'Divya', 'Ganesh', 'Harish', 'Karthik', 'Nikhil', 'Pawan', 'Rahul', 'Sanjay', 'Teja', 'Varun'];
  const lastNames = ['Kumar', 'Reddy', 'Rao', 'Sharma', 'Patel', 'Verma', 'Naidu', 'Chowdhary', 'Babu', 'Murthy'];
  
  for (let i = 1; i <= 44; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const idNum = 102 - i; // counts down from 101
    const rollId = `26SO0${idNum < 100 ? '0' + idNum : idNum}`;
    const cl = (i % 10) + 1;
    list.push({
      name: `${fn} ${ln}`.toUpperCase(),
      class: String(cl),
      section: 'A',
      id: rollId,
      status: i % 12 === 0 ? 'Inactive' : 'Active'
    });
  }
  // Sort by ID descending to ensure 26SO0107 is first
  return list.sort((a, b) => b.id.localeCompare(a.id));
};

const StudentRecords = () => {
  const navigate = useNavigate();
  const [students] = useState(generateMockStudents);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Active' | 'Inactive'

  const filtered = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'All' || s.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 pb-28 md:pb-8 max-w-6xl mx-auto space-y-6"
    >
      {/* Header bar */}
      <header className="flex items-center gap-4 py-2 border-b border-[#e2e8f0]/40 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#EEF5FB] rounded-full text-dark transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-grow">
          <h1 className="text-sm font-bold text-dark">Students</h1>
        </div>
      </header>

      {/* Grid Layout for Desktop View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Section: Search, Filters and Cards (spans 2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search students"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-full card-shadow focus:outline-none focus:border-brand-blue/60 text-xs font-semibold text-dark placeholder:text-secondaryText/60"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {['All', 'Active', 'Inactive'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1597E5] border-[#1597E5] text-white shadow-md shadow-brand-blue/15'
                      : 'bg-white border-[#e2e8f0] text-secondaryText hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Students count label */}
          <div className="px-1 text-[10px] font-extrabold text-secondaryText uppercase tracking-wider">
            {filtered.length} Students
          </div>

          {/* Students List in responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((s) => {
              const initials = s.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl p-4.5 card-shadow border border-[#e2e8f0]/40 flex justify-between items-center group hover:border-[#1597E5]/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Initials circle */}
                    <div className="w-10 h-10 rounded-full bg-[#EEF5FB] flex items-center justify-center text-xs font-extrabold text-[#1597E5]">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-dark group-hover:text-[#1597E5] transition-colors">
                        {s.name}
                      </h3>
                      <p className="text-[10px] text-secondaryText mt-0.5 font-bold">
                        {s.id} · {s.class}-{s.section}
                      </p>
                    </div>
                  </div>

                  {/* Status and Action */}
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${s.status === 'Active' ? 'bg-[#23C16B]' : 'bg-secondaryText/45'}`} />
                    <FiChevronRight className="w-4 h-4 text-secondaryText group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Hero Card Dashboard & Quick Actions Card (spans 1 column on desktop) */}
        <div className="space-y-6">
          {/* Blue Hero Card */}
          <div className="relative rounded-[24px] bg-gradient-to-br from-[#1597E5] to-[#00A1FF] p-6 text-white card-shadow overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
            <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">Branch Management</p>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-bold">Students</h2>
              <span className="bg-white/20 border border-white/25 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {students.length}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1 font-medium">Search by name, student ID, or parent phone</p>
          </div>

          {/* Quick Actions Panel for Desktop */}
          <div className="bg-white rounded-[24px] border border-[#e2e8f0]/40 p-6 card-shadow space-y-4">
            <span className="text-[10px] font-extrabold text-secondaryText uppercase tracking-widest px-1 block">
              Quick Actions
            </span>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/settings/create-student')}
                className="w-full py-3.5 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-brand-blue/15 hover:shadow-lg active:scale-95"
              >
                <HiOutlineUserPlus className="w-4 h-4" />
                Add Student
              </button>
              <button
                onClick={() => navigate('/settings/bulk-upload')}
                className="w-full py-3.5 border border-[#1597E5]/30 hover:bg-[#EEF5FB]/40 text-[#1597E5] rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                Bulk CSV Import
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Button (Mobile Only) */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 max-w-xl mx-auto px-4 z-40">
        <button
          onClick={() => navigate('/settings/create-student')}
          className="w-full py-4 bg-[#1597E5] hover:bg-[#00A1FF] text-white rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/35 transition-all cursor-pointer active:scale-95"
        >
          <HiOutlineUserPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>
    </motion.div>
  );
};

export default StudentRecords;
