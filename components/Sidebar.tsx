
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
  
  const publicMenu = [
    { id: 'home', label: 'Cari Properti', icon: '🏠' },
    { id: 'requests', label: 'Titip Cari (Request)', icon: '📢' },
    { id: 'blog', label: 'Blog & Edukasi', icon: '📚' },
  ];

  const userMenu = user ? [
    { id: 'dashboard', label: 'Dashboard Saya', icon: '📊' },
    { id: 'profile', label: 'Profil Akun', icon: '👤' },
  ] : [];

  const adminMenu = (user && user.isAdmin) ? [
    { id: 'admin-dashboard', label: 'Admin Panel', icon: '🛡️' },
  ] : [];

  const handleNav = (page: string) => {
    onNavigate(page);
    onClose();
  };

  const renderMenuItem = (item: { id: string, label: string, icon: string }) => {
    const isActive = activePage === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleNav(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all relative group ${
          isActive
            ? 'text-blue-700 bg-blue-50'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"></div>}
        <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
        {item.label}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container - MOBILE ONLY */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
               <span className="text-white font-bold text-lg">V</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                Vueltra
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto py-6">
          
          <div className="space-y-1 mb-8">
             <div className="px-6 mb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Menu Utama</div>
             {publicMenu.map(renderMenuItem)}
          </div>

          {user && (
            <div className="space-y-1 mb-8">
               <div className="px-6 mb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Akun Saya</div>
               {userMenu.map(renderMenuItem)}
            </div>
          )}

          {user && user.isAdmin && (
            <div className="space-y-1">
               <div className="px-6 mb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Area Admin</div>
               {adminMenu.map(renderMenuItem)}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-200 space-y-1">
             <div className="px-6 mb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Bantuan</div>
             {[{id: 'contact', label: 'Hubungi Kami', icon: '📞'}, {id: 'legal', label: 'Legal & Privasi', icon: '⚖️'}].map(renderMenuItem)}
          </div>
        </div>

        {/* User Info / Logout (Bottom) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          {user ? (
            <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-emerald-50/50">
               <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm">
                 {user.photoUrl ? (
                   <img src={user.photoUrl} alt={user.username} className="w-full h-full object-cover" />
                 ) : (
                   user.username[0]?.toUpperCase()
                 )}
               </div>
               <div className="flex-1">
                 <div className="font-bold text-slate-900 text-sm truncate">{user.username}</div>
                 <div className="text-xs text-slate-600 truncate">{user.email}</div>
               </div>
            </div>
          ) : (
            <div className="mb-3">
              <button onClick={() => handleNav('login')} className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
                Masuk
              </button>
            </div>
          )}
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-lg">
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>
    </>
  );
};

// Changed from default export to named export
export { Sidebar };
