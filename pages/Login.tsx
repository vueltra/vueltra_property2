
import React, { useState } from 'react';
import { StoreService } from '../services/store';
import { useToast } from '../context/ToastContext'; // Use global Toast

interface LoginProps {
  onSuccess: () => void;
  onNavigate: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Toast Context
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await StoreService.login(email, password);
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Gagal login.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {/* Toast is now global */}
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">V</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang</h2>
          <p className="text-slate-600">Masuk ke Vueltra Dashboard</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg mb-6 text-xs text-slate-600">
           <strong>Demo Admin Account:</strong><br/>
           Email: admin@vueltra.com<br/>
           Pass: admin
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="form-label">Password</label>
              <button 
                type="button" 
                onClick={() => onNavigate('forgot-password')}
                className="text-xs text-blue-700 hover:text-blue-900 font-medium"
              >
                Lupa password?
              </button>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600 border-t border-slate-200 pt-6">
          Belum punya akun?{' '}
          <button onClick={() => onNavigate('register')} className="text-blue-700 hover:text-blue-900 font-bold">
            Daftar Gratis
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;