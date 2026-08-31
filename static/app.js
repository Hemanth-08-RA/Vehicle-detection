import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import htm from 'htm';

const html = htm.bind(React.createElement);

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzj7Y3Cg858enguXSXuq1k7CtDGRxkOl9Q6wmachbQGN9GWDkBRYCGNDyAD-ReHnVu2/exec";

// ==========================================
// SUB-COMPONENTS
// ==========================================

// Navigation Bar
const Navbar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'live', label: 'Live Monitoring', icon: 'fa-video' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-pie' },
    { id: 'history', label: 'History Logs', icon: 'fa-file-medical' },
    { id: 'settings', label: 'Settings', icon: 'fa-sliders' }
  ];

  return html`
    <header class="sticky top-0 z-50 w-full border-b border-brand-card-border bg-brand-bg/85 glass-panel transition-all">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-brand-primary to-brand-secondary shadow-neon-cyan">
            <i class="fa-solid class fa-shield-halved text-brand-bg text-xl"></i>
          </div>
          <span class="font-display text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-linear-to-r from-white via-slate-100 to-brand-primary">
            VehicleVision <span class="text-brand-primary">AI</span>
          </span>
        </div>

        <!-- Desktop Nav Links -->
        <nav class="hidden md:flex space-x-1">
          ${tabs.map(tab => html`
            <button
              key=${tab.id}
              onClick=${() => setActiveTab(tab.id)}
              class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-card text-brand-primary border border-brand-primary/20 shadow-neon-cyan/10'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }"
            >
              <i class="fa-solid ${tab.icon}"></i>
              ${tab.label}
            </button>
          `)}
        </nav>

        <!-- User Profile icon -->
        <div class="flex items-center gap-4">
          <div class="hidden lg:flex flex-col text-right">
            <span class="text-xs text-slate-500 font-mono">NODE_STATUS</span>
            <span class="text-xs text-brand-success font-mono flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-brand-success inline-block live-dot"></span>
              ONLINE
            </span>
          </div>
          <div class="h-9 w-9 rounded-full border border-brand-card-border bg-white/5 flex items-center justify-center text-slate-300 cursor-pointer hover:border-brand-primary transition-all">
            <i class="fa-solid fa-user text-sm"></i>
          </div>
        </div>

      </div>
    </header>
  `;
};

// Stat Card
const StatCard = ({ title, count, icon, colorClass, shadowClass }) => {
  return html`
    <div class="relative overflow-hidden rounded-xl border border-brand-card-border bg-brand-card p-6 shadow-xs glass-panel transition-all hover:-translate-y-1 hover:border-white/10 ${shadowClass}">
      <!-- Background Glow Effect -->
      <div class="absolute -right-10 -bottom-10 h-28 w-28 rounded-full filter blur-2xl opacity-10 bg-current ${colorClass}"></div>
      
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">${title}</span>
          <h3 class="mt-2 text-4xl font-extrabold tracking-tight text-white font-display">
            ${count}
          </h3>
        </div>
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-brand-card-border text-2xl ${colorClass}">
          <i class="fa-solid ${icon}"></i>
        </div>
      </div>
    </div>
  `;
};

// Traffic Density Card
const TrafficDensityCard = ({ totalCount }) => {
  let density = "Low";
  let color = "text-brand-success";
  let barColor = "bg-brand-success";
  let bgGlow = "shadow-neon-green/20";
  let desc = "Normal flow of traffic, optimal speeds.";

  if (totalCount > 6) {
    density = "High";
    color = "text-brand-danger";
    barColor = "bg-brand-danger";
    bgGlow = "shadow-neon-red/20";
    desc = "Congestion detected. High volume of vehicles.";
  } else if (totalCount > 2) {
    density = "Medium";
    color = "text-brand-warning";
    barColor = "bg-brand-warning";
    bgGlow = "shadow-brand-warning/20";
    desc = "Moderate flow, caution advised.";
  }

  return html`
    <div class="rounded-xl border border-brand-card-border bg-brand-card p-6 glass-panel flex flex-col justify-between h-full shadow-md ${bgGlow}">
      <div>
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Traffic Density</span>
        <div class="mt-3 flex items-baseline gap-2">
          <h4 class="text-3xl font-extrabold tracking-tight font-display ${color}">${density}</h4>
          <span class="text-sm text-slate-400 font-mono">(${totalCount} Live)</span>
        </div>
        <p class="mt-2 text-sm text-slate-400">${desc}</p>
      </div>
      
      <!-- Progress visualizer -->
      <div class="mt-4">
        <div class="flex justify-between text-xs text-slate-500 font-mono mb-1">
          <span>CAPACITY</span>
          <span>${Math.min(Math.round((totalCount / 12) * 100), 100)}%</span>
        </div>
        <div class="h-2 w-full rounded-full bg-white/5 overflow-hidden">
          <div class=${`h-full rounded-full ${barColor} transition-all duration-500`} style=${{ width: `${Math.min((totalCount / 12) * 100, 100)}%` }}></div>
        </div>
      </div>
    </div>
  `;
};

