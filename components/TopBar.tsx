import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface TopBarProps {
  onToggleSidebar: () => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, searchValue, onSearchChange, user, onNavigate, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between sticky top-0 z-30">
      
      {/* Left: Hamburger & Mobile Logo */}
      <div className="flex items-center gap-3 md:gap-0">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
           <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">V</div>
           <span className="font-bold text-slate-900">Vueltra</span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative group">
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

      {/* Right: Actions / Profile */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
               <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-bold">
                      {user.username[0]}
                    </div>
                  )}
               </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fade-in">
                 <div className="px-4 py-3 border-b border-slate-50">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.username}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                 </div>
                 <button onClick={() => { setIsProfileOpen(false); onNavigate('profile'); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Profil Saya</button>
                 <button onClick={() => { setIsProfileOpen(false); onNavigate('dashboard'); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Dashboard</button>
                 <div className="border-t border-slate-100 my-1"></div>
                 <button onClick={() => { setIsProfileOpen(false); onLogout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Keluar</button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => onNavigate('login')}
            className="text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Masuk
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;