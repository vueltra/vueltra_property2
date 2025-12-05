import React from 'react';
import { Listing, Category, ListingType, ListingStatus } from '../types';

interface ListingCardProps {
  listing: Listing;
  onClick: (listing: Listing) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const getCategoryBadge = (cat: Category) => {
  switch (cat) {
    case Category.RUMAH: return 'bg-slate-100 text-slate-700';
    case Category.APARTEMEN: return 'bg-slate-100 text-slate-700';
    case Category.RUKO: return 'bg-slate-100 text-slate-700';
    case Category.TANAH: return 'bg-blue-50 text-blue-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick, isWishlisted = false, onToggleWishlist }) => {
  const isSewa = listing.type === ListingType.SEWA;
  const isSold = listing.status === ListingStatus.SOLD;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah klik tembus ke card wrapper
    if (onToggleWishlist) {
      onToggleWishlist(listing.id);
    }
  };

  return (
    <div 
      onClick={() => onClick(listing)}
      className={`group relative bg-white rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col h-full
        ${listing.isPinned ? 'border-yellow-400 ring-1 ring-yellow-400 shadow-yellow-100' : 'border-slate-200 hover:border-blue-300 shadow-sm'}
        ${isSold ? 'opacity-80' : ''}
      `}
    >
      {/* EXAMPLE Badge */}
      {listing.isExample && !isSold && (
        <div className="absolute top-10 left-3 z-10">
          <div className="bg-slate-200 text-slate-600 text-[10px] font-extrabold px-2 py-1 rounded shadow-sm uppercase tracking-wider border border-slate-300">
            CONTOH
          </div>
        </div>
      )}

      {/* Pinned Badge */}
      {listing.isPinned && !isSold && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
            ⭐ Top Listing
          </div>
        </div>
      )}

      {/* SOLD Badge Overlay */}
      {isSold && (
        <div className="absolute inset-0 z-20 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px]">
          <div className="bg-red-600 text-white text-lg font-bold px-6 py-2 rounded-lg border-2 border-white shadow-2xl transform -rotate-12 uppercase tracking-widest">
            {listing.type === ListingType.JUAL ? 'TERJUAL' : 'DISEWA'}
          </div>
        </div>
      )}

      {/* Type Badge (Jual/Sewa) */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide border ${
          isSewa ? 'bg-purple-600 text-white border-purple-700' : 'bg-blue-600 text-white border-blue-700'
        }`}>
          {listing.type}
        </span>
      </div>

      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
        <img 
          src={listing.imageUrl} 
          alt={listing.title} 
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isSold ? 'grayscale' : ''}`}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?blur=2'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
        
        {/* Location Badge on Image */}
        <div className="absolute bottom-3 left-3 text-white">
           <div className="flex items-center gap-1 text-xs font-medium drop-shadow-md">
             <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
             {listing.location}
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getCategoryBadge(listing.category)}`}>
            {listing.category}
          </span>
        </div>
        
        <h3 className="text-slate-900 font-semibold text-base leading-snug mb-3 line-clamp-2 min-h-[40px]">
          {listing.title}
        </h3>
        
        {/* Specs */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100 text-xs text-slate-500 mb-3">
           <div className="flex flex-col items-center">
              <span className="font-bold text-slate-700">{listing.surfaceArea} m²</span>
              <span>L.Tanah</span>
           </div>
           {listing.buildingArea > 0 && (
            <div className="flex flex-col items-center border-l border-slate-100">
                <span className="font-bold text-slate-700">{listing.buildingArea} m²</span>
                <span>Bangunan</span>
            </div>
           )}
           {listing.bedrooms > 0 && (
             <div className="flex flex-col items-center border-l border-slate-100">
                <span className="font-bold text-slate-700">{listing.bedrooms} KT</span>
                <span>Kamar</span>
             </div>
           )}
        </div>

        <div className="mt-auto pt-2 flex justify-between items-end">
          <div>
            <div className={`text-lg font-bold ${isSold ? 'text-slate-400 line-through' : 'text-blue-700'}`}>
              Rp {listing.price.toLocaleString('id-ID')}
              {isSewa && <span className="text-xs text-slate-500 font-normal no-underline"> /tahun</span>}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
               <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                  {listing.sellerName[0]}
               </span>
               {listing.sellerName}
            </div>
          </div>
          
          {/* Heart Icon Button */}
          <button 
            onClick={handleHeartClick}
            className={`p-2 rounded-full transition-all duration-300 transform active:scale-90 hover:bg-red-50 group focus:outline-none z-30 ${
              isWishlisted ? 'text-red-500' : 'text-slate-300 hover:text-red-500 hover:scale-110'
            }`}
            title={isWishlisted ? "Hapus dari Favorit" : "Simpan ke Favorit"}
          >
             <svg 
               className={`w-6 h-6 transition-colors duration-300 ${isWishlisted ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}
               viewBox="0 0 24 24"
             >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
             </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;