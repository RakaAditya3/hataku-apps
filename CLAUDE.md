# HatakuApps — Project Context for Claude Code

> File ini dibaca otomatis oleh Claude Code setiap sesi.
> Update file ini setiap ada keputusan arsitektur baru atau milestone selesai.

---

## Tentang Project

**HatakuApps** adalah aplikasi customer-facing untuk toko **Dimsum HATAKU**, terpisah dari HatakuOS (yang internal-only). Tagline: *"Pesan, Kumpulkan, Nikmati."*

**Owner/Developer:** Raka Aditya — Pasuruan, Jawa Timur.
**Sister project:** HatakuOS (internal ops, https://hataku-os.vercel.app)
**Live:** TBD (dev di home server PC i5-10400F, Windows 11 + Docker)

---

## Konsep Bisnis (ESB-style Flow)

```
1. Customer buka PWA → login Google → pilih produk → checkout (dine-in/takeaway)
2. Order created → muncul QR code unik (e.g. HTK-20240601-0042)
3. Customer datang ke toko, tunjukkan QR ke kasir
4. Kasir scan QR di admin panel → customer bayar (Cash/QRIS toko, bukan gateway)
5. Kasir konfirmasi bayar → status: paid → in_progress
6. Dapur siapkan pesanan
7. Pesanan siap → kasir mark done
8. Point loyalty masuk ke customer + counter tier naik
```

**Kenapa wajib scan QR & bayar di tempat:** menghindari order fiktif. Customer hanya dapat point jika benar-benar transaksi.

**Phase 2 (beberapa bulan ke depan):** integrasi payment gateway (Midtrans/Xendit) untuk pre-order dari rumah.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 15+ (App Router, PWA) |
| Backend | Laravel 13 (REST API) |
| Database | MySQL 8.0 |
| Frontend Language | TypeScript |
| Backend Language | PHP 8.3+ |
| Styling | Tailwind CSS + shadcn/ui |
| Auth (Customer) | NextAuth.js + Google Provider |
| Auth (Admin) | Laravel Sanctum (email + password) |
| API Client (FE) | Native fetch + React Query (TanStack) |
| Validation (FE) | Zod v4 |
| Validation (BE) | Laravel FormRequest + Validation Rules |
| Reverse Proxy | Nginx |
| Containerization | Docker + Docker Compose |
| PWA | next-pwa atau Serwist |
| Currency | Integer Rupiah |

**Tidak pakai:**
- Inertia/Livewire (karena BE-FE terpisah)
- Blade template (Laravel hanya API)
- Payment gateway (Phase 1)
- WebSocket/Pusher (polling sudah cukup untuk MVP)
- jQuery, Bootstrap

---

## Struktur Folder

```
hataku-apps/                        # Root project (monorepo via Docker)
├── docker-compose.yml              # Service definitions
├── docker-compose.mac.yml          # Override untuk M1 (platform linux/amd64)
├── .env                            # ⚠️ Tidak di-commit
├── .gitignore
├── CLAUDE.md                       # File ini
├── nginx/
│   └── default.conf                # Reverse proxy ke FE & BE
├── backend/                        # Laravel 13
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/    # API controllers
│   │   │   ├── Requests/           # FormRequest validation
│   │   │   ├── Resources/          # API Resources
│   │   │   └── Middleware/
│   │   ├── Models/                 # Eloquent models
│   │   ├── Services/               # Business logic (BUKAN di controller)
│   │   └── Console/Commands/       # Artisan commands + scheduler
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── routes/
│   │   ├── api.php                 # Routes customer & admin
│   │   └── console.php             # Scheduled tasks
│   ├── tests/
│   └── Dockerfile
└── frontend/                       # Next.js
    ├── app/
    │   ├── (customer)/             # Customer-facing routes
    │   │   ├── layout.tsx
    │   │   ├── page.tsx            # Home
    │   │   ├── menu/
    │   │   ├── cart/
    │   │   ├── orders/
    │   │   ├── rewards/
    │   │   └── profile/
    │   ├── (admin)/                # Admin panel routes
    │   │   ├── layout.tsx
    │   │   ├── scan/               # Scan QR
    │   │   ├── orders/
    │   │   ├── products/
    │   │   ├── promos/
    │   │   └── customers/
    │   ├── api/auth/               # NextAuth handlers
    │   └── manifest.ts             # PWA manifest
    ├── components/
    │   ├── ui/                     # shadcn/ui components
    │   ├── customer/
    │   └── admin/
    ├── lib/
    │   ├── api/                    # Axios/fetch client + endpoints
    │   ├── auth/                   # NextAuth config
    │   └── utils/
    ├── public/                     # PWA icons + static assets
    ├── next.config.mjs
    └── Dockerfile
```

---

## Database Schema (17 Tabel)

### Grup 1 — Users & Auth

```sql
users (Customer-facing — login via Google)
  id                      BIGINT UNSIGNED PK
  name                    VARCHAR(100) NOT NULL
  email                   VARCHAR(100) UNIQUE NOT NULL
  phone                   VARCHAR(20) NULLABLE              -- diisi manual setelah login
  google_id               VARCHAR(100) UNIQUE NULLABLE
  avatar_url              VARCHAR(255) NULLABLE

  -- Loyalty
  point_balance           INT DEFAULT 0                     -- available point
  point_reserved          INT DEFAULT 0                     -- di-hold saat order aktif
  tier                    ENUM('bamboo','jade','imperial','dragon') DEFAULT 'bamboo'
  valid_transaction_count INT DEFAULT 0                     -- counter naik tier

  -- Daily streak
  current_streak          TINYINT DEFAULT 0                 -- hari ke-1 sampai ke-7
  last_checkin_date       DATE NULLABLE
  streak_started_at       DATE NULLABLE

  -- Referral (kolom siapkan, fitur Phase 2)
  referral_code           VARCHAR(20) UNIQUE NULLABLE
  referred_by_user_id     BIGINT UNSIGNED NULLABLE FK → users.id
  referral_bonus_given    BOOLEAN DEFAULT FALSE

  -- Tier benefit tracking
  last_weekly_voucher_at  DATE NULLABLE
  last_monthly_voucher_at DATE NULLABLE

  created_at              TIMESTAMP
  updated_at              TIMESTAMP

admin_users (Admin/Kasir — login email+password)
  id          INT UNSIGNED PK
  name        VARCHAR(100) NOT NULL
  email       VARCHAR(100) UNIQUE NOT NULL
  password    VARCHAR(255) NOT NULL                         -- bcrypt
  role        ENUM('admin','cashier') DEFAULT 'cashier'
  created_at  TIMESTAMP
  updated_at  TIMESTAMP
```

### Grup 2 — Katalog

```sql
categories
  id          INT UNSIGNED PK
  name        VARCHAR(50) NOT NULL
  sort_order  INT DEFAULT 0
  is_active   BOOLEAN DEFAULT TRUE
  created_at  TIMESTAMP

products
  id                  INT UNSIGNED PK
  category_id         INT UNSIGNED FK → categories.id
  name                VARCHAR(100) NOT NULL
  description         TEXT NULLABLE
  price               INT NOT NULL                          -- integer Rupiah
  photo_url           VARCHAR(255) NULLABLE
  is_available        BOOLEAN DEFAULT TRUE                  -- toggle manual admin
  daily_stock_limit   INT NULLABLE                          -- null = unlimited
  sort_order          INT DEFAULT 0
  is_deleted          BOOLEAN DEFAULT FALSE                 -- soft delete
  created_at          TIMESTAMP
  updated_at          TIMESTAMP

option_groups
  id            INT UNSIGNED PK
  name          VARCHAR(50) NOT NULL                        -- "Pilihan Saus", "Pilihan Topping"
  is_required   BOOLEAN DEFAULT TRUE
  min_select    TINYINT DEFAULT 1
  max_select    TINYINT DEFAULT 1
  created_at    TIMESTAMP

option_items
  id              INT UNSIGNED PK
  option_group_id INT UNSIGNED FK → option_groups.id
  name            VARCHAR(100) NOT NULL                     -- "Mentai", "Tar Tar"
  sort_order      INT DEFAULT 0
  is_active       BOOLEAN DEFAULT TRUE
  created_at      TIMESTAMP

product_option_groups (Junction table dengan override)
  id              INT UNSIGNED PK
  product_id      INT UNSIGNED FK → products.id
  option_group_id INT UNSIGNED FK → option_groups.id
  min_select      TINYINT NULLABLE                          -- override default group
  max_select      TINYINT NULLABLE                          -- override default group
```

**Catatan option groups:**
- Semua menu wajib pilih 1 saus (option_group "Pilihan Saus")
- Hanya Mix Series yang punya option_group "Pilihan Topping"
  - Regular Mix → min=3, max=3
  - Large Mix → min=2, max=4
  - Family Mix → min=4, max=4

### Grup 3 — Order

```sql
orders
  id                    BIGINT UNSIGNED PK
  user_id               BIGINT UNSIGNED FK → users.id
  order_code            VARCHAR(20) UNIQUE NOT NULL         -- "HTK-20240601-0042"
  order_type            ENUM('dine_in','takeaway') NOT NULL
  status                ENUM('pending','paid','in_progress','done','cancelled','expired') DEFAULT 'pending'

  -- Pricing
  subtotal              INT NOT NULL                        -- sebelum diskon
  discount_amount       INT DEFAULT 0                       -- dari promo code
  points_redeemed       INT DEFAULT 0
  points_value          INT DEFAULT 0                       -- Rupiah value dari point
  reward_id             INT UNSIGNED NULLABLE FK → rewards.id
  reward_discount       INT DEFAULT 0                       -- nilai diskon dari reward redeem
  total                 INT NOT NULL                        -- final yang dibayar

  -- Loyalty outcome
  points_earned         INT NULLABLE                        -- diisi saat done
  is_valid_transaction  BOOLEAN DEFAULT FALSE               -- total >= 25.000

  promo_code_used       VARCHAR(50) NULLABLE

  -- Timestamps lifecycle
  expires_at            TIMESTAMP NOT NULL                  -- akhir hari operasional
  paid_at               TIMESTAMP NULLABLE
  done_at               TIMESTAMP NULLABLE
  cancelled_at          TIMESTAMP NULLABLE

  created_at            TIMESTAMP
  updated_at            TIMESTAMP

order_items
  id            BIGINT UNSIGNED PK
  order_id      BIGINT UNSIGNED FK → orders.id
  product_id    INT UNSIGNED FK → products.id

  -- Snapshot (harga & nama saat order)
  product_name  VARCHAR(100) NOT NULL
  product_price INT NOT NULL
  quantity      INT NOT NULL
  subtotal      INT NOT NULL                                -- product_price × quantity

  created_at    TIMESTAMP

order_item_options
  id              BIGINT UNSIGNED PK
  order_item_id   BIGINT UNSIGNED FK → order_items.id
  option_group_id INT UNSIGNED FK → option_groups.id
  option_item_id  INT UNSIGNED FK → option_items.id
  option_name     VARCHAR(100) NOT NULL                     -- snapshot
  created_at      TIMESTAMP
```

### Grup 4 — Loyalty

```sql
point_transactions
  id              BIGINT UNSIGNED PK
  user_id         BIGINT UNSIGNED FK → users.id
  order_id        BIGINT UNSIGNED NULLABLE FK → orders.id
  type            ENUM('earn','redeem','refund','referral','checkin','adjustment') NOT NULL
  amount          INT NOT NULL                              -- positif/negatif
  balance_after   INT NOT NULL                              -- snapshot balance
  note            VARCHAR(255) NULLABLE
  created_at      TIMESTAMP

daily_checkins
  id            BIGINT UNSIGNED PK
  user_id       BIGINT UNSIGNED FK → users.id
  checked_in_at DATE NOT NULL
  streak_day    TINYINT NOT NULL                            -- 1-7
  points_earned INT NOT NULL                                -- 1 (hari 1-6) atau 5 (hari 7)
  created_at    TIMESTAMP

  UNIQUE(user_id, checked_in_at)

rewards (Katalog reward yang bisa di-redeem)
  id              INT UNSIGNED PK
  name            VARCHAR(100) NOT NULL                     -- "Voucher Rp5.000", "Regular Original Gratis"
  description     TEXT NULLABLE
  type            ENUM('discount','product') NOT NULL
  points_required INT NOT NULL

  discount_value  INT NULLABLE                              -- jika type=discount
  product_id      INT UNSIGNED NULLABLE FK → products.id    -- jika type=product

  is_active       BOOLEAN DEFAULT TRUE
  created_at      TIMESTAMP
  updated_at      TIMESTAMP

redeemed_rewards (History redeem per user)
  id              BIGINT UNSIGNED PK
  user_id         BIGINT UNSIGNED FK → users.id
  reward_id       INT UNSIGNED FK → rewards.id
  order_id        BIGINT UNSIGNED NULLABLE FK → orders.id   -- dipakai di order mana
  points_spent    INT NOT NULL                              -- snapshot saat redeem
  status          ENUM('pending','used','expired','cancelled') DEFAULT 'pending'
  expires_at      TIMESTAMP NULLABLE
  used_at         TIMESTAMP NULLABLE
  created_at      TIMESTAMP
```

### Grup 5 — Tier Benefits

```sql
tier_benefits (Definisi benefit per tier — bisa diatur dari admin panel)
  id              INT UNSIGNED PK
  tier            ENUM('bamboo','jade','imperial','dragon') NOT NULL
  benefit_type    ENUM('point_bonus','weekly_voucher','monthly_voucher','other') NOT NULL

  bonus_percent   INT NULLABLE                              -- jika point_bonus (20, 35, 50)

  voucher_value   INT NULLABLE                              -- jika voucher
  voucher_type    ENUM('fixed','percent') NULLABLE

  description     VARCHAR(255) NULLABLE
  is_active       BOOLEAN DEFAULT TRUE
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
```

### Grup 6 — Promo

```sql
promos
  id              INT UNSIGNED PK
  title           VARCHAR(100) NOT NULL
  description     TEXT NULLABLE
  banner_url      VARCHAR(255) NULLABLE
  code            VARCHAR(50) UNIQUE NULLABLE               -- null = display only
  discount_type   ENUM('fixed','percent') NOT NULL
  discount_value  INT NOT NULL
  min_purchase    INT DEFAULT 0
  max_uses        INT NULLABLE                              -- null = unlimited
  current_uses    INT DEFAULT 0
  valid_from      TIMESTAMP NOT NULL
  valid_until     TIMESTAMP NOT NULL
  is_active       BOOLEAN DEFAULT TRUE
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
```

---

## Business Rules — WAJIB DIIKUTI

### 1. Currency: Integer Rupiah
```php
// ✅ Benar
$price = 42083;
// ❌ Salah: float, string, atau Money object
```

### 2. Order Code Format
```
HTK-{YYYYMMDD}-{0000}
HTK-20240601-0042
```
- Prefix `HTK` static
- Tanggal `YYYYMMDD` lokal Asia/Jakarta
- Counter 4 digit, reset tiap hari, increment per order

### 3. Loyalty Point Rules

**Earn rate:**
- Rp1.000 belanja = 1 point (basis: `total` setelah diskon)
- Bonus tier: Bamboo 0%, Jade +20%, Imperial +35%, Dragon +50%
- Point earned saat status = `done`, BUKAN saat paid
- `points_earned = floor(total / 1000) * (1 + bonus_percent / 100)`

**Redeem rules:**
- Redeem dilakukan saat checkout (di order creation)
- `point_reserved += points_redeemed` saat order created
- `point_balance -= points_redeemed` saat order paid
- `point_reserved -= points_redeemed` saat order paid/cancelled/expired
- Available point = `point_balance - point_reserved`

**Redeem types:**
- `discount` → potongan nominal Rupiah (e.g. 100 pt = Rp5.000)
- `product` → produk free dengan pengurangan harga sebesar harga produk
  - Contoh: redeem Family Original (Rp50.000) → `reward_discount = 50000`
  - Jika order ada qty 2 produk yang sama, hanya 1 yang free (1 × harga produk)

### 4. Daily Check-in Streak

**Mekanisme:**
- Rolling 7 hari, dihitung dari hari pertama login (BUKAN calendar week)
- Hari 1-6: 1 point per check-in
- Hari 7: 5 point bonus
- Setelah hari 7 → reset ke hari 1

**Skip behavior:**
- Skip 1+ hari → streak TIDAK reset, lanjut ke hari berikutnya
- Tapi point hari yang diskip TIDAK bisa di-claim retroaktif
- Contoh: user check-in hari 1, 2, 3, skip hari 4, lanjut hari 5 → dapat point hari 5 (1 point), bukan dobel

**Implementasi:**
- `users.current_streak` increment saat check-in
- `users.last_checkin_date` = today
- `users.streak_started_at` = tanggal hari ke-1
- Saat current_streak = 7, next check-in reset ke 1 dan streak_started_at = today

### 5. Tier System

| Tier | Syarat Transaksi Valid | Bonus Point | Voucher Mingguan |
|---|---|---|---|
| Bamboo | 0–4 | — | — |
| Jade | 5–24 | +20% | TBD via admin panel |
| Imperial | 25–49 | +35% | TBD via admin panel |
| Dragon | 50+ | +50% | TBD via admin panel |

**Transaksi valid** = order dengan `status = done` AND `total >= 25.000`

**Tier transitions:**
- Tier HANYA NAIK, tidak pernah turun
- Cek tier setelah order status berubah ke `done`
- Tier upgrade di-trigger oleh service `TierService::checkAndUpgrade($user)`

### 6. Order State Machine

```
pending → paid → in_progress → done
   ↓        ↓         ↓
cancelled / expired (point reserved direstore)
```

**Allowed transitions:**
- `pending → paid`: kasir scan QR + konfirmasi bayar
- `pending → cancelled`: customer cancel sendiri sebelum scan
- `pending → expired`: scheduler malam (akhir hari operasional)
- `paid → in_progress`: kasir mulai proses (otomatis setelah paid)
- `in_progress → done`: kasir mark selesai
- `paid/in_progress → cancelled`: hanya admin (refund flow)

**Forbidden transitions:** apapun yang tidak ada di atas — harus throw exception.

### 7. Snapshot Pattern (Audit Trail)

Field berikut WAJIB di-snapshot saat insert, JANGAN reference live data:
- `order_items.product_name`
- `order_items.product_price`
- `order_item_options.option_name`
- `point_transactions.balance_after`

Alasan: harga/nama berubah kapan saja, tapi history transaksi harus reflect kondisi saat itu.

### 8. Soft Delete vs Hard Delete

**WAJIB Soft Delete (`is_deleted` flag):**
- products, categories, admin_users

**BOLEH Hard Delete:**
- order_items, order_item_options, product_option_groups (junction)
- daily_checkins (kalau perlu cleanup data lama)

**JANGAN PERNAH delete:**
- orders, point_transactions, redeemed_rewards (data finansial/audit)

---

## Konvensi Coding

### Backend (Laravel)

**1. Layered Architecture**
```
Route → Controller → FormRequest (validation) → Service (logic) → Model
```
- Controller TIPIS — hanya orchestrate
- Service handle business logic
- Model HANYA Eloquent definition, NO business logic

**2. API Response Format (konsisten)**
```php
// Sukses
return response()->json([
    'success' => true,
    'data' => $data,
]);

// Error validation (handled by FormRequest otomatis)
return response()->json([
    'success' => false,
    'message' => 'Validation failed',
    'errors' => $errors,
], 422);

// Error business
return response()->json([
    'success' => false,
    'message' => 'Insufficient points',
], 400);
```

**3. FormRequest untuk SEMUA mutasi**
```php
// ✅ app/Http/Requests/CreateOrderRequest.php
class CreateOrderRequest extends FormRequest {
    public function rules(): array { ... }
}

// ❌ JANGAN validate inline di controller
```

**4. API Resources untuk response**
```php
// ✅ app/Http/Resources/ProductResource.php
return ProductResource::collection($products);

// ❌ JANGAN return raw model: return $products;
```

**5. Service Layer**
```php
// app/Services/OrderService.php
class OrderService {
    public function create(User $user, array $data): Order { ... }
    public function markAsPaid(Order $order): Order { ... }
    public function markAsDone(Order $order): Order { ... }
}

// Controller cukup:
public function store(CreateOrderRequest $request, OrderService $orderService) {
    $order = $orderService->create($request->user(), $request->validated());
    return new OrderResource($order);
}
```

**6. Database Transaction untuk multi-table writes**
```php
DB::transaction(function () use ($user, $data) {
    $order = Order::create([...]);
    foreach ($data['items'] as $item) {
        $order->items()->create([...]);
    }
    PointTransaction::create([...]);
    $user->update([...]);
});
```

**7. Eloquent Relationships — explicit**
```php
class Order extends Model {
    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
    public function items(): HasMany {
        return $this->hasMany(OrderItem::class);
    }
}
```

**8. Migration — explicit + reversible**
```php
public function up(): void {
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        // ...
    });
}
public function down(): void {
    Schema::dropIfExists('orders');
}
```

### Frontend (Next.js)

**1. App Router + Server Components by default**
- Server Component untuk data fetching
- Client Component (`'use client'`) HANYA jika butuh interactivity/hooks

**2. API Client di `lib/api/`**
```typescript
// lib/api/client.ts
export const apiClient = {
  get: <T>(path: string) => fetch(`/api${path}`).then(r => r.json() as Promise<T>),
  // ...
};

// lib/api/products.ts
export const getProducts = () => apiClient.get<Product[]>('/products');
```

**3. TypeScript types match Laravel API Resources**
```typescript
// types/api.ts
export type Product = {
  id: number;
  name: string;
  price: number;
  category: { id: number; name: string };
  is_available: boolean;
};
```

**4. Form validation: Zod v4**
```typescript
const schema = z.object({
  phone: z.string().min(10, 'Nomor minimal 10 digit'),
});
```

**5. Mobile-first responsive**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

**6. PWA — manifest.ts + service worker via next-pwa**

---

## Authentication

### Customer (NextAuth + Google)
- Login: Google OAuth via NextAuth
- Session: JWT stored in httpOnly cookie
- Setelah login pertama, customer wajib isi `phone` (untuk notifikasi WA)
- Backend verifikasi JWT dari NextAuth via shared secret (atau API call ke `/api/auth/verify`)

### Admin (Sanctum)
- Login: POST `/api/admin/login` dengan email + password
- Response: Bearer token
- Token disimpan di sessionStorage/localStorage (admin panel tidak PWA)
- Middleware `auth:sanctum` di semua admin routes

### CORS
- Backend allow origin: `http://localhost:3000`, dan domain production saat ready
- Credentials: true (untuk cookie-based auth NextAuth)

---

## Vercel Cron / Laravel Scheduler

Schedule tasks (di `routes/console.php` atau `app/Console/Kernel.php`):

```php
// Tiap menit — check order expired di akhir hari
Schedule::call(fn() => app(OrderService::class)->expireOldOrders())->everyMinute();

// Tiap Senin pagi — generate weekly voucher untuk tier eligible
Schedule::call(fn() => app(TierBenefitService::class)->generateWeeklyVouchers())->mondays()->at('07:00');

// Tiap awal bulan — monthly voucher
Schedule::call(fn() => app(TierBenefitService::class)->generateMonthlyVouchers())->monthlyOn(1, '07:00');
```

---

## Docker Workflow

### Service Names (untuk internal networking)
- `mysql` — port 3306
- `backend` — Laravel, port 8000
- `frontend` — Next.js, port 3000
- `nginx` — reverse proxy, port 80 (exposed)

### Akses dari host
- `http://localhost` → frontend (via nginx)
- `http://localhost/api/*` → backend (via nginx)
- `mysql://localhost:3306` → MySQL (jika dev tool perlu akses langsung)

### Gotcha — node_modules di M1 Mac + Docker

Problem: bind mount `./frontend:/app` membawa Mac ARM64 Darwin binaries
ke dalam container Linux Alpine → native modules (lightningcss, dll) crash.

Solusi yang benar (3 komponen, semua wajib ada bersamaan):
1. `frontend/Dockerfile`: `RUN npm install` → bake Linux ARM64 musl binaries ke image layer
2. `frontend/.dockerignore`: include `node_modules` → jangan COPY Mac binaries saat build
3. `docker-compose.yml` service frontend: tetap ada `- /app/node_modules` (anonymous volume)
   → Docker inisialisasi dari image layer, override balik bind mount untuk subdirectory ini

JANGAN hapus anonymous volume `- /app/node_modules` dari docker-compose.yml.
JANGAN ada node_modules di host folder frontend/ (rm -rf frontend/node_modules).

### Commands
```bash
# Mac (M1) — pakai override file
docker compose -f docker-compose.yml -f docker-compose.mac.yml up -d

# PC Windows
docker compose up -d

# Logs
docker compose logs -f backend
docker compose logs -f frontend

# Masuk ke container
docker compose exec backend bash
docker compose exec frontend sh

# Artisan
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan tinker

# NPM
docker compose exec frontend npm install
docker compose exec frontend npm run dev


```
### Cart State (Zustand v5)

- Cart state HANYA di client (zustand), tidak persist ke backend sampai checkout
- `CartItem` wajib include snapshot: productName, productPrice, optionGroupName, optionName
- `removeItem(index)` dan `updateQuantity(index, qty)` pakai index (bukan productId)
  → aman untuk produk yang sama dengan pilihan saus berbeda di cart
- `totalItems` dan `totalPrice` recompute setiap mutation (derived state)
- Store di `frontend/lib/store/cart.ts`

---

## Roadmap

### Phase 1 — MVP (Target: 2-3 bulan)

**Sprint 1 — Foundation**
- [x] Docker Compose setup (MySQL + Laravel + Next.js + Nginx)
- [x] Laravel 13.8 init + Sanctum + CORS
- [x] backend/Dockerfile + entrypoint.sh
- [x] Next.js 15.5 init (TypeScript + Tailwind 4 + App Router + Turbopack)
- [x] frontend/Dockerfile
- [x] Database migrations — 17 domain tables di MySQL
- [x] Seeders (8 kategori, 12 saus, 4 topping, 4 tier benefits, 1 admin)
- [x] shadcn/ui (button, input, card, badge, dialog, sheet, sonner)
- [x] NextAuth v4 + Google Provider (config + route handler + types)

**Sprint 2 — Customer Core**
- [x] Auth flow customer (Google login + isi phone) — NextAuth Google + /complete-profile
- [x] Home page (banner + featured products + CartIcon)
- [x] Menu/katalog (per kategori + tab filter + ProductCard + CartIcon)
- [x] Product detail (saus radio + topping checkbox + qty selector + validasi min_select)
- [x] Cart (zustand store + list item + hapus + update qty + subtotal)
- [x] Checkout (order_type dine_in/takeaway, promo code, point redeem)
- [x] Order creation + QR generation (backend + frontend)
- [x] Order detail page dengan QR display
- [x] Order history customer

**Sprint 3 — Admin Panel**
- [ ] Admin login (Sanctum)
- [ ] Scan QR page (camera + manual input)
- [ ] Order management (paid, in_progress, done)
- [ ] Product management (CRUD + toggle availability)
- [ ] Category management
- [ ] Option groups + items management
- [ ] Customer list + detail

**Sprint 4 — Loyalty**
- [ ] Point earn on order done + tier bonus
- [ ] Point transaction history (customer view)
- [ ] Daily check-in (7-day streak)
- [ ] Rewards catalog (admin manage)
- [ ] Redeem flow (discount + product reward)
- [ ] Tier system (auto-upgrade)

**Sprint 5 — Promo & Polish**
- [ ] Promo management (admin)
- [ ] Promo code apply at checkout
- [ ] Tier benefits (weekly voucher via scheduler)
- [ ] PWA setup (manifest + service worker)
- [ ] Notifikasi WA ke owner saat ada order baru (via Fonnte)
- [ ] Auto-expire order scheduler

**Sprint 6 — Pre-launch**
- [ ] Soft launch ke customer existing (10-20 orang)
- [ ] Bug fixing
- [ ] Performance tuning
- [ ] Cloudflare Tunnel setup (untuk akses dari luar)

### Phase 2 — Post-launch (TBD)
- [ ] Payment gateway (Midtrans/Xendit)
- [ ] Referral system aktivasi
- [ ] Integrasi dengan HatakuOS (sync products, sync sales)
- [ ] WhatsApp OTP login (alternative ke Google)
- [ ] Push notification PWA

---

## Yang TIDAK Boleh Dilakukan Claude Code

1. **JANGAN hard delete** orders, point_transactions, redeemed_rewards, users
2. **JANGAN business logic di controller** — harus di Service
3. **JANGAN validate inline di controller** — harus di FormRequest
4. **JANGAN return raw Eloquent model** — harus pakai API Resource
5. **JANGAN skip database transaction** untuk multi-table write
6. **JANGAN pakai `any` di TypeScript**
7. **JANGAN install library** tanpa diskusi (kecuali: laravel/sanctum, next-auth, @tanstack/react-query, zod, shadcn/ui components)
8. **JANGAN ubah schema** tanpa konfirmasi user
9. **JANGAN expose internal field** seperti `google_id`, `point_reserved` di API Resource customer
10. **JANGAN pakai Blade template** — Laravel hanya API
11. **JANGAN buat komponen tanpa mobile-responsive**
12. **JANGAN commit `.env`** ke git
13. **JANGAN ubah snapshot field** di order_items, order_item_options, point_transactions setelah created
14. **JANGAN naik/turun tier manual** — harus via TierService::checkAndUpgrade()
15. **JANGAN reference price live** di order display — selalu pakai snapshot `product_price`
16. JANGAN persist cart ke backend sebelum user klik "Buat Pesanan" di checkout
17. JANGAN pakai productId saja sebagai key di cart — pakai index karena produk sama bisa punya pilihan saus berbeda

---

## Konteks Bisnis

- **Produk:** Dimsum berbagai varian + Gyoza + Mix Series (Regular/Large/Family)
- **Saus options:** Mentai, Tar Tar, Volcano, Cheese, Carbonara, Creamy Bolognese, Mentai Mix Tar Tar, Mentai Mix Volcano, Mentai Mix Carbonara, Mentai Mix Cheese, Mentai Mix Bolognese, Carbonara Mix Bolognese
- Topping options (Mix Series): Topping Boncabe, Katsuoboshi, Red Cheddar Slice, Mozza
- Kategori: Original Series, Mozza Series, Mix Series, Katsuo Series, Dimsum, Cheezy Series, Boncabe Series, Signature New
- **POS terpisah:** Kasir Pintar Pro (untuk struk fisik, tidak ada integrasi)
- **Jam operasional toko:** 15:00 – 21:00 (sementara)

---

## Workflow Development

```
Raka diskusi di Claude.ai (planner)
  ↓
Update CLAUDE.md di project root
  ↓
Commit ke git
  ↓
Claude Code di VS Code (Mac) baca CLAUDE.md
  ↓
Eksekusi: tulis migration, model, service, controller, FE component, dll
  ↓
Test di Docker Mac (lokal)
  ↓
Commit + push
  ↓
PC Windows pull + run Docker (sebagai "production" lokal)
```

**Saat Claude Code session baru atau kehilangan context:**
1. Baca CLAUDE.md ini SELALU di awal
2. Audit folder yang relevan (backend/app/Services, frontend/lib/api, dll)
3. Cek migration terakhir yang sudah di-create
4. Baru lanjut eksekusi

---

*Last updated: Sprint 2 tahap 4 complete — checkout + order creation + QR generation + order history*
*Next milestone: Sprint 3 — Admin Panel (login + scan QR + order management)*