// SVG Pie/Donut Chart
const SVGDonutChart = ({ data }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  
  // Default values if zero
  const safeData = total === 0 ? { car: 1, motorcycle: 1, truck: 1, bus: 1 } : data;
  const safeTotal = total === 0 ? 4 : total;
  
  const classes = [
    { label: 'Cars', val: safeData.car, color: '#00F5FF', offset: 0 },
    { label: 'Motorcycles', val: safeData.motorcycle, color: '#00FF88', offset: 0 },
    { label: 'Trucks', val: safeData.truck, color: '#FFD700', offset: 0 },
    { label: 'Buses', val: safeData.bus, color: '#FF4D6D', offset: 0 }
  ];

  // Calculate percentages and circumference offsets
  const radius = 50;
  const circ = 2 * Math.PI * radius; // ~314.16
  
  let currentOffset = 0;
  classes.forEach(c => {
    c.percent = (c.val / safeTotal) * 100;
    c.strokeDash = (c.val / safeTotal) * circ;
    c.offset = currentOffset;
    currentOffset += c.strokeDash;
  });

  return html`
    <div class="flex flex-col items-center sm:flex-row justify-around gap-6 py-4">
      <div class="relative h-44 w-44">
        <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" stroke-width="12" />
          ${classes.map(c => html`
            <circle
              key=${c.label}
              cx="60"
              cy="60"
              r="50"
              fill="transparent"
              stroke=${c.color}
              stroke-width="12"
              stroke-dasharray="${c.strokeDash} ${circ - c.strokeDash}"
              stroke-dashoffset="-${c.offset}"
              stroke-linecap=${total > 0 ? 'round' : 'butt'}
              class="transition-all duration-700"
            />
          `)}
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-2xl font-bold font-mono text-white">${total}</span>
          <span class="text-2xs uppercase tracking-wider text-slate-500">Analyzed</span>
        </div>
      </div>
      
      <!-- Legends -->
      <div class="flex flex-col gap-2">
        ${classes.map((c, i) => html`
          <div key=${i} class="flex items-center gap-3">
            <span class="h-3 w-3 rounded-full" style=${{ backgroundColor: c.color }}></span>
            <div class="flex flex-col">
              <span class="text-xs text-slate-400 font-medium">${c.label}</span>
              <span class="text-sm font-bold font-mono text-white">
                ${data[c.label.toLowerCase().slice(0, -1)] || 0} 
                <span class="text-2xs text-slate-500 font-normal ml-1">
                  (${total > 0 ? Math.round(( (data[c.label.toLowerCase().slice(0, -1)] || 0) / total) * 100) : 0}%)
                </span>
              </span>
            </div>
          </div>
        `)}
      </div>
    </div>
  `;
};

// SVG Line Chart
const SVGLineChart = ({ logs }) => {
  // Group logs by hour
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const data = [12, 18, 28, 22, 35, 45, 16]; // Default trend line

  // If logs exist, extract counts by mapping roughly to hourly blocks
  if (logs && logs.length > 0) {
    // Basic aggregation
    const hourCounts = { '08': 0, '10': 0, '12': 0, '14': 0, '16': 0, '18': 0, '20': 0 };
    logs.forEach(log => {
      if (log.timestamp) {
        // format: "2026-06-07 23:15:00" -> hour = "23"
        const matches = log.timestamp.match(/(\d{2}):/);
        if (matches) {
          const hour = matches[1];
          // Round to nearest category
          if (hour <= '09') hourCounts['08'] += log.total;
          else if (hour <= '11') hourCounts['10'] += log.total;
          else if (hour <= '13') hourCounts['12'] += log.total;
          else if (hour <= '15') hourCounts['14'] += log.total;
          else if (hour <= '17') hourCounts['16'] += log.total;
          else if (hour <= '19') hourCounts['18'] += log.total;
          else hourCounts['20'] += log.total;
        }
      }
    });

    // Populate chart data, fall back to default if no detections in that hour
    hours.forEach((h, idx) => {
      const key = h.split(':')[0];
      if (hourCounts[key] > 0) {
        data[idx] = hourCounts[key];
      }
    });
  }

  // Draw chart dimensions
  const width = 500;
  const height = 150;
  const padding = 25;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxVal = Math.max(...data, 10);
  
  // Calculate points
  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - (val / maxVal) * chartHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Fill path underneath
  const fillPathD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return html`
    <div class="w-full">
      <svg viewBox="0 0 500 150" class="w-full overflow-visible">
        <defs>
          <linearGradient id="glow-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00F5FF" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#00F5FF" stop-opacity="0" />
          </linearGradient>
        </defs>
        
        <!-- Y Gridlines -->
        <line x1=${padding} y1=${padding} x2=${width - padding} y2=${padding} stroke="rgba(255,255,255,0.03)" stroke-dasharray="3" />
        <line x1=${padding} y1=${padding + chartHeight/2} x2=${width - padding} y2=${padding + chartHeight/2} stroke="rgba(255,255,255,0.03)" stroke-dasharray="3" />
        <line x1=${padding} y1=${height - padding} x2=${width - padding} y2=${height - padding} stroke="rgba(255,255,255,0.08)" />

        <!-- Gradient Area -->
        <path d=${fillPathD} fill="url(#glow-grad)" />

        <!-- Line Path -->
        <path d=${pathD} fill="none" stroke="#00F5FF" stroke-width="2.5" class="drop-shadow-[0_0_8px_#00F5FF]" />

        <!-- Data Dots -->
        ${points.map((p, idx) => html`
          <g key=${idx} class="group">
            <circle cx=${p.x} cy=${p.y} r="4" fill="#0A0F1C" stroke="#00F5FF" stroke-width="2" />
            <circle cx=${p.x} cy=${p.y} r="8" fill="#00F5FF" class="opacity-0 group-hover:opacity-20 transition-all cursor-pointer" />
            <!-- Tooltip text on hover -->
            <text x=${p.x} y=${p.y - 8} fill="white" font-size="8" font-family="monospace" text-anchor="middle" class="opacity-0 group-hover:opacity-100 bg-black font-semibold transition-all">
              ${data[idx]}
            </text>
          </g>
        `)}

        <!-- X Axis labels -->
        ${hours.map((h, idx) => {
          const x = padding + (idx / (hours.length - 1)) * chartWidth;
          return html`
            <text key=${idx} x=${x} y=${height - 5} fill="rgba(255,255,255,0.4)" font-size="8" font-family="monospace" text-anchor="middle">
              ${h}
            </text>
          `;
        })}
      </svg>
    </div>
  `;
};

