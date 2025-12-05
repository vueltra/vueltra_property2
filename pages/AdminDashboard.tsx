import React, { useState, useEffect, useRef } from 'react';
import { Listing, Category, User, POPULAR_LOCATIONS, LOCATION_GROUPS, ListingType, VerificationStatus, ListingReport, BlogPost, AppSettings } from '../types';
import { StoreService } from '../services/store';
import Toast, { ToastType } from '../components/Toast';

interface AdminDashboardProps {
  user: User;
}

// Custom select style class
const SELECT_CLASS = "w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-3 pr-10 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19.5%208.25l-7.5%207.5-7.5-7.5%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

// Custom input style class
const INPUT_CLASS = "w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'verifications' | 'reports' | 'users' | 'blog' | 'settings'>('listings');
  
  // Data State
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ 
    showMarketInsights: true,
    contactEmail: '',
    contactPhone: '',
    contactWorkingHours: '',
    contactAddress: ''
  });
  const [search, setSearch] = useState('');

  // Toast State
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };

  // Edit Form State (Listings)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [listingFormData, setListingFormData] = useState({
    title: '', description: '', price: 0,
    category: Category.RUMAH, type: ListingType.JUAL, location: POPULAR_LOCATIONS[0],
    imageUrl: '', whatsapp: '', surfaceArea: 0, buildingArea: 0, bedrooms: 0, bathrooms: 0, address: '', certificate: 'SHM',
    isExample: false // [NEW] Flag for Example Data
  });

  // Create Listing For User State
  const [isCreateForUserModalOpen, setIsCreateForUserModalOpen] = useState(false);
  const [creatingForUser, setCreatingForUser] = useState<User | null>(null);

  // Edit User State
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    photoUrl: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Blog State
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [blogFormData, setBlogFormData] = useState({
    title: '', slug: '', category: 'Tips', excerpt: '', content: '', imageUrl: '', author: 'Vueltra Team'
  });
  
  const [isUploading, setIsUploading] = useState(false);

  // Verification View Modal
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Credit Management Modal State
  const [creditModal, setCreditModal] = useState<{
    isOpen: boolean;
    userId: string;
    username: string;
    currentCredits: number;
  }>({ isOpen: false, userId: '', username: '', currentCredits: 0 });
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [creditAction, setCreditAction] = useState<'ADD' | 'SUBTRACT'>('ADD');

  // Custom Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    isDestructive: false
  });
  
  // Helper for conditional rendering in edit modal
  const isBuilding = listingFormData.category !== Category.TANAH && listingFormData.category !== Category.SPACE;

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const lData = await StoreService.getListings();
    setListings(lData);
    const uData = await StoreService.getUsers();
    setUsers(uData);
    const rData = await StoreService.getReports();
    setReports(rData);
    const bData = await StoreService.getBlogPosts();
    setBlogPosts(bData);
    const sData = await StoreService.getSettings();
    setSettings(sData);
  };

  const showConfirm = (message: string, onConfirm: () => void, isDestructive = false) => {
    setConfirmModal({
      isOpen: true,
      message,
      onConfirm,
      isDestructive
    });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDelete = (id: string) => {
    showConfirm("ADMIN: Hapus listing ini secara permanen?", async () => {
      await StoreService.deleteListing(id);
      refreshData();
      showToast("Listing dihapus", "success");
      closeConfirm();
    }, true);
  };

  const handleTogglePin = (id: string, currentStatus: boolean) => {
    showConfirm(`ADMIN: ${currentStatus ? 'Un-Pin' : 'Pin'} Listing ini?`, async () => {
      await StoreService.adminTogglePin(id, !currentStatus);
      refreshData();
      showToast(currentStatus ? "Pin dicabut" : "Listing di-Pin", "success");
      closeConfirm();
    });
  };

  const handleDeleteReport = (id: string) => {
     showConfirm("Hapus laporan ini? (Abaikan)", async () => {
       await StoreService.deleteReport(id);
       refreshData();
       showToast("Laporan dihapus", "info");
       closeConfirm();
     });
  };

  const handleActionReport = (report: ListingReport) => {
     showConfirm("Hapus listing yang dilaporkan ini?", async () => {
        await StoreService.deleteListing(report.listingId);
        await StoreService.deleteReport(report.id);
        refreshData();
        showToast("Listing dilaporkan berhasil dihapus", "success");
        closeConfirm();
     }, true);
  };

  const handleDeleteBlogPost = (id: string) => {
    showConfirm("Hapus artikel ini?", async () => {
      await StoreService.deleteBlogPost(id);
      refreshData();
      showToast("Artikel dihapus", "success");
      closeConfirm();
    }, true);
  };

  const handleAdminImageUpload = async (file: File) => {
      setIsUploading(true);
      try {
          const url = await StoreService.uploadImage(file);
          return url;
      } catch (e) {
          showToast("Gagal upload gambar", "error");
          return "";
      } finally {
          setIsUploading(false);
      }
  };

  // --- LISTING CRUD ---
  const openEditListingModal = (listing: Listing) => {
    setEditingListing(listing);
    setListingFormData({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      type: listing.type,
      location: listing.location,
      imageUrl: listing.imageUrl,
      whatsapp: listing.whatsapp,
      surfaceArea: listing.surfaceArea,
      buildingArea: listing.buildingArea,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      address: listing.address || '',
      certificate: listing.certificate || 'SHM',
      isExample: listing.isExample || false // Populate existing flag
    });
    setIsEditModalOpen(true);
  };

  const openCreateForUserModal = (user: User) => {
      setCreatingForUser(user);
      setListingFormData({
        title: '', description: '', price: 0,
        category: Category.RUMAH, type: ListingType.JUAL, location: POPULAR_LOCATIONS[0],
        imageUrl: '', whatsapp: user.phoneNumber || '', surfaceArea: 0, buildingArea: 0, bedrooms: 0, bathrooms: 0, address: '', certificate: 'SHM',
        isExample: false
      });
      setIsCreateForUserModalOpen(true);
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingListing) {
      const updated: Listing = {
        ...editingListing,
        ...listingFormData,
        buildingArea: isBuilding ? listingFormData.buildingArea : 0,
        bedrooms: isBuilding ? listingFormData.bedrooms : 0,
        bathrooms: isBuilding ? listingFormData.bathrooms : 0,
      };
      await StoreService.updateListing(updated);
    }
    setIsEditModalOpen(false);
    showToast("Listing berhasil disimpan", "success");
    refreshData();
  };

  const handleCreateListingForUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!creatingForUser) return;

      await StoreService.createListing({
        ...listingFormData,
        bedrooms: isBuilding ? listingFormData.bedrooms : 0, 
        bathrooms: isBuilding ? listingFormData.bathrooms : 0,
        buildingArea: isBuilding ? listingFormData.buildingArea : 0,
      }, creatingForUser.id);

      setIsCreateForUserModalOpen(false);
      refreshData();
      showToast(`Listing untuk ${creatingForUser.username} berhasil dibuat`, "success");
  };

  // --- USER CRUD ---
  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setUserFormData({
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        photoUrl: user.photoUrl || ''
    });
    setIsEditUserModalOpen(true);
  };

  const handleUserPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleAdminImageUpload(file);
      if (url) setUserFormData({ ...userFormData, photoUrl: url });
    }
  };
  
  const handleListingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = await handleAdminImageUpload(file);
          if (url) setListingFormData({ ...listingFormData, imageUrl: url });
      }
  }

  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingUser) return;
      await StoreService.updateUserProfile(editingUser.id, {
          username: userFormData.username,
          email: userFormData.email,
          phoneNumber: userFormData.phoneNumber,
          photoUrl: userFormData.photoUrl
      });
      setIsEditUserModalOpen(false);
      showToast("Data user berhasil diupdate", "success");
      refreshData();
  };

  // --- BLOG CRUD ---
  const openCreateBlogModal = () => {
    setEditingPost(null);
    setBlogFormData({
      title: '', slug: '', category: 'Tips', excerpt: '', content: '', imageUrl: '', author: 'Vueltra Team'
    });
    setIsBlogModalOpen(true);
  };

  const openEditBlogModal = (post: BlogPost) => {
    setEditingPost(post);
    setBlogFormData({
      title: post.title, slug: post.slug, category: post.category, excerpt: post.excerpt, content: post.content, imageUrl: post.imageUrl, author: post.author
    });
    setIsBlogModalOpen(true);
  };
  
  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = await handleAdminImageUpload(file);
          if (url) setBlogFormData({ ...blogFormData, imageUrl: url });
      }
  }

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
       await StoreService.updateBlogPost({ ...editingPost, ...blogFormData });
    } else {
       await StoreService.createBlogPost(blogFormData);
    }
    setIsBlogModalOpen(false);
    showToast("Artikel berhasil disimpan", "success");
    refreshData();
  };

  // --- SETTINGS ---
  const handleToggleMarketInsight = async () => {
    const newVal = !settings.showMarketInsights;
    await StoreService.updateSettings({ showMarketInsights: newVal });
    setSettings({ ...settings, showMarketInsights: newVal });
    showToast(`Widget Market Insight ${newVal ? 'diaktifkan' : 'dinonaktifkan'}`, "info");
  };

  const handleSaveContactSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await StoreService.updateSettings(settings);
    showToast("Pengaturan kontak disimpan!", "success");
  };

  // --- VERIFICATION ---
  const handleVerifyAction = (userId: string, newStatus: VerificationStatus) => {
    let confirmMsg = "";
    let isDestructive = false;

    if (newStatus === VerificationStatus.VERIFIED) {
      confirmMsg = "Setujui verifikasi user ini?";
    } else if (newStatus === VerificationStatus.REJECTED) {
      confirmMsg = "Tolak verifikasi user ini?";
      isDestructive = true;
    } else {
      confirmMsg = `Ubah status menjadi ${newStatus}?`;
    }

    showConfirm(confirmMsg, async () => {
      await StoreService.adminVerifyUser(userId, newStatus);
      if (viewingUser) {
        setViewingUser({ ...viewingUser, verificationStatus: newStatus });
        if (newStatus === VerificationStatus.VERIFIED || newStatus === VerificationStatus.REJECTED) {
           setViewingUser(null);
        }
      }
      await refreshData();
      showToast(`Status verifikasi diubah: ${newStatus}`, "success");
      closeConfirm();
    }, isDestructive);
  };

  // --- Credit Management Handlers ---
  const openCreditModal = (user: User) => {
    setCreditModal({
      isOpen: true,
      userId: user.id,
      username: user.username,
      currentCredits: user.credits
    });
    setCreditAmount('');
    setCreditAction('ADD');
  };

  const submitCreditChange = async () => {
    if (!creditAmount || Number(creditAmount) <= 0) return;
    const amount = Number(creditAmount);
    await StoreService.adminManageCredits(creditModal.userId, amount, creditAction);
    setCreditModal({ ...creditModal, isOpen: false });
    refreshData();
    showToast("Saldo user berhasil diupdate", "success");
  };


  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) || 
    l.sellerName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ).filter(u => !u.isAdmin);

  const filteredBlogPosts = blogPosts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const pendingUsers = users.filter(u => u.verificationStatus === VerificationStatus.PENDING);

  if (!user.isAdmin) return <div>Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Properti</h1>
        <div className="flex gap-2 flex-wrap">
           <button onClick={() => setActiveTab('listings')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'listings' ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>Listings</button>
           <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'users' ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>Pengguna</button>
           <button onClick={() => setActiveTab('verifications')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'verifications' ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
             Verifikasi {pendingUsers.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">{pendingUsers.length}</span>}
           </button>
           <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'reports' ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
             Laporan {reports.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">{reports.length}</span>}
           </button>
           <button onClick={() => setActiveTab('blog')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'blog' ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
             Blog
           </button>
           <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'settings' ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
             ⚙️ Pengaturan
           </button>
        </div>
      </div>

      {activeTab === 'listings' && (
        <>
          <div className="mb-6">
            <input 
              type="text" 
              placeholder="Cari ID, Judul, atau Seller..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 border border-gray-300 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Listing</th>
                    <th className="p-4">Lokasi & Tipe</th>
                    <th className="p-4">Seller</th>
                    <th className="p-4 text-center">Top Ad</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredListings.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           {l.isExample && <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold border border-slate-300">CONTOH</span>}
                           <div className="font-bold text-slate-900 line-clamp-1">{l.title}</div>
                        </div>
                        <div className="text-xs text-slate-500">{l.id} • Rp {l.price.toLocaleString()}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-700">
                        <div>{l.location}</div>
                        <div className="text-xs text-slate-500">{l.category} ({l.type})</div>
                      </td>
                      <td className="p-4 text-sm text-slate-700">
                        <div className="font-semibold">{l.sellerName}</div>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleTogglePin(l.id, l.isPinned)} className={`px-2 py-1 text-xs rounded border transition-colors ${l.isPinned ? 'bg-yellow-100 border-yellow-400 text-yellow-800' : 'bg-slate-100 text-slate-500'}`}>
                          {l.isPinned ? 'PINNED' : 'No'}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEditListingModal(l)} className="text-blue-600 font-bold text-xs hover:underline">Edit</button>
                        <button onClick={() => handleDelete(l.id)} className="text-red-600 font-bold text-xs hover:underline">Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Other Tabs content omitted for brevity as they remain unchanged */}
      {activeTab === 'users' && (
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="p-6 text-lg font-bold text-slate-900 border-b">Daftar Pengguna ({filteredUsers.length})</h3>
            <div className="px-6 pt-4 pb-2">
               <input type="text" placeholder="Cari Nama atau Email user..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900" />
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b">
                     <tr><th className="p-4">User Info</th><th className="p-4">Status</th><th className="p-4">Saldo</th><th className="p-4 text-right">Kelola</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                           <td className="p-4">
                              <div className="font-bold text-slate-900">{u.username}</div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                              {u.phoneNumber && <div className="text-xs text-slate-400">{u.phoneNumber}</div>}
                           </td>
                           <td className="p-4"><span className={`text-xs px-2 py-1 rounded font-bold ${u.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}>{u.verificationStatus}</span></td>
                           <td className="p-4 font-mono font-bold text-blue-700">Rp {u.credits.toLocaleString()}</td>
                           <td className="p-4 text-right space-x-2 flex justify-end">
                              <button onClick={() => openEditUserModal(u)} className="bg-slate-100 text-xs font-bold p-1.5 rounded">Edit</button>
                              <button onClick={() => openCreditModal(u)} className="bg-slate-100 text-xs font-bold p-1.5 rounded">Saldo</button>
                              <button onClick={() => openCreateForUserModal(u)} className="bg-blue-50 text-blue-700 text-xs font-bold p-1.5 rounded">+Iklan</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="p-6 text-lg font-bold text-slate-900 border-b">Laporan Iklan ({reports.length})</h3>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b">
                     <tr><th className="p-4">Pelapor</th><th className="p-4">Listing</th><th className="p-4">Alasan</th><th className="p-4 text-right">Tindakan</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {reports.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-400">Tidak ada laporan masuk.</td></tr>
                     ) : (
                        reports.map(r => (
                           <tr key={r.id} className="hover:bg-slate-50">
                              <td className="p-4">
                                 <div className="font-bold text-slate-900">{r.reporterName}</div>
                                 <div className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString()}</div>
                              </td>
                              <td className="p-4">
                                 <div className="font-medium text-slate-800">{r.listingTitle}</div>
                                 <div className="text-xs text-slate-500 font-mono">{r.listingId}</div>
                              </td>
                              <td className="p-4 text-sm text-red-600 font-bold">{r.reason}</td>
                              <td className="p-4 text-right space-x-2">
                                 <button onClick={() => handleDeleteReport(r.id)} className="bg-slate-100 text-xs font-bold px-2 py-1 rounded">Abaikan</button>
                                 <button onClick={() => handleActionReport(r)} className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">Hapus Iklan</button>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* Verifications Tab */}
      {activeTab === 'verifications' && (
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="p-6 text-lg font-bold text-slate-900 border-b">Request Verifikasi ({pendingUsers.length})</h3>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b">
                     <tr><th className="p-4">User</th><th className="p-4">Status</th><th className="p-4 text-right">Review</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {pendingUsers.length === 0 ? (
                        <tr><td colSpan={3} className="p-8 text-center text-slate-400">Tidak ada pending request.</td></tr>
                     ) : (
                        pendingUsers.map(u => (
                           <tr key={u.id} className="hover:bg-slate-50">
                              <td className="p-4">
                                 <div className="font-bold text-slate-900">{u.username}</div>
                                 <div className="text-xs text-slate-500">{u.email}</div>
                              </td>
                              <td className="p-4"><span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">PENDING</span></td>
                              <td className="p-4 text-right">
                                 <button onClick={() => setViewingUser(u)} className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow hover:bg-blue-700">Lihat Dokumen</button>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* Blog Tab */}
      {activeTab === 'blog' && (
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
               <h3 className="text-lg font-bold text-slate-900">Artikel Blog ({filteredBlogPosts.length})</h3>
               <button onClick={openCreateBlogModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700">
                  + Tulis Artikel
               </button>
            </div>
            <div className="px-6 pt-4 pb-2">
               <input type="text" placeholder="Cari Judul Artikel..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900" />
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b">
                     <tr><th className="p-4">Judul</th><th className="p-4">Kategori</th><th className="p-4">Tanggal</th><th className="p-4 text-right">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredBlogPosts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                           <td className="p-4 font-bold text-slate-900">{p.title}</td>
                           <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{p.category}</span></td>
                           <td className="p-4 text-sm text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                           <td className="p-4 text-right space-x-2">
                              <button onClick={() => openEditBlogModal(p)} className="text-blue-600 font-bold text-xs hover:underline">Edit</button>
                              <button onClick={() => handleDeleteBlogPost(p.id)} className="text-red-600 font-bold text-xs hover:underline">Hapus</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Konfigurasi Sistem</h3>
            
            <div className="space-y-8">
               {/* Feature Flags */}
               <div>
                  <h4 className="font-bold text-slate-900 mb-4 bg-slate-100 px-4 py-2 rounded-lg">Feature Flags</h4>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                     <div>
                        <h4 className="font-bold text-slate-900">Market Insight Widget</h4>
                        <p className="text-sm text-slate-500 mt-1">
                           Tampilkan data analitik wilayah (harga rata-rata, tren) di halaman depan.
                        </p>
                     </div>
                     <div className="flex items-center">
                        <button 
                           onClick={handleToggleMarketInsight}
                           className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.showMarketInsights ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                           <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showMarketInsights ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className="ml-3 text-sm font-bold text-slate-700 w-16">
                           {settings.showMarketInsights ? 'AKTIF' : 'NON-AKTIF'}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Contact Settings */}
               <div>
                  <h4 className="font-bold text-slate-900 mb-4 bg-slate-100 px-4 py-2 rounded-lg">Info Kontak / Footer</h4>
                  <form onSubmit={handleSaveContactSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500">Email Support</label>
                        <input className={INPUT_CLASS} value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} placeholder="support@vueltra.com" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500">Nomor Telepon</label>
                        <input className={INPUT_CLASS} value={settings.contactPhone} onChange={e => setSettings({...settings, contactPhone: e.target.value})} placeholder="021-xxxxxx" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500">Jam Kerja</label>
                        <input className={INPUT_CLASS} value={settings.contactWorkingHours} onChange={e => setSettings({...settings, contactWorkingHours: e.target.value})} placeholder="Senin - Jumat..." />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500">Alamat Kantor</label>
                        <input className={INPUT_CLASS} value={settings.contactAddress} onChange={e => setSettings({...settings, contactAddress: e.target.value})} placeholder="Jakarta..." />
                     </div>
                     <div className="md:col-span-2 flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-blue-700">Simpan Perubahan Kontak</button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      )}

      {/* --- MODALS --- */}

      {/* Edit Listing Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Listing (Admin Mode)</h3>
            <form onSubmit={handleSaveListing} className="space-y-4">
               {/* EXAMPLE Checkbox */}
               <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 flex items-center gap-3">
                  <input type="checkbox" id="isExampleEdit" className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500" checked={listingFormData.isExample} onChange={(e) => setListingFormData({...listingFormData, isExample: e.target.checked})} />
                  <label htmlFor="isExampleEdit" className="text-sm font-bold text-slate-700 cursor-pointer">Tandai sebagai CONTOH (Simulasi/Mock Data)</label>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-500">Tipe</label><select className={SELECT_CLASS} value={listingFormData.type} onChange={e => setListingFormData({...listingFormData, type: e.target.value as ListingType})}>{Object.values(ListingType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div><label className="text-xs font-bold text-slate-500">Kategori</label><select className={SELECT_CLASS} value={listingFormData.category} onChange={e => setListingFormData({...listingFormData, category: e.target.value as Category})}>{Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
               </div>
               <div><label className="text-xs font-bold text-slate-500">Judul</label><input required className={INPUT_CLASS} value={listingFormData.title} onChange={e => setListingFormData({...listingFormData, title: e.target.value})} /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-500">Lokasi</label>
                    <select className={SELECT_CLASS} value={listingFormData.location} onChange={e => setListingFormData({...listingFormData, location: e.target.value})}>
                      {LOCATION_GROUPS.map((group, idx) => (
                        <optgroup key={idx} label={group.region}>
                          {group.cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div><label className="text-xs font-bold text-slate-500">Harga</label><input required type="number" className={INPUT_CLASS} value={listingFormData.price} onChange={e => setListingFormData({...listingFormData, price: Number(e.target.value)})} /></div>
               </div>
               <div><label className="text-xs font-bold text-slate-500">Alamat</label><input className={INPUT_CLASS} value={listingFormData.address} onChange={e => setListingFormData({...listingFormData, address: e.target.value})} /></div>
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className={!isBuilding ? "col-span-2" : ""}><label className="text-xs font-bold text-slate-500">L. Tanah</label><input required type="number" className={INPUT_CLASS} value={listingFormData.surfaceArea} onChange={e => setListingFormData({...listingFormData, surfaceArea: Number(e.target.value)})} /></div>
                  {isBuilding && (
                    <>
                      <div><label className="text-xs font-bold text-slate-500">L. Bangunan</label><input required type="number" className={INPUT_CLASS} value={listingFormData.buildingArea} onChange={e => setListingFormData({...listingFormData, buildingArea: Number(e.target.value)})} /></div>
                      <div><label className="text-xs font-bold text-slate-500">K. Tidur</label><input required type="number" className={INPUT_CLASS} value={listingFormData.bedrooms} onChange={e => setListingFormData({...listingFormData, bedrooms: Number(e.target.value)})} /></div>
                      <div><label className="text-xs font-bold text-slate-500">K. Mandi</label><input required type="number" className={INPUT_CLASS} value={listingFormData.bathrooms} onChange={e => setListingFormData({...listingFormData, bathrooms: Number(e.target.value)})} /></div>
                    </>
                  )}
               </div>
               
               {/* Image Upload */}
               <div>
                   <label className="text-xs font-bold text-slate-500 mb-1 block">Foto Properti</label>
                   <div className="flex gap-2">
                       {listingFormData.imageUrl && <img src={listingFormData.imageUrl} className="h-10 w-10 object-cover rounded" />}
                       <input type="file" accept="image/*" onChange={handleListingImageUpload} disabled={isUploading} className="text-sm" />
                   </div>
               </div>
               
               <div><label className="text-xs font-bold text-slate-500">Deskripsi</label><textarea required rows={3} className={INPUT_CLASS} value={listingFormData.description} onChange={e => setListingFormData({...listingFormData, description: e.target.value})} /></div>
               <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold">Batal</button>
                  <button type="submit" disabled={isUploading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Simpan</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Listing For User Modal */}
      {isCreateForUserModalOpen && creatingForUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tambah Listing untuk User</h3>
            <p className="text-sm text-slate-500 mb-4">Pemilik: <strong>{creatingForUser.username}</strong> ({creatingForUser.email})</p>
            <form onSubmit={handleCreateListingForUser} className="space-y-4">
               {/* EXAMPLE Checkbox */}
               <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 flex items-center gap-3">
                  <input type="checkbox" id="isExampleCreate" className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500" checked={listingFormData.isExample} onChange={(e) => setListingFormData({...listingFormData, isExample: e.target.checked})} />
                  <label htmlFor="isExampleCreate" className="text-sm font-bold text-slate-700 cursor-pointer">Tandai sebagai CONTOH (Simulasi/Mock Data)</label>
               </div>

               {/* Same form fields as Edit Listing, simplified reuse */}
               <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-500">Tipe</label><select className={SELECT_CLASS} value={listingFormData.type} onChange={e => setListingFormData({...listingFormData, type: e.target.value as ListingType})}>{Object.values(ListingType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div><label className="text-xs font-bold text-slate-500">Kategori</label><select className={SELECT_CLASS} value={listingFormData.category} onChange={e => setListingFormData({...listingFormData, category: e.target.value as Category})}>{Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
               </div>
               <div><label className="text-xs font-bold text-slate-500">Judul</label><input required className={INPUT_CLASS} value={listingFormData.title} onChange={e => setListingFormData({...listingFormData, title: e.target.value})} /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-500">Lokasi</label>
                    <select className={SELECT_CLASS} value={listingFormData.location} onChange={e => setListingFormData({...listingFormData, location: e.target.value})}>
                      {LOCATION_GROUPS.map((group, idx) => (
                        <optgroup key={idx} label={group.region}>
                          {group.cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div><label className="text-xs font-bold text-slate-500">Harga</label><input required type="number" className={INPUT_CLASS} value={listingFormData.price} onChange={e => setListingFormData({...listingFormData, price: Number(e.target.value)})} /></div>
               </div>
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className={!isBuilding ? "col-span-2" : ""}><label className="text-xs font-bold text-slate-500">L. Tanah</label><input required type="number" className={INPUT_CLASS} value={listingFormData.surfaceArea} onChange={e => setListingFormData({...listingFormData, surfaceArea: Number(e.target.value)})} /></div>
                  {isBuilding && (
                    <>
                      <div><label className="text-xs font-bold text-slate-500">L. Bangunan</label><input required type="number" className={INPUT_CLASS} value={listingFormData.buildingArea} onChange={e => setListingFormData({...listingFormData, buildingArea: Number(e.target.value)})} /></div>
                      <div><label className="text-xs font-bold text-slate-500">K. Tidur</label><input required type="number" className={INPUT_CLASS} value={listingFormData.bedrooms} onChange={e => setListingFormData({...listingFormData, bedrooms: Number(e.target.value)})} /></div>
                      <div><label className="text-xs font-bold text-slate-500">K. Mandi</label><input required type="number" className={INPUT_CLASS} value={listingFormData.bathrooms} onChange={e => setListingFormData({...listingFormData, bathrooms: Number(e.target.value)})} /></div>
                    </>
                  )}
               </div>

                {/* Image Upload */}
               <div>
                   <label className="text-xs font-bold text-slate-500 mb-1 block">Foto Properti</label>
                   <div className="flex gap-2">
                       {listingFormData.imageUrl && <img src={listingFormData.imageUrl} className="h-10 w-10 object-cover rounded" />}
                       <input type="file" accept="image/*" onChange={handleListingImageUpload} disabled={isUploading} className="text-sm" />
                   </div>
               </div>

               <div><label className="text-xs font-bold text-slate-500">Deskripsi</label><textarea required rows={3} className={INPUT_CLASS} value={listingFormData.description} onChange={e => setListingFormData({...listingFormData, description: e.target.value})} /></div>
               <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setIsCreateForUserModalOpen(false)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold">Batal</button>
                  <button type="submit" disabled={isUploading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Posting</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Other modals omitted for brevity */}
      {isEditUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Data User</h3>
              <form onSubmit={handleSaveUser} className="space-y-4">
                 <div><label className="text-xs font-bold text-slate-500">Username</label><input required className={INPUT_CLASS} value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} /></div>
                 <div><label className="text-xs font-bold text-slate-500">Email</label><input required type="email" className={INPUT_CLASS} value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} /></div>
                 <div><label className="text-xs font-bold text-slate-500">WhatsApp</label><input className={INPUT_CLASS} value={userFormData.phoneNumber} onChange={e => setUserFormData({...userFormData, phoneNumber: e.target.value})} /></div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Foto Profil</label>
                    <div className="flex items-center gap-2">
                         {userFormData.photoUrl && <img src={userFormData.photoUrl} className="w-10 h-10 rounded-full border" />}
                         <input type="file" ref={fileInputRef} onChange={handleUserPhotoUpload} className="text-sm" disabled={isUploading} />
                    </div>
                    {isUploading && <span className="text-xs text-blue-600">Mengupload...</span>}
                 </div>
                 <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={() => setIsEditUserModalOpen(false)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold">Batal</button>
                    <button type="submit" disabled={isUploading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Simpan</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {creditModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Kelola Saldo</h3>
              <p className="text-sm text-slate-500 mb-4">User: <strong>{creditModal.username}</strong><br/>Saldo Saat Ini: Rp {creditModal.currentCredits.toLocaleString()}</p>
              <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-lg">
                 <button onClick={() => setCreditAction('ADD')} className={`flex-1 py-1 rounded text-sm font-bold ${creditAction === 'ADD' ? 'bg-white shadow text-green-700' : 'text-slate-500'}`}>Tambah (+)</button>
                 <button onClick={() => setCreditAction('SUBTRACT')} className={`flex-1 py-1 rounded text-sm font-bold ${creditAction === 'SUBTRACT' ? 'bg-white shadow text-red-700' : 'text-slate-500'}`}>Kurangi (-)</button>
              </div>
              <input type="number" placeholder="Nominal (Rp)" className={INPUT_CLASS} value={creditAmount} onChange={e => setCreditAmount(e.target.value)} />
              <div className="flex justify-end gap-2 mt-4">
                 <button onClick={() => setCreditModal({...creditModal, isOpen: false})} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold">Batal</button>
                 <button onClick={submitCreditChange} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Simpan</button>
              </div>
           </div>
        </div>
      )}

      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-lg">Review Verifikasi: {viewingUser.username}</h3>
                 <button onClick={() => setViewingUser(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div>
                    <h4 className="font-bold text-slate-500 text-sm mb-2 uppercase">Data User</h4>
                    <p>Email: {viewingUser.email}</p>
                    <p>Phone: {viewingUser.phoneNumber}</p>
                    <p>Status Saat Ini: <span className="font-bold">{viewingUser.verificationStatus}</span></p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <h4 className="font-bold text-slate-900 mb-2">Foto KTP</h4>
                       <div className="border rounded-lg p-2 bg-slate-100 min-h-[200px] flex items-center justify-center">
                          {viewingUser.ktpUrl ? <img src={viewingUser.ktpUrl} alt="KTP" className="max-w-full max-h-64 object-contain" /> : <span className="text-slate-400">Tidak ada foto</span>}
                       </div>
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-900 mb-2">Foto Selfie</h4>
                       <div className="border rounded-lg p-2 bg-slate-100 min-h-[200px] flex items-center justify-center">
                          {viewingUser.selfieUrl ? <img src={viewingUser.selfieUrl} alt="Selfie" className="max-w-full max-h-64 object-contain" /> : <span className="text-slate-400">Tidak ada foto</span>}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
                 {viewingUser.verificationStatus !== 'VERIFIED' && (
                    <button onClick={() => handleVerifyAction(viewingUser.id, VerificationStatus.VERIFIED)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-md">Approve (Setujui)</button>
                 )}
                 {viewingUser.verificationStatus !== 'REJECTED' && (
                    <button onClick={() => handleVerifyAction(viewingUser.id, VerificationStatus.REJECTED)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-md">Reject (Tolak)</button>
                 )}
                 {viewingUser.verificationStatus === 'VERIFIED' && (
                    <button onClick={() => handleVerifyAction(viewingUser.id, VerificationStatus.UNVERIFIED)} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-bold hover:bg-slate-300">Cabut Verifikasi</button>
                 )}
              </div>
           </div>
        </div>
      )}

      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
             <h3 className="text-lg font-bold text-slate-900 mb-4">{editingPost ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h3>
             <form onSubmit={handleSaveBlog} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500">Judul Artikel</label><input required className={INPUT_CLASS} value={blogFormData.title} onChange={e => setBlogFormData({...blogFormData, title: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                   <div><label className="text-xs font-bold text-slate-500">Kategori</label><input required className={INPUT_CLASS} value={blogFormData.category} onChange={e => setBlogFormData({...blogFormData, category: e.target.value})} placeholder="Tips, Investasi, dll" /></div>
                   <div><label className="text-xs font-bold text-slate-500">Penulis</label><input className={INPUT_CLASS} value={blogFormData.author} onChange={e => setBlogFormData({...blogFormData, author: e.target.value})} /></div>
                </div>
                
                {/* Blog Image Upload */}
                <div>
                   <label className="text-xs font-bold text-slate-500 mb-1 block">Gambar Utama</label>
                   <div className="flex gap-2">
                       {blogFormData.imageUrl && <img src={blogFormData.imageUrl} className="h-10 w-16 object-cover rounded" />}
                       <input type="file" accept="image/*" onChange={handleBlogImageUpload} disabled={isUploading} className="text-sm" />
                   </div>
                </div>

                <div><label className="text-xs font-bold text-slate-500">Ringkasan (Excerpt)</label><textarea required rows={2} className={INPUT_CLASS} value={blogFormData.excerpt} onChange={e => setBlogFormData({...blogFormData, excerpt: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-slate-500">Isi Konten</label><textarea required rows={10} className={INPUT_CLASS} value={blogFormData.content} onChange={e => setBlogFormData({...blogFormData, content: e.target.value})} placeholder="Tulis artikel di sini..." /></div>
                
                <div className="flex gap-3 justify-end mt-4">
                   <button type="button" onClick={() => setIsBlogModalOpen(false)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold">Batal</button>
                   <button type="submit" disabled={isUploading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Simpan Artikel</button>
                </div>
             </form>
           </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
             <p className="mb-6 text-lg text-slate-800">{confirmModal.message}</p>
             <div className="flex justify-end gap-2">
                <button onClick={closeConfirm} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium">Batal</button>
                <button onClick={confirmModal.onConfirm} className={`text-white px-4 py-2 rounded-lg font-bold ${confirmModal.isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>Ya, Lanjutkan</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;