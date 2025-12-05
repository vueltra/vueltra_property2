import React, { useState, useEffect } from 'react';
import { User, Listing } from '../types';
import { StoreService } from '../services/store';
import ListingCard from '../components/ListingCard';
import Toast, { ToastType } from '../components/Toast';

interface AgentProfileProps {
  agentId: string;
  onListingClick: (listing: Listing) => void;
  onBack: () => void;
}

const AgentProfile: React.FC<AgentProfileProps> = ({ agentId, onListingClick, onBack }) => {
  const [agent, setAgent] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Toast State
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };

  // Simple wishlist state for visual purposes in this view
  const handleToggleWishlist = async (id: string) => {
    const state = StoreService.getState();
    if(state.currentUser) {
        await StoreService.toggleWishlist(id);
        showToast("Disimpan ke Favorit", "success");
    } else {
        showToast("Silahkan login untuk menyimpan listing.", "info");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await StoreService.getAgentProfile(agentId);
      if (data) {
        setAgent(data.agent);
        setListings(data.listings);
      }
      setLoading(false);
    };
    fetchData();
  }, [agentId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat profil agen...</div>;
  if (!agent) return <div className="p-8 text-center text-red-500">Agen tidak ditemukan.</div>;

  const agentPhone = agent.phoneNumber ? agent.phoneNumber.replace(/^0/, '62').replace(/\D/g, '') : '';
  const waLink = agentPhone ? `https://wa.me/${agentPhone}?text=Halo ${agent.username}, saya lihat profil Anda di Vueltra.` : '#';

  return (
    <div className="pb-16">
       {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
       {/* Cover */}
       <div className="h-48 bg-gradient-to-r from-slate-800 to-blue-900 relative">
          <button onClick={onBack} className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur px-4 py-2 rounded-full text-sm font-bold transition-colors z-20">
             &larr; Kembali
          </button>
       </div>

       {/* Main Content with Negative Margin */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end text-center md:text-left gap-6 mb-8">
             {/* Profile Picture */}
             <div className="w-40 h-40 bg-white p-2 rounded-full shadow-xl flex-shrink-0">
               <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-5xl font-bold text-blue-800 overflow-hidden">
                 {agent.photoUrl ? (
                   <img src={agent.photoUrl} alt={agent.username} className="w-full h-full object-cover" />
                 ) : (
                   agent.username[0].toUpperCase()
                 )}
               </div>
             </div>

             {/* Agent Info */}
             <div className="flex-1 pb-4">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                   <h1 className="text-3xl font-bold text-slate-900 md:text-white drop-shadow-md">{agent.username}</h1>
                   {agent.verificationStatus === 'VERIFIED' && (
                     <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                       ✅ Verified
                     </span>
                   )}
                </div>
                <div className="text-slate-500 mb-4 md:text-blue-50 md:drop-shadow-sm font-medium">
                   Bergabung sejak {new Date(agent.joinedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-4 justify-center md:justify-start">
                   <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
                      <div className="text-xl font-bold text-slate-900">{listings.length}</div>
                      <div className="text-xs text-slate-500 uppercase">Properti</div>
                   </div>
                   <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
                      <div className="text-xl font-bold text-slate-900">
                         {listings.filter(l => l.status === 'SOLD').length}
                      </div>
                      <div className="text-xs text-slate-500 uppercase">Terjual</div>
                   </div>
                </div>
             </div>
             
             {/* Action Button */}
             <div className="pb-4">
                {agentPhone ? (
                  <a 
                     href={waLink}
                     target="_blank" rel="noreferrer"
                     className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-transform hover:scale-105"
                  >
                    <span>💬</span> Chat WhatsApp
                  </a>
                ) : (
                  <button disabled className="bg-slate-300 text-slate-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed">
                     <span>💬</span> No WhatsApp
                  </button>
                )}
             </div>
          </div>

          <div className="pt-8">
             <h2 className="text-xl font-bold text-slate-900 mb-6 text-center md:text-left">Listing Properti ({listings.length})</h2>
             {listings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed text-slate-500">
                   Agen ini belum memiliki listing aktif.
                </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   {listings.map(l => (
                      <ListingCard 
                        key={l.id} 
                        listing={l} 
                        onClick={onListingClick} 
                        onToggleWishlist={handleToggleWishlist}
                      />
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default AgentProfile;