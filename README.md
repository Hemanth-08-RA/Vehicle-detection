# VehicleVision AI - Real-Time Vehicle Detection & Traffic Analytics

VehicleVision AI is a premium, futuristic traffic analytics dashboard powered by **YOLOv5** deep learning and computer vision. The project features a lightweight **FastAPI** Python backend coupled with a **build-less React & Tailwind CSS v4** frontend.

---

## 🌟 Key Features

* **Real-Time Vehicle Detection**: Processes vehicle class predictions (Cars, Motorcycles, Trucks, Buses) using YOLOv5.
* **Live Monitoring Stream**: Interactive video feed viewer with play/pause controls, dynamic FPS counters, and full-screen visualization from built-in webcams or remote IP Camera streams.
* **Traffic Density Calculator**: Adaptive density status indicator (Low, Medium, High) based on live vehicle thresholds.
* **Interactive Snapshots Gallery**: Scrollable gallery displaying crop captures of vehicle detections with inspection modal popups.
* **Futuristic Analytics**: Custom SVG-designed widgets showing traffic distribution donuts, volume bar graphs, and hourly traffic flow lines.
* **History Logs**: Clean database table with search options and a custom utility to **Export to CSV**.
* **Cloud Integration**: Synchronizes local logs to a Google Sheets cloud webhook in background tasks.

---

## 🛠️ Technology Stack

* **Backend**: FastAPI (Python), PyTorch, OpenCV, Uvicorn, Pandas
* **Frontend**: React (ES Modules), Tailwind CSS v4 (Play CDN), custom SVG charts
* **Machine Learning**: YOLOv5 Nano Model (Ultralytics)

---

## 🚀 Step-by-Step Installation & Setup

Follow these instructions to set up the project on your local machine:

### 📋 Prerequisites
* **Python 3.9 - 3.11** (Ensure you check **"Add Python to PATH"** during installation on Windows)
* **Git** installed on your system

---

### Step 1: Clone the Repository
Open your terminal (or PowerShell on Windows) and run:
```bash
git clone https://github.com/Hemanth-08-RA/Vehicle-detection.git
cd Vehicle-detection
```

### Step 2: Create a Virtual Environment
It is highly recommended to use a virtual environment to keep dependencies isolated:

* **On Windows (PowerShell)**:
  ```powershell
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```
  *(If you get a PowerShell Execution Policy error, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` first)*

* **On macOS / Linux**:
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

### Step 3: Install Dependencies
Upgrade `pip` and install the required packages:
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```
*Note: This will download PyTorch and OpenCV. The installation might take a few minutes depending on your internet connection.*

### Step 4: Run the Application
Start the FastAPI server:
```bash
python main.py
```
Upon startup, the server will optimize your CPU threads and load the YOLOv5 engine.

### Step 5: Access the Dashboard
Once the console outputs `Uvicorn running on http://0.0.0.0:8000`, open your web browser and navigate to:

👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 🧪 Testing with Sample Assets

We have provided sample media to test the vehicle detection:
* **Images**: Located in the [`image/`](image/) directory. Drag and drop any image (e.g., `Bus2.jpeg` or `car.jpeg`) into the upload zone to test detection.
* **Videos**: Located in the [`video/`](video/) directory. You can test live stream tracking by inputting the path to a video file in the camera settings.

---

## ☁️ Deploying to Render (Cloud Web Application)

This application is fully configured for seamless 1-click deployment on **[Render](https://render.com/)** straight from GitHub.

### Option A: Automatic Blueprint Deployment (Recommended)
1. Push this repository to GitHub.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository (`Vehicle-detection`).
5. Render will automatically detect `render.yaml` and configure all build/start settings, environment variables, and instance specs.
6. Click **Apply**.

---

### Option B: Manual Web Service Setup
If creating a Web Service manually on Render:

| Field | Value |
| :--- | :--- |
| **Service Type** | Web Service |
| **Environment** | Python 3 |
| **Region** | Oregon, USA (or any region) |
| **Branch** | `main` |
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
| **Start Command** | `gunicorn -w 1 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT main:app` |
| **Auto-Deploy** | Yes |

#### Environment Variables
In the Render Dashboard under **Environment**:

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `PORT` | `10000` | Port assigned dynamically by Render |
| `ALLOWED_ORIGINS` | `*` | Allowed CORS origins |
| `PYTHON_VERSION` | `3.10.12` | Python version for Render runtime |
| `WEBHOOK_URL` | `https://script.google.com/...` | Google Sheets logging webhook URL |

---

## 📂 Project Architecture

```
├── main.py              # FastAPI server (API routes & stream generator)
├── requirements.txt     # Python dependency list (with Gunicorn & Headless OpenCV)
├── Procfile             # Render production server start process
├── render.yaml          # Render Blueprint deployment definition
├── runtime.txt          # Python runtime version
├── .gitignore           # Excludes virtual environments and local weights
├── LICENSE              # Open-source MIT License
├── README.md            # Detailed documentation
├── image/               # Test image files (Bus & Car samples)
├── video/               # Test video files (Traffic flows)
└── static/              # Frontend Directory
    ├── index.html       # Entrypoint (Tailwind CSS v4 and React maps)
    └── app.js           # React components, charts, and AJAX logic
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

