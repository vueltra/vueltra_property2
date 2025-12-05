

import React, { useState, useRef } from 'react';
import { User, VerificationStatus } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';

interface NavbarProps {
  user: User | null;
  onNavigate: (page: string) => void;
  activePage: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, activePage, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    setIsDropdownOpen(false);
  });

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  const handleNav = (page: string) => {
    setIsDropdownOpen(false);
    onNavigate(page);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. BRANDING LOGO */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
            {/* Vueltra Logo */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="6" fill="#047857"/>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900 tracking-tighter leading-none group-hover:text-emerald-700 transition-colors">
                Vueltra
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                Property Marketplace
              </span>
            </div>
          </div>

          <div className="flex items-center">
            
            {/* 2. MAIN NAVIGATION (Middle) - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-1 mr-6">
              <button 
                onClick={() => onNavigate('home')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePage === 'home' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Cari Properti
              </button>
              
              <button 
                onClick={() => onNavigate('requests')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  activePage === 'requests' ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Titip Cari
              </button>

              {user && (
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activePage === 'dashboard' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </button>
              )}
            </div>

            {/* 3. USER ACTIONS (Right) */}
            <div className="flex items-center gap-4">
              
              {user ? (
                <>
                  {/* Divider */}
                  <div className="hidden md:block w-px h-8 bg-slate-200"></div>

                  {/* Saldo Pill */}
                  <div className="hidden sm:flex items-center gap-2 bg-slate-50 pl-3 pr-4 py-1.5 rounded-full border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors cursor-default">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">
                      💰
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Saldo</span>
                      <span className="text-sm font-bold text-slate-700">
                        Rp {user.credits.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Admin Link */}
                  {user.isAdmin && (
                    <button 
                      onClick={() => onNavigate('admin-dashboard')}
                      className={`hidden md:block text-sm font-bold transition-colors ${
                        activePage === 'admin-dashboard' 
                          ? 'text-red-600' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Admin Panel
                    </button>
                  )}

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 focus:outline-none group pl-2"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white ring-2 ring-slate-100 group-hover:ring-emerald-200 transition-all shadow-sm">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm">
                            {user.username[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <svg className={`hidden sm:block w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-4 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in origin-top-right">
                        <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/30">
                          <p className="text-sm font-bold text-slate-900 truncate">{user.username}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        
                        <div className="py-2">
                           <button 
                            onClick={() => handleNav('home')}
                            className="w-full text-left px-5 py-2.5 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors md:hidden"
                          >
                            <span>🔍</span> Cari Properti
                          </button>
                          <button 
                            onClick={() => handleNav('requests')}
                            className="w-full text-left px-5 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors md:hidden"
                          >
                            <span>📢</span> Titip Cari
                          </button>
                          <button 
                            onClick={() => handleNav('profile')}
                            className="w-full text-left px-5 py-2.5 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors"
                          >
                            <span>👤</span> Profil Saya
                          </button>
                          {user.isAdmin && (
                             <button 
                              onClick={() => handleNav('admin-dashboard')}
                              className="w-full text-left px-5 py-2.5 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors md:hidden"
                            >
                              <span>🛡️</span> Admin Panel
                            </button>
                          )}
                          <button 
                            onClick={() => handleNav('dashboard')}
                            className="w-full text-left px-5 py-2.5 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors md:hidden"
                          >
                            <span>📊</span> Dashboard
                          </button>
                        </div>

                        <div className="border-t border-slate-100 py-2">
                           <div className="px-5 py-2 sm:hidden">
                              <div className="text-xs text-slate-400 uppercase font-bold mb-1">Saldo Iklan</div>
                              <div className="text-sm font-bold text-emerald-700">Rp {user.credits.toLocaleString()}</div>
                           </div>
                          <button 
                            onClick={handleLogout}
                            className="w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 font-medium transition-colors"
                          >
                            <span>🚪</span> Keluar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onNavigate('login')}
                    className="text-slate-500 hover:text-slate-900 text-sm font-bold px-4 py-2 transition-colors"
                  >
                    Masuk
                  </button>
                  <button 
                    onClick={() => onNavigate('register')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-100 hover:shadow-emerald-200"
                  >
                    Pasang Iklan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;