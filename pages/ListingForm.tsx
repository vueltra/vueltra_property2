

import React, { useState, useEffect } from 'react';
import { Listing, Category, ListingType, ListingStatus, User } from '../types';
import { StoreService } from '../services/store';
import { useToast } from '../context/ToastContext';
import { POPULAR_LOCATIONS, LOCATION_GROUPS } from '../services/data'; // Corrected import path

interface ListingFormProps {
  user: User;
  editListingId?: string;
  onNavigate: (page: string) => void;
}

const ListingForm: React.FC<ListingFormProps> = ({ user, editListingId, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

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
    whatsapp: user.phoneNumber || ''
  });

  // Load data if editing
  useEffect(() => {
    if (editListingId) {
      const loadListing = async () => {
        setLoading(true);
        const listings = await StoreService.getListings();
        const found = listings.find(l => l.id === editListingId);
        if (found) {
          if (found.sellerId !== user.id && !user.isAdmin) {
             onNavigate('dashboard'); // Unauthorized
             return;
          }
          setFormData({
            title: found.title,
            description: found.description,
            price: found.price.toString(),
            category: found.category,
            type: found.type,
            location: found.location,
            address: found.address || '',
            imageUrl: found.imageUrl,
            surfaceArea: found.surfaceArea.toString(),
            buildingArea: found.buildingArea.toString(),
            bedrooms: found.bedrooms.toString(),
            bathrooms: found.bathrooms.toString(),
            certificate: found.certificate || 'SHM',
            whatsapp: found.whatsapp
          });
        }
        setLoading(false);
      };
      loadListing();
    }
  }, [editListingId, user.id, user.isAdmin, onNavigate]);

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

  const handleSubmit = async (e: React.FormEvent, status: ListingStatus) => {
    e.preventDefault();
    
    if (!formData.imageUrl && status === ListingStatus.ACTIVE) {
        showToast("Foto properti wajib diupload untuk tayang.", "error");
        return;
    }
    
    // Logic to determine inputs visibility
    const showBuildingArea = formData.category !== Category.TANAH && formData.category !== Category.SPACE;
    const showBedrooms = [Category.RUMAH, Category.APARTEMEN, Category.RUKO, Category.HOTEL].includes(formData.category);

    const commonData = {
      title: formData.title || (status === ListingStatus.DRAFT ? 'Draft Listing' : ''),
      description: formData.description,
      price: Number(formData.price),
      category: formData.category,
      type: formData.type,
      location: formData.location,
      address: formData.address,
      imageUrl: formData.imageUrl,
      surfaceArea: Number(formData.surfaceArea),
      buildingArea: showBuildingArea ? Number(formData.buildingArea) : 0,
      bedrooms: showBedrooms ? Number(formData.bedrooms) : 0,
      bathrooms: showBedrooms ? Number(formData.bathrooms) : 0,
      certificate: formData.certificate,
      whatsapp: formData.whatsapp,
      status: status // Use passed status (ACTIVE or DRAFT)
    };

    setLoading(true);
    try {
        if (editListingId) {
            // UPDATE EXISTING
            const listings = await StoreService.getListings();
            const original = listings.find(l => l.id === editListingId);
            if (original) {
                await StoreService.updateListing({
                  ...original,
                  ...commonData,
                  // Keep sold status if it was sold, unless we are forcing draft/active? 
                  // For simplicity, if user creates/edits here, we set to passed status.
                  status: status 
                });
            }
            showToast(status === ListingStatus.DRAFT ? "Draft disimpan" : "Iklan berhasil diperbarui!", "success");
        } else {
            // CREATE NEW
            await StoreService.createListing({
                ...commonData
            });
            showToast(status === ListingStatus.DRAFT ? "Draft disimpan" : "Iklan berhasil ditayangkan!", "success");
        }

        // Delay redirect slightly for UX
        setTimeout(() => {
            onNavigate('dashboard');
        }, 1500);
        
    } catch(err) {
        showToast("Terjadi kesalahan saat menyimpan", "error");
        setLoading(false);
    }
  };

  // Conditionals for Form Fields
  const showBuildingArea = formData.category !== Category.TANAH && formData.category !== Category.SPACE;
  const showBedrooms = [Category.RUMAH, Category.APARTEMEN, Category.RUKO, Category.HOTEL].includes(formData.category);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-8">
        <button onClick={() => onNavigate('dashboard')} className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2 mb-4 transition-colors">
          &larr; Batal & Kembali
        </button>
        <h1 className="text-3xl font-extrabold text-slate-900">
          {editListingId ? 'Edit Properti' : 'Pasang Iklan Baru'}
        </h1>
        <p className="text-slate-500 mt-2">Isi detail properti Anda selengkap mungkin untuk menarik pembeli.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Progress Bar (Optional Visual) */}
        <div className="h-1.5 bg-slate-100 w-full">
           <div className="h-full bg-blue-600 w-1/3 rounded-r-full"></div>
        </div>

        <form className="p-8 space-y-8">
           {/* Section 1: Basic Info */}
           <section>
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">1</span>
                 Informasi Dasar
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                    <label className="form-label">Jenis Iklan</label>
                    <div className="flex bg-slate-100 p-1.5 rounded-xl">
                       {Object.values(ListingType).map(t => (
                          <button
                            key={t} type="button"
                            onClick={() => setFormData({...formData, type: t})}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === t ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            {t}
                          </button>
                       ))}
                    </div>
                 </div>
                 <div>
                    <label className="form-label">Kategori Properti</label>
                    <select className="form-select"
                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}
                    >
                      {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>

              <div className="mb-6">
                <label className="form-label">Judul Iklan</label>
                <input type="text" className="form-input"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="Contoh: Rumah Minimalis Modern di BSD City Cluster X"
                />
              </div>

              <div className="mb-6">
                <label className="form-label">Deskripsi Lengkap</label>
                <textarea rows={6} className="form-input" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Jelaskan kondisi properti, akses jalan, fasilitas sekitar, dan kelebihan lainnya..."
                ></textarea>
              </div>
           </section>

           <hr className="border-slate-100" />

           {/* Section 2: Location & Price */}
           <section>
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">2</span>
                 Lokasi & Harga
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="form-label">Wilayah (Kota/Area)</label>
                    <div className="relative">
                      <select className="form-select"
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
                  </div>
                   <div>
                    <label className="form-label">Harga (Rp)</label>
                    <input type="number" className="form-input" 
                      value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} 
                      placeholder="Contoh: 1500000000"
                    />
                 </div>
              </div>

              <div>
                <label className="form-label">Alamat Lengkap (Opsional)</label>
                <input type="text" className="form-input" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="Nama jalan, nomor rumah, RT/RW..."
                />
              </div>
           </section>

           <hr className="border-slate-100" />

           {/* Section 3: Details & Specs */}
           <section>
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">3</span>
                 Spesifikasi & Media
              </h3>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className={!showBuildingArea ? "col-span-2" : ""}>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1">Luas Tanah (m²)</label>
                      <input type="number" className="form-input" value={formData.surfaceArea} onChange={e => setFormData({...formData, surfaceArea: e.target.value})} />
                   </div>
                   {showBuildingArea && (
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1">Luas Bangunan (m²)</label>
                          <input type="number" className="form-input" value={formData.buildingArea} onChange={e => setFormData({...formData, buildingArea: e.target.value})} />
                       </div>
                   )}
                   {showBedrooms && (
                     <>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1">K. Tidur</label>
                          <input type="number" className="form-input" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1">K. Mandi</label>
                          <input type="number" className="form-input" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} />
                       </div>
                     </>
                   )}
                </div>
                
                <div className="mt-4">
                   <label className="text-xs font-bold text-slate-500 uppercase mb-1">Sertifikat</label>
                   <div className="relative">
                     <select className="form-select" value={formData.certificate} onChange={e => setFormData({...formData, certificate: e.target.value})}>
                       <option value="SHM">SHM (Sertifikat Hak Milik)</option>
                       <option value="HGB">HGB (Hak Guna Bangunan)</option>
                       <option value="Strata Title">Strata Title (Apartemen)</option>
                       <option value="Girik/Lainnya">Girik / Lainnya</option>
                     </select>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="form-label">Foto Utama Properti</label>
                    <div className={`border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center transition-colors ${isUploading ? 'bg-slate-50' : 'hover:bg-slate-50 hover:border-blue-300'}`}>
                         {formData.imageUrl ? (
                             <div className="relative aspect-video rounded-lg overflow-hidden shadow-sm">
                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setFormData({...formData, imageUrl: ''})} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-md hover:bg-red-700">
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                             </div>
                         ) : (
                             <label className="cursor-pointer block h-full flex flex-col items-center justify-center py-4">
                                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-3">📷</div>
                                 <span className="text-sm font-bold text-slate-900 block mb-1">{isUploading ? 'Mengupload...' : 'Upload Foto'}</span>
                                 <span className="text-xs text-slate-500">Format JPG/PNG, Max 5MB</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                             </label>
                         )}
                    </div>
                 </div>
                 <div>
                     <label className="form-label">Nomor WhatsApp (Kontak)</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <span className="text-slate-500 font-bold">📞</span>
                        </div>
                        <input type="text" className="form-input pl-10"
                           value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
                           placeholder="08123456789"
                        />
                     </div>
                     <p className="text-xs text-slate-500 mt-2">
                        *Pembeli akan menghubungi Anda langsung melalui nomor ini.
                     </p>
                 </div>
              </div>
           </section>
        </form>

        {/* Action Footer */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-4 sticky bottom-0 z-10">
           <button 
             type="button"
             onClick={(e) => handleSubmit(e, ListingStatus.DRAFT)}
             disabled={loading || isUploading}
             className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50"
           >
             Simpan sebagai Draft
           </button>
           <button 
             type="button"
             onClick={(e) => handleSubmit(e, ListingStatus.ACTIVE)}
             disabled={loading || isUploading}
             className="px-8 py-3 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
           >
             {loading ? 'Menyimpan...' : (editListingId ? 'Simpan Perubahan' : 'Tayangkan Iklan')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ListingForm;