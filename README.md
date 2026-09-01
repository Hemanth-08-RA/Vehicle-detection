# VehicleVision AI - Real-Time Vehicle Detection & Traffic Analytics

VehicleVision AI is a premium, futuristic traffic analytics dashboard powered by **YOLOv5** deep learning, **Vercel** serverless web hosting, and **Supabase** (PostgreSQL + Auth + Row Level Security).

---

## 🌟 Key Features & Architecture

* **High-Performance Architecture**:
  * **Frontend**: Deployed globally on **Vercel** (React 19 + Tailwind CSS v4 Play CDN).
  * **Authentication & Database**: Powered by **Supabase** (PostgreSQL + JWT Sessions + Row Level Security).
  * **AI Inference Engine**: **FastAPI** Python service executing YOLOv5 real-time vehicle classification & video tracking.
* **Supabase User Authentication**: Registration and Login with encrypted passwords (never stored in plain text).
* **Row Level Security (RLS)**: Each user's detection history logs are strictly isolated in PostgreSQL so users cannot view or modify other users' data.
* **Real-Time Vehicle Detection**: Processes vehicle class predictions (Cars, Motorcycles, Trucks, Buses) using YOLOv5.
* **Live Stream Studio**: Video stream viewer with play/pause controls, dynamic FPS counter, and stream presets.
* **Traffic Density Calculator**: Adaptive density status indicator (LOW, MEDIUM, HIGH) with congestion advisory metrics.
* **Interactive Snapshots & SVG Analytics**: Scrollable snapshot gallery with 1-click Lightbox modal inspect, distribution donuts, hourly trend line graphs, and volume bar charts.
* **CSV Export & Log Storage**: Clean, searchable detection database table with **Export to CSV**.

---

## 🛠️ Technology Stack

* **Frontend**: Vercel, React 19 (ES Modules), Tailwind CSS v4, FontAwesome, SVG Charts
* **Database & Auth**: Supabase (PostgreSQL, Auth, RLS Policies)
* **AI Engine**: FastAPI (Python), PyTorch, OpenCV Headless, YOLOv5 (Ultralytics)

---

## ⚡ Supabase Setup Instructions

1. Log in to [Supabase Console](https://supabase.com/dashboard) and create a new project.
2. Go to **SQL Editor** in the left sidebar.
3. Open [`supabase_schema.sql`](supabase_schema.sql) from this repository, paste the entire SQL script, and click **Run**.
   - This creates the `detection_logs` table, `profiles` table, indexes, user creation trigger, and **Row Level Security (RLS)** policies.
4. Go to **Project Settings -> API** to retrieve your:
   - **`SUPABASE_URL`** (e.g., `https://xyz.supabase.co`)
   - **`SUPABASE_ANON_KEY`** (Public safe API key)

---

## 🚀 Vercel Deployment Instructions

1. Push this repository to GitHub.
2. Log in to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... -> Project**.
3. Import your GitHub repository (`Vehicle-detection`).
4. Under **Environment Variables**, add:
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `DETECTION_BACKEND_URL`: Your FastAPI detection service URL (e.g., `https://vehicle-detection-backend.onrender.com`)
5. Click **Deploy**. Vercel will automatically read `vercel.json` and deploy your application.

---

## 💻 Local Testing & Setup

### Step 1: Clone & Configure Environment
```bash
git clone https://github.com/Hemanth-08-RA/Vehicle-detection.git
cd Vehicle-detection
cp .env.example .env
```

### Step 2: Set Up Virtual Environment & Dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Run Local Detection Engine
```bash
python main.py
```
The FastAPI backend will start on **`http://localhost:8000`**.

---

## 📂 Project Architecture

```
├── main.py              # FastAPI backend engine (YOLOv5 & video streams)
├── requirements.txt     # Python dependency list
├── vercel.json          # Vercel deployment configuration & API rewrites
├── supabase_schema.sql  # Supabase PostgreSQL schema & RLS policies
├── .env.example         # Environment variables template
├── Procfile             # Render/PaaS backend execution process
├── render.yaml          # Render backend blueprint
├── runtime.txt          # Python runtime version
├── .gitignore           # Excludes local caches and weights
├── LICENSE              # Open-source MIT License
├── README.md            # Detailed documentation
├── image/               # Sample test images
├── video/               # Sample test traffic streams
└── static/              # Frontend Directory
    ├── index.html       # HTML entrypoint (Tailwind CSS v4 & Supabase SDK)
    └── app.js           # React app, Supabase Auth/DB, charts, UI
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
