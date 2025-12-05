import React, { useState, useEffect, useRef } from 'react';
import { Listing, Category, ListingType, User, CityInsight } from '../types';
import { StoreService } from '../services/store';
import ListingCard from '../components/ListingCard';
import { useClickOutside } from '../hooks/useClickOutside';
import { POPULAR_LOCATIONS, LOCATION_GROUPS } from '../services/data'; // Corrected import path

interface HomeProps {
  user: User | null;
  onListingClick: (listing: Listing) => void;
  onRefreshUser: () => void;
  onNavigate: (page: string) => void;
  searchQuery: string;
}

const Home: React.FC<HomeProps> = ({ user, onListingClick, onRefreshUser, onNavigate, searchQuery }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<ListingType | 'ALL'>('ALL');
  
  const [cityInsight, setCityInsight] = useState<CityInsight | null>(null);
  const [showInsights, setShowInsights] = useState(true);

  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const [locationSearch, setLocationSearch] = useState('');
  
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  useEffect(() => {
    StoreService.getListings().then(data => setListings(data));
    StoreService.getSettings().then(settings => setShowInsights(settings.showMarketInsights));
  }, []);

  useClickOutside(locationDropdownRef, () => setIsLocationDropdownOpen(false));
  useClickOutside(statusDropdownRef, () => setIsStatusDropdownOpen(false));
  useClickOutside(categoryDropdownRef, () => setIsCategoryDropdownOpen(false));

  useEffect(() => {
    if (showInsights) {
        const fetchInsight = async () => {
        const data = await StoreService.getCityInsight(locationFilter === 'ALL' ? 'Indonesia (Nasional)' : locationFilter);
        setCityInsight(data);
        };
        fetchInsight();
    }
  }, [locationFilter, showInsights]);

  const handleToggleWishlist = async (listingId: string) => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    await StoreService.toggleWishlist(listingId);
    onRefreshUser();
  };

  const handleLoginRedirect = () => {
    setLoginPromptOpen(false);
    onNavigate('login');
  };

  const filteredListings = listings.filter(l => {
    const matchesCategory = categoryFilter === 'ALL' || l.category === categoryFilter;
    const matchesLocation = locationFilter === 'ALL' || l.location === locationFilter;
    const matchesType = typeFilter === 'ALL' || l.type === typeFilter;
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLocation && matchesType && matchesSearch;
  });

  const isSearchingLocation = locationSearch.length > 0;
  const filteredFlatLocations = isSearchingLocation 
    ? POPULAR_LOCATIONS.filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()))
    : [];

  return (
    <div className="pb-20 pt-10">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PAGE HEADER */}
        <div className="mb-6">
           <h1 className="text-3xl font-extrabold text-slate-900">Cari Properti</h1>
           <p className="text-slate-500 mt-2">Temukan hunian dan properti investasi terbaik di Indonesia.</p>
        </div>

        {/* --- HORIZONTAL FILTER BAR --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8 relative z-40 overflow-hidden"> {/* Added overflow-hidden */}
           <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              
              {/* 1. STATUS Dropdown */}
              <div className="md:col-span-2 relative" ref={statusDropdownRef}>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block tracking-wide">Status</label>
                 <button 
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border flex justify-between items-center transition-colors text-sm font-semibold ${
                      typeFilter !== 'ALL' 
                        ? 'bg-blue-50 border-blue-200 text-blue-800' 
                        : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'
                    }`}
                 >
                    <span className="truncate">{typeFilter === 'ALL' ? 'Semua Status' : typeFilter}</span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                 </button>
                 {isStatusDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden animate-fade-in ring-1 ring-black/5">
                        <button
                            onClick={() => { setTypeFilter('ALL'); setIsStatusDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 font-bold border-b border-slate-50 ${typeFilter === 'ALL' ? 'text-blue-700 bg-blue-50' : 'text-slate-700'}`}
                        >
                            Semua Status
                        </button>
                        {Object.values(ListingType).map(type => (
                            <button
                                key={type}
                                onClick={() => { setTypeFilter(type); setIsStatusDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 ${typeFilter === type ? 'text-blue-700 bg-blue-50 font-bold' : 'text-slate-700'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                 )}
              </div>

              {/* 2. KATEGORI Dropdown */}
              <div className="md:col-span-3 relative" ref={categoryDropdownRef}>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block tracking-wide">Kategori</label>
                 <button 
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border flex justify-between items-center transition-colors text-sm font-semibold ${
                      categoryFilter !== 'ALL' 
                        ? 'bg-blue-50 border-blue-200 text-blue-800' 
                        : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'
                    }`}
                 >
                    <span className="truncate">{categoryFilter === 'ALL' ? 'Semua Kategori' : categoryFilter}</span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                 </button>
                 {isCategoryDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-y-auto max-h-60 animate-fade-in ring-1 ring-black/5">
                        <button
                            onClick={() => { setCategoryFilter('ALL'); setIsCategoryDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 font-bold border-b border-slate-50 ${categoryFilter === 'ALL' ? 'text-blue-700 bg-blue-50' : 'text-slate-700'}`}
                        >
                            Semua Kategori
                        </button>
                        {Object.values(Category).map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setCategoryFilter(cat); setIsCategoryDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 ${categoryFilter === cat ? 'text-blue-700 bg-blue-50 font-bold' : 'text-slate-700'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                 )}
              </div>

              {/* 3. LOKASI Dropdown */}
              <div className="md:col-span-5 relative" ref={locationDropdownRef}>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block tracking-wide">Lokasi / Wilayah</label>
                 <button 
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border flex justify-between items-center transition-colors text-sm font-semibold ${
                    locationFilter !== 'ALL' 
                      ? 'bg-blue-50 border-blue-200 text-blue-800' 
                      : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'
                  }`}
                >
                  <span className="truncate">{locationFilter === 'ALL' ? 'Seluruh Indonesia' : locationFilter}</span>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isLocationDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto z-40 animate-fade-in ring-1 ring-black/5">
                     <div className="sticky top-0 bg-white p-2 border-b border-slate-100 z-10">
                        <input 
                          type="text" 
                          placeholder="Ketik nama kota..." 
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-slate-900"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          autoFocus
                        />
                     </div>
                     <div className="py-1">
                        {!isSearchingLocation && (
                          <button
                            onClick={() => { setLocationFilter('ALL'); setIsLocationDropdownOpen(false); setLocationSearch(''); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 font-bold border-b border-slate-50 ${locationFilter === 'ALL' ? 'text-blue-700 bg-blue-50' : 'text-slate-700'}`}
                          >
                            🌍 Semua Indonesia
                          </button>
                        )}

                        {isSearchingLocation ? (
                           filteredFlatLocations.length > 0 ? (
                             filteredFlatLocations.map(loc => (
                                <button
                                  key={loc}
                                  onClick={() => { setLocationFilter(loc); setIsLocationDropdownOpen(false); setLocationSearch(''); }}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${locationFilter === loc ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-600'}`}
                                >
                                  {loc}
                                </button>
                             ))
                           ) : (
                             <div className="px-4 py-3 text-sm text-slate-400 text-center">Lokasi tidak ditemukan</div>
                           )
                        ) : (
                           LOCATION_GROUPS.map((group, idx) => (
                              <div key={idx}>
                                 <div className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-50 uppercase tracking-wider sticky top-0">
                                    {group.region}
                                 </div>
                                 {group.cities.map(city => (
                                    <button
                                      key={city}
                                      onClick={() => { setLocationFilter(city); setIsLocationDropdownOpen(false); setLocationSearch(''); }}
                                      className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${locationFilter === city ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-600'}`}
                                    >
                                      {city}
                                    </button>
                                 ))}
                              </div>
                           ))
                        )}
                     </div>
                  </div>
                )}
              </div>

              {/* 4. Reset Button */}
              <div className="md:col-span-2">
                 <button 
                    onClick={() => { setCategoryFilter('ALL'); setLocationFilter('ALL'); setTypeFilter('ALL'); }}
                    className="w-full py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-colors border border-slate-300"
                 >
                    Reset Filter
                 </button>
              </div>
           </div>
        </div>

        {/* --- MARKET INSIGHTS BANNER --- */}
        {showInsights && cityInsight && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <svg className="w-48 h-48 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
               </div>

               <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">📊 Market Insight</span>
                          </div>
                          <h2 className="text-2xl font-extrabold text-slate-900 leading-none">
                             {cityInsight.location}
                          </h2>
                       </div>
                       <div className="text-left md:text-right bg-slate-50 p-2 rounded-lg md:bg-transparent md:p-0">
                          <div className="text-xs text-slate-500 font-bold uppercase">Growth Rate</div>
                          <div className="text-green-600 font-bold text-lg flex items-center gap-1 md:justify-end">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                             {cityInsight.growthRate}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Harga Rata-rata</div>
                          <div className="text-sm font-bold text-slate-900 leading-tight">{cityInsight.avgPrice}</div>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Potensi Sewa</div>
                          <div className="text-sm font-bold text-slate-900 leading-tight">🏠 {cityInsight.rentalYield}</div>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Keamanan</div>
                          <div className="text-sm font-bold text-slate-900 leading-tight">🛡️ {cityInsight.safetyIndex}</div>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Transportasi</div>
                          <div className="text-sm font-bold text-slate-900 leading-tight">🚆 {cityInsight.transportation}</div>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 md:col-span-2">
                          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Terkenal Dengan</div>
                          <div className="text-sm font-bold text-slate-900 leading-tight">🌟 {cityInsight.famousFor}</div>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Internet</div>
                          <div className="text-sm font-bold text-slate-900 leading-tight">📶 {cityInsight.internetSpeed}</div>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Cuaca</div>
                          <div className="text-sm font-bold text-slate-900 leading-tight">☀️ {cityInsight.weather}</div>
                       </div>
                    </div>
                 </div>
            </div>
        )}

        {/* Listings Grid */}
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
             {typeFilter === 'ALL' ? 'Properti Terbaru' : `Properti ${typeFilter}`}
             <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-bold border border-slate-200">{filteredListings.length}</span>
           </h2>
        </div>
        
        {filteredListings.length > 0 ? (
          <div className="flex flex-col space-y-6">
            {filteredListings.map(listing => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                onClick={onListingClick}
                isWishlisted={user?.wishlist.includes(listing.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="text-6xl mb-4 grayscale opacity-30 text-slate-400">🏠</div>
            <p className="text-slate-500 font-medium">Tidak ada properti ditemukan.</p>
            <p className="text-sm text-slate-400 mt-2">Coba ubah filter lokasi atau kategori.</p>
          </div>
        )}
      </div>

      {/* Login Prompt Modal */}
      {loginPromptOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-200">
             <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4 text-2xl border border-blue-200">
                   🔐
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Login Diperlukan</h3>
                <p className="text-slate-600 text-sm">
                   Anda perlu masuk ke akun Anda untuk menyimpan properti ini ke daftar Favorit.
                </p>
             </div>
             <div className="flex gap-3">
               <button 
                 onClick={() => setLoginPromptOpen(false)}
                 className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-sm transition-colors border border-slate-300"
               >
                 Nanti Saja
               </button>
               <button 
                 onClick={handleLoginRedirect}
                 className="flex-1 px-4 py-2.5 text-white bg-blue-700 hover:bg-blue-800 rounded-lg font-bold text-sm shadow-lg shadow-blue-200 transition-colors"
               >
                 Masuk Sekarang
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;