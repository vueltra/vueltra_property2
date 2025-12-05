import React, { useState, useRef, useEffect } from 'react';
import { User, VerificationStatus } from '../types';
import { StoreService } from '../services/store';
import Toast, { ToastType } from '../components/Toast';

interface ProfileProps {
  user: User;
  onRefreshUser: () => void;
  onNavigate: (page: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onRefreshUser, onNavigate }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    phoneNumber: user.phoneNumber || ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast State
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) { 
        showToast("Ukuran foto maksimal 2MB", "error");
        return;
      }
      setUploading(true);
      try {
        const url = await StoreService.uploadImage(file);
        await StoreService.updateUserProfile(user.id, { photoUrl: url });
        onRefreshUser();
        showToast("Foto profil berhasil diperbarui!", "success");
      } catch (error) {
        showToast("Gagal mengupload foto profil.", "error");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await StoreService.updateUserProfile(user.id, {
        username: formData.username,
        phoneNumber: formData.phoneNumber
      });
      
      onRefreshUser();
      showToast("Profil berhasil disimpan!", "success");
    } catch (error) {
      showToast("Gagal memperbarui profil.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getVerificationBadge = () => {
    switch(user.verificationStatus) {
      case VerificationStatus.VERIFIED:
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">✅ Terverifikasi</span>;
      case VerificationStatus.PENDING:
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">⏳ Menunggu Verifikasi</span>;
      case VerificationStatus.REJECTED:
        return <button onClick={() => onNavigate('verification')} className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full hover:bg-red-200">❌ Ditolak (Coba Lagi)</button>;
      default:
        return <button onClick={() => onNavigate('verification')} className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full hover:bg-slate-200 border border-slate-300">⚠️ Verifikasi Akun</button>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-10 text-white">
           <h1 className="text-2xl font-bold">Profil Saya</h1>
           <p className="text-blue-100 text-sm">Kelola informasi pribadi dan keamanan akun Anda.</p>
        </div>
        
        <div className="p-8">
           {/* Avatar Section */}
           <div className="flex flex-col items-center -mt-20 mb-8">
              <div className="relative group cursor-pointer" onClick={() => !uploading && fileInputRef.current?.click()}>
                 <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-slate-400 font-bold">{user.username[0]?.toUpperCase()}</span>
                    )}
                 </div>
                 <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">{uploading ? '...' : 'Ubah Foto'}</span>
                 </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
              <div className="mt-4 text-center">
                 <h2 className="text-xl font-bold text-slate-900">{user.username}</h2>
                 <p className="text-sm text-slate-500">Anggota sejak {new Date(user.joinedAt).toLocaleDateString()}</p>
              </div>
           </div>

           <form onSubmit={handleSave} className="space-y-6">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Nama Pengguna</label>
                 <input 
                   type="text" 
                   value={formData.username}
                   onChange={(e) => setFormData({...formData, username: e.target.value})}
                   className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                 />
              </div>

              <div>
                 <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Alamat Email</label>
                    {getVerificationBadge()}
                 </div>
                 <input 
                   type="email" 
                   value={user.email}
                   disabled
                   className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                 />
                 <p className="text-xs text-slate-400 mt-1">*Email tidak dapat diubah.</p>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Nomor WhatsApp</label>
                 <input 
                   type="tel" 
                   value={formData.phoneNumber}
                   onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                   className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                   placeholder="Contoh: 08123456789"
                 />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                 <button 
                   type="submit" 
                   disabled={loading || uploading}
                   className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all disabled:opacity-70"
                 >
                   {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;