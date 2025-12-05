
# Vueltra Backend API Contract

Dokumen ini adalah spesifikasi teknis untuk Backend Developer (Golang/Node.js). Frontend Vueltra mengharapkan struktur endpoint, payload, dan response JSON persis seperti di bawah ini agar fitur berjalan lancar.

## 🟢 Base Configuration

*   **Base URL**: `http://localhost:8080/api/v1` (atau domain production)
*   **Content-Type**: `application/json` (kecuali endpoint Upload)
*   **Authorization**: Bearer Token (JWT) di header `Authorization` untuk endpoint yang butuh login.

---

## 🔐 1. Authentication

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "user_1",
    "username": "JuraganProperti",
    "email": "user@example.com",
    "phoneNumber": "08123456789",
    "photoUrl": "https://...",
    "credits": 50000,
    "isAdmin": false,
    "verificationStatus": "VERIFIED",
    "wishlist": ["p_1", "p_2"],
    "joinedAt": 1715421234000
  }
}
```

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "AgentBaru",
  "email": "new@example.com",
  "password": "password123",
  "phoneNumber": "081299998888"
}
```

**Response (201 Created):**
```json
{
  "token": "...",
  "user": { "id": "user_new", "email": "new@example.com", ... }
}
```

### Get Current User Profile (Me)
**GET** `/auth/me`
*Header: Authorization: Bearer {token}*

**Response (200 OK):**
```json
{
  "user": { "id": "user_1", "username": "...", ... }
}
```

---

## 🏠 2. Listings (Properti)

### Get All Listings (Public)
**GET** `/listings`
*Query Params (Optional): `?category=RUMAH&location=Bali&type=JUAL`*

**Response (200 OK):**
```json
[
  {
    "id": "p_1",
    "sellerId": "user_1",
    "sellerName": "JuraganProperti",
    "title": "Rumah Mewah Pondok Indah",
    "description": "Deskripsi lengkap...",
    "price": 15000000000,
    "category": "Rumah Tapak",
    "type": "Dijual",
    "status": "ACTIVE",
    "location": "Jakarta Selatan",
    "imageUrl": "https://...",
    "surfaceArea": 500,
    "buildingArea": 800,
    "bedrooms": 5,
    "bathrooms": 5,
    "certificate": "SHM",
    "isPinned": true,
    "whatsapp": "08123456789",
    "createdAt": 1715421234000
  },
  ...
]
```

### Create Listing (Protected)
**POST** `/listings`
*Header: Authorization: Bearer {token}*

**Request Body:**
```json
{
  "title": "Tanah Kavling Murah",
  "description": "Siap bangun...",
  "price": 500000000,
  "category": "Tanah Kavling",
  "type": "Dijual",
  "location": "Bogor",
  "address": "Jl. Raya Bogor KM 5",
  "imageUrl": "https://...",
  "surfaceArea": 200,
  "buildingArea": 0,
  "bedrooms": 0,
  "bathrooms": 0,
  "certificate": "SHM",
  "whatsapp": "08123456789",
  
  // [NEW] Optional: Admin Only
  // Jika diisi oleh Admin, listing akan dibuat atas nama user ini
  "asUserId": "user_2" 
}
```

**Response (201 Created):**
```json
{
  "id": "p_new_123",
  "sellerId": "user_2", // Sesuai asUserId
  "sellerName": "AgentSantoso", // [FIX] Added populated field
  "title": "Tanah Kavling Murah",
  ... 
}
```

### Update Listing Status (Active/Sold)
**PATCH** `/listings/:id/status`
*Header: Authorization: Bearer {token}*

**Request Body:**
```json
{
  "status": "SOLD" 
}
// Enum: "ACTIVE", "SOLD"
```

### Pin Listing (Promote)
**POST** `/listings/:id/pin`
*Header: Authorization: Bearer {token}*
*Logic Backend: Cek saldo user. Jika cukup, kurangi saldo, set isPinned=true, catat transaksi.*

**Request Body:**
```json
{
  "cost": 50000,
  "durationDays": 1
}
```

**Response:**
```json
{
  "success": true,
  "remainingCredits": 45000,
  "message": "Listing berhasil dipromosikan"
}
```

### Delete Listing
**DELETE** `/listings/:id`
*Header: Authorization: Bearer {token}*

---

## 🙋‍♂️ 2.5. Market Requests (Titip Cari)

### Get All Requests
**GET** `/requests`

**Response:**
```json
[
  {
    "id": "req_1",
    "userId": "user_99",
    "userName": "Budi Investor",
    "userPhone": "0812...", // Only shown if authorized? or mask in frontend
    "type": "Dijual",
    "category": "Rumah Tapak",
    "location": "Jakarta Selatan",
    "budgetMin": 5000000000,
    "budgetMax": 10000000000,
    "description": "Cari rumah hitung tanah...",
    "createdAt": 1710000
  }
]
```

### Create Request
**POST** `/requests`
*Header: Authorization: Bearer {token}*

**Request Body:**
```json
{
  "type": "Dijual",
  "category": "Rumah Tapak",
  "location": "BSD",
  "budgetMin": 1000000000,
  "budgetMax": 2000000000,
  "description": "..."
}
```

