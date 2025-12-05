import React, { useState } from 'react';
import { StoreService } from '../services/store';
import Toast, { ToastType } from '../components/Toast';

interface LoginProps {
  onSuccess: () => void;
  onNavigate: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await StoreService.login(email, password);
      onSuccess();
    } catch (err: any) {
      setToast({ msg: err.message || 'Gagal login.', type: 'error' });
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
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang</h2>
          <p className="text-slate-500">Masuk ke Vueltra Dashboard</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-6 text-xs text-blue-800">
           <strong>Demo Admin Account:</strong><br/>
           Email: admin@vueltra.com<br/>
           Pass: admin
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-900 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all focus:ring-2"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <button 
                type="button" 
                onClick={() => onNavigate('forgot-password')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Lupa password?
              </button>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-slate-900 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all focus:ring-2"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          Belum punya akun?{' '}
          <button onClick={() => onNavigate('register')} className="text-blue-600 hover:text-blue-700 font-bold">
            Daftar Gratis
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;