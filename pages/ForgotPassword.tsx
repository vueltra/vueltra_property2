
import React, { useState } from 'react';
import { StoreService } from '../services/store';
import { useToast } from '../context/ToastContext'; // Use global Toast

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const { showToast } = useToast();

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
      showToast(err.message || 'Gagal mengirim reset password.', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {/* Toast is now global */}
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h2>
          <p className="text-slate-600">Masukkan email yang terdaftar</p>
        </div>

        {status === 'success' ? (
          <div className="text-center animate-fade-in">
            <div className="bg-green-50 text-green-700 p-6 rounded-xl mb-6 border border-green-200 flex flex-col items-center">
              <span className="text-4xl mb-2">📧</span>
              <p className="font-bold">Email Terkirim!</p>
              <p className="text-sm mt-1">Link reset password telah dikirim ke <span className="font-bold">{email}</span></p>
            </div>
            <button 
              onClick={() => onNavigate('login')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-colors"
            >
              Kembali ke Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {status === 'loading' ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
            
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => onNavigate('login')}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium"
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