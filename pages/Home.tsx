import React, { useState, useEffect, useRef } from 'react';
import { Listing, Category, ListingType, POPULAR_LOCATIONS, LOCATION_GROUPS, User, CityInsight } from '../types';
import { StoreService } from '../services/store';
import ListingCard from '../components/ListingCard';

interface HomeProps {
  user: User | null;
  onListingClick: (listing: Listing) => void;
  onRefreshUser: () => void;
  onNavigate: (page: string) => void;
  searchQuery: string; // New Prop from App
}

const Home: React.FC<HomeProps> = ({ user, onListingClick, onRefreshUser, onNavigate, searchQuery }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<ListingType | 'ALL'>('ALL');
  
  // Insights Data
  const [cityInsight, setCityInsight] = useState<CityInsight | null>(null);
  const [showInsights, setShowInsights] = useState(true);

  // Dropdown Location State
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Login Prompt Modal
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  useEffect(() => {
    StoreService.getListings().then(data => setListings(data));
    StoreService.getSettings().then(settings => setShowInsights(settings.showMarketInsights));
    
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    // Use searchQuery prop
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
    <div className="pb-20">
      {/* Hero Section - Simplified for new Layout */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
              Temukan <span className="text-blue-700">Hunian Impian</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              Jelajahi ribuan listing terbaik di seluruh Indonesia dengan mudah.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Unified Dashboard: Filters (Left) + Insights (Right) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-col lg:flex-row relative">
          
          {/* LEFT PANEL: Filters Controls */}
          <div className={`${showInsights ? 'lg:w-1/3 border-r' : 'w-full'} p-6 border-slate-100 bg-white relative z-30 rounded-2xl`}>
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-lg">Filter Pencarian</h3>
                <button 
                  onClick={() => { setCategoryFilter('ALL'); setLocationFilter('ALL'); setTypeFilter('ALL'); }}
                  className="text-xs text-slate-400 hover:text-blue-600 font-medium underline"
                >
                  Reset
                </button>
             </div>
             
             {/* Type Switcher */}
             <div className="mb-5">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                   {['ALL', 'Dijual', 'Disewa'].map((type) => (
                     <button
                       key={type}
                       onClick={() => setTypeFilter(type === 'ALL' ? 'ALL' : type as ListingType)}
                       className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                         (type === 'ALL' && typeFilter === 'ALL') || typeFilter === type
                           ? 'bg-white text-blue-800 shadow-sm' 
                           : 'text-slate-500 hover:text-slate-700'
                       }`}
                     >
                       {type === 'ALL' ? 'Semua' : type}
                     </button>
                   ))}
                </div>
             </div>

             {/* Location Dropdown */}
             <div className="mb-5 relative z-50" ref={locationDropdownRef}>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block tracking-wide">Lokasi / Wilayah</label>
                <button 
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className={`w-full text-left px-4 py-3 rounded-xl border flex justify-between items-center transition-colors ${
                    locationFilter !== 'ALL' 
                      ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{locationFilter === 'ALL' ? 'Semua Indonesia' : locationFilter}</span>
                  <svg className={`w-4 h-4 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isLocationDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto z-[60]">
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

             {/* Categories (Chips) */}
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wide">Kategori Properti</label>
                <div className="flex flex-wrap gap-2">
                  {['ALL', ...Object.values(Category)].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat as Category | 'ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        categoryFilter === cat 
                          ? 'bg-blue-800 border-blue-800 text-white shadow-md' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-200'
                      }`}
                    >
                      {cat === 'ALL' ? 'Semua' : cat}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          {/* RIGHT PANEL: Market Insights */}
          {showInsights && (
            <div className="lg:w-2/3 bg-slate-50/50 p-6 relative overflow-hidden flex flex-col rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none">
               <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <svg className="w-48 h-48 text-blue-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
               </div>

               {cityInsight ? (
                 <div className="relative z-10 flex-grow">
                    <div className="flex items-end justify-between mb-6">
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="bg-blue-100 text-blue-800 p-1 rounded text-xs">📊 Market Insight</span>
                          </div>
                          <h2 className="text-2xl font-extrabold text-slate-900 leading-none">
                             {cityInsight.location}
                          </h2>
                       </div>
                       <div className="text-right hidden sm:block">
                          <div className="text-xs text-slate-400 font-bold uppercase">Growth Rate</div>
                          <div className="text-blue-600 font-bold text-lg">{cityInsight.growthRate}</div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Rata-rata Harga</div>
                          <div className="text-sm font-bold text-slate-800 leading-tight">{cityInsight.avgPrice}</div>
                       </div>
                       <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Potensi Sewa</div>
                          <div className="text-sm font-bold text-slate-800 leading-tight">🏠 {cityInsight.rentalYield}</div>
                       </div>
                       <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Keamanan</div>
                          <div className="text-sm font-bold text-slate-800 leading-tight">🛡️ {cityInsight.safetyIndex}</div>
                       </div>
                       <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Transportasi</div>
                          <div className="text-sm font-bold text-slate-800 leading-tight">🚆 {cityInsight.transportation}</div>
                       </div>
                       <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 col-span-2 md:col-span-2">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Terkenal Dengan</div>
                          <div className="text-sm font-bold text-slate-800 leading-tight">🌟 {cityInsight.famousFor}</div>
                       </div>
                       <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Internet</div>
                          <div className="text-sm font-bold text-slate-800 leading-tight">📶 {cityInsight.internetSpeed}</div>
                       </div>
                       <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Cuaca</div>
                          <div className="text-sm font-bold text-slate-800 leading-tight">☀️ {cityInsight.weather}</div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-400">
                    Memuat data wilayah...
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Listings Grid */}
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
             {typeFilter === 'ALL' ? 'Properti Terbaru' : `Properti ${typeFilter}`}
             <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-bold">{filteredListings.length}</span>
           </h2>
        </div>
        
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <div className="text-6xl mb-4 grayscale opacity-30">🏠</div>
            <p className="text-slate-500 font-medium">Tidak ada properti ditemukan.</p>
            <p className="text-sm text-slate-400 mt-2">Coba ubah filter lokasi atau kategori.</p>
          </div>
        )}
      </div>

      {/* Login Prompt Modal */}
      {loginPromptOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
             <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4 text-2xl">
                   🔐
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Login Diperlukan</h3>
                <p className="text-slate-500 text-sm">
                   Anda perlu masuk ke akun Anda untuk menyimpan properti ini ke daftar Favorit.
                </p>
             </div>
             <div className="flex gap-3">
               <button 
                 onClick={() => setLoginPromptOpen(false)}
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
    </div>
  );
};

export default Home;