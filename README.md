# Evim — kirayə evlər portalı

Azərbaycanda kirayə mənzil, ev və villalar üçün full-stack portal.
Minimalist premium dizayn, üç dil: **Azərbaycan**, **Русский**, **English**.

| Hissə | Texnologiya | Pulsuz deploy |
|---|---|---|
| `frontend/` | Next.js 16 (App Router, TypeScript) | **Vercel** |
| `backend/` | Express 5 + PostgreSQL (`pg`, `zod`) | **Render** (web service) |
| Verilənlər bazası | PostgreSQL 16 | **Neon** (pulsuz, vaxtı bitmir) |

Bütün data backend-dən gəlir: frontend yalnız API-ni çağırır.

---

## Layihə strukturu

```
.
├── backend/
│   ├── src/
│   │   ├── config/        # env.js, constants.js
│   │   ├── db/
│   │   │   ├── migrations/001_init.sql
│   │   │   ├── migrate.js       # miqrasiya runner
│   │   │   ├── seed-data.js     # 5 şəhər + 10 ev (az/ru/en)
│   │   │   ├── seed.js
│   │   │   └── pool.js
│   │   ├── routes/        # URL → controller
│   │   ├── controllers/   # HTTP qatı
│   │   ├── services/      # SQL / biznes məntiqi
│   │   ├── validators/    # zod sxemləri
│   │   ├── middlewares/   # dil, validasiya, xəta emalı
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/[locale]/              # /az, /ru, /en
│   │   │   ├── page.tsx               # ana səhifə
│   │   │   ├── properties/page.tsx    # elanlar + filtrlər
│   │   │   └── properties/[slug]/     # elan səhifəsi
│   │   ├── components/
│   │   ├── i18n/dictionaries/         # az.ts, ru.ts, en.ts
│   │   ├── lib/api.ts                 # backend client
│   │   └── proxy.ts                   # dil yönləndirməsi
│   └── .env.example
├── docker-compose.yml     # lokal PostgreSQL
└── render.yaml            # Render blueprint (backend)
```

## API

Bütün endpoint-lər `?lang=az|ru|en` qəbul edir (default `az`).

| Metod | URL | Təsvir |
|---|---|---|
| GET | `/api/health` | Server və DB vəziyyəti |
| GET | `/api/properties` | Siyahı. Filtrlər: `city`, `type`, `minPrice`, `maxPrice`, `rooms`, `q`, `featured`, `sort` (`newest`, `price_asc`, `price_desc`, `area_desc`), `page`, `limit` |
| GET | `/api/properties/stats` | Ümumi say, qiymət aralığı |
| GET | `/api/properties/:slug` | Tam məlumat + 3 oxşar elan |
| GET | `/api/cities` | Şəhərlər və elan sayı |
| POST | `/api/inquiries` | Baxış üçün müraciət (`propertySlug`, `name`, `phone`, `email?`, `message?`, `lang?`). 15 dəq-də 5 sorğu limiti |

---

## Lokal işə salma

Tələb: Node.js 20+, Docker (və ya quraşdırılmış PostgreSQL).

```bash
# 1. Verilənlər bazası (Docker Desktop açıq olmalıdır)
docker compose up -d
docker ps              # siyahıda "evim-db" görünməlidir

# 2. Backend  → http://localhost:4000
cd backend
cp .env.example .env
npm install
npm run db:seed        # cədvəlləri yaradır və 10 evi əlavə edir
npm run dev

# 3. Frontend → http://localhost:3000  (yeni terminalda)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

> Docker bazası kompüterdə **5433** portunda açılır ki, başqa PostgreSQL ilə (5432) toqquşmasın.
> `password authentication failed` xətası görsəniz, `backend/.env`-də portun `5433` olduğunu yoxlayın.

Faydalı əmrlər (backend):

- `npm run db:migrate` — yalnız miqrasiyalar
- `npm run db:seed` — default datanı əlavə edir / yeniləyir (slug üzrə, təkrar işlətmək olar)
- `npm run db:reset` — bütün datanı silib yenidən doldurur

---

## Deploy (hamısı pulsuz)

### 1. Verilənlər bazası — Neon

1. [neon.tech](https://neon.tech) → qeydiyyat → **New project** (region: Frankfurt).
2. **Connection string**-i kopyala, məsələn:
   `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`

> Render-in öz pulsuz PostgreSQL-i 30 gündən sonra silinir, ona görə Neon tövsiyə olunur.

### 2. Backend — Render

1. [render.com](https://render.com) → GitHub ilə daxil ol.
2. **New → Blueprint** → bu repozitoriyanı seç. `render.yaml` avtomatik oxunacaq (`rootDir: backend`).
3. Soruşulan dəyişənləri doldur:
   - `DATABASE_URL` — Neon connection string
   - `CORS_ORIGIN` — Vercel ünvanın, məs. `https://evim.vercel.app`
4. Deploy bitəndən sonra `https://evim-api.onrender.com/api/health` açılmalıdır.

İlk işə düşəndə `start:prod` miqrasiyaları tətbiq edir və baza boşdursa 10 evi avtomatik əlavə edir.

> Pulsuz Render servisi 15 dəqiqə sorğu gəlməsə "yuxuya gedir", ilk sorğu ~30–50 saniyə çəkə bilər.
> Frontend səhifələri 60 saniyəlik keş ilə işlədiyi üçün istifadəçilər bunu az hiss edir.
> Tam oyaq saxlamaq üçün [cron-job.org](https://cron-job.org)-da hər 10 dəqiqədən bir `/api/health`-ə sorğu qura bilərsən.

Alternativlər: **Railway** və ya **Koyeb** — eyni parametrlərlə (`Root directory: backend`, `Start: npm run start:prod`).

### 3. Frontend — Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → repozitoriyanı import et.
2. **Root Directory**: `frontend` (vacib!). Framework avtomatik Next.js təyin olunur.
3. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://evim-api.onrender.com`
   - `NEXT_PUBLIC_SITE_URL` = `https://<sənin-layihən>.vercel.app`
4. **Deploy**. Sonra Vercel ünvanını Render-də `CORS_ORIGIN`-ə əlavə et.

---

## Dillər

- URL-lər: `/az/...`, `/ru/...`, `/en/...`. `/` brauzer dilinə görə yönləndirir, seçilən dil cookie-də yadda qalır.
- İnterfeys mətnləri: `frontend/src/i18n/dictionaries/*.ts`.
- Elan mətnləri bazada JSONB kimi saxlanılır: `{ "az": "...", "ru": "...", "en": "..." }`; API istənən dili qaytarır.

## Yeni elan əlavə etmək

`backend/src/db/seed-data.js`-ə yeni obyekt əlavə et və `npm run db:seed` işlət
(və ya birbaşa `properties` cədvəlinə INSERT et).
