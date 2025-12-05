import React, { useState, useEffect } from 'react';
import { Listing, Category, User, POPULAR_LOCATIONS, LOCATION_GROUPS, ListingType, ListingStatus, Transaction } from '../types';
import { StoreService } from '../services/store';
import { generateDescription } from '../services/geminiService';
import ListingCard from '../components/ListingCard';
import Toast, { ToastType } from '../components/Toast';

const PIN_COST = 50000;

interface DashboardProps {
  user: User;
  onRefreshUser: () => void;
}

// Custom select style class
const SELECT_CLASS = "w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-3 pr-10 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19.5%208.25l-7.5%207.5-7.5-7.5%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

// Custom input style class
const INPUT_CLASS = "w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const Dashboard: React.FC<DashboardProps> = ({ user, onRefreshUser }) => {
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'transactions'>('listings');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Custom Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({ isOpen: false, message: '', onConfirm: () => {}, isDestructive: false });
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: Category.RUMAH,
    type: ListingType.JUAL,
    location: POPULAR_LOCATIONS[0],
    address: '',
    imageUrl: '',
    surfaceArea: '',
    buildingArea: '',
    bedrooms: '',
    bathrooms: '',
    certificate: 'SHM',
    whatsapp: ''
  });

  // Helper to check if category needs building specs
  const isBuilding = formData.category !== Category.TANAH && formData.category !== Category.SPACE;

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    const all = await StoreService.getListings();
    setMyListings(all.filter(l => l.sellerId === user.id));
    
    const trx = await StoreService.getTransactions();
    setTransactions(trx);
  };

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };

  const showConfirm = (message: string, onConfirm: () => void, isDestructive = false) => {
    setConfirmModal({ isOpen: true, message, onConfirm, isDestructive });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDelete = async (id: string) => {
    showConfirm("Hapus listing properti ini?", async () => {
      await StoreService.deleteListing(id);
      loadData();
      showToast("Listing berhasil dihapus", "success");
      closeConfirm();
    }, true);
  };

  const handleStatusToggle = async (listing: Listing) => {
    const newStatus = listing.status === ListingStatus.ACTIVE ? ListingStatus.SOLD : ListingStatus.ACTIVE;
    const msg = newStatus === ListingStatus.SOLD 
      ? "Tandai properti sebagai TERJUAL? Iklan akan tetap ada tapi tidak bisa dibeli."
      : "Aktifkan kembali properti ini?";
      
    showConfirm(msg, async () => {
       await StoreService.updateListingStatus(listing.id, newStatus);
       loadData();
       showToast(`Status listing diubah menjadi ${newStatus}`, "info");
       closeConfirm();
    });
  };

  const handlePin = async (id: string) => {
    if (user.credits < PIN_COST) {
      showToast("Saldo iklan tidak cukup! Silahkan Top Up.", "error");
      setIsTopUpOpen(true);
      return;
    }
    showConfirm(`Jadikan Top Listing selama 24 jam dengan biaya Rp ${PIN_COST.toLocaleString()}?`, async () => {
      const success = await StoreService.pinListing(id, PIN_COST);
      if (success) {
        onRefreshUser();
        loadData();
        showToast("Listing berhasil dipromosikan!", "success");
      }
      closeConfirm();
    });
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({ 
      title: '', description: '', price: '', 
      category: Category.RUMAH, type: ListingType.JUAL, location: POPULAR_LOCATIONS[0],
      address: '', imageUrl: '', surfaceArea: '', buildingArea: '',
      bedrooms: '', bathrooms: '', certificate: 'SHM', whatsapp: user.phoneNumber || '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (listing: Listing) => {
    setEditingId(listing.id);
    setFormData({
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      category: listing.category,
      type: listing.type,
      location: listing.location,
      address: listing.address || '',
      imageUrl: listing.imageUrl,
      surfaceArea: listing.surfaceArea.toString(),
      buildingArea: listing.buildingArea.toString(),
      bedrooms: listing.bedrooms.toString(),
      bathrooms: listing.bathrooms.toString(),
      certificate: listing.certificate || 'SHM',
      whatsapp: listing.whatsapp
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await StoreService.uploadImage(file);
        setFormData(prev => ({ ...prev, imageUrl: url }));
        showToast("Gambar berhasil diupload", "success");
      } catch (error) {
        showToast("Gagal mengupload gambar", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
        showToast("Mohon upload foto properti", "error");
        return;
    }
    
    const commonData = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      category: formData.category,
      type: formData.type,
      location: formData.location,
      address: formData.address,
      imageUrl: formData.imageUrl,
      surfaceArea: Number(formData.surfaceArea),
      buildingArea: isBuilding ? Number(formData.buildingArea) : 0,
      bedrooms: isBuilding ? Number(formData.bedrooms) : 0,
      bathrooms: isBuilding ? Number(formData.bathrooms) : 0,
      certificate: formData.certificate,
      whatsapp: formData.whatsapp
    };

    try {
        if (editingId) {
            // UPDATE EXISTING
            const original = myListings.find(l => l.id === editingId);
            if (original) {
                await StoreService.updateListing({
                ...original,
                ...commonData
                });
            }
            showToast("Iklan berhasil diperbarui!", "success");
        } else {
            // CREATE NEW
            await StoreService.createListing(commonData);
            showToast("Iklan berhasil ditayangkan!", "success");
        }

        setIsModalOpen(false);
        loadData();
    } catch(err) {
        showToast("Terjadi kesalahan saat menyimpan", "error");
    }
  };

  const handleTopUpConfirm = async (amount: number) => {
    await StoreService.debugAddCredits(amount);
    onRefreshUser();
    setIsTopUpOpen(false);
    showToast(`Top up Rp ${amount.toLocaleString()} berhasil.`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-slate-500 text-sm font-medium">Saldo Iklan Anda</h2>
            <div className="text-3xl font-bold text-slate-900 mt-1">Rp {user.credits.toLocaleString('id-ID')}</div>
          </div>
          <button 
            onClick={() => setIsTopUpOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            + Isi Saldo
          </button>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="font-bold text-lg">Punya Properti?</h3>
                <p className="text-slate-300 text-sm mb-4">Iklankan properti Anda ke ribuan calon pembeli potensial di Vueltra.</p>
                <button 
                  onClick={handleOpenCreateModal}
                  className="bg-white text-slate-900 px-5 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Pasang Iklan Baru
                </button>
             </div>
        </div>
      </div>

      <div className="mb-6 flex gap-4 border-b border-slate-200 pb-1">
         <button 
           onClick={() => setActiveTab('listings')}
           className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'listings' ? 'text-blue-800' : 'text-slate-500 hover:text-slate-800'}`}
         >
           Properti Saya
           {activeTab === 'listings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-800"></div>}
         </button>
         <button 
           onClick={() => setActiveTab('transactions')}
           className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'transactions' ? 'text-blue-800' : 'text-slate-500 hover:text-slate-800'}`}
         >
           Riwayat Transaksi
           {activeTab === 'transactions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-800"></div>}
         </button>
      </div>

      {activeTab === 'listings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {myListings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Anda belum memasang iklan properti.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b border-slate-200">
                  <tr>
                    <th className="p-4">Properti</th>
                    <th className="p-4">Tipe</th>
                    <th className="p-4">Lokasi</th>
                    <th className="p-4">Harga</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Iklan</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myListings.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{l.title}</div>
                        <div className="text-xs text-slate-400">{l.category} • {l.surfaceArea}m²</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${l.type === ListingType.JUAL ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {l.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{l.location}</td>
                      <td className="p-4 text-sm font-bold text-slate-900">Rp {l.price.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleStatusToggle(l)}
                          className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                            l.status === ListingStatus.ACTIVE 
                             ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                             : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                          }`}
                        >
                          {l.status}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        {l.isPinned ? (
                          <span className="inline-block px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full border border-yellow-200 font-bold">
                            TOP AD
                          </span>
                        ) : (
                           <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">Regular</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2 flex justify-end">
                        {!l.isPinned && l.status === ListingStatus.ACTIVE && (
                          <button 
                            onClick={() => handlePin(l.id)}
                            className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md transition shadow-sm"
                            title={`Pin seharga Rp ${PIN_COST}`}
                          >
                            Promosikan
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenEditModal(l)}
                          className="text-xs bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(l.id)}
                          className="text-xs bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-md transition"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Belum ada riwayat transaksi.</div>
          ) : (
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b border-slate-200">
                  <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Deskripsi</th>
                    <th className="p-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {transactions.map(trx => (
                     <tr key={trx.id} className="hover:bg-slate-50">
                        <td className="p-4 text-sm text-slate-500">
                          {new Date(trx.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-700">{trx.description}</td>
                        <td className={`p-4 text-right font-bold text-sm ${trx.type === 'TOPUP' ? 'text-green-600' : 'text-red-600'}`}>
                           {trx.type === 'TOPUP' ? '+' : '-'} Rp {trx.amount.toLocaleString()}
                        </td>
                     </tr>
                   ))}
                </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal: Create / Edit Listing */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Iklan Properti' : 'Pasang Iklan Properti'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Form content */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Saya ingin...</label>
                    <select className={SELECT_CLASS}
                      value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ListingType})}
                    >
                      {Object.values(ListingType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Properti</label>
                    <select className={SELECT_CLASS}
                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}
                    >
                      {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Iklan</label>
                <input required type="text" className={INPUT_CLASS} 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Rumah Minimalis Modern di BSD"
                />
              </div>

              {/* Location & Price */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi (Kota/Area)</label>
                    <select className={SELECT_CLASS}
                      value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                    >
                      {LOCATION_GROUPS.map((group, idx) => (
                        <optgroup key={idx} label={group.region}>
                          {group.cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp)</label>
                    <input required type="number" className={INPUT_CLASS} 
                      value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Contoh: 1500000000"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap (Opsional)</label>
                <input type="text" className={INPUT_CLASS} 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>

              {/* Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Spesifikasi</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   <div className={!isBuilding ? "col-span-2" : ""}>
                      <label className="block text-xs font-medium text-slate-600 mb-1">L. Tanah / Area (m²)</label>
                      <input required type="number" className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.surfaceArea} onChange={e => setFormData({...formData, surfaceArea: e.target.value})} />
                   </div>
                   {isBuilding && (
                     <>
                       <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">L. Bangunan (m²)</label>
                          <input required type="number" className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.buildingArea} onChange={e => setFormData({...formData, buildingArea: e.target.value})} />
                       </div>
                       <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">K. Tidur</label>
                          <input required type="number" className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} />
                       </div>
                       <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">K. Mandi</label>
                          <input required type="number" className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} />
                       </div>
                     </>
                   )}
                </div>
                <div className="mt-3">
                   <label className="block text-xs font-medium text-slate-600 mb-1">Sertifikat</label>
                   <select className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19.5%208.25l-7.5%207.5-7.5-7.5%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center]" value={formData.certificate} onChange={e => setFormData({...formData, certificate: e.target.value})}>
                     <option value="SHM">SHM (Sertifikat Hak Milik)</option>
                     <option value="HGB">HGB (Hak Guna Bangunan)</option>
                     <option value="Strata Title">Strata Title (Apartemen)</option>
                     <option value="Girik/Lainnya">Girik / Lainnya</option>
                   </select>
                </div>
              </div>

              {/* Media & Contact */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Foto Properti</label>
                    <div className="flex flex-col gap-2">
                         {formData.imageUrl && (
                             <img src={formData.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                         )}
                         <label className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                             <div className="text-center">
                                 <div className="text-2xl mb-1">📷</div>
                                 <span className="text-xs font-bold text-slate-500">{isUploading ? 'Mengupload...' : 'Pilih Foto'}</span>
                             </div>
                             <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                         </label>
                    </div>
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Agen</label>
                     <input required type="text" className={INPUT_CLASS} 
                        value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="62812345678"
                      />
                 </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Deskripsi Properti</label>
                </div>
                <textarea required rows={4} className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Jelaskan kondisi properti, akses, dan kelebihan..."
                ></textarea>
              </div>

              <button type="submit" disabled={isUploading} className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200 disabled:opacity-50">
                {editingId ? 'Simpan Perubahan' : 'Tayangkan Iklan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Top Up Modal & Confirmation Modal (Unchanged) */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Top Up Saldo Iklan</h3>
              <p className="text-sm text-slate-500 mb-4">Transfer ke BCA: 12345678 a.n Vueltra</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                 {[50000, 100000, 500000, 1000000].map(amt => (
                   <button key={amt} onClick={() => handleTopUpConfirm(amt)} className="border p-2 rounded hover:bg-slate-50">Rp {amt.toLocaleString()}</button>
                 ))}
              </div>
              <button onClick={() => setIsTopUpOpen(false)} className="w-full bg-slate-100 p-2 rounded">Batal</button>
           </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
            <h3 className={`text-lg font-bold mb-2 ${confirmModal.isDestructive ? 'text-red-600' : 'text-slate-900'}`}>
              Konfirmasi
            </h3>
            <p className="text-slate-600 mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={closeConfirm}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 text-white rounded-lg font-bold shadow-sm transition-colors ${
                  confirmModal.isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;