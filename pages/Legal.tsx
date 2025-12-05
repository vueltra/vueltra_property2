import React, { useState } from 'react';

interface LegalProps {
  onBack: () => void;
}

const Legal: React.FC<LegalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'disclaimer'>('terms');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button onClick={onBack} className="mb-6 text-slate-400 hover:text-white font-medium flex items-center gap-2 transition-colors">
        &larr; Kembali ke Beranda
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Pusat Legalitas & Privasi</h1>
        <p className="text-slate-400">Transparansi dan keamanan adalah prioritas kami di Vueltra.</p>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-4 px-6 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'terms' ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
          >
            Syarat & Ketentuan
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-4 px-6 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'privacy' ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
          >
            Kebijakan Privasi
          </button>
          <button 
            onClick={() => setActiveTab('disclaimer')}
            className={`flex-1 py-4 px-6 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'disclaimer' ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
          >
            Disclaimer (Penafian)
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-slate-300 leading-relaxed text-sm md:text-base space-y-6 max-h-[70vh] overflow-y-auto">
          
          {activeTab === 'terms' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-4">Syarat dan Ketentuan Penggunaan</h2>
              <p>Selamat datang di Vueltra. Dengan mengakses atau menggunakan situs web kami, Anda setuju untuk terikat oleh syarat dan ketentuan berikut:</p>
              
              <h3 className="font-bold text-white mt-4 mb-2">1. Definisi Layanan</h3>
              <p>Vueltra adalah platform perantara (marketplace) yang mempertemukan penjual/agen properti dengan calon pembeli atau penyewa. Vueltra TIDAK memiliki properti yang terdaftar dan bukan merupakan agen real estate, kecuali dinyatakan lain secara eksplisit.</p>

              <h3 className="font-bold text-white mt-4 mb-2">2. Akun Pengguna</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Anda wajib memberikan informasi yang akurat dan lengkap saat mendaftar.</li>
                <li>Anda bertanggung jawab penuh atas keamanan kata sandi akun Anda.</li>
                <li>Vueltra berhak menangguhkan akun yang terindikasi melakukan penipuan atau pelanggaran hukum.</li>
              </ul>

              <h3 className="font-bold text-white mt-4 mb-2">3. Konten Listing</h3>
              <p>Penjual dilarang memposting properti fiktif, menggunakan foto milik orang lain tanpa izin, atau mencantumkan harga yang menyesatkan. Vueltra berhak menghapus konten yang melanggar tanpa pemberitahuan sebelumnya.</p>

              <h3 className="font-bold text-white mt-4 mb-2">4. Biaya dan Pembayaran</h3>
              <p>Pendaftaran akun dan pemasangan iklan dasar bersifat gratis. Fitur premium seperti "Top Listing" dikenakan biaya sesuai tarif yang berlaku. Pembayaran yang sudah dilakukan tidak dapat dikembalikan (non-refundable).</p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-4">Kebijakan Privasi</h2>
              <p>Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) yang berlaku di Indonesia.</p>

              <h3 className="font-bold text-white mt-4 mb-2">1. Data yang Kami Kumpulkan</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Informasi Identitas: Nama, alamat email, nomor telepon, dan foto profil.</li>
                <li>Dokumen Verifikasi: Foto KTP dan Selfie (untuk fitur Verified Agent).</li>
                <li>Data Aktivitas: Riwayat pencarian, properti favorit, dan log transaksi saldo.</li>
              </ul>

              <h3 className="font-bold text-white mt-4 mb-2">2. Penggunaan Data</h3>
              <p>Data Anda digunakan untuk memvalidasi akun, menghubungkan Anda dengan penjual/pembeli, dan meningkatkan layanan kami. Foto KTP hanya digunakan untuk proses verifikasi manual dan tidak akan ditampilkan secara publik.</p>

              <h3 className="font-bold text-white mt-4 mb-2">3. Keamanan Data</h3>
              <p>Kami menggunakan enkripsi standar industri untuk melindungi data sensitif Anda. Kami tidak akan menjual data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran tanpa persetujuan Anda.</p>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-4">Penafian (Disclaimer)</h2>
              <div className="bg-red-900/20 border-l-4 border-red-600 p-4 mb-6 text-red-300 font-medium">
                PENTING: Harap baca dengan seksama sebelum melakukan transaksi apapun.
              </div>

              <h3 className="font-bold text-white mt-4 mb-2">1. Transaksi Properti</h3>
              <p>Vueltra TIDAK terlibat dalam proses pembayaran transaksi properti (DP, pelunasan, sewa) antara Pembeli dan Penjual. Segala transaksi keuangan terkait properti dilakukan secara langsung antar pihak (peer-to-peer) di luar platform Vueltra.</p>

              <h3 className="font-bold text-white mt-4 mb-2">2. Verifikasi Data Properti</h3>
              <p>Meskipun kami berusaha memverifikasi agen, kami tidak menjamin keakuratan 100% mengenai detail properti (luas tanah, legalitas sertifikat, kondisi bangunan). Pembeli WAJIB melakukan cek fisik (survei) dan pengecekan legalitas ke BPN (Badan Pertanahan Nasional) sebelum melakukan pembayaran.</p>

              <h3 className="font-bold text-white mt-4 mb-2">3. Batasan Tanggung Jawab</h3>
              <p>Vueltra tidak bertanggung jawab atas kerugian finansial, penipuan, atau sengketa hukum yang timbul akibat interaksi antar pengguna di platform ini. Kami menyarankan penggunaan jasa notaris/PPAT terpercaya untuk setiap transaksi jual beli.</p>
            </div>
          )}

        </div>
        <div className="bg-slate-900 px-8 py-4 border-t border-slate-800 text-xs text-slate-500 text-center">
           Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

export default Legal;