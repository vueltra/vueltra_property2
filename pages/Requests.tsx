

import React, { useEffect, useState } from 'react';
import { PropertyRequest, ListingType } from '../types';
import { StoreService } from '../services/store';
import { useToast } from '../context/ToastContext';

interface RequestsProps {
  user: any; // Simplified type for brevity, should be User | null
  onNavigate: (page: string) => void;
}

const Requests: React.FC<RequestsProps> = ({ user, onNavigate }) => {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'BUY' | 'RENT'>('BUY');
  
  // Toast Context
  const { showToast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const data = await StoreService.getRequests();
    // Sort new to old
    setRequests(data.sort((a, b) => b.createdAt - a.createdAt));
    setLoading(false);
  };

  const handleCreateClick = () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    onNavigate('create-request');
  };

  const handleContact = (req: PropertyRequest) => {
    if (!user) {
      showToast("Silakan login untuk menghubungi pencari properti ini.", "info");
      onNavigate('login');
      return;
    }
    // Logic to open WhatsApp or show contact info
    const phoneNumber = req.userPhone.replace(/^0/, '62');
    const message = encodeURIComponent(`Halo ${req.userName}, saya melihat request properti Anda di Vueltra. Saya punya properti yang mungkin cocok: ${req.description}. Bolehkah saya tawarkan lebih detail?`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleDeleteRequest = async (id: string) => {
    if (!user || !user.isAdmin) { // Only admin can delete requests
      showToast("Akses ditolak.", "error");
      return;
    }
    // Add confirmation modal in a real app
    if (window.confirm("Yakin ingin menghapus request ini?")) {
      await StoreService.deleteRequest(id);
      showToast("Request berhasil dihapus.", "success");
      loadRequests();
    }
  };

  const filteredRequests = requests.filter(req => 
    (activeTab === 'BUY' && req.type === ListingType.JUAL) ||
    (activeTab === 'RENT' && req.type === ListingType.SEWA)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Titip Cari Properti</h1>
          <p className="text-slate-600 mt-2">Daftar permintaan properti dari calon pembeli/penyewa.</p>
        </div>
        <button 
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
        >
          + Buat Request Saya
        </button>
      </div>

      <div className="mb-8 flex gap-4 border-b border-slate-200 pb-1">
         <button 
           onClick={() => setActiveTab('BUY')}
           className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'BUY' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
         >
           Mencari Dijual
           {activeTab === 'BUY' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
         </button>
         <button 
           onClick={() => setActiveTab('RENT')}
           className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'RENT' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
         >
           Mencari Disewa
           {activeTab === 'RENT' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
         </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Memuat permintaan...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.length === 0 ? (
            <div className="md:col-span-3 text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
               <p className="text-slate-500 font-medium">Belum ada permintaan di kategori ini.</p>
               <p className="text-sm text-slate-400 mt-2">Coba buat permintaan Anda sendiri!</p>
            </div>
          ) : (
            filteredRequests.map(req => (
              <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full relative">
                {req.isExample && (
                   <span className="absolute top-3 right-3 bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-slate-200">CONTOH</span>
                )}
                <div className="flex items-center gap-2 mb-3">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.type === ListingType.JUAL ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{req.type}</span>
                   <span className="text-xs text-slate-500">{req.category}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{req.location}</h3>
                <p className="text-slate-600 text-sm mb-4 flex-grow">{req.description}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100">
                   <div className="text-xs text-slate-500 uppercase font-bold mb-1">Budget</div>
                   <div className="text-lg font-bold text-emerald-700">Rp {req.budgetMin.toLocaleString()} - {req.budgetMax.toLocaleString()}</div>
                   <div className="flex justify-between items-center mt-3">
                      <div>
                         <div className="text-xs text-slate-500">Oleh</div>
                         <div className="font-bold text-slate-800">{req.userName}</div>
                      </div>
                      <button 
                         onClick={() => handleContact(req)}
                         className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                      >
                         Hubungi Pencari
                      </button>
                   </div>
                   {user?.isAdmin && (
                      <div className="mt-3 text-right">
                         <button onClick={() => handleDeleteRequest(req.id)} className="text-red-600 text-xs font-bold hover:underline">Hapus Request (Admin)</button>
                      </div>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Requests;