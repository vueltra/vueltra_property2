
import React, { useState } from 'react';
import { User, VerificationStatus } from '../types';
import { StoreService } from '../services/store';
import { useToast } from '../context/ToastContext'; // Use global Toast

interface VerificationProps {
  user: User;
  onRefreshUser: () => void;
}

const Verification: React.FC<VerificationProps> = ({ user, onRefreshUser }) => {
  const [ktpFile, setKtpFile] = useState<string | null>(user.ktpUrl || null);
  const [selfieFile, setSelfieFile] = useState<string | null>(user.selfieUrl || null);
  const [cardFile, setCardFile] = useState<string | null>(user.agentCardUrl || null);
  const [loading, setLoading] = useState(false);
  const [uploadingState, setUploadingState] = useState<{ [key: string]: boolean }>({});
  
  // Toast Context
  const { showToast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { 
        showToast("Ukuran file maksimal 5MB.", "error");
        return;
      }
      
      setUploadingState(prev => ({ ...prev, [key]: true }));
      try {
        const url = await StoreService.uploadImage(file);
        setter(url);
        showToast("File berhasil diupload", "success");
      } catch (error) {
        console.error("Upload failed", error);
        showToast("Gagal mengupload file.", "error");
      } finally {
        setUploadingState(prev => ({ ...prev, [key]: false }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ktpFile || !selfieFile) {
      showToast("Wajib upload Foto KTP dan Foto Selfie.", "error");
      return;
    }
    setLoading(true);
    
    try {
      await StoreService.submitVerification(ktpFile, selfieFile, cardFile || undefined);
      onRefreshUser();
      showToast("Dokumen berhasil dikirim. Menunggu verifikasi admin.", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal mengirim dokumen.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (user.verificationStatus === VerificationStatus.VERIFIED) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-green-700 mb-2">Akun Terverifikasi!</h2>
          <p className="text-green-600">Selamat! Akun Anda sudah memiliki centang biru. Tingkat kepercayaan pembeli terhadap listing Anda sekarang lebih tinggi.</p>
        </div>
      </div>
    );
  }

  if (user.verificationStatus === VerificationStatus.PENDING) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-12">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-3xl font-bold text-yellow-700 mb-2">Dalam Peninjauan</h2>
          <p className="text-yellow-600 mb-6">Dokumen Anda sedang diperiksa oleh Admin. Proses ini biasanya memakan waktu 1x24 jam.</p>
          <div className="text-sm text-slate-600">
             Mohon cek kembali secara berkala.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Toast is now global */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-8 py-10 text-white">
           <h1 className="text-2xl font-bold mb-2">Verifikasi Identitas (KYC)</h1>
           <p className="text-blue-100">
            Dapatkan badge "Terverifikasi" untuk meningkatkan kepercayaan pembeli dan mencegah penipuan.
            Data Anda aman dan hanya digunakan untuk validasi.
          </p>
        </div>

        <div className="p-8">
          {user.verificationStatus === VerificationStatus.REJECTED && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
              <div className="font-bold flex items-center gap-2 mb-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Verifikasi Ditolak
              </div>
              <p className="text-sm">
                Dokumen yang Anda kirimkan sebelumnya tidak valid atau buram. Silakan perbaiki dan upload ulang dokumen terbaru di bawah ini.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* KTP */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900">1. Foto KTP (Wajib)</label>
              <p className="text-sm text-slate-600">Pastikan NIK dan Nama terbaca jelas. Tidak blur.</p>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                {uploadingState['ktp'] ? (
                    <div className="text-slate-600 text-sm">Mengupload KTP...</div>
                ) : ktpFile ? (
                   <div className="relative h-48 w-full">
                     <img src={ktpFile} alt="Preview KTP" className="h-full w-full object-contain rounded" />
                     <button type="button" onClick={() => setKtpFile(null)} className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs rounded">Hapus</button>
                   </div>
                ) : (
                  <>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setKtpFile, 'ktp')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="text-slate-500">
                      <span className="block text-2xl mb-1">📷</span>
                      Klik untuk upload foto KTP
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Selfie */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900">2. Selfie dengan KTP (Wajib)</label>
              <p className="text-sm text-slate-600">Pegang KTP di samping wajah Anda. Pastikan wajah tidak tertutup aksesoris.</p>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                 {uploadingState['selfie'] ? (
                    <div className="text-slate-600 text-sm">Mengupload Selfie...</div>
                 ) : selfieFile ? (
                   <div className="relative h-48 w-full">
                     <img src={selfieFile} alt="Preview Selfie" className="h-full w-full object-contain rounded" />
                     <button type="button" onClick={() => setSelfieFile(null)} className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs rounded">Hapus</button>
                   </div>
                ) : (
                  <>
                     <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setSelfieFile, 'selfie')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="text-slate-500">
                      <span className="block text-2xl mb-1">🤳</span>
                      Klik untuk upload foto Selfie
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Agent Card */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900">3. Kartu Nama / ID Card Agen (Opsional)</label>
              <p className="text-sm text-slate-600">Jika Anda agen properti profesional (Ray White, Era, dll), lampirkan kartu nama.</p>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                 {uploadingState['card'] ? (
                    <div className="text-slate-600 text-sm">Mengupload Kartu...</div>
                 ) : cardFile ? (
                   <div className="relative h-48 w-full">
                     <img src={cardFile} alt="Preview Card" className="h-full w-full object-contain rounded" />
                     <button type="button" onClick={() => setCardFile(null)} className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs rounded">Hapus</button>
                   </div>
                ) : (
                  <>
                     <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setCardFile, 'card')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="text-slate-500">
                      <span className="block text-2xl mb-1">💳</span>
                      Klik untuk upload Kartu Nama
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button 
                type="submit" 
                disabled={loading || Object.values(uploadingState).some(v => v)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              >
                {loading ? 'Mengirim Data...' : 'Kirim Data Verifikasi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Verification;