

import React from 'react';
import { Listing, Category, ListingType, ListingStatus } from '../types';
import Badge, { BadgeVariant } from './Badge';

interface ListingCardProps {
  listing: Listing;
  onClick: (listing: Listing) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const getCategoryBadgeVariant = (cat: Category): BadgeVariant => {
  switch (cat) {
    case Category.RUMAH: return 'neutral';
    case Category.APARTEMEN: return 'neutral';
    case Category.TANAH: return 'secondary';
    case Category.GUDANG: return 'warning';
    case Category.HOTEL: return 'primary';
    case Category.GEDUNG: return 'primary';
    case Category.SPACE: return 'success';
    default: return 'neutral';
  }
};

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick, isWishlisted = false, onToggleWishlist }) => {
  const isSewa = listing.type === ListingType.SEWA;
  const isSold = listing.status === ListingStatus.SOLD;
  const isDraft = listing.status === ListingStatus.DRAFT;
  const isPremium = listing.isPinned && !isSold && !isDraft;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(listing.id);
    }
  };

  return (
    <div 
      onClick={() => onClick(listing)}
      className={`
        group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col md:flex-row h-full w-full
        ${isPremium 
          ? 'border-2 border-amber-500 ring-2 ring-amber-200 shadow-xl shadow-amber-100' 
          : 'border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200'
        }
        ${isSold ? 'opacity-60 grayscale' : ''}
        ${isDraft ? 'opacity-70 border-dashed border-2 border-slate-400' : ''}
      `}
    >
      {/* --- IMAGE SECTION --- */}
      <div className="w-full md:w-[320px] lg:w-[360px] shrink-0 relative bg-slate-100 overflow-hidden">
        <div className="aspect-[4/3] md:h-full md:aspect-auto relative">
            <img 
            src={listing.imageUrl} 
            alt={listing.title} 
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSold ? 'grayscale' : ''}`}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?blur=2'; }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/90 to-transparent" />
            
            {/* Location on Image */}
            <div className="absolute bottom-3 left-3 text-white flex items-center gap-1 z-10">
                <svg className="w-3.5 h-3.5 opacity-90" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                <span className="text-xs font-semibold tracking-wide drop-shadow-md text-white">{listing.location}</span>
            </div>
        </div>

        {/* --- BADGES --- */}
        {listing.isExample && !isSold && !isDraft && (
            <div className="absolute top-12 left-3 z-10">
            <Badge variant="neutral" className="bg-white/90 backdrop-blur text-slate-600 shadow-sm !border-slate-200">
                Simulasi
            </Badge>
            </div>
        )}

        {isPremium && (
            <div className="absolute top-3 right-3 z-10 animate-fade-in">
            <Badge variant="premium" icon="👑" className="!bg-amber-500 !text-white !border-amber-400 !shadow-lg shadow-black/50">
                Prioritas
            </Badge>
            </div>
        )}

        {isSold && (
            <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-red-700 text-white text-lg font-bold px-6 py-2 rounded-lg border-2 border-red-500 shadow-xl transform -rotate-6 uppercase tracking-widest">
                {listing.type === ListingType.JUAL ? 'Terjual' : 'Disewa'}
            </div>
            </div>
        )}

        {isDraft && (
            <div className="absolute top-3 right-3 z-20">
            <Badge variant="neutral" className="!bg-slate-400 !text-white !border-slate-300 font-bold shadow-sm">
                Draft
            </Badge>
            </div>
        )}

        <div className="absolute top-3 left-3 z-10">
            <Badge variant={isSewa ? 'secondary' : 'primary'} className="shadow-md !border-0 !text-white !bg-blue-600">
            {isSewa ? 'Disewa' : 'Dijual'}
            </Badge>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <Badge variant={getCategoryBadgeVariant(listing.category)} className="!px-2 !py-0.5 !text-[10px] !bg-slate-100 !text-slate-600 !border-slate-200">
                {listing.category}
            </Badge>
            <div className="text-xs text-slate-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {new Date(listing.createdAt).toLocaleDateString()}
            </div>
        </div>
        
        <h3 className="text-slate-900 font-bold text-lg leading-snug mb-3 md:mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
          {listing.title}
        </h3>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2 md:line-clamp-2 flex-grow">
            {listing.description}
        </p>
        
        {/* Specs Grid */}
        <div className="flex flex-wrap gap-4 py-3 border-t border-b border-slate-200 text-xs text-slate-600 mb-4 bg-slate-50 rounded-lg px-2">
           <div className="flex items-center gap-1.5">
              <span className="p-1.5 bg-white rounded-md shadow-sm border border-slate-200">📐</span>
              <div className="flex flex-col">
                 <span className="font-bold text-slate-900">{listing.surfaceArea} m²</span>
                 <span className="text-[10px] text-slate-500">Tanah</span>
              </div>
           </div>
           {listing.buildingArea > 0 && (
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <span className="p-1.5 bg-white rounded-md shadow-sm border border-slate-200">🏠</span>
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{listing.buildingArea} m²</span>
                    <span className="text-[10px] text-slate-500">Bangunan</span>
                </div>
            </div>
           )}
           {listing.bedrooms > 0 && (
             <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <span className="p-1.5 bg-white rounded-md shadow-sm border border-slate-200">🛏️</span>
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{listing.bedrooms}</span>
                    <span className="text-[10px] text-slate-500">Kamar</span>
                </div>
             </div>
           )}
           {listing.bathrooms > 0 && (
             <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <span className="p-1.5 bg-white rounded-md shadow-sm border border-slate-200">🚿</span>
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{listing.bathrooms}</span>
                    <span className="text-[10px] text-slate-500">Mandi</span>
                </div>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex justify-between items-center">
          <div>
            <div className={`text-xl font-extrabold ${isSold ? 'text-slate-400 line-through decoration-slate-400' : 'text-blue-700'}`}>
              Rp {listing.price.toLocaleString('id-ID')}
              {isSewa && <span className="text-sm text-slate-500 font-semibold no-underline text-transform-none"> /tahun</span>}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
               <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white uppercase ${isPremium ? 'bg-amber-600' : 'bg-slate-600'}`}>
                  {listing.sellerName[0]}
               </div>
               <span className="font-medium truncate max-w-[150px] text-slate-700">{listing.sellerName}</span>
            </div>
          </div>
          
          {/* Heart Button */}
          {!isDraft && (
            <button 
              onClick={handleHeartClick}
              className={`p-3 rounded-full transition-all duration-200 transform active:scale-90 group/heart flex items-center justify-center ${
                isWishlisted 
                  ? 'bg-red-50 text-red-600 ring-1 ring-red-200' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-red-500 hover:shadow-sm'
              }`}
              title={isWishlisted ? "Hapus dari Favorit" : "Simpan ke Favorit"}
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${isWishlisted ? 'fill-current scale-110' : 'fill-none stroke-current stroke-2 group-hover/heart:scale-110'}`}
                viewBox="0 0 24 24"
              >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;