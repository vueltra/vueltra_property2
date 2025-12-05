import React, { useState, useRef } from 'react';
import { User } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';

interface TopBarProps {
  onToggleSidebar: () => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  activePage?: string;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, searchValue, onSearchChange, user, onNavigate, onLogout, activePage }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    setIsProfileOpen(false);
  });

  const navLinks = [
    { id: 'home', label: 'Cari Properti' },
    { id: 'requests', label: 'Titip Cari' },
    { id: 'blog', label: 'Blog' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm transition-colors">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        <div className="flex items-center gap-4 lg:gap-8 flex-1">
          {/* Mobile Hamburger */}
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => onNavigate('home')}>
             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md shadow-blue-100 transition-transform hover:scale-105">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
             </div>
             <span className="text-xl font-extrabold text-slate-900 tracking-tight hidden sm:block">Vueltra</span>
          </div>

          {/* Search Bar */}
          <div className="relative group w-full max-w-sm lg:max-w-md hidden sm:block ml-4">
            <input 
              type="text" 
              placeholder="Cari lokasi, gedung, atau judul..." 
              className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {/* Right Section: Navigation & Profile */}
        <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  activePage === link.id 
                    ? 'text-blue-700 bg-blue-50' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          {/* User Profile / Login */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors group"
              >
                 <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 group-hover:border-blue-300 transition-colors">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-bold">
                        {user.username[0]}
                      </div>
                    )}
                 </div>
                 <span className="text-sm font-bold text-slate-700 hidden lg:block max-w-[100px] truncate">{user.username}</span>
                 <svg className="w-4 h-4 text-slate-400 hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in origin-top-right ring-1 ring-black/5">
                   <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.username}</p>
                      <p className="text-xs text-slate-500 truncate mb-1">{user.email}</p>
                      <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-green-200">
                         Saldo: Rp {user.credits.toLocaleString()}
                      </div>
                   </div>
                   
                   <div className="py-1">
                      <button onClick={() => { setIsProfileOpen(false); onNavigate('dashboard'); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-700 font-medium">
                         📊 Dashboard Saya
                      </button>
                      <button onClick={() => { setIsProfileOpen(false); onNavigate('profile'); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-700 font-medium">
                         👤 Edit Profil
                      </button>
                      {user.isAdmin && (
                        <button onClick={() => { setIsProfileOpen(false); onNavigate('admin-dashboard'); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-700 font-medium border-t border-slate-50 mt-1 pt-2">
                           🛡️ Admin Panel
                        </button>
                      )}
                   </div>

                   <div className="border-t border-slate-100 my-1 pt-1">
                     <button onClick={() => { setIsProfileOpen(false); onLogout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold">
                        Keluar
                     </button>
                   </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onNavigate('login')}
                className="text-sm font-bold text-slate-600 hover:text-blue-700 px-3 py-2 transition-colors whitespace-nowrap hidden sm:block"
              >
                Masuk
              </button>
              <button 
                onClick={() => onNavigate('register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all whitespace-nowrap"
              >
                Daftar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;