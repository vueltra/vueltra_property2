
import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { StoreService } from '../services/store';

interface ContactProps {
  onBack: () => void;
}

const Contact: React.FC<ContactProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    StoreService.getSettings().then(setSettings);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {/* Header Blue Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white py-16 md:py-24 relative overflow-hidden border-b border-blue-200">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 4.25l-7.07 4.42c-.32.2-.74.2-1.06 0L4.4 8.25c-.25-.16-.4-.43-.4-.72 0-.67.73-1.07 1.3-.72L12 11l6.7-4.19c.57-.35 1.3.05 1.3.72 0 .29-.15.56-.4.72z"/></svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-4">
             <button onClick={onBack} className="text-blue-200 hover:text-white flex items-center gap-2 font-medium transition-colors">
               &larr; Kembali ke Beranda
             </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kontak Kami</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Hubungi kami untuk pertanyaan, saran, komentar, atau permasalahan apa pun. Tim kami siap membantu Anda.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Customer Service */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
             <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">
               Layanan Pengaduan Konsumen
             </h2>
             <p className="text-slate-600 mb-6 text-sm">
                Vueltra Indonesia berkomitmen memberikan pelayanan terbaik. Silakan hubungi kami melalui saluran berikut:
             </p>
             
             <div className="space-y-6">
                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-slate-100 text-blue-700 rounded-full flex items-center justify-center text-xl flex-shrink-0 border border-slate-200">
                      🕒
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900">Jam Kerja</h4>
                      <p className="text-slate-600">{settings?.contactWorkingHours || 'Memuat...'}</p>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-slate-100 text-blue-700 rounded-full flex items-center justify-center text-xl flex-shrink-0 border border-slate-200">
                      📞
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900">Nomor Telepon</h4>
                      <p className="text-slate-600 text-lg font-mono">{settings?.contactPhone || 'Memuat...'}</p>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-slate-100 text-blue-700 rounded-full flex items-center justify-center text-xl flex-shrink-0 border border-slate-200">
                      📧
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900">Email Support</h4>
                      <a href={`mailto:${settings?.contactEmail}`} className="text-blue-700 hover:text-blue-900 hover:underline">{settings?.contactEmail || 'Memuat...'}</a>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-slate-100 text-blue-700 rounded-full flex items-center justify-center text-xl flex-shrink-0 border border-slate-200">
                      🏢
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900">Alamat Kantor</h4>
                      <p className="text-slate-600">{settings?.contactAddress || 'Memuat...'}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Card 2: Other Inquiries */}
          <div className="space-y-8">
             <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 hover:border-slate-300 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2 text-lg">Pertanyaan Pers & Media</h3>
                <p className="text-slate-600 text-sm mb-4">
                   Untuk keperluan media dan permintaan pembicara harap hubungi tim PR kami.
                </p>
                <a href={`mailto:press@vueltra.com`} className="text-blue-700 font-bold hover:underline text-sm">
                   Hubungi Tim PR &rarr;
                </a>
             </div>

             <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 hover:border-slate-300 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2 text-lg">Karir di Vueltra</h3>
                <p className="text-slate-600 text-sm mb-4">
                   Bergabunglah menjadi #gamechanger di industri properti sekarang! Cek lowongan terbaru kami.
                </p>
                <button className="text-blue-700 font-bold hover:underline text-sm">
                   Lihat Lowongan (LinkedIn) &rarr;
                </button>
             </div>

             <div className="bg-blue-50 rounded-2xl border border-blue-200 p-8">
                <h3 className="font-bold text-blue-700 mb-2 text-lg flex items-center gap-2">
                   <span>🛡️</span> Tips Keamanan
                </h3>
                <p className="text-blue-600/80 text-sm mb-4">
                   Jangan pernah mentransfer uang ke rekening pribadi agen sebelum bertemu dan mengecek legalitas properti. Gunakan fitur pelaporan jika menemukan iklan mencurigakan.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;