### Delete Request
**DELETE** `/requests/:id`
*Header: Authorization: Bearer {token}* (Must be owner or Admin)

---

## 👤 3. User & Profile

### Get Agent Public Profile
**GET** `/users/:id/public`

**Response (200 OK):**
```json
{
  "agent": {
    "id": "user_2",
    "username": "AgentSantoso",
    "photoUrl": "...",
    "verificationStatus": "VERIFIED",
    "joinedAt": 1710000000000,
    "phoneNumber": "0812345678" // Optional, for WA link
  },
  "listings": [ ...Array of Listing objects... ]
}
```

### Update Own Profile
**PUT** `/users/me`
*Header: Authorization: Bearer {token}*

**Request Body (Partial):**
```json
{
  "username": "Nama Baru",
  "phoneNumber": "081111111",
  "email": "newemail@example.com", // [NEW] Admin Only or specific flow
  "photoUrl": "data:image/png;base64,..." 
}
```

### Admin Update User Profile
**PUT** `/admin/users/:id`
*Header: Authorization: Bearer {token} (Admin Only)*

**Request Body:** Same as Update Own Profile above.

### Toggle Wishlist
**POST** `/listings/:id/wishlist`
*Header: Authorization: Bearer {token}*

**Response:**
```json
{
  "isWishlisted": true // [FIX] Updated to match current impl
}
```

---

## 💳 4. Transactions & Credits

### Get My Transactions
**GET** `/transactions`
*Header: Authorization: Bearer {token}*

**Response:**
```json
[
  {
    "id": "trx_1",
    "userId": "user_1",
    "type": "TOPUP", // or "SPEND"
    "amount": 100000,
    "description": "Top Up Saldo",
    "date": 1715420000000
  }
]
```

---

## 🛡️ 5. Verification (KYC)

### Submit Verification Documents
**POST** `/verification/submit`
*Header: Authorization: Bearer {token}*

**Request Body:**
```json
{
  "ktpUrl": "data:image/jpeg;base64,...",
  "selfieUrl": "data:image/jpeg;base64,...",
  "agentCardUrl": "(Optional)"
}
```
*[NOTE] Current Implementation uses Base64 string for easier local setup, not multipart/form-data.*

**Response:**
```json
{ "status": "PENDING" }
```

---

## 📚 6. Blog & Artikel

### Get All Blog Posts
**GET** `/posts`

**Response:**
```json
[
  {
    "id": "post_1",
    "title": "Tips Beli Rumah",
    "slug": "tips-beli-rumah",
    "excerpt": "...",
    "imageUrl": "...",
    "category": "Tips",
    "author": "Vueltra",
    "createdAt": 171000000
  }
]
```

### Get Blog Detail
**GET** `/posts/:id` (or slug)

**Response:**
```json
{
  "id": "post_1",
  "title": "Tips Beli Rumah",
  "content": "Isi artikel lengkap...",
  ...
}
```

### Create Blog Post (Admin Only)
**POST** `/posts`
*Header: Authorization: Bearer {token}*

**Request Body:**
```json
{
  "title": "Judul Baru",
  "slug": "judul-baru",
  "content": "Isi...",
  "excerpt": "Ringkasan...",
  "category": "Berita",
  "imageUrl": "..."
}
```

### Update Blog Post (Admin Only)
**PUT** `/posts/:id`

### Delete Blog Post (Admin Only)
**DELETE** `/posts/:id`

---

## 📊 7. Insights & Extras

### Get City Insight
**GET** `/insights/city`
*Query Param: `?location=Jakarta Selatan`*

**Response:**
```json
{
  "location": "Jakarta Selatan",
  "avgPrice": "Rp 25 - 45 Juta / m²",
  "weather": "Tropis (28°C)",
  "famousFor": "SCBD, Mall Mewah",
  "growthRate": "+8.5%",
  "rentalYield": "5%",
  "safetyIndex": "8/10",
  ...
}
```

### Upload Image (General)
**POST** `/upload`
*Header: Authorization: Bearer {token}*
*Content-Type: application/json (mock)*

**Response:**
```json
{
  "url": "https://storage.googleapis.com/bucket/image.jpg"
}
```

### Submit Report
**POST** `/reports`
*Header: Authorization: Bearer {token}*

**Request Body:**
```json
{
  "listingId": "p_1",
  "reason": "Penipuan"
}
```

---

## 👮 8. Admin Panel (Admin Only)

*Semua endpoint ini butuh User dengan `isAdmin: true`*

### Get All Users
**GET** `/admin/users`

### Verify User
**POST** `/admin/verify`
**Body:**
```json
{
  "userId": "user_2",
  "status": "VERIFIED" // UNVERIFIED, PENDING, VERIFIED, REJECTED
}
```

### Manage Credits (Add/Subtract)
**POST** `/admin/credits`
**Body:**
```json
{
  "userId": "user_2",
  "amount": 50000,
  "type": "ADD" // or "SUBTRACT"
}
```

### Get Reports
**GET** `/admin/reports`

### Delete Report (Ignore)
**DELETE** `/admin/reports/:id`
