import React from 'react';
import { User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activePage, onNavigate, user, onLogout }) => {
  const menuItems = [
    { id: 'home', label: 'Cari Properti', icon: '🏠' },
    { id: 'requests', label: 'Titip Cari (Wants)', icon: '📢' },
    { id: 'blog', label: 'Blog & Edukasi', icon: '📚' },
  ];

  if (user) {
    menuItems.push({ id: 'dashboard', label: 'Dashboard Saya', icon: '📊' });
    menuItems.push({ id: 'profile', label: 'Profil Akun', icon: '👤' });
    if (user.isAdmin) {
      menuItems.push({ id: 'admin-dashboard', label: 'Admin Panel', icon: '🛡️' });
    }
  }

  const handleNav = (page: string) => {
    onNavigate(page);
    if (window.innerWidth < 768) {
      onClose(); // Close sidebar on mobile after click
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('home')}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg">
               <rect width="40" height="40" rx="10" fill="#1d4ed8"/> {/* blue-700 */}
               <path d="M12 12L20 30L28 12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                Vueltra
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                Marketplace
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activePage === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Additional Links */}
          <div className="pt-6 mt-6 border-t border-slate-100">
             <div className="px-3 text-xs font-bold text-slate-400 uppercase mb-2">Lainnya</div>
             <button onClick={() => handleNav('contact')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                <span>📞</span> Kontak Kami
             </button>
             <button onClick={() => handleNav('legal')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                <span>⚖️</span> Legalitas
             </button>
          </div>
        </div>

        {/* User Info / Logout (Bottom) */}
        <div className="p-4 border-t border-slate-200">
          {user ? (
            <div className="flex items-center gap-3 mb-3">
               <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm overflow-hidden">
                  {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" alt="User"/> : user.username[0]}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.username}</p>
                  <p className="text-xs text-slate-500 truncate">Rp {user.credits.toLocaleString()}</p>
               </div>
            </div>
          ) : (
             <div className="mb-3">
                <button onClick={() => handleNav('login')} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-800 transition-colors">
                   Masuk / Daftar
                </button>
             </div>
          )}
          
          {user && (
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Keluar
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;