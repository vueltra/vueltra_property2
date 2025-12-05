

export enum Category {
  RUMAH = 'Rumah Tapak',
  APARTEMEN = 'Apartemen',
  RUKO = 'Ruko & Rukan',
  KANTOR = 'Kantor & Office',
  TANAH = 'Tanah Kavling',
  SPACE = 'Lapak / Space Usaha',
  GUDANG = 'Gudang & Industri',
  HOTEL = 'Hotel & Villa',
  GEDUNG = 'Gedung & Komersial Lain'
}

export enum ListingType {
  JUAL = 'Dijual',
  SEWA = 'Disewa'
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  DRAFT = 'DRAFT'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

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