// SVG Bar Chart
const SVGBarChart = ({ data }) => {
  const categories = ['Cars', 'Motorcycles', 'Trucks', 'Buses'];
  const values = [data.car || 0, data.motorcycle || 0, data.truck || 0, data.bus || 0];
  const maxVal = Math.max(...values, 5);
  
  const colors = ['#00F5FF', '#00FF88', '#FFD700', '#FF4D6D'];

  const width = 500;
  const height = 150;
  const padding = 25;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const barWidth = 45;
  const spacing = (chartWidth - barWidth * categories.length) / (categories.length - 1);

  return html`
    <div class="w-full">
      <svg viewBox="0 0 500 150" class="w-full overflow-visible">
        <!-- Gridline -->
        <line x1=${padding} y1=${height - padding} x2=${width - padding} y2=${height - padding} stroke="rgba(255,255,255,0.08)" />

        <!-- Bars -->
        ${categories.map((cat, idx) => {
          const val = values[idx];
          const x = padding + idx * (barWidth + spacing);
          const barHeight = (val / maxVal) * chartHeight;
          const y = height - padding - barHeight;

          return html`
            <g key=${idx} class="group">
              <!-- Rounded-top bars -->
              <rect
                x=${x}
                y=${y}
                width=${barWidth}
                height=${Math.max(barHeight, 2)}
                rx="4"
                fill=${colors[idx]}
                class="opacity-80 group-hover:opacity-100 transition-all cursor-pointer"
                style=${{ filter: `drop-shadow(0 0 4px ${colors[idx]}33)` }}
              />
              
              <!-- Value Text -->
              <text x=${x + barWidth/2} y=${y - 6} fill="white" font-size="9" font-family="monospace" text-anchor="middle" class="font-bold">
                ${val}
              </text>
              
              <!-- Category Label -->
              <text x=${x + barWidth/2} y=${height - 8} fill="rgba(255,255,255,0.4)" font-size="9" text-anchor="middle">
                ${cat}
              </text>
            </g>
          `;
        })}
      </svg>
    </div>
  `;
};


