import React, { useState, useEffect } from 'react';
import { Listing, ListingType, ListingStatus, User } from '../types';
import { StoreService } from '../services/store';
import ListingCard from '../components/ListingCard';
import Toast, { ToastType } from '../components/Toast';

interface ListingDetailProps {
  listing: Listing;
  currentUser: User | null;
  onBack: () => void;
  onAgentClick: (agentId: string) => void;
  onListingClick: (listing: Listing) => void;
  onRefreshUser: () => void;
  onNavigate: (page: string) => void;
}

const ListingDetail: React.FC<ListingDetailProps> = ({ listing, currentUser, onBack, onAgentClick, onListingClick, onRefreshUser, onNavigate }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  
  // Similar Listings State
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Mortgage Calculator State
  const [calcDpPercent, setCalcDpPercent] = useState(20);
  const [calcTenor, setCalcTenor] = useState(15);
  const [interestRate, setInterestRate] = useState(8.5); // Editable Interest Rate

  // Login Prompt Modal State
  const [loginPrompt, setLoginPrompt] = useState<{isOpen: boolean, action: string}>({isOpen: false, action: ''});

  // Toast State
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };

  // Direct to Seller WhatsApp
  const sellerWa = listing.whatsapp.replace(/^0/, '62').replace(/\D/g, ''); 
  const waText = encodeURIComponent(`Halo, saya tertarik dengan properti Anda di Vueltra:\n\n*${listing.title}*\nHarga: Rp ${listing.price.toLocaleString()}\nLink: vueltra.com/detail/${listing.id}\n\nApakah unit masih tersedia?`);
  const waLink = `https://wa.me/${sellerWa}?text=${waText}`;

  useEffect(() => {
    // Check wishlist status
    if (currentUser && currentUser.wishlist) {
      setIsWishlisted(currentUser.wishlist.includes(listing.id));
    } else {
      setIsWishlisted(false);
    }

    // Load Similar Listings (Frontend Logic)
    const loadSimilar = async () => {
      const all = await StoreService.getListings();
      // Filter: Same Category, Not current item, limit to 3
      const similar = all
        .filter(l => l.category === listing.category && l.id !== listing.id)
        .slice(0, 3);
      setSimilarListings(similar);
    };
    loadSimilar();

    // Reset Calculator defaults when listing changes
    setCalcDpPercent(20);
    setCalcTenor(15);
    setInterestRate(8.5);
    window.scrollTo(0, 0); // Ensure scroll to top on change
  }, [currentUser, listing.id, listing.category]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Cek properti ini: ${listing.title} di ${listing.location}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(`${window.location.origin}/detail/${listing.id}`);
      showToast("Link disalin ke clipboard!", "success");
    }
  };

  const handleWishlist = async () => {
    if (!currentUser) {
      setLoginPrompt({
        isOpen: true, 
        action: 'menyimpan properti ini ke Favorit'
      });
      return;
    }
    const added = await StoreService.toggleWishlist(listing.id);
    setIsWishlisted(added);
    onRefreshUser();
    showToast(added ? "Disimpan ke Favorit" : "Dihapus dari Favorit", "success");
  };

  const handleReportTrigger = () => {
    if (!currentUser) {
       setLoginPrompt({
        isOpen: true, 
        action: 'melaporkan iklan ini'
      });
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async () => {
    await StoreService.submitReport(listing.id, reportReason);
    setIsReportModalOpen(false);
    showToast("Laporan diterima. Terima kasih.", "success");
  };

  const handleLoginRedirect = () => {
    setLoginPrompt({isOpen: false, action: ''});
    onNavigate('login');
  };

  // --- Mortgage Calculation Logic ---
  const calculateMortgage = () => {
    const price = listing.price;
    const dpAmount = price * (calcDpPercent / 100);
    const loanAmount = price - dpAmount;
    
    // Monthly interest rate
    const monthlyRate = interestRate / 100 / 12;
    const numberOfMonths = calcTenor * 12;

    // Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
    // If interest is 0 (unlikely but possible input), simple division
    let monthlyPayment = 0;
    if (interestRate > 0) {
       monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / 
                        (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    } else {
       monthlyPayment = loanAmount / numberOfMonths;
    }

    // Minimum Salary Requirement (Assuming installment max 30% of income)
    const minSalary = monthlyPayment / 0.3;

    return {
      dpAmount,
      loanAmount,
      monthlyPayment,
      minSalary
    };
  };

  const mortgage = calculateMortgage();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* EXAMPLE BANNER */}
      {listing.isExample && (
        <div className="mb-6 bg-slate-100 border-l-4 border-slate-500 text-slate-700 p-4 rounded-r shadow-sm flex items-start gap-3">
           <div className="text-2xl">💡</div>
           <div>
              <h3 className="font-bold text-lg">Properti Contoh (Simulasi)</h3>
              <p className="text-sm">
                 Listing ini adalah data dummy untuk keperluan demonstrasi aplikasi. Properti ini tidak nyata dan tidak diperjualbelikan.
                 Silakan gunakan listing ini untuk mencoba fitur-fitur website.
              </p>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-900 flex items-center gap-2 font-medium transition-colors">
          &larr; Kembali ke Pencarian
        </button>
        <div className="flex gap-2">
           <button onClick={handleShare} className="text-slate-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors" title="Bagikan">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
           </button>
           <button onClick={handleWishlist} className={`p-2 rounded-full transition-colors ${isWishlisted ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'}`} title="Simpan">
             <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
           </button>
           <button onClick={handleReportTrigger} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100" title="Laporkan">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Content (Images + Desc) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Image with Lightbox Trigger */}
          <div 
            className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-slate-100 cursor-zoom-in group"
            onClick={() => setIsLightboxOpen(true)}
          >
             <img 
              src={listing.imageUrl} 
              alt={listing.title} 
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${listing.status === ListingStatus.SOLD ? 'grayscale' : ''}`}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/800/600?blur=2'; }}
            />
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
             <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-white px-4 py-1.5 rounded-full text-sm font-bold z-10">
               {listing.type}
             </div>
             
             {/* View Fullscreen Hint */}
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md">
                   🔍 Lihat Foto Penuh
                </span>
             </div>

             {listing.isPinned && (
               <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-sm font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-10">
                 ⭐ Top Listing
               </div>
             )}
             {listing.status === ListingStatus.SOLD && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                   <div className="bg-red-600 text-white font-bold text-2xl px-8 py-3 border-4 border-white transform -rotate-12 uppercase tracking-widest shadow-2xl">
                     {listing.type === ListingType.JUAL ? 'TERJUAL' : 'DISEWA'}
                   </div>
                </div>
             )}
          </div>

          <div>
             <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-sm font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full">{listing.category}</span>
                <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {listing.location}
                </span>
             </div>
             
             <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{listing.title}</h1>
             <p className="text-slate-500 mb-4 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
               {listing.address || 'Alamat lengkap hubungi agen'}
             </p>

             <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Spesifikasi Properti</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div>
                   <div className="text-slate-500 text-xs mb-1">Luas Tanah</div>
                   <div className="font-bold text-lg text-slate-800 flex items-end gap-1">
                     {listing.surfaceArea} <span className="text-xs font-normal text-slate-500 mb-1">m²</span>
                   </div>
                 </div>
                 {listing.buildingArea > 0 && (
                   <div>
                     <div className="text-slate-500 text-xs mb-1">Luas Bangunan</div>
                     <div className="font-bold text-lg text-slate-800 flex items-end gap-1">
                       {listing.buildingArea} <span className="text-xs font-normal text-slate-500 mb-1">m²</span>
                     </div>
                   </div>
                 )}
                 <div>
                   <div className="text-slate-500 text-xs mb-1">Kamar Tidur</div>
                   <div className="font-bold text-lg text-slate-800">{listing.bedrooms}</div>
                 </div>
                 <div>
                   <div className="text-slate-500 text-xs mb-1">Kamar Mandi</div>
                   <div className="font-bold text-lg text-slate-800">{listing.bathrooms}</div>
                 </div>
                 <div>
                    <div className="text-slate-500 text-xs mb-1">Sertifikat</div>
                    <div className="font-bold text-slate-800 text-sm bg-slate-100 px-2 py-1 rounded inline-block">{listing.certificate}</div>
                 </div>
               </div>
             </div>

             <div className="mt-8">
               <h3 className="text-xl font-bold text-slate-900 mb-3">Deskripsi</h3>
               <div className="prose prose-blue max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                 {listing.description}
               </div>
             </div>
          </div>
        </div>

        {/* Sidebar (Price + Agent + Calculator) */}
        <div className="lg:col-span-1 space-y-6">
           {/* Price & Contact */}
           <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 ring-1 ring-blue-50">
               <div className="mb-6 pb-6 border-b border-slate-100">
                 <div className="text-sm text-slate-500 mb-1 font-medium">Harga Penawaran</div>
                 <div className={`text-3xl font-extrabold tracking-tight ${listing.status === ListingStatus.SOLD ? 'text-slate-400 decoration-slate-400 line-through' : 'text-blue-800'}`}>
                   Rp {listing.price.toLocaleString('id-ID')}
                   {listing.type === ListingType.SEWA && <span className="text-lg text-slate-500 font-normal"> /th</span>}
                 </div>
                 {listing.status === ListingStatus.SOLD && (
                   <div className="text-red-600 font-bold mt-2 text-center uppercase tracking-wider">
                     Maaf, sudah laku.
                   </div>
                 )}
               </div>

               <a 
                 href={listing.status === ListingStatus.ACTIVE ? waLink : '#'}
                 target={listing.status === ListingStatus.ACTIVE ? "_blank" : undefined}
                 rel="noopener noreferrer"
                 className={`block w-full text-center font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mb-4 group ${
                   listing.status === ListingStatus.ACTIVE 
                     ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:shadow-blue-300' 
                     : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                 }`}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/>
                 </svg>
                 {listing.status === ListingStatus.ACTIVE ? 'Hubungi Penjual (WA)' : 'Tidak Tersedia'}
               </a>
               <div className="text-xs text-center text-slate-400 px-4">
                 Pastikan transaksi aman. Gunakan Rekber jika ragu transfer langsung.
               </div>
           </div>

           {/* Mortgage Calculator Widget */}
           {listing.type === ListingType.JUAL && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xl">🧮</span>
                  <h3 className="font-bold text-slate-800">Simulasi KPR</h3>
                </div>
                
                <div className="space-y-6">
                  {/* DP Control */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>Uang Muka (DP)</span>
                      <span className="font-bold text-slate-800">{calcDpPercent}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="90" step="5"
                      value={calcDpPercent} onChange={(e) => setCalcDpPercent(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                       <span>DP: Rp {mortgage.dpAmount.toLocaleString()}</span>
                       <span>Pinjaman: Rp {mortgage.loanAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Tenor Control */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>Jangka Waktu</span>
                      <span className="font-bold text-slate-800">{calcTenor} Tahun</span>
                    </div>
                    <input 
                      type="range" min="1" max="25" step="1"
                      value={calcTenor} onChange={(e) => setCalcTenor(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                        <span>1 Tahun</span>
                        <span>25 Tahun</span>
                    </div>
                  </div>

                  {/* Interest Rate Control */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mt-2">
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-medium text-slate-500">Suku Bunga (per tahun)</label>
                     </div>
                     <div className="flex items-center gap-2">
                        <input 
                           type="number" 
                           value={interestRate} 
                           onChange={(e) => setInterestRate(Number(e.target.value))}
                           onWheel={(e) => (e.target as HTMLInputElement).blur()}
                           className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                           step="0.1"
                        />
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">% Fix Rate</span>
                     </div>
                  </div>

                  {/* Result Box */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 mt-2 shadow-sm">
                    <div className="text-xs text-slate-400 mb-1">Estimasi Cicilan / bln</div>
                    <div className="text-2xl font-bold text-slate-900 mb-3">
                      Rp {Math.round(mortgage.monthlyPayment).toLocaleString()}
                    </div>
                    
                    {/* Minimum Salary Insight */}
                    <div className="pt-3 border-t border-slate-100">
                       <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Gaji Minimal (30% Rule)</div>
                       <div className="text-sm font-semibold text-blue-700">
                          ± Rp {Math.round(mortgage.minSalary).toLocaleString()}
                       </div>
                       <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                          *Estimasi gaji bersih agar KPR disetujui bank.
                       </p>
                    </div>
                  </div>
                </div>
              </div>
           )}

           {/* Agent Info */}
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-400 font-bold uppercase mb-4 tracking-wider flex justify-between">
                <span>Listing Agent</span>
                <span className="text-blue-600">Online</span>
              </div>
              <div className="flex items-center gap-4 mb-4 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors" onClick={() => onAgentClick(listing.sellerId)}>
                 <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-xl font-bold text-blue-800 border-2 border-white shadow-sm">
                   {listing.sellerName[0].toUpperCase()}
                 </div>
                 <div>
                    <div className="font-bold text-slate-900 hover:text-blue-700">{listing.sellerName}</div>
                    <div className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">Terverifikasi</div>
                 </div>
              </div>
              <button 
                onClick={() => onAgentClick(listing.sellerId)} 
                className="w-full border border-slate-300 text-slate-700 font-semibold py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm"
              >
                 Lihat Profil Agen
              </button>
           </div>
        </div>
      </div>

      {/* Similar Listings Section */}
      {similarListings.length > 0 && (
        <div className="mb-12 pt-8 border-t border-slate-200">
           <h2 className="text-2xl font-bold text-slate-900 mb-6">Properti Sejenis Lainnya</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarListings.map(l => (
                 <ListingCard 
                   key={l.id} 
                   listing={l} 
                   onClick={() => onListingClick(l)} 
                   isWishlisted={false}
                 />
              ))}
           </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsLightboxOpen(false)}>
           <button 
             className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-[110]"
             onClick={() => setIsLightboxOpen(false)}
           >
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
           
           <img 
             src={listing.imageUrl} 
             alt={listing.title} 
             className="max-w-full max-h-screen object-contain shadow-2xl rounded-sm"
             onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
           />
           
           <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/80 text-sm font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
              {listing.title}
           </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {loginPrompt.isOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
             <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4 text-2xl">
                   🔐
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Login Diperlukan</h3>
                <p className="text-slate-500 text-sm">
                   Anda perlu masuk ke akun Anda untuk {loginPrompt.action}.
                </p>
             </div>
             <div className="flex gap-3">
               <button 
                 onClick={() => setLoginPrompt({isOpen: false, action: ''})}
                 className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-sm transition-colors"
               >
                 Nanti Saja
               </button>
               <button 
                 onClick={handleLoginRedirect}
                 className="flex-1 px-4 py-2.5 text-white bg-blue-800 hover:bg-blue-900 rounded-lg font-bold text-sm shadow-lg shadow-blue-200 transition-colors"
               >
                 Masuk Sekarang
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold mb-4 text-slate-900">Laporkan Iklan Ini</h3>
              <p className="text-sm text-slate-500 mb-4">Bantu kami menjaga komunitas tetap aman. Apa alasan Anda melaporkan iklan ini?</p>
              
              <div className="space-y-3 mb-4">
                 {['Penipuan / Scam', 'Informasi Palsu', 'Duplikat Listing', 'Konten Tidak Pantas'].map(r => (
                   <label key={r} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="radio" name="reason" value={r} onChange={e => setReportReason(e.target.value)} checked={reportReason === r} />
                      <span className="text-sm text-slate-700">{r}</span>
                   </label>
                 ))}
              </div>
              
              <div className="flex gap-2">
                 <button onClick={() => setIsReportModalOpen(false)} className="flex-1 border p-2 rounded-lg text-slate-600">Batal</button>
                 <button onClick={handleReportSubmit} className="flex-1 bg-red-600 text-white font-bold p-2 rounded-lg hover:bg-red-700">Kirim Laporan</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;