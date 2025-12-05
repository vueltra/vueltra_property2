import React, { useState } from 'react';
import { StoreService } from '../services/store';
import Toast, { ToastType } from '../components/Toast';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      await StoreService.resetPassword(email);
      setStatus('success');
      // No toast needed for success here as we change the view entirely, which is stronger feedback
    } catch (err: any) {
      setStatus('idle');
      setToast({ msg: err.message || 'Gagal mengirim reset password.', type: 'error' });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-stone-200 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-stone-900 mb-2">Reset Password</h2>
          <p className="text-stone-500">Masukkan email yang terdaftar</p>
        </div>

        {status === 'success' ? (
          <div className="text-center animate-fade-in">
            <div className="bg-emerald-50 text-emerald-700 p-6 rounded-xl mb-6 border border-emerald-100 flex flex-col items-center">
              <span className="text-4xl mb-2">📧</span>
              <p className="font-bold">Email Terkirim!</p>
              <p className="text-sm mt-1">Link reset password telah dikirim ke <span className="font-bold">{email}</span></p>
            </div>
            <button 
              onClick={() => onNavigate('login')}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3 rounded-lg transition-colors"
            >
              Kembali ke Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-stone-900 focus:ring-emerald-500 focus:border-emerald-500 outline-none focus:ring-2"
                placeholder="user@example.com"
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
            >
              {status === 'loading' ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
            
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => onNavigate('login')}
                className="text-sm text-stone-500 hover:text-stone-800 font-medium"
              >
                Batal, kembali ke login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;