

import { Listing, User, Category, AppState, ListingType, VerificationStatus, ListingStatus, Transaction, ListingReport, CityInsight, BlogPost, AppSettings, PropertyRequest } from '../types';
import { 
  APP_CONFIG, 
  API_CONFIG, 
  DEFAULT_SETTINGS, 
  INITIAL_USERS, 
  INITIAL_LISTINGS, 
  INITIAL_BLOG_POSTS, 
  INITIAL_REQUESTS, 
  CITY_INSIGHTS_DATA, 
  DEFAULT_INDONESIA_STATS,
  POPULAR_LOCATIONS, // Import from data.ts
  LOCATION_GROUPS // Import from data.ts
} from './data';

// --- API HELPER ---
const apiCall = async (endpoint: string, method = 'GET', body?: any) => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  // Ambil token dari localStorage jika ada
  const token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  };

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Request Failed [${method} ${endpoint}]:`, error);
    throw error;
  }
};

const getInitialState = (): AppState => {
  const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
  
  // 1. Mock Data Storage
  let mockState: AppState | null = null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure migration for new fields if accessing old data
      const migratedUsers = parsed.users.map((u: User) => ({
        ...u,
        wishlist: u.wishlist || [],
        verificationStatus: u.verificationStatus || VerificationStatus.UNVERIFIED,
        joinedAt: u.joinedAt || Date.now(),
        phoneNumber: u.phoneNumber || '',
        photoUrl: u.photoUrl || '' 
      }));

      // Listings migration: ensure youtubeUrl exists, isExample
      const migratedListings = parsed.listings.map((l: Listing) => ({
        ...l,
        youtubeUrl: l.youtubeUrl || '',
        isExample: l.isExample || false
      }));

      // Requests migration
      const migratedRequests = (parsed.requests || []).map((r: PropertyRequest) => ({
        ...r,
        isExample: r.isExample || false
      }));

      // Merge Settings properly to support new flags in future
      const mergedSettings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };

      mockState = {
        users: migratedUsers,
        listings: migratedListings,
        currentUser: parsed.currentUser,
        transactions: parsed.transactions || [],
        reports: parsed.reports || [],
        blogPosts: parsed.blogPosts || INITIAL_BLOG_POSTS, // Migrate Blog
        requests: migratedRequests.length > 0 ? migratedRequests : INITIAL_REQUESTS, // Migrate Requests
        settings: mergedSettings
      };
    } catch (e) {
      console.error("Storage Error", e);
    }
  }

  // Fallback default mock state
  if (!mockState) {
     mockState = {
        users: INITIAL_USERS,
        listings: INITIAL_LISTINGS,
        currentUser: null,
        transactions: [],
        reports: [],
        blogPosts: INITIAL_BLOG_POSTS,
        requests: INITIAL_REQUESTS,
        settings: DEFAULT_SETTINGS
     };
  }

  // 2. Real Backend Session Check
  let realUser: User | null = null;
  if (APP_CONFIG.USE_REAL_BACKEND) {
     const storedUser = localStorage.getItem('auth_user');
     if (storedUser) {
        try {
           realUser = JSON.parse(storedUser);
        } catch(e) { console.error("Real User Storage Error", e); }
     }
  }

  // Determine Current User based on Mode
  let activeUser = null;
  if (APP_CONFIG.USE_REAL_BACKEND) {
     activeUser = realUser; 
  } else {
     // Mock Mode: Check for Dev Auto-Login
     if (!mockState.currentUser && APP_CONFIG.IS_DEV_MODE) {
        console.log("DEV MODE: Auto-logging in as Admin");
        activeUser = INITIAL_USERS[2]; // Admin
     } else {
        activeUser = mockState.currentUser;
     }
  }

  return {
    ...mockState,
    currentUser: activeUser
  };
};

export const StoreService = {
  getState: (): AppState => {
    return getInitialState();
  },

  saveState: (state: AppState) => {
    if (!APP_CONFIG.USE_REAL_BACKEND) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(state));
    }
  },

  // --- SETTINGS METHODS ---
  getSettings: async (): Promise<AppSettings> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        return await apiCall(API_CONFIG.ENDPOINTS.SETTINGS);
    }
    const state = getInitialState();
    return state.settings;
  },

  updateSettings: async (newSettings: Partial<AppSettings>) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        return await apiCall(API_CONFIG.ENDPOINTS.SETTINGS, 'PUT', newSettings);
    }
    const state = getInitialState();
    state.settings = { ...state.settings, ...newSettings };
    StoreService.saveState(state);
    return state.settings;
  },

  // --- REQUESTS (TITIP CARI) METHODS ---
  getRequests: async (): Promise<PropertyRequest[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.REQUESTS);
    const state = getInitialState();
    return state.requests;
  },

  createRequest: async (req: Omit<PropertyRequest, 'id' | 'createdAt'>) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.REQUESTS, 'POST', req);
    const state = getInitialState();
    const newReq: PropertyRequest = {
      id: `req_${Date.now()}`,
      ...req,
      createdAt: Date.now()
    };
    state.requests.unshift(newReq);
    StoreService.saveState(state);
    return newReq;
  },

  deleteRequest: async (id: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(`${API_CONFIG.ENDPOINTS.REQUESTS}/${id}`, 'DELETE');
    const state = getInitialState();
    state.requests = state.requests.filter(r => r.id !== id);
    StoreService.saveState(state);
  },

  // --- BLOG METHODS ---
  getBlogPosts: async (): Promise<BlogPost[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(API_CONFIG.ENDPOINTS.BLOG);
    }
    const state = getInitialState();
    return state.blogPosts;
  },

  getBlogPostById: async (id: string): Promise<BlogPost | undefined> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       // GET /posts/:id
       return await apiCall(`${API_CONFIG.ENDPOINTS.BLOG}/${id}`);
    }
    const state = getInitialState();
    return state.blogPosts.find(p => p.id === id);
  },

  createBlogPost: async (post: Omit<BlogPost, 'id' | 'createdAt'>) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(API_CONFIG.ENDPOINTS.BLOG, 'POST', post);
    }
    const state = getInitialState();
    const newPost: BlogPost = {
       id: `post_${Date.now()}`,
       ...post,
       createdAt: Date.now()
    };
    state.blogPosts.unshift(newPost);
    StoreService.saveState(state);
    return newPost;
  },

  updateBlogPost: async (post: BlogPost) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(`${API_CONFIG.ENDPOINTS.BLOG}/${post.id}`, 'PUT', post);
    }
    const state = getInitialState();
    const idx = state.blogPosts.findIndex(p => p.id === post.id);
    if (idx !== -1) {
       state.blogPosts[idx] = post;
       StoreService.saveState(state);
    }
  },

  deleteBlogPost: async (id: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(`${API_CONFIG.ENDPOINTS.BLOG}/${id}`, 'DELETE');
    }
    const state = getInitialState();
    state.blogPosts = state.blogPosts.filter(p => p.id !== id);
    StoreService.saveState(state);
  },

  // --- EXISTING METHODS ---

  getListings: async (): Promise<Listing[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        try {
           const data = await apiCall(API_CONFIG.ENDPOINTS.LISTINGS);
           return data; 
        } catch (e) {
           console.warn("Backend unavailable, falling back to mock");
           return getInitialState().listings;
        }
    } else {
        return getInitialState().listings;
    }
  },
  
  login: async (email: string, password: string): Promise<User> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        const data = await apiCall(API_CONFIG.ENDPOINTS.LOGIN, 'POST', { email, password });
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        return data.user;
    } else {
        const state = getInitialState();
        const user = state.users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error("Email atau password salah");
        state.currentUser = user;
        StoreService.saveState(state);
        return user;
    }
  },

  logout: async () => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }
    const state = getInitialState();
    state.currentUser = null;
    StoreService.saveState(state);
  },

  register: async (username: string, email: string, password: string, phoneNumber: string): Promise<User> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       const data = await apiCall(API_CONFIG.ENDPOINTS.REGISTER, 'POST', { username, email, password, phoneNumber });
       return data.user;
    } else {
        const state = getInitialState();
        if (state.users.find(u => u.email === email)) throw new Error("Email sudah terdaftar");
        const newUser: User = { id: `user_${Date.now()}`, username, email, phoneNumber, password, credits: 0, verificationStatus: VerificationStatus.UNVERIFIED, wishlist: [], joinedAt: Date.now(), photoUrl: '' };
        state.users.push(newUser);
        state.currentUser = newUser;
        StoreService.saveState(state);
        return newUser;
    }
  },

  createListing: async (data: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'createdAt' | 'isPinned'>, asUserId?: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        return await apiCall(API_CONFIG.ENDPOINTS.LISTINGS, 'POST', { ...data, asUserId });
    } else {
        const state = getInitialState();
        if (!state.currentUser) throw new Error("Unauthorized");
        let sellerId = state.currentUser.id;
        let sellerName = state.currentUser.username;
        if (asUserId && state.currentUser.isAdmin) {
            const targetUser = state.users.find(u => u.id === asUserId);
            if (targetUser) { sellerId = targetUser.id; sellerName = targetUser.username; }
        }
        // Pastikan status default adalah ACTIVE jika tidak dikirim (namun sekarang dikirim dari FE)
        const status = data.status || ListingStatus.ACTIVE;
        
        const newListing: Listing = { 
            id: `p_${Date.now()}`, 
            sellerId, 
            sellerName, 
            ...data, 
            status: status, // Use spread status
            isPinned: false, 
            createdAt: Date.now() 
        };
        state.listings.unshift(newListing);
        StoreService.saveState(state);
        return newListing;
    }
  },

  adminManageCredits: async (userId: string, amount: number, type: 'ADD' | 'SUBTRACT') => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        return await apiCall(API_CONFIG.ENDPOINTS.MANAGE_CREDITS, 'POST', { userId, amount, type });
    } else {
        const state = getInitialState();
        const userIdx = state.users.findIndex(u => u.id === userId);
        if (userIdx !== -1) {
            if (type === 'ADD') state.users[userIdx].credits += amount;
            else state.users[userIdx].credits = Math.max(0, state.users[userIdx].credits - amount);
            state.transactions.push({ id: `trx_admin_${Date.now()}`, userId: userId, type: type === 'ADD' ? 'TOPUP' : 'SPEND', amount: amount, description: type === 'ADD' ? 'Top Up by Admin' : 'Penyesuaian Admin (Deduct)', date: Date.now() });
            if (state.currentUser && state.currentUser.id === userId) state.currentUser = state.users[userIdx];
            StoreService.saveState(state);
            return true;
        }
        return false;
    }
  },

  updateUserProfile: async (userId: string, updates: Partial<User>) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
      const endpoint = userId === 'me' ? API_CONFIG.ENDPOINTS.UPDATE_PROFILE : `${API_CONFIG.ENDPOINTS.ADMIN_USER_UPDATE}/${userId}`;
      const res = await apiCall(endpoint, 'PUT', updates);
      if (userId === 'me') localStorage.setItem('auth_user', JSON.stringify(res.user));
      return res;
    } else {
      const state = getInitialState();
      let targetUserId = userId;
      if (userId === 'me' && state.currentUser) targetUserId = state.currentUser.id;
      const userIdx = state.users.findIndex(u => u.id === targetUserId);
      if (userIdx !== -1) {
        const updatedUser = { ...state.users[userIdx], ...updates };
        state.users[userIdx] = updatedUser;
        if (state.currentUser && state.currentUser.id === targetUserId) state.currentUser = updatedUser;
        if (updates.username) { state.listings.forEach(l => { if (l.sellerId === targetUserId) l.sellerName = updates.username!; }); }
        StoreService.saveState(state);
      }
    }
  },

  getUsers: async (): Promise<User[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.USERS);
    return getInitialState().users;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.TRANSACTIONS);
    const state = getInitialState();
    return state.transactions.filter(t => t.userId === state.currentUser?.id).sort((a,b) => b.date - a.date);
  },

  getReports: async (): Promise<ListingReport[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.REPORTS);
    return getInitialState().reports;
  },

  getCityInsight: async (location: string): Promise<CityInsight> => {
    return CITY_INSIGHTS_DATA[location] || DEFAULT_INDONESIA_STATS;
  },

  resetPassword: async (email: string) => {
    const state = getInitialState();
    if (!state.users.find(u => u.email === email)) throw new Error("Email tidak terdaftar");
    return true;
  },

  updateListing: async (listing: Listing) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(`${API_CONFIG.ENDPOINTS.LISTINGS}/${listing.id}`, 'PUT', listing);
    }
    const state = getInitialState();
    const idx = state.listings.findIndex(l => l.id === listing.id);
    if (idx !== -1) { state.listings[idx] = listing; StoreService.saveState(state); }
  },

  updateListingStatus: async (id: string, status: ListingStatus) => {
     if (APP_CONFIG.USE_REAL_BACKEND) {
        return await apiCall(`${API_CONFIG.ENDPOINTS.LISTINGS}/${id}/status`, 'PATCH', { status });
     }
     const state = getInitialState();
     const listing = state.listings.find(l => l.id === id);
     if (listing) { listing.status = status; StoreService.saveState(state); }
  },

  deleteListing: async (id: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(`${API_CONFIG.ENDPOINTS.LISTINGS}/${id}`, 'DELETE');
    }
    const state = getInitialState();
    state.listings = state.listings.filter(l => l.id !== id);
    StoreService.saveState(state);
  },

  pinListing: async (id: string, cost: number) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       try {
          await apiCall(`${API_CONFIG.ENDPOINTS.LISTINGS}/${id}/pin`, 'POST', { cost });
          return true;
       } catch (e) { return false; }
    }
    const state = getInitialState();
    if (!state.currentUser) return false;
    const userIdx = state.users.findIndex(u => u.id === state.currentUser?.id);
    if (userIdx === -1 || state.users[userIdx].credits < cost) return false;
    const listing = state.listings.find(l => l.id === id);
    if (!listing) return false;
    state.users[userIdx].credits -= cost;
    listing.isPinned = true;
    state.transactions.push({ id: `trx_${Date.now()}`, userId: state.users[userIdx].id, type: 'SPEND', amount: cost, description: `Promosi Listing: ${listing.title}`, date: Date.now() });
    state.currentUser = state.users[userIdx];
    StoreService.saveState(state);
    return true;
  },

  adminTogglePin: async (id: string, status: boolean) => {
    const state = getInitialState();
    const listing = state.listings.find(l => l.id === id);
    if (listing) { listing.isPinned = status; StoreService.saveState(state); }
  },

  debugAddCredits: async (amount: number) => {
    const state = getInitialState();
    if (!state.currentUser) return;
    const userIdx = state.users.findIndex(u => u.id === state.currentUser?.id);
    if (userIdx !== -1) {
      state.users[userIdx].credits += amount;
      state.transactions.push({ id: `trx_${Date.now()}`, userId: state.currentUser.id, type: 'TOPUP', amount: amount, description: 'Top Up Saldo Iklan', date: Date.now() });
      state.currentUser = state.users[userIdx];
      StoreService.saveState(state);
    }
  },

  toggleWishlist: async (listingId: string): Promise<boolean> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
      const res = await apiCall(API_CONFIG.ENDPOINTS.LISTINGS + `/${listingId}/wishlist`, 'POST');
      return res.isWishlisted;
    }
    const state = getInitialState();
    if (!state.currentUser) return false;
    const userIdx = state.users.findIndex(u => u.id === state.currentUser?.id);
    if (userIdx === -1) return false;
    let wishlist = state.users[userIdx].wishlist || [];
    let added = false;
    if (wishlist.includes(listingId)) { wishlist = wishlist.filter(id => id !== listingId); } 
    else { wishlist.push(listingId); added = true; }
    state.users[userIdx].wishlist = wishlist;
    state.currentUser = state.users[userIdx]; 
    StoreService.saveState(state);
    return added;
  },

  submitVerification: async (ktp: string, selfie: string, card?: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.VERIFICATION, 'POST', { ktpUrl: ktp, selfieUrl: selfie, agentCardUrl: card });
    const state = getInitialState();
    if (!state.currentUser) return;
    const userIdx = state.users.findIndex(u => u.id === state.currentUser?.id);
    if (userIdx !== -1) {
      state.users[userIdx].verificationStatus = VerificationStatus.PENDING;
      state.users[userIdx].ktpUrl = ktp;
      state.users[userIdx].selfieUrl = selfie;
      state.currentUser = state.users[userIdx];
      StoreService.saveState(state);
    }
  },

  adminVerifyUser: async (userId: string, status: VerificationStatus) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.ADMIN_VERIFY, 'POST', { userId, status });
    const state = getInitialState();
    const userIdx = state.users.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      state.users[userIdx].verificationStatus = status;
      if (state.currentUser && state.currentUser.id === userId) state.currentUser.verificationStatus = status;
      StoreService.saveState(state);
    }
  },

  submitReport: async (listingId: string, reason: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.REPORTS, 'POST', { listingId, reason });
    const state = getInitialState();
    if (!state.currentUser) return;
    const listing = state.listings.find(l => l.id === listingId);
    state.reports.push({ id: `rpt_${Date.now()}`, listingId, listingTitle: listing ? listing.title : 'Unknown', reporterId: state.currentUser.id, reporterName: state.currentUser.username, reason, date: Date.now() });
    StoreService.saveState(state);
  },

  deleteReport: async (id: string) => {
    const state = getInitialState();
    state.reports = state.reports.filter(r => r.id !== id);
    StoreService.saveState(state);
  },

  getAgentProfile: async (agentId: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.USERS + `/${agentId}/public`);
    const state = getInitialState();
    const agent = state.users.find(u => u.id === agentId);
    if (!agent) return null;
    const listings = state.listings.filter(l => l.sellerId === agentId);
    return { agent, listings };
  },

  // --- NEW: UPLOAD IMAGE HELPER ---
  uploadImage: async (file: File): Promise<string> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Custom fetch call for Multipart because content-type must be auto-set by browser
        const token = localStorage.getItem('auth_token');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            
            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error("Upload error", error);
            throw error;
        }
    } else {
        // Mock Mode: Convert to Base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }
  }
};