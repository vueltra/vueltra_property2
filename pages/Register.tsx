import React, { useState } from 'react';
import { StoreService } from '../services/store';
import Toast, { ToastType } from '../components/Toast';

interface RegisterProps {
  onSuccess: () => void;
  onNavigate: (page: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setToast({ msg: 'Password konfirmasi tidak cocok.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await StoreService.register(formData.username, formData.email, formData.password, formData.phoneNumber);
      // Optional: Show success toast before redirect, though onSuccess usually navigates away
      onSuccess();
    } catch (err: any) {
      setToast({ msg: err.message || 'Gagal mendaftar.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">V</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Buat Akun Baru</h2>
          <p className="text-slate-500">Mulai jual atau sewa properti Anda sekarang</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama / Nama Agen</label>
            <input 
              type="text" 
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-900 focus:ring-blue-500 focus:border-blue-500 outline-none focus:ring-2"
              placeholder="JuraganProperti"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-900 focus:ring-blue-500 focus:border-blue-500 outline-none focus:ring-2"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nomor WhatsApp</label>
            <input 
              type="tel" 
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-900 focus:ring-blue-500 focus:border-blue-500 outline-none focus:ring-2"
              placeholder="08123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-900 focus:ring-blue-500 focus:border-blue-500 outline-none focus:ring-2"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label>
            <input 
              type="password" 
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-900 focus:ring-blue-500 focus:border-blue-500 outline-none focus:ring-2"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          Sudah punya akun?{' '}
          <button onClick={() => onNavigate('login')} className="text-blue-600 hover:text-blue-700 font-bold">
            Login di sini
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;