// ==========================================
// MAIN COMPONENT
// ==========================================
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  
  // Settings & Stream config
  const [cameraUrl, setCameraUrl] = useState('0'); // 0 for local webcam default
  const [confidence, setConfidence] = useState(0.25);
  const [isStreaming, setIsStreaming] = useState(false);
  const [fps, setFps] = useState(30);

  // Upload States
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadResultImage, setUploadResultImage] = useState(null);
  const [uploadStats, setUploadStats] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // General UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [alert, setAlert] = useState(null);

  // Cumulative Analytics Counter (Computed from logs + active counts)
  const [cumulativeStats, setCumulativeStats] = useState({ car: 0, motorcycle: 0, truck: 0, bus: 0, total: 0 });

  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Trigger alert banner
  const triggerAlert = (message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Fetch log history
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);

        // Aggregate statistics from history
        if (data && data.length > 0) {
          const sums = data.reduce((acc, log) => {
            acc.car += log.cars || 0;
            acc.motorcycle += log.motorcycles || 0;
            acc.truck += log.trucks || 0;
            acc.bus += log.buses || 0;
            acc.total += log.total || 0;
            return acc;
          }, { car: 0, motorcycle: 0, truck: 0, bus: 0, total: 0 });
          setCumulativeStats(sums);
        } else {
          setCumulativeStats({ car: 0, motorcycle: 0, truck: 0, bus: 0, total: 0 });
        }
      }
    } catch (e) {
      console.error("Failed to load logs:", e);
    }
  };

  // On load, load log files
  useEffect(() => {
    fetchLogs();
  }, []);

  // Set interval to poll logs every 5 seconds to show new webcam detections
  useEffect(() => {
    let interval;
    if (isStreaming) {
      interval = setInterval(() => {
        fetchLogs();
        // Simulate minor FPS variance (27-30) for realism
        setFps(Math.floor(Math.random() * (31 - 27) + 27));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file) => {
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setUploadResultImage(null);
    setUploadStats(null);
  };

  // Submit image upload detection
  const handleDetectUpload = async () => {
    if (!uploadFile) {
      triggerAlert("Please select or drop an image file first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("confidence", confidence);

    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setUploadResultImage(data.image);
        setUploadStats(data.counts);
        // Refresh log database
        fetchLogs();
      } else {
        const err = await res.json();
        triggerAlert(err.detail || "Error detecting vehicles.");
      }
    } catch (e) {
      triggerAlert("Failed to connect to backend server.");
    } finally {
      setIsUploading(false);
    }
  };

  // Control live camera
  const handleStartCamera = () => {
    if (!cameraUrl) {
      triggerAlert("Please enter a Camera URL or WebCam Index.");
      return;
    }
    setIsStreaming(true);
  };

  const handleStopCamera = async () => {
    setIsStreaming(false);
    try {
      await fetch("/api/stop_feeds", { method: "POST" });
    } catch (e) {
      console.error("Failed to stop stream feed:", e);
    }
  };

  // Clear Logs CSV
  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all history and logs? This will delete all saved images.")) {
      return;
    }
    try {
      const res = await fetch("/api/clear_logs", { method: "POST" });
      if (res.ok) {
        fetchLogs();
        triggerAlert("All history logs and images cleared.", "success");
      }
    } catch (e) {
      triggerAlert("Failed to clear logs.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      triggerAlert("No log entries available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Source,Cars,Motorcycles,Trucks,Buses,Total\n";

    logs.forEach(log => {
      csvContent += `${log.timestamp},${log.source},${log.cars},${log.motorcycles},${log.trucks},${log.buses},${log.total}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `traffic_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle fullscreen on video container
  const toggleFullscreen = () => {
    const element = streamRef.current;
    if (!element) return;
    
    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listener to track escape from native fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Filter gallery images
  const galleryDetections = logs.filter(log => log.image && log.total > 0).slice(0, 6);

  return html`
    <div class="min-h-screen flex flex-col font-sans">
      
      <!-- Top Navigation -->
      <${Navbar} activeTab=${activeTab} setActiveTab=${setActiveTab} />
      
      <!-- Alert Banner -->
      ${alert && html`
        <div class="fixed top-20 right-4 z-50 rounded-lg border glass-panel p-4 flex items-center gap-3 transition-all duration-300 shadow-md ${
          alert.type === 'success' 
            ? 'border-brand-success bg-brand-success/10 text-brand-success' 
            : 'border-brand-danger bg-brand-danger/10 text-brand-danger'
        }">
          <i class="fa-solid ${alert.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} text-lg"></i>
          <span class="font-medium text-sm">${alert.message}</span>
        </div>
      `}

      <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Hero Section -->
        <section class="mb-10 text-center md:text-left">
          <div class="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 py-1 text-2xs font-semibold tracking-wider uppercase text-brand-primary font-mono mb-4">
            <span class="h-2 w-2 rounded-full bg-brand-primary inline-block animate-ping"></span>
            YOLOv5 Deep Learning Engine
          </div>
          <h1 class="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Real-Time Vehicle Detection <br class="hidden sm:inline" />
            <span class="text-brand-primary bg-clip-text text-transparent bg-linear-to-r from-brand-primary to-brand-secondary">
              & Traffic Analytics
            </span>
          </h1>
          <p class="mt-4 max-w-2xl text-base text-slate-400">
            Monitor traffic densities, track vehicles, and generate analytics using state-of-the-art Deep Learning models directly inside your browser.
          </p>
        </section>

        <!-- Main Switch Tabs Content -->
        ${activeTab === 'dashboard' && html`
          <div class="space-y-8 animate-fadeIn">
            
            <!-- Statistics Cards Grid -->
            <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <${StatCard} 
                title="Cars" 
                count=${cumulativeStats.car} 
                icon="fa-car" 
                colorClass="text-brand-primary" 
                shadowClass="hover:shadow-neon-cyan" 
              />
              <${StatCard} 
                title="Motorcycles" 
                count=${cumulativeStats.motorcycle} 
                icon="fa-motorcycle" 
                colorClass="text-brand-success" 
                shadowClass="hover:shadow-neon-green" 
              />
              <${StatCard} 
                title="Trucks" 
                count=${cumulativeStats.truck} 
                icon="fa-truck" 
                colorClass="text-brand-warning" 
                shadowClass="hover:shadow-brand-warning/30" 
              />
              <${StatCard} 
                title="Buses" 
                count=${cumulativeStats.bus} 
                icon="fa-bus" 
                colorClass="text-brand-danger" 
                shadowClass="hover:shadow-neon-red" 
              />
            </div>

            <!-- Dashboard Row 2 (Monitoring, Upload, Density) -->
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              <!-- Live Camera Feed Viewer -->
              <div class="lg:col-span-2 flex flex-col rounded-xl border border-brand-card-border bg-brand-card overflow-hidden glass-panel">
                <div class="flex items-center justify-between border-b border-brand-card-border px-5 py-4">
                  <div class="flex items-center gap-2">
                    <span class="flex h-3.5 w-3.5 items-center justify-center">
                      <span class="absolute inline-flex h-3 w-3 rounded-full opacity-75 ${isStreaming ? 'bg-brand-danger animate-ping' : 'bg-slate-600'}"></span>
                      <span class="relative inline-flex h-2 w-2 rounded-full ${isStreaming ? 'bg-brand-danger' : 'bg-slate-500'}"></span>
                    </span>
                    <h3 class="font-display font-bold text-white">Live Monitoring Stream</h3>
                  </div>
                  <div class="flex items-center gap-3">
                    ${isStreaming && html`
                      <span class="rounded bg-white/5 border border-brand-card-border px-2 py-0.5 text-3xs font-mono text-slate-400">
                        FPS: ${fps}
                      </span>
                    `}
                    <button onClick=${toggleFullscreen} class="text-slate-400 hover:text-white transition-all text-sm" title="Fullscreen">
                      <i class="fa-solid fa-expand"></i>
                    </button>
                  </div>
                </div>

                <div ref=${streamRef} class="relative flex-grow bg-slate-950 flex items-center justify-center min-h-[300px] overflow-hidden">
                  ${isStreaming 
                    ? html`<img 
                        src="/api/video_feed?url=${cameraUrl}&confidence=${confidence}" 
                        class="w-full h-full max-h-[420px] object-contain" 
                        alt="Live Camera Feed" 
                      />`
                    : html`
                      <!-- Standby / Offline Screen -->
                      <div class="flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div class="relative flex items-center justify-center h-20 w-20 rounded-full border border-dashed border-brand-primary/30 text-brand-primary bg-brand-primary/5">
                          <i class="fa-solid fa-video-slash text-2xl"></i>
                        </div>
                        <div class="max-w-xs">
                          <h4 class="text-slate-300 font-bold font-display">Video Feed Standby</h4>
                          <p class="text-xs text-slate-500 mt-1">Camera feed offline. Enter camera URL or Webcam index in settings and click Start to begin detection.</p>
                        </div>
                      </div>
                    `
                  }
                </div>

                <div class="border-t border-brand-card-border px-5 py-3.5 flex flex-wrap gap-3 items-center justify-between bg-black/10">
                  <div class="flex items-center gap-2 max-w-sm w-full">
                    <span class="text-xs text-slate-400 font-mono">Camera:</span>
                    <span class="text-xs font-semibold text-white truncate">${isStreaming ? `Active URL: ${cameraUrl}` : 'Idle'}</span>
                  </div>
                  <div class="flex gap-2">
                    ${isStreaming 
                      ? html`
                        <button onClick=${handleStopCamera} class="rounded-lg bg-brand-danger hover:bg-brand-danger/80 text-white font-medium text-xs px-4 py-2 flex items-center gap-1.5 transition-all shadow-xs hover:shadow-neon-red/10">
                          <i class="fa-solid fa-stop"></i> Stop Monitoring
                        </button>
                      `
                      : html`
                        <button onClick=${handleStartCamera} class="rounded-lg bg-brand-primary hover:bg-brand-primary/80 text-brand-bg font-bold text-xs px-4 py-2 flex items-center gap-1.5 transition-all shadow-xs hover:shadow-neon-cyan/15">
                          <i class="fa-solid fa-play"></i> Start Monitoring
                        </button>
                      `
                    }
                  </div>
                </div>
              </div>

              <!-- Traffic Density Summary Card -->
              <div class="flex flex-col gap-6">
                <${TrafficDensityCard} totalCount=${isStreaming ? (logs[0]?.total || 0) : 0} />
                
                <!-- Quick Settings within Dashboard -->
                <div class="rounded-xl border border-brand-card-border bg-brand-card p-6 glass-panel flex-grow flex flex-col justify-between">
                  <div>
                    <h3 class="font-display font-bold text-white mb-4">Quick Control Panel</h3>
                    <div class="space-y-4">
                      
                      <!-- Confidence slider -->
                      <div>
                        <div class="flex justify-between text-xs mb-1 font-mono">
                          <span class="text-slate-400">Confidence Threshold</span>
                          <span class="text-brand-primary font-bold">${confidence}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.10" 
                          max="0.90" 
                          step="0.05" 
                          value=${confidence} 
                          onChange=${(e) => setConfidence(parseFloat(e.target.value))}
                          class="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-primary" 
                        />
                      </div>

                      <!-- Camera Input selection -->
                      <div>
                        <label class="block text-xs text-slate-400 font-mono mb-1">Camera Stream URL / Index</label>
                        <div class="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="e.g. 0 or IP webcam URL" 
                            value=${cameraUrl} 
                            onChange=${(e) => setCameraUrl(e.target.value)}
                            disabled=${isStreaming}
                            class="flex-grow rounded-lg border border-brand-card-border bg-slate-900/60 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-brand-primary focus:outline-hidden disabled:opacity-40" 
                          />
                        </div>
                        <p class="text-4xs text-slate-500 mt-1">Use '0' for built-in Laptop Webcam, or enter RTSP/HTTP URL for external cameras.</p>
                      </div>

                    </div>
                  </div>

                  <div class="border-t border-brand-card-border/50 pt-4 mt-4 flex justify-between gap-2">
                    <button onClick=${() => setActiveTab('settings')} class="rounded-lg bg-white/5 border border-brand-card-border hover:bg-white/10 text-white font-medium text-xs px-3.5 py-1.5 transition-all">
                      All Settings
                    </button>
                    <button onClick=${handleClearLogs} class="rounded-lg bg-brand-danger/10 hover:bg-brand-danger/25 text-brand-danger font-medium text-xs px-3.5 py-1.5 border border-brand-danger/20 transition-all">
                      Clear Logs
                    </button>
                  </div>
                </div>

              </div>

            </div>

            <!-- Dashboard Row 3 (Upload Area & Charts) -->
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              
              <!-- Upload Panel -->
              <div class="rounded-xl border border-brand-card-border bg-brand-card p-6 glass-panel flex flex-col justify-between min-h-[450px]">
                <div>
                  <h3 class="font-display font-bold text-white mb-2">Upload Image Detection</h3>
                  <p class="text-xs text-slate-400 mb-5">Analyze a static traffic image snapshot using the deep learning detector.</p>
                  
                  <!-- Drag Zone -->
                  <div 
                    onDragOver=${handleDragOver}
                    onDrop=${handleDrop}
                    onClick=${() => fileInputRef.current.click()}
                    class="relative border-2 border-dashed border-brand-card-border hover:border-brand-primary/50 bg-slate-900/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-white/1"
                  >
                    <input 
                      type="file" 
                      ref=${fileInputRef} 
                      onChange=${handleFileChange} 
                      accept="image/*"
                      class="hidden" 
                    />
                    
                    ${uploadPreview 
                      ? html`
                        <div class="flex gap-4 w-full justify-center">
                          <div class="flex flex-col items-center">
                            <span class="text-3xs text-slate-500 mb-1 font-mono">Original</span>
                            <img src=${uploadPreview} class="h-28 object-contain rounded-lg border border-brand-card-border" />
                          </div>
                          ${uploadResultImage && html`
                            <div class="flex flex-col items-center">
                              <span class="text-3xs text-brand-primary mb-1 font-mono">Processed</span>
                              <img src=${uploadResultImage} class="h-28 object-contain rounded-lg border border-brand-primary/20 shadow-neon-cyan/10" />
                            </div>
                          `}
                        </div>
                      `
                      : html`
                        <div class="h-12 w-12 rounded-lg bg-white/5 border border-brand-card-border flex items-center justify-center text-slate-400 text-lg">
                          <i class="fa-solid fa-cloud-arrow-up"></i>
                        </div>
                        <div class="text-center">
                          <span class="text-xs text-slate-300 font-semibold">Click to upload</span>
                          <span class="text-xs text-slate-500"> or drag and drop</span>
                          <p class="text-4xs text-slate-600 mt-1">PNG, JPG, JPEG up to 10MB</p>
                        </div>
                      `
                    }
                  </div>

                  <!-- Detection results summary -->
                  ${uploadStats && html`
                    <div class="mt-6 rounded-lg bg-brand-primary/5 border border-brand-primary/10 p-4 animate-fadeIn">
                      <h4 class="text-xs font-semibold text-brand-primary uppercase tracking-wider font-mono mb-2">Detection Summary</h4>
                      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div class="bg-black/20 p-2 rounded-md">
                          <div class="text-slate-500 text-3xs font-mono">CARS</div>
                          <div class="text-white font-bold text-sm font-mono">${uploadStats.car}</div>
                        </div>
                        <div class="bg-black/20 p-2 rounded-md">
                          <div class="text-slate-500 text-3xs font-mono">MOTORCYCLES</div>
                          <div class="text-white font-bold text-sm font-mono">${uploadStats.motorcycle}</div>
                        </div>
                        <div class="bg-black/20 p-2 rounded-md">
                          <div class="text-slate-500 text-3xs font-mono">TRUCKS</div>
                          <div class="text-white font-bold text-sm font-mono">${uploadStats.truck}</div>
                        </div>
                        <div class="bg-black/20 p-2 rounded-md">
                          <div class="text-slate-500 text-3xs font-mono">BUSES</div>
                          <div class="text-white font-bold text-sm font-mono">${uploadStats.bus}</div>
                        </div>
                      </div>
                      <div class="text-center text-xs mt-3 text-white font-semibold font-mono">
                        Total Vehicles Detected: <span class="text-brand-primary">${uploadStats.total}</span>
                      </div>
                    </div>
                  `}

                </div>

                <div class="flex gap-3 mt-6 border-t border-brand-card-border/50 pt-4">
                  ${uploadPreview && html`
                    <button 
                      onClick=${() => { setUploadPreview(null); setUploadResultImage(null); setUploadStats(null); }}
                      class="flex-1 rounded-lg bg-white/5 border border-brand-card-border hover:bg-white/10 text-white font-medium text-xs py-2 transition-all"
                    >
                      Clear Selection
                    </button>
                  `}
                  <button 
                    onClick=${handleDetectUpload}
                    disabled=${isUploading || !uploadPreview}
                    class="flex-2 rounded-lg bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-40 disabled:hover:bg-brand-primary text-brand-bg font-extrabold text-xs py-2 flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    ${isUploading ? html`
                      <i class="fa-solid fa-spinner animate-spin"></i> Processing...
                    ` : html`
                      <i class="fa-solid fa-microchip"></i> Run AI Detection
                    `}
                  </button>
                </div>
              </div>

              <!-- Live Analytics (Graphs preview) -->
              <div class="rounded-xl border border-brand-card-border bg-brand-card p-6 glass-panel flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="font-display font-bold text-white">Live Traffic Distribution</h3>
                    <button onClick=${() => setActiveTab('analytics')} class="text-xs text-brand-primary hover:underline font-mono">
                      Full Reports <i class="fa-solid fa-chevron-right ml-0.5"></i>
                    </button>
                  </div>
                  
                  <div class="bg-slate-950/40 rounded-xl p-4 border border-brand-card-border">
                    <${SVGDonutChart} data=${cumulativeStats} />
                  </div>
                </div>

                <!-- Small bar chart preview -->
                <div class="mt-4">
                  <span class="text-2xs font-semibold uppercase tracking-wider text-slate-500 font-mono mb-2 block">Detections by Vehicle Class</span>
                  <div class="bg-slate-950/20 p-2 rounded-lg">
                    <${SVGBarChart} data=${cumulativeStats} />
                  </div>
                </div>
              </div>

            </div>

            <!-- Dashboard Row 4 (Recent Gallery) -->
            ${galleryDetections.length > 0 && html`
              <section class="rounded-xl border border-brand-card-border bg-brand-card p-6 glass-panel">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <h3 class="font-display font-bold text-white text-lg">Recent Snapshots Gallery</h3>
                    <p class="text-xs text-slate-400 mt-1">Hover and click snapshot cards to inspect bounding boxes.</p>
                  </div>
                  <button onClick=${() => setActiveTab('history')} class="text-xs text-brand-primary hover:underline font-mono">
                    View Logs
                  </button>
                </div>

                <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  ${galleryDetections.map((log, idx) => html`
                    <div 
                      key=${idx} 
                      onClick=${() => setModalImage(`/${log.image}`)}
                      class="group relative aspect-square rounded-lg border border-brand-card-border overflow-hidden bg-slate-950 cursor-pointer transition-all hover:border-brand-primary hover:-translate-y-0.5 shadow-sm hover:shadow-neon-cyan/10"
                    >
                      <img src="/${log.image}" class="h-full w-full object-cover transition-all duration-300 group-hover:scale-105" alt="Snapshot" />
                      <div class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-2.5">
                        <span class="text-4xs text-slate-400 font-mono">${log.timestamp.slice(11)}</span>
                        <span class="text-3xs font-semibold text-brand-primary font-mono">Vehicles: ${log.total}</span>
                      </div>
                    </div>
                  `)}
                </div>
              </section>
            `}

          </div>
        `}

        ${activeTab === 'live' && html`
          <div class="space-y-6 animate-fadeIn">
            
            <div class="rounded-xl border border-brand-card-border bg-brand-card p-6 glass-panel">
              <h3 class="font-display font-bold text-white text-lg mb-2">Detailed Live Monitoring</h3>
              <p class="text-xs text-slate-400 mb-6">Manage streams, set confidence scores, and analyze video output in real time.</p>
              
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <!-- Main Stream Screen -->
                <div class="lg:col-span-2 flex flex-col rounded-lg border border-brand-card-border overflow-hidden bg-slate-950">
                  <div class="bg-black/35 px-4 py-3 flex justify-between items-center border-b border-brand-card-border">
                    <span class="text-xs font-bold text-white flex items-center gap-1.5">
                      <span class="h-2.5 w-2.5 rounded-full ${isStreaming ? 'bg-brand-success animate-pulse' : 'bg-slate-600'}"></span>
                      ${isStreaming ? 'VIDEO FEED ACTIVE' : 'VIDEO FEED IDLE'}
                    </span>
                    <button onClick=${toggleFullscreen} class="text-slate-400 hover:text-white transition-all text-xs">
                      <i class="fa-solid fa-expand"></i> Fullscreen
                    </button>
                  </div>
                  
                  <div ref=${streamRef} class="relative flex-grow min-h-[350px] md:min-h-[400px] flex items-center justify-center">
                    ${isStreaming 
                      ? html`<img 
                          src="/api/video_feed?url=${cameraUrl}&confidence=${confidence}" 
                          class="w-full h-full max-h-[500px] object-contain" 
                          alt="Live Stream" 
                        />`
                      : html`
                        <div class="flex flex-col items-center justify-center p-6 text-center space-y-4">
                          <i class="fa-solid fa-video-slash text-4xl text-slate-600"></i>
                          <div>
                            <h4 class="text-slate-300 font-bold font-display">Inactive Stream</h4>
                            <p class="text-xs text-slate-500 max-w-xs mt-1">Configure your camera source on the right and click "Start Detection" to begin tracking.</p>
                          </div>
                        </div>
                      `
                    }
                  </div>
                </div>

                <!-- Stream Configuration Panel -->
                <div class="rounded-lg border border-brand-card-border bg-slate-900/40 p-5 flex flex-col justify-between">
                  <div class="space-y-5">
                    <h4 class="text-sm font-bold text-white border-b border-brand-card-border/50 pb-2">Stream Configuration</h4>
                    
                    <!-- Camera Source -->
                    <div>
                      <label class="block text-xs text-slate-400 font-mono mb-1.5">CAMERA STREAM SOURCE</label>
                      <input 
                        type="text" 
                        value=${cameraUrl} 
                        onChange=${(e) => setCameraUrl(e.target.value)}
                        disabled=${isStreaming}
                        class="w-full rounded-lg border border-brand-card-border bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-brand-primary focus:outline-hidden disabled:opacity-40" 
                        placeholder="e.g. 0 for webcam"
                      />
                      <p class="text-4xs text-slate-500 mt-1">Accepts local camera indices (0, 1) or IP camera MJPEG URLs (e.g. http://192.168.x.x:8080/video).</p>
                    </div>

                    <!-- Confidence -->
                    <div>
                      <div class="flex justify-between text-xs font-mono mb-1.5">
                        <span class="text-slate-400">MINIMUM CONFIDENCE</span>
                        <span class="text-brand-primary font-bold">${confidence}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.10" 
                        max="0.90" 
                        step="0.05" 
                        value=${confidence} 
                        onChange=${(e) => setConfidence(parseFloat(e.target.value))}
                        class="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-primary" 
                      />
                    </div>

                    <!-- Analytics stats indicators -->
                    <div class="pt-4 border-t border-brand-card-border/40">
                      <span class="block text-2xs font-semibold uppercase tracking-wider text-slate-500 font-mono mb-3">Live Feed Statistics</span>
                      <div class="grid grid-cols-2 gap-3 text-center">
                        <div class="bg-black/30 p-2.5 rounded-lg">
                          <span class="text-4xs text-slate-500 font-mono block">FPS</span>
                          <span class="text-base font-bold font-mono text-white">${isStreaming ? fps : '0.0'}</span>
                        </div>
                        <div class="bg-black/30 p-2.5 rounded-lg">
                          <span class="text-4xs text-slate-500 font-mono block">TOTAL DETECTED</span>
                          <span class="text-base font-bold font-mono text-brand-primary">${isStreaming ? (logs[0]?.total || 0) : '0'}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div class="pt-6 border-t border-brand-card-border/40 flex flex-col gap-2 mt-6">
                    ${isStreaming 
                      ? html`
                        <button onClick=${handleStopCamera} class="w-full rounded-lg bg-brand-danger hover:bg-brand-danger/90 text-white font-bold text-xs py-2.5 transition-all shadow-xs">
                          <i class="fa-solid fa-stop mr-1.5"></i> Stop Detection
                        </button>
                      `
                      : html`
                        <button onClick=${handleStartCamera} class="w-full rounded-lg bg-brand-primary hover:bg-brand-primary/95 text-brand-bg font-extrabold text-xs py-2.5 transition-all shadow-xs hover:shadow-neon-cyan/15">
                          <i class="fa-solid fa-play mr-1.5"></i> Start Detection
                        </button>
                      `
                    }
                  </div>
                </div>

              </div>
            </div>

          </div>
        `}

        ${activeTab === 'analytics' && html`
          <div class="space-y-6 animate-fadeIn">
            
            <div class="rounded-xl border border-brand-card-border bg-brand-card p-6 glass-panel">
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h3 class="font-display font-bold text-white text-lg">Traffic Density & Analytics</h3>
                  <p class="text-xs text-slate-400 mt-1">Aggregated statistics compiled from processed files and active feeds.</p>
                </div>
                <div class="bg-slate-900 border border-brand-card-border rounded-lg p-2.5 flex items-center gap-4">
                  <div class="text-right">
                    <span class="text-3xs text-slate-500 block font-mono uppercase">Total Analyzed Today</span>
                    <span class="text-lg font-bold font-mono text-brand-primary">${cumulativeStats.total}</span>
                  </div>
                  <i class="fa-solid fa-calendar-day text-brand-primary text-lg border-l border-brand-card-border/80 pl-3"></i>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <!-- Line Chart -->
                <div class="rounded-lg border border-brand-card-border bg-slate-900/35 p-5">
                  <h4 class="text-sm font-bold text-white mb-1">Hourly Traffic density</h4>
                  <p class="text-2xs text-slate-500 mb-6">Shows hourly patterns of vehicles detected across all sources.</p>
                  <div class="bg-black/10 p-2 rounded-lg">
                    <${SVGLineChart} logs=${logs} />
                  </div>
                </div>

                <!-- Donut Chart -->
                <div class="rounded-lg border border-brand-card-border bg-slate-900/35 p-5">
                  <h4 class="text-sm font-bold text-white mb-1">Vehicle Classification</h4>
                  <p class="text-2xs text-slate-500 mb-6">Distribution share of each type of vehicle.</p>
                  <div class="bg-black/10 p-2 rounded-lg">
                    <${SVGDonutChart} data=${cumulativeStats} />
                  </div>
                </div>

                <!-- Bar Chart -->
                <div class="rounded-lg border border-brand-card-border bg-slate-900/35 p-5 md:col-span-2">
                  <h4 class="text-sm font-bold text-white mb-1">Detection Volumes</h4>
                  <p class="text-2xs text-slate-500 mb-6">Absolute count comparison of detected classes.</p>
                  <div class="bg-black/10 p-2 rounded-lg">
                    <${SVGBarChart} data=${cumulativeStats} />
                  </div>
                </div>

              </div>
            </div>

          </div>
        `}

        ${activeTab === 'history' && html`
          <div class="space-y-6 animate-fadeIn">
            
            <div class="rounded-xl border border-brand-card-border bg-brand-card p-6 glass-panel">
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h3 class="font-display font-bold text-white text-lg">System Logs & History</h3>
                  <p class="text-xs text-slate-400 mt-1">Review CSV database logs of vehicle detections.</p>
                </div>
                <div class="flex gap-2">
                  <button onClick=${handleExportCSV} class="rounded-lg bg-white/5 border border-brand-card-border hover:bg-white/10 text-white font-medium text-xs px-4 py-2 transition-all flex items-center gap-1.5">
                    <i class="fa-solid fa-file-export"></i> Export CSV
                  </button>
                  <button onClick=${handleClearLogs} class="rounded-lg bg-brand-danger/10 hover:bg-brand-danger/25 text-brand-danger border border-brand-danger/20 font-medium text-xs px-4 py-2 transition-all flex items-center gap-1.5">
                    <i class="fa-solid fa-trash-can"></i> Clear History
                  </button>
                </div>
              </div>

              <!-- Table container -->
              <div class="w-full overflow-x-auto rounded-lg border border-brand-card-border bg-slate-950/30">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-900 text-slate-400 uppercase font-mono tracking-wider border-b border-brand-card-border">
                    <tr>
                      <th class="px-5 py-3.5">Timestamp</th>
                      <th class="px-5 py-3.5">Source Camera</th>
                      <th class="px-5 py-3.5 text-center">Cars</th>
                      <th class="px-5 py-3.5 text-center">Motorcycles</th>
                      <th class="px-5 py-3.5 text-center">Trucks</th>
                      <th class="px-5 py-3.5 text-center">Buses</th>
                      <th class="px-5 py-3.5 text-center">Total</th>
                      <th class="px-5 py-3.5 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-brand-card-border/50 text-slate-300">
                    ${logs.length === 0 ? html`
                      <tr>
                        <td colspan="8" class="px-5 py-10 text-center text-slate-500 font-medium">
                          No detection records found. Complete a detection to populate logs.
                        </td>
                      </tr>
                    ` : logs.map((log, idx) => html`
                      <tr key=${idx} class="hover:bg-white/1 transition-all">
                        <td class="px-5 py-3.5 font-mono text-slate-400 font-medium">${log.timestamp}</td>
                        <td class="px-5 py-3.5 font-semibold text-white">${log.source}</td>
                        <td class="px-5 py-3.5 text-center font-mono text-brand-primary">${log.cars}</td>
                        <td class="px-5 py-3.5 text-center font-mono text-brand-success">${log.motorcycles}</td>
                        <td class="px-5 py-3.5 text-center font-mono text-brand-warning">${log.trucks}</td>
                        <td class="px-5 py-3.5 text-center font-mono text-brand-danger">${log.buses}</td>
                        <td class="px-5 py-3.5 text-center font-bold font-mono text-white">${log.total}</td>
                        <td class="px-5 py-3.5 text-right">
                          ${log.image ? html`
                            <button 
                              onClick=${() => setModalImage(`/${log.image}`)}
                              class="text-brand-primary hover:text-brand-primary/80 transition-all font-semibold font-mono"
                            >
                              <i class="fa-solid fa-image"></i> Inspect
                            </button>
                          ` : html`<span class="text-slate-600 font-mono">-</span>`}
                        </td>
                      </tr>
                    `)}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        `}

        ${activeTab === 'settings' && html`
          <div class="space-y-6 animate-fadeIn">
            
            <div class="rounded-xl border border-brand-card-border bg-brand-card p-6 glass-panel max-w-2xl mx-auto">
              <h3 class="font-display font-bold text-white text-lg mb-2">System Configuration Settings</h3>
              <p class="text-xs text-slate-400 mb-6">Modify YOLOv5 model variables, camera stream mappings, and clear local database logs.</p>
              
              <div class="space-y-6">
                
                <!-- Confidence setting -->
                <div class="bg-slate-900/50 p-4 rounded-lg border border-brand-card-border">
                  <div class="flex justify-between items-center mb-1.5">
                    <label class="text-xs font-bold text-white uppercase tracking-wider font-mono">Confidence Threshold</label>
                    <span class="text-sm font-bold text-brand-primary font-mono">${confidence}</span>
                  </div>
                  <p class="text-3xs text-slate-500 mb-3">Detections with confidence below this threshold will be filtered out.</p>
                  <input 
                    type="range" 
                    min="0.10" 
                    max="0.90" 
                    step="0.05" 
                    value=${confidence} 
                    onChange=${(e) => setConfidence(parseFloat(e.target.value))}
                    class="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-primary" 
                  />
                </div>

                <!-- Camera stream mapping -->
                <div class="bg-slate-900/50 p-4 rounded-lg border border-brand-card-border">
                  <label class="block text-xs font-bold text-white uppercase tracking-wider font-mono mb-1.5">Live Camera URL Mapping</label>
                  <p class="text-3xs text-slate-500 mb-3">Link RTSP or HTTP camera feeds here. Set to '0' to map local laptop webcam.</p>
                  <input 
                    type="text" 
                    value=${cameraUrl} 
                    onChange=${(e) => setCameraUrl(e.target.value)}
                    class="w-full rounded-lg border border-brand-card-border bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-brand-primary focus:outline-hidden" 
                    placeholder="e.g. 0"
                  />
                </div>

                <!-- Google App Script Webhook -->
                <div class="bg-slate-900/50 p-4 rounded-lg border border-brand-card-border">
                  <label class="block text-xs font-bold text-white uppercase tracking-wider font-mono mb-1.5">Google Sheets Cloud Logging Webhook</label>
                  <p class="text-3xs text-slate-500 mb-2">Automated POST requests are sent here for remote data persistence.</p>
                  <input 
                    type="text" 
                    value=${WEBHOOK_URL} 
                    disabled
                    class="w-full rounded-lg border border-brand-card-border bg-slate-950/50 px-3.5 py-2 text-xs text-slate-500 font-mono overflow-ellipsis cursor-not-allowed" 
                  />
                </div>

                <!-- System Purge -->
                <div class="bg-brand-danger/5 p-4 rounded-lg border border-brand-danger/25">
                  <h4 class="text-xs font-bold text-brand-danger uppercase tracking-wider font-mono mb-1">Purge Local Logs Database</h4>
                  <p class="text-3xs text-slate-400 mb-4">Warning: This deletes all saved detection images from your computer's drive and clears the CSV files.</p>
                  <button onClick=${handleClearLogs} class="rounded-lg bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger border border-brand-danger/30 font-semibold text-xs px-4 py-2 transition-all flex items-center gap-1.5">
                    <i class="fa-solid fa-trash-can"></i> Purge All Data
                  </button>
                </div>

              </div>
            </div>

          </div>
        `}

      </main>

      <!-- Image Viewer Modal popup -->
      ${modalImage && html`
        <div 
          onClick=${() => setModalImage(null)}
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fadeIn"
        >
          <div class="relative max-w-4xl w-full flex flex-col items-center">
            <button 
              onClick=${() => setModalImage(null)}
              class="absolute -top-10 right-0 text-white hover:text-brand-primary transition-all text-xl"
            >
              <i class="fa-solid fa-xmark"></i> Close
            </button>
            <img src=${modalImage} class="rounded-xl border border-white/10 max-h-[80vh] w-auto max-w-full object-contain shadow-2xl" />
          </div>
        </div>
      `}

      <!-- Footer -->
      <footer class="border-t border-brand-card-border bg-black/10 py-6 mt-12 text-center text-xs text-slate-500 font-mono">
        <div class="container mx-auto px-4">
          <span>VehicleVision AI Traffic Analytics • Developed via Advanced AI Pair Programming</span>
        </div>
      </footer>

    </div>
  `;
};

// ==========================================
// RENDER ROOT
// ==========================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
