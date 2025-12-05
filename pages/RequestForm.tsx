

import React, { useState } from 'react';
import { User, ListingType, Category } from '../types';
import { StoreService } from '../services/store';
import { useToast } from '../context/ToastContext';
import { POPULAR_LOCATIONS, LOCATION_GROUPS } from '../services/data'; // Corrected import path

interface RequestFormProps {
  user: User;
  onNavigate: (page: string) => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ user, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    type: ListingType.JUAL,
    category: Category.RUMAH,
    location: POPULAR_LOCATIONS[0],
    budgetMin: '',
    budgetMax: '',
    description: '',
    isExample: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
            isExample: formData.isExample
        });

        showToast("Request berhasil diposting!", "success");
        setTimeout(() => onNavigate('requests'), 1500);
    } catch(e) {
        showToast("Gagal membuat request.", "error");
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      
      <div className="mb-8">
        <button onClick={() => onNavigate('requests')} className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2 mb-4 transition-colors">
          &larr; Kembali
        </button>
        <h1 className="text-3xl font-extrabold text-slate-900">Buat Request (Titip Cari)</h1>
        <p className="text-slate-500 mt-2">Biarkan agen dan penjual yang menawarkan properti ke Anda.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         <form onSubmit={handleSubmit} className="p-8 space-y-6">
             {/* Admin Only: Example Flag */}
             {user.isAdmin && (
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 flex items-center gap-3">
                   <input type="checkbox" id="isExampleReq" className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500" checked={formData.isExample} onChange={(e) => setFormData({...formData, isExample: e.target.checked})} />
                   <label htmlFor="isExampleReq" className="text-sm font-bold text-slate-700 cursor-pointer">Tandai sebagai CONTOH (Simulasi)</label>
                </div>
             )}

             <div>
                <label className="form-label">Saya sedang mencari...</label>
                <div className="flex bg-slate-100 p-1.5 rounded-xl">
                   <button type="button" onClick={() => setFormData({...formData, type: ListingType.JUAL})} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${formData.type === ListingType.JUAL ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>Properti Dijual</button>
                   <button type="button" onClick={() => setFormData({...formData, type: ListingType.SEWA})} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${formData.type === ListingType.SEWA ? 'bg-white shadow text-purple-700' : 'text-slate-500 hover:text-slate-700'}`}>Properti Disewa</button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="form-label">Tipe Properti</label>
                   <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                      {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                   <label className="form-label">Lokasi Dicari</label>
                   <div className="relative">
                      <select className="form-select" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                          {LOCATION_GROUPS.flatMap(g => g.cities).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="form-label">Budget Min (Rp)</label>
                   <input type="number" required className="form-input" value={formData.budgetMin} onChange={e => setFormData({...formData, budgetMin: e.target.value})} placeholder="0" />
                </div>
                <div>
                   <label className="form-label">Budget Max (Rp)</label>
                   <input type="number" required className="form-input" value={formData.budgetMax} onChange={e => setFormData({...formData, budgetMax: e.target.value})} placeholder="1000000000" />
                </div>
             </div>

             <div>
                <label className="form-label">Deskripsi Kebutuhan</label>
                <textarea required rows={5} className="form-input" placeholder="Contoh: Cari rumah 2 lantai, minimal 3 kamar, akses mobil lancar, dekat tol, hadap timur..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
             </div>

             <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => onNavigate('requests')} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="flex-[2] py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 shadow-lg shadow-blue-200 transition-colors disabled:opacity-50">
                   {loading ? 'Memproses...' : 'Posting Request'}
                </button>
             </div>
         </form>
      </div>
    </div>
  );
};

export default RequestForm;