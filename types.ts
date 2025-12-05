
export enum Category {
  RUMAH = 'Rumah Tapak',
  APARTEMEN = 'Apartemen',
  RUKO = 'Ruko & Rukan',
  KANTOR = 'Kantor & Office',
  TANAH = 'Tanah Kavling',
  SPACE = 'Lapak / Space Usaha'
}

export enum ListingType {
  JUAL = 'Dijual',
  SEWA = 'Disewa'
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

// Grouped Locations for Better UX (Like Lamudi/Rumah123)
export const LOCATION_GROUPS = [
  {
    region: "Jabodetabek (Populer)",
    cities: [
      'Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Utara', 'Jakarta Timur',
      'Tangerang Selatan', 'BSD City', 'Gading Serpong', 'Bintaro',
      'Tangerang Kota', 'Depok', 'Bekasi', 'Cikarang', 'Bogor', 'Sentul', 'Cibubur'
    ]
  },
  {
    region: "Jawa Barat",
    cities: ['Bandung', 'Cimahi', 'Cirebon', 'Sukabumi', 'Karawang']
  },
  {
    region: "Jawa Tengah & DIY",
    cities: ['Yogyakarta', 'Sleman', 'Semarang', 'Solo (Surakarta)', 'Magelang']
  },
  {
    region: "Jawa Timur",
    cities: ['Surabaya', 'Sidoarjo', 'Malang', 'Batu', 'Gresik']
  },
  {
    region: "Bali & Nusa Tenggara",
    cities: ['Bali - Denpasar', 'Bali - Badung (Canggu/Seminyak)', 'Bali - Ubud', 'Bali - Jimbaran', 'Lombok']
  },
  {
    region: "Sumatera",
    cities: ['Medan', 'Palembang', 'Batam', 'Pekanbaru', 'Lampung', 'Padang']
  },
  {
    region: "Kalimantan & Sulawesi",
    cities: ['Makassar', 'Manado', 'Balikpapan', 'Samarinda', 'Pontianak', 'Banjarmasin']
  },
  {
    region: "Lainnya",
    cities: ['Other']
  }
];

// Flattened array helper for backward compatibility / validation
export const POPULAR_LOCATIONS = LOCATION_GROUPS.flatMap(group => group.cities);

export interface CityInsight {
  location: string;
  avgPrice: string;
  weather: string;
  famousFor: string;
  transportation: string;
  growthRate: string; // Kenaikan harga per tahun
  rentalYield: string; // Potensi sewa
  internetSpeed: string;
  safetyIndex: string;
  vibe: string;
  developmentStatus: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'TOPUP' | 'SPEND';
  amount: number;
  description: string;
  date: number;
}

export interface ListingReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  date: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  category: string;
  createdAt: number;
}

export interface PropertyRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: ListingType; // Ingin Beli / Ingin Sewa
  category: Category;
  location: string;
  budgetMin: number;
  budgetMax: number;
  description: string;
  createdAt: number;
  isExample?: boolean; // [NEW] Flag for Example Data
}

export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string; 
  photoUrl?: string; // Profile Picture
  credits: number; 
  password?: string; 
  isAdmin?: boolean; 
  wishlist: string[]; 
  joinedAt: number;
  
  // Verification Data
  verificationStatus: VerificationStatus;
  ktpUrl?: string;
  selfieUrl?: string;
  agentCardUrl?: string; 
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  type: ListingType; 
  status: ListingStatus; 
  location: string; 
  address?: string;
  imageUrl: string;
  youtubeUrl?: string; 
  
  // Property Specs
  surfaceArea: number; 
  buildingArea: number; 
  bedrooms: number;
  bathrooms: number;
  certificate: string; 

  isPinned: boolean; 
  pinnedUntil?: number; 
  createdAt: number;
  whatsapp: string; 
  isExample?: boolean; // [NEW] Flag for Example Data
}

export interface AppSettings {
  showMarketInsights: boolean;
  // Contact Info (Editable by Admin)
  contactEmail: string;
  contactPhone: string;
  contactWorkingHours: string;
  contactAddress: string;
}

// Mock Database Structure
export interface AppState {
  users: User[];
  listings: Listing[];
  transactions: Transaction[];
  reports: ListingReport[];
  blogPosts: BlogPost[];
  requests: PropertyRequest[]; 
  currentUser: User | null;
  settings: AppSettings;
}
