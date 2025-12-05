import React, { useEffect, useState } from 'react';
import { PropertyRequest, Category, ListingType, POPULAR_LOCATIONS, LOCATION_GROUPS, User } from '../types';
import { StoreService } from '../services/store';
import Toast, { ToastType } from '../components/Toast';

interface RequestsProps {
  user: User | null;
  onNavigate: (page: string) => void;
}

const Requests: React.FC<RequestsProps> = ({ user, onNavigate }) => {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'BUY' | 'RENT'>('BUY');
  
  // Toast State
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };

  // Form State
  const [formData, setFormData] = useState({
    type: ListingType.JUAL,
    category: Category.RUMAH,
    location: POPULAR_LOCATIONS[0],
    budgetMin: '',
    budgetMax: '',
    description: '',
    isExample: false
  });

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

  const handleOpenModal = () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    setFormData({
      type: activeTab === 'BUY' ? ListingType.JUAL : ListingType.SEWA,
      category: Category.RUMAH,
      location: POPULAR_LOCATIONS[0],
      budgetMin: '',
      budgetMax: '',
      description: '',
      isExample: false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await StoreService.createRequest({
      userId: user.id,
      userName: user.username,
      userPhone: user.phoneNumber || '',
      type: formData.type,
      category: formData.category,
      location: formData.location,
      budgetMin: Number(formData.budgetMin),
      budgetMax: Number(formData.budgetMax),
      description: formData.description,
      isExample: formData.isExample // Pass flag
    });

    setIsModalOpen(false);
    loadRequests();
    showToast("Request berhasil diposting!", "success");
  };

  const handleContact = (req: PropertyRequest) => {
    if (!user) {
      showToast("Silakan login untuk menghubungi pencari properti ini.", "info");
      onNavigate('login');
      return;
    }
    
    // Format message
    const phone = req.userPhone.replace(/^0/, '62').replace(/\D/g, '');
    const msg = encodeURIComponent(`Halo Kak ${req.userName}, saya lihat di Vueltra Kakak sedang cari ${req.category} di ${req.location} dengan budget sekitar ${Number(req.budgetMax).toLocaleString()}. Saya punya penawaran yang mungkin cocok. Boleh diskusi?`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const filteredRequests = requests.filter(r => 
    (activeTab === 'BUY' ? r.type === ListingType.JUAL : r.type === ListingType.SEWA)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Pasar Permintaan (Request)</h1>
          <p className="text-slate-500 mt-1">Daftar orang yang sedang mencari properti. Tawarkan properti Anda langsung ke mereka.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
        >
          <span>📢</span> Buat Request Baru
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('BUY')}
          className={`pb-4 px-2 font-bold text-sm transition-colors relative ${activeTab === 'BUY' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Ingin Beli
          {activeTab === 'BUY' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('RENT')}
          className={`pb-4 px-2 font-bold text-sm transition-colors relative ${activeTab === 'RENT' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Ingin Sewa
          {activeTab === 'RENT' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Memuat data...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
           <div className="text-4xl mb-4">📭</div>
           <p className="text-slate-500 font-medium">Belum ada request di kategori ini.</p>
           <button onClick={handleOpenModal} className="text-blue-600 font-bold mt-2 hover:underline">Jadilah yang pertama!</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(req => (
            <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col h-full relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
               
               {/* EXAMPLE Badge - MOVED TO LEFT */}
               {req.isExample && (
                 <div className="absolute top-4 left-4 z-10">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded border border-slate-200">CONTOH</span>
                 </div>
               )}

               <div className="flex justify-between items-start mb-4 mt-4">
                  <div>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Dicari</span>
                     <h3 className="text-lg font-bold text-slate-900">{req.category}</h3>
                     <div className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {req.location}
                     </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                     {req.userName[0]}
                  </div>
               </div>

               <div className="bg-slate-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-slate-500 font-medium mb-1">Budget</div>
                  <div className="font-mono font-bold text-blue-800 text-lg">
                     {req.budgetMin === 0 ? 'Up to ' : ''} Rp {req.budgetMax.toLocaleString()}
                  </div>
               </div>

               <p className="text-slate-600 text-sm mb-6 flex-grow italic">
                  "{req.description}"
               </p>

               <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                     {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => handleContact(req)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors"
                  >
                    <span>💬</span> Tawarkan
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Buat Request Pencarian</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                 {/* Only Admin can set as Example */}
                 {user?.isAdmin && (
                    <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 flex items-center gap-3">
                       <input type="checkbox" id="isExampleReq" className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500" checked={formData.isExample} onChange={(e) => setFormData({...formData, isExample: e.target.checked})} />
                       <label htmlFor="isExampleReq" className="text-sm font-bold text-slate-700 cursor-pointer">Tandai sebagai CONTOH (Simulasi/Mock Data)</label>
                    </div>
                 )}

                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Saya ingin...</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                       <button type="button" onClick={() => setFormData({...formData, type: ListingType.JUAL})} className={`flex-1 py-2 text-sm font-bold rounded-md ${formData.type === ListingType.JUAL ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}>Membeli</button>
                       <button type="button" onClick={() => setFormData({...formData, type: ListingType.SEWA})} className={`flex-1 py-2 text-sm font-bold rounded-md ${formData.type === ListingType.SEWA ? 'bg-white shadow text-purple-700' : 'text-slate-500'}`}>Menyewa</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Tipe Properti</label>
                       <select className="w-full border border-gray-300 bg-white text-slate-900 p-2 rounded-lg text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                          {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Lokasi</label>
                       <select className="w-full border border-gray-300 bg-white text-slate-900 p-2 rounded-lg text-sm" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                          {LOCATION_GROUPS.flatMap(g => g.cities).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Budget Min (Rp)</label>
                       <input type="number" required className="w-full border border-gray-300 bg-white text-slate-900 p-2 rounded-lg text-sm" value={formData.budgetMin} onChange={e => setFormData({...formData, budgetMin: e.target.value})} placeholder="0" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Budget Max (Rp)</label>
                       <input type="number" required className="w-full border border-gray-300 bg-white text-slate-900 p-2 rounded-lg text-sm" value={formData.budgetMax} onChange={e => setFormData({...formData, budgetMax: e.target.value})} placeholder="1000000000" />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Kebutuhan</label>
                    <textarea required rows={4} className="w-full border border-gray-300 bg-white text-slate-900 p-3 rounded-lg text-sm" placeholder="Contoh: Cari rumah 2 lantai, minimal 3 kamar, akses mobil lancar, dekat tol..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                 </div>

                 <div className="flex gap-3 justify-end pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-200">Batal</button>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg">Posting Request</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Requests;