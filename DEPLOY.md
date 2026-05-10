# ShopZen — Complete Deployment Guide

Stack: **React (Vercel)** + **Node/Express (Railway)** + **MongoDB Atlas** + **Cloudinary**

---

## 1. Prerequisites — Install these first

```bash
# Node.js 18+ (https://nodejs.org)
node -v   # should show v18+

# Git
git --version
```

---

## 2. Run Locally (Development)

### 2-A. Clone / open the project

```bash
cd shopzen
```

### 2-B. Configure backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and set:

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/shopzen     # local MongoDB
JWT_SECRET=any_long_random_string_here

# For images locally, leave Cloudinary blank — files go to backend/uploads/
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

FRONTEND_URL=http://localhost:3000
```

> **Optional email:** fill EMAIL_* if you want OTP/order emails.

### 2-C. Install backend dependencies

```bash
cd backend
npm install
```

### 2-D. Configure frontend

```bash
cd frontend
cp .env.example .env
```

Leave `REACT_APP_API_URL=` blank — the React proxy in `package.json` forwards
`/api` requests to `localhost:5001` automatically.

### 2-E. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2-F. (Optional) Seed the database

```bash
cd backend
node seed.js
```

### 2-G. Start both servers

Open **two terminals**:

```bash
# Terminal 1 — backend
cd backend
npm run dev        # nodemon auto-restarts on file change

# Terminal 2 — frontend
cd frontend
npm start          # opens http://localhost:3000
```

**Admin panel:** http://localhost:3000/admin  
Default admin after seeding: `admin@shopzen.com` / `admin123`

---

## 3. Set Up Cloudinary (Free — Required for Production)

1. Go to [cloudinary.com](https://cloudinary.com) → **Sign up free**
2. Dashboard → copy your **Cloud name**, **API Key**, **API Secret**
3. Paste into `backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdef_your_secret
   ```
4. Restart backend — you'll see `🌥️  Upload storage: Cloudinary` in logs

> Images uploaded in production go directly to Cloudinary CDN. Local dev still
> works without Cloudinary (files stored in `backend/uploads/`).

---

## 4. MongoDB Atlas (Free Cloud Database)

1. [mongodb.com/atlas](https://mongodb.com/atlas) → Create free M0 cluster
2. **Database Access** → Add user (username + password, read/write)
3. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere)
4. **Connect** → Drivers → copy the connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/shopzen?retryWrites=true&w=majority
   ```
5. Save this — you'll use it in Railway env vars

---

## 5. Deploy Backend → Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repo, set **Root Directory** to `backend`
3. Railway auto-detects Node.js and runs `npm start`
4. Go to **Variables** tab and add all these:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | any long random string (min 32 chars) |
   | `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
   | `CLOUDINARY_API_KEY` | from Cloudinary dashboard |
   | `CLOUDINARY_API_SECRET` | from Cloudinary dashboard |
   | `FRONTEND_URL` | your Vercel URL (add after step 6) |
   | `EMAIL_USER` | your Gmail (optional) |
   | `EMAIL_PASS` | Gmail App Password (optional) |
   | `NODE_ENV` | `production` |

5. **Settings → Networking** → Generate Domain → copy URL like:
   `https://shopzen-backend-production.up.railway.app`

6. Test: visit `https://your-railway-url.up.railway.app/api/health`
   → should return `{"status":"ok",...}`

---

## 6. Deploy Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Framework: **Create React App** (auto-detected)
4. **Environment Variables** → Add:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://your-railway-url.up.railway.app` |

5. Click **Deploy** → wait ~2 min → get your URL:
   `https://shopzen.vercel.app`

6. **Go back to Railway** → add this Vercel URL as `FRONTEND_URL` variable
7. Railway will auto-redeploy with updated CORS

---

## 7. After Deployment — First Run

1. Visit your Vercel URL → store should load
2. Go to `/admin` → log in
3. Go to **Admin → Settings → Store** → configure store name, currency, etc.
4. Go to **Admin → Layout** → arrange homepage sections
5. Go to **Admin → Banners** → add hero images
6. Go to **Admin → Products** → add your products

---

## 8. Admin Panel Features (Full Control)

| Section | What you can change |
|---------|-------------------|
| **Layout** | Order & visibility of every homepage section |
| **Banners** | Hero slider, promo banners — images & links |
| **Settings → Theme** | Colors, fonts, 10 built-in themes |
| **Settings → Store** | Name, logo, currency, contact info |
| **Settings → Delivery** | Shipping zones, rates, free shipping threshold |
| **Settings → Payment** | Enable/disable COD, bank transfer, gateways |
| **Settings → Pages** | About, FAQ, Privacy Policy pages (rich text) |
| **Settings → Content** | Homepage section titles & subtitles |
| **Settings → SEO** | Meta title, description, OG image |
| **Products** | Add/edit products, images (via Cloudinary) |
| **Categories** | Category tree with images |
| **Seasonal** | Holiday campaigns with discount codes |
| **Animations** | Enable/disable cinematic effects |

---

## 9. Environment Variable Reference

### Backend (`backend/.env`)

```env
PORT=5001
MONGODB_URI=                  # MongoDB connection string
JWT_SECRET=                   # Min 32 random chars
FRONTEND_URL=                 # Vercel URL (for CORS)
CLOUDINARY_CLOUD_NAME=        # From Cloudinary dashboard
CLOUDINARY_API_KEY=           # From Cloudinary dashboard
CLOUDINARY_API_SECRET=        # From Cloudinary dashboard
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=                   # Gmail address
EMAIL_PASS=                   # Gmail App Password
EMAIL_FROM=ShopZen <you@gmail.com>
```

### Frontend (`frontend/.env`)

```env
# Leave blank for localhost (proxy handles it)
# Set to Railway URL for production
REACT_APP_API_URL=
```

---

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error in browser | Add your Vercel URL as `FRONTEND_URL` in Railway |
| Images not uploading | Check Cloudinary env vars in Railway |
| 404 on page refresh (Vercel) | `vercel.json` rewrite is already configured |
| MongoDB connection fails | Check Atlas Network Access (0.0.0.0/0) |
| `npm install` fails | Use Node 18+: `node -v` |
| Admin login fails | Run `node seed.js` in backend |

---

## 11. Updating the App

```bash
# Make changes locally, then:
git add .
git commit -m "your changes"
git push

# Railway and Vercel auto-deploy on push 🚀
```
