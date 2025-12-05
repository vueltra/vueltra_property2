

import React, { useState, useEffect } from 'react';
import { Listing, User, ListingType, ListingStatus, Transaction } from '../types';
import { StoreService } from '../services/store';
import { useToast } from '../context/ToastContext'; // Use global Toast

const PIN_COST = 50000;

interface DashboardProps {
  user: User;
  onRefreshUser: () => void;
  onNavigate: (page: string, id?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onRefreshUser, onNavigate }) => {
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'transactions'>('listings');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  
  // Toast Context
  const { showToast } = useToast();
  
  // Custom Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({ isOpen: false, message: '', onConfirm: () => {}, isDestructive: false });

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    const all = await StoreService.getListings();
    setMyListings(all.filter(l => l.sellerId === user.id));
    
    const trx = await StoreService.getTransactions();
    setTransactions(trx);
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

  const handleTopUpConfirm = async (amount: number) => {
    await StoreService.debugAddCredits(amount);
    onRefreshUser();
    setIsTopUpOpen(false);
    showToast(`Top up Rp ${amount.toLocaleString()} berhasil.`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast is now global, so removed local state and `Toast` component */}
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-slate-500 text-sm font-medium">Saldo Iklan Anda</h2>
            <div className="text-3xl font-bold text-slate-900 mt-1">Rp {user.credits.toLocaleString('id-ID')}</div>
          </div>
          <button 
            onClick={() => setIsTopUpOpen(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            + Isi Saldo
          </button>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center relative overflow-hidden border border-blue-500">
             <div className="relative z-10">
                <h3 className="font-bold text-lg">Punya Properti?</h3>
                <p className="text-blue-100 text-sm mb-4">Iklankan properti Anda ke ribuan calon pembeli potensial di Vueltra.</p>
                <button 
                  onClick={() => onNavigate('create-listing')}
                  className="bg-white text-slate-900 px-5 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors shadow-sm"
                >
                  Pasang Iklan Baru
                </button>
             </div>
        </div>
      </div>

      <div className="mb-6 flex gap-4 border-b border-slate-200 pb-1">
         <button 
           onClick={() => setActiveTab('listings')}
           className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'listings' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
         >
           Properti Saya
           {activeTab === 'listings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
         </button>
         <button 
           onClick={() => setActiveTab('transactions')}
           className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'transactions' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
         >
           Riwayat Transaksi
           {activeTab === 'transactions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
         </button>
      </div>

      {activeTab === 'listings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {myListings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
               <p className="mb-4">Anda belum memasang iklan properti.</p>
               <button onClick={() => onNavigate('create-listing')} className="text-blue-700 font-bold hover:underline">Mulai Pasang Iklan</button>
            </div>
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
                <tbody className="divide-y divide-slate-200">
                  {myListings.map(l => (
                    <tr key={l.id} className={`transition-colors ${l.status === ListingStatus.DRAFT ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                           {l.imageUrl ? (
                             <img src={l.imageUrl} className="w-12 h-12 object-cover rounded-lg" alt="Thumbnail" />
                           ) : (
                             <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">No Img</div>
                           )}
                           <div>
                              <div className="font-medium text-slate-900 line-clamp-1">{l.title || 'Draft Listing'}</div>
                              <div className="text-xs text-slate-500">{l.category} • {l.surfaceArea}m²</div>
                           </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${l.type === ListingType.JUAL ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {l.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{l.location}</td>
                      <td className="p-4 text-sm font-bold text-slate-900">Rp {l.price.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        {l.status === ListingStatus.DRAFT ? (
                           <span className="text-xs font-bold px-3 py-1 rounded-full border border-slate-400 bg-slate-200 text-slate-600">DRAFT</span>
                        ) : (
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
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {l.isPinned ? (
                          <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-700 text-xs rounded-full border border-amber-200 font-bold">
                            TOP AD
                          </span>
                        ) : (
                           <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">Regular</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2 flex justify-end items-center h-full">
                        {!l.isPinned && l.status === ListingStatus.ACTIVE && (
                          <button 
                            onClick={() => handlePin(l.id)}
                            className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-md transition shadow-sm"
                            title={`Pin seharga Rp ${PIN_COST}`}
                          >
                            Promosikan
                          </button>
                        )}
                        <button 
                          onClick={() => onNavigate('edit-listing', l.id)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-300 px-3 py-1.5 rounded-md transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(l.id)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-red-700 border border-slate-300 px-3 py-1.5 rounded-md transition"
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
                <tbody className="divide-y divide-slate-200">
                   {transactions.map(trx => (
                     <tr key={trx.id} className="hover:bg-slate-50">
                        <td className="p-4 text-sm text-slate-500">
                          {new Date(trx.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-800">{trx.description}</td>
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

      {/* Top Up Modal & Confirmation Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-slate-900">Top Up Saldo Iklan</h3>
              <p className="text-sm text-slate-600 mb-4">Transfer ke BCA: 12345678 a.n Vueltra</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                 {[50000, 100000, 500000, 1000000].map(amt => (
                   <button key={amt} onClick={() => handleTopUpConfirm(amt)} className="border border-slate-300 text-slate-700 p-2 rounded hover:bg-slate-100 hover:border-slate-400 transition-colors">Rp {amt.toLocaleString()}</button>
                 ))}
              </div>
              <button onClick={() => setIsTopUpOpen(false)} className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 p-2 rounded transition-colors">Batal</button>
           </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 border border-slate-200">
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