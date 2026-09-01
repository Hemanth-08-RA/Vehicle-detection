import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import htm from 'htm';

const html = htm.bind(React.createElement);

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzj7Y3Cg858enguXSXuq1k7CtDGRxkOl9Q6wmachbQGN9GWDkBRYCGNDyAD-ReHnVu2/exec";

// ==========================================
// SUB-COMPONENTS
// ==========================================

// Navigation Bar Component
const Navbar = ({ activeTab, setActiveTab, logCount }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'live', label: 'Live Stream', icon: 'fa-video' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-pie' },
    { id: 'history', label: 'History Logs', icon: 'fa-database', badge: logCount },
    { id: 'settings', label: 'Settings', icon: 'fa-sliders' }
  ];

  return html`
    <header class="sticky top-0 z-50 w-full border-b border-brand-card-border bg-brand-bg/85 backdrop-blur-xl transition-all">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <!-- Brand Logo -->
        <div class="flex items-center gap-3 cursor-pointer" onClick=${() => setActiveTab('dashboard')}>
          <div class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent shadow-neon-cyan transition-transform hover:scale-105">
            <i class="fa-solid fa-shield-cat text-brand-bg text-xl"></i>
            <span class="absolute -top-1 -right-1 flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
            </span>
          </div>
          <div class="flex flex-col">
            <span class="font-display text-xl font-black tracking-wider text-white">
              VehicleVision <span class="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">AI</span>
            </span>
            <span class="text-3xs font-mono text-slate-400 tracking-widest uppercase -mt-1">YOLOv5 Neural Engine</span>
          </div>
        </div>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center space-x-1 rounded-xl border border-brand-card-border bg-slate-950/60 p-1.5 backdrop-blur-md">
          ${tabs.map(tab => html`
            <button
              key=${tab.id}
              onClick=${() => setActiveTab(tab.id)}
              class="relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 text-brand-primary border border-brand-primary/30 shadow-neon-cyan/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }"
            >
              <i class="fa-solid ${tab.icon} ${activeTab === tab.id ? 'text-brand-primary' : 'text-slate-500'}"></i>
              ${tab.label}
              ${tab.badge > 0 && html`
                <span class="ml-1 rounded-full bg-brand-primary/20 px-1.5 py-0.5 text-4xs font-mono font-bold text-brand-primary border border-brand-primary/30">
                  ${tab.badge}
                </span>
              `}
            </button>
          `)}
        </nav>

        <!-- System Status Telemetry -->
        <div class="flex items-center gap-4">
          <div class="hidden sm:flex flex-col text-right">
            <div class="flex items-center justify-end gap-1.5">
              <span class="h-2 w-2 rounded-full bg-brand-success live-pulse"></span>
              <span class="text-3xs font-mono font-bold text-brand-success tracking-wider uppercase">NODE ONLINE</span>
            </div>
            <span class="text-3xs font-mono text-slate-400">${timeStr || 'LIVE'}</span>
          </div>

          <button 
            onClick=${() => setActiveTab('settings')}
            class="h-9 w-9 rounded-xl border border-brand-card-border bg-slate-900/80 flex items-center justify-center text-slate-300 hover:border-brand-primary hover:text-brand-primary hover:shadow-neon-cyan transition-all"
            title="System Settings"
          >
            <i class="fa-solid fa-gear text-sm"></i>
          </button>
        </div>

      </div>
    </header>
  `;
};

// Stat KPI Card
const StatCard = ({ title, count, icon, colorClass, shadowClass, gradientFrom, gradientTo, percentChange }) => {
  return html`
    <div class="glass-panel glass-panel-hover relative overflow-hidden rounded-2xl p-6 transition-all">
      <!-- Background Ambient Glow -->
      <div class="absolute -right-8 -bottom-8 h-32 w-32 rounded-full filter blur-2xl opacity-15 bg-gradient-to-br ${gradientFrom} ${gradientTo}"></div>
      
      <div class="flex items-center justify-between relative z-10">
        <div>
          <span class="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono">${title}</span>
          <h3 class="mt-2 text-4xl font-black tracking-tight text-white font-display">
            ${count}
          </h3>
          <div class="mt-2 flex items-center gap-1.5">
            <span class="inline-flex items-center text-3xs font-mono font-semibold text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-full border border-brand-success/20">
              <i class="fa-solid fa-arrow-trend-up text-4xs mr-1"></i> Active Tracked
            </span>
          </div>
        </div>

        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900/90 border border-brand-card-border text-2xl ${colorClass} ${shadowClass} transition-transform group-hover:scale-110">
          <i class="fa-solid ${icon}"></i>
        </div>
      </div>
    </div>
  `;
};

// Traffic Density Meter Component
const TrafficDensityCard = ({ totalCount }) => {
  let density = "LOW";
  let color = "text-brand-success";
  let borderColor = "border-brand-success/30";
  let bgGradient = "from-brand-success/10 to-emerald-950/20";
  let percentage = Math.min((totalCount / 10) * 100, 100);
  let statusText = "Optimal Flow - No Congestion Detected";

  if (totalCount > 6) {
    density = "HIGH";
    color = "text-brand-danger";
    borderColor = "border-brand-danger/30";
    bgGradient = "from-brand-danger/10 to-rose-950/20";
    statusText = "Heavy Congestion - Potential Delay Alert";
  } else if (totalCount > 2) {
    density = "MEDIUM";
    color = "text-brand-warning";
    borderColor = "border-brand-warning/30";
    bgGradient = "from-brand-warning/10 to-amber-950/20";
    statusText = "Moderate Traffic - Constant Speed Flow";
  }

  return html`
    <div class="glass-panel glass-panel-hover relative overflow-hidden rounded-2xl p-6 border ${borderColor} bg-gradient-to-br ${bgGradient} transition-all">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="flex h-3 w-3 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${totalCount > 6 ? 'bg-brand-danger' : totalCount > 2 ? 'bg-brand-warning' : 'bg-brand-success'}"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 ${totalCount > 6 ? 'bg-brand-danger' : totalCount > 2 ? 'bg-brand-warning' : 'bg-brand-success'}"></span>
          </span>
          <h3 class="font-display font-extrabold text-white text-base">Traffic Density Index</h3>
        </div>
        <span class="font-mono text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border bg-slate-950/80 ${color} ${borderColor}">
          ${density} DENSITY
        </span>
      </div>

      <!-- Meter Gauge Progress Bar -->
      <div class="space-y-2 my-4">
        <div class="flex justify-between text-xs font-mono">
          <span class="text-slate-400">Current Occupancy</span>
          <span class="font-bold ${color}">${totalCount} Vehicles Detected</span>
        </div>
        <div class="h-3 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-brand-card-border">
          <div 
            class="h-full rounded-full transition-all duration-500 bg-gradient-to-r ${totalCount > 6 ? 'from-brand-warning to-brand-danger shadow-neon-rose' : totalCount > 2 ? 'from-brand-primary to-brand-warning' : 'from-brand-primary to-brand-success shadow-neon-emerald'}"
            style="width: ${Math.max(percentage, 8)}%"
          ></div>
        </div>
      </div>

      <p class="text-2xs font-mono text-slate-400 flex items-center gap-1.5 mt-3">
        <i class="fa-solid fa-circle-info ${color}"></i>
        ${statusText}
      </p>
    </div>
  `;
};

// SVG Donut Classification Chart Component
const SVGDonutChart = ({ data }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const safeData = total === 0 ? { car: 1, motorcycle: 1, truck: 1, bus: 1 } : data;
  const safeTotal = total === 0 ? 4 : total;

  const classes = [
    { key: 'car', label: 'Cars', color: '#00F5FF', count: data.car || 0 },
    { key: 'motorcycle', label: 'Motorcycles', color: '#10B981', count: data.motorcycle || 0 },
    { key: 'truck', label: 'Trucks', color: '#F59E0B', count: data.truck || 0 },
    { key: 'bus', label: 'Buses', color: '#F43F5E', count: data.bus || 0 }
  ];

  const radius = 55;
  const circ = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return html`
    <div class="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
      <!-- Donut Graphic -->
      <div class="relative h-44 w-44 flex items-center justify-center">
        <svg class="h-full w-full -rotate-90 transform" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="${radius}" stroke="rgba(255,255,255,0.05)" stroke-width="16" fill="transparent" />
          ${classes.map((cls) => {
            const val = safeData[cls.key] || 0;
            const strokeDasharray = `${(val / safeTotal) * circ} ${circ}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += (val / safeTotal) * circ;
            return html`
              <circle
                key=${cls.key}
                cx="70"
                cy="70"
                r="${radius}"
                stroke="${cls.color}"
                stroke-width="16"
                stroke-dasharray="${strokeDasharray}"
                stroke-dashoffset="${strokeDashoffset}"
                stroke-linecap="round"
                fill="transparent"
                class="transition-all duration-700 hover:opacity-80 cursor-pointer"
              />
            `;
          })}
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span class="text-3xs font-mono uppercase tracking-widest text-slate-400">Total</span>
          <span class="text-3xl font-black font-display text-white">${total}</span>
          <span class="text-4xs font-mono text-brand-primary">VEHICLES</span>
        </div>
      </div>

      <!-- Legend Tags -->
      <div class="grid grid-cols-2 sm:grid-cols-1 gap-3 w-full sm:w-auto">
        ${classes.map(cls => {
          const pct = total > 0 ? ((cls.count / total) * 100).toFixed(1) : 0;
          return html`
            <div key=${cls.key} class="flex items-center justify-between gap-4 rounded-xl border border-brand-card-border bg-slate-950/60 px-3.5 py-2 font-mono">
              <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-md inline-block shadow-xs" style="background-color: ${cls.color}"></span>
                <span class="text-xs font-semibold text-slate-300">${cls.label}</span>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold text-white">${cls.count}</span>
                <span class="text-4xs text-slate-500 ml-1">(${pct}%)</span>
              </div>
            </div>
          `;
        })}
      </div>
    </div>
  `;
};

// SVG Line Chart Component for Hourly Density
const SVGLineChart = ({ logs }) => {
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const defaultData = [12, 18, 28, 22, 35, 45, 16];
  let data = [...defaultData];

  if (logs && logs.length > 0) {
    const hourCounts = { '08': 0, '10': 0, '12': 0, '14': 0, '16': 0, '18': 0, '20': 0 };
    logs.forEach(log => {
      if (log.timestamp) {
        const matches = log.timestamp.match(/(\d{2}):/);
        if (matches) {
          const hour = matches[1];
          if (hourCounts.hasOwnProperty(hour)) {
            hourCounts[hour] += log.total || 0;
          }
        }
      }
    });

    const parsedData = hours.map(h => {
      const key = h.split(':')[0];
      return hourCounts[key] || 0;
    });

    if (parsedData.some(val => val > 0)) {
      data = parsedData;
    }
  }

  const width = 500;
  const height = 160;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxVal = Math.max(...data, 10);

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const fillPathD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return html`
    <div class="w-full overflow-x-auto">
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto max-h-[180px]">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00F5FF" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#00F5FF" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#00F5FF" />
            <stop offset="50%" stop-color="#3B82F6" />
            <stop offset="100%" stop-color="#8B5CF6" />
          </linearGradient>
        </defs>

        <!-- Grid Lines -->
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />
        <line x1="${padding}" y1="${padding + chartHeight / 2}" x2="${width - padding}" y2="${padding + chartHeight / 2}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.08)" />

        <!-- Gradient Fill -->
        <path d="${fillPathD}" fill="url(#lineGrad)" />

        <!-- Smooth Path Line -->
        <path d="${pathD}" fill="none" stroke="url(#strokeGrad)" stroke-width="3" stroke-linecap="round" />

        <!-- Data Circles & Labels -->
        ${points.map((p, idx) => html`
          <g key=${idx}>
            <circle cx="${p.x}" cy="${p.y}" r="4" fill="#070B14" stroke="#00F5FF" stroke-width="2" class="hover:r-6 transition-all cursor-pointer" />
            <text x="${p.x}" y="${height - 8}" text-anchor="middle" fill="#64748B" font-size="10" font-family="Share Tech Mono">${hours[idx]}</text>
            <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" fill="#00F5FF" font-size="10" font-family="Share Tech Mono" font-weight="bold">${p.val}</text>
          </g>
        `)}
      </svg>
    </div>
  `;
};

// SVG Bar Chart Component for Class Comparison
const SVGBarChart = ({ data }) => {
  const categories = ['Cars', 'Motorcycles', 'Trucks', 'Buses'];
  const values = [data.car || 0, data.motorcycle || 0, data.truck || 0, data.bus || 0];
  const maxVal = Math.max(...values, 5);

  const colors = ['#00F5FF', '#10B981', '#F59E0B', '#F43F5E'];

  const width = 500;
  const height = 160;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const barWidth = 50;
  const spacing = (chartWidth - barWidth * categories.length) / (categories.length - 1);

  return html`
    <div class="w-full overflow-x-auto">
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto max-h-[180px]">
        <!-- Baseline -->
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.08)" />

        ${categories.map((cat, idx) => {
          const val = values[idx];
          const x = padding + idx * (barWidth + spacing);
          const barHeight = (val / maxVal) * chartHeight;
          const y = height - padding - barHeight;

          return html`
            <g key=${cat}>
              <!-- Background Bar track -->
              <rect x="${x}" y="${padding}" width="${barWidth}" height="${chartHeight}" rx="6" fill="rgba(255,255,255,0.03)" />
              
              <!-- Value Bar -->
              <rect 
                x="${x}" 
                y="${y}" 
                width="${barWidth}" 
                height="${barHeight}" 
                rx="6" 
                fill="${colors[idx]}" 
                opacity="0.85"
                class="transition-all duration-500 hover:opacity-100 cursor-pointer"
              />
              
              <!-- Value label -->
              <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" fill="${colors[idx]}" font-size="11" font-family="Share Tech Mono" font-weight="bold">${val}</text>
              
              <!-- Category label -->
              <text x="${x + barWidth / 2}" y="${height - 8}" text-anchor="middle" fill="#94A3B8" font-size="10" font-family="Share Tech Mono">${cat}</text>
            </g>
          `;
        })}
      </svg>
    </div>
  `;
};

// MAIN APPLICATION COMPONENT
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  
  // Settings & Stream config
  const [cameraUrl, setCameraUrl] = useState('0');
  const [confidence, setConfidence] = useState(0.25);
  const [isStreaming, setIsStreaming] = useState(false);
  const [fps, setFps] = useState(30);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Upload States
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadResultImage, setUploadResultImage] = useState(null);
  const [uploadStats, setUploadStats] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [alert, setAlert] = useState(null);

  // Cumulative Analytics Counter
  const [cumulativeStats, setCumulativeStats] = useState({ car: 0, motorcycle: 0, truck: 0, bus: 0, total: 0 });

  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const triggerAlert = (message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);

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

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let interval;
    if (isStreaming) {
      interval = setInterval(() => {
        fetchLogs();
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

  // 1-Click Sample Image Selector
  const loadSampleImage = async (samplePath) => {
    try {
      setIsUploading(true);
      const response = await fetch(samplePath);
      const blob = await response.blob();
      const filename = samplePath.split('/').pop();
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
      processSelectedFile(file);
      triggerAlert(`Sample image "${filename}" loaded. Click "Run AI Detection" to process!`, "success");
    } catch (e) {
      triggerAlert("Failed to load sample image.");
    } finally {
      setIsUploading(false);
    }
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

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadResultImage(data.image);
        setUploadStats(data.counts);
        triggerAlert(`AI Detection complete! Found ${data.counts.total} vehicles.`, "success");
        fetchLogs();
      } else {
        triggerAlert(data.detail || "Detection failed.");
      }
    } catch (e) {
      triggerAlert("Server error while processing image detection.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartCamera = () => {
    setIsStreaming(true);
    triggerAlert("Camera feed initialized. Tracking active vehicles...", "success");
  };

  const handleStopCamera = async () => {
    setIsStreaming(false);
    try {
      await fetch("/api/stop_feeds", { method: "POST" });
      triggerAlert("Camera feed stopped.", "success");
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all detection history logs and saved image snapshots?")) {
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
    link.setAttribute("download", `vehicle_vision_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const galleryDetections = logs.filter(log => log.image && log.total > 0).slice(0, 6);

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.timestamp && log.timestamp.toLowerCase().includes(q)) ||
      (log.source && log.source.toLowerCase().includes(q)) ||
      (log.total && log.total.toString().includes(q))
    );
  });

  return html`
    <div class="min-h-screen flex flex-col font-sans">
      
      <!-- Top Navigation Header -->
      <${Navbar} activeTab=${activeTab} setActiveTab=${setActiveTab} logCount=${logs.length} />
      
      <!-- Alert Toast Banner -->
      ${alert && html`
        <div class="fixed top-20 right-6 z-50 rounded-2xl border glass-panel p-4 flex items-center gap-3 transition-all duration-300 shadow-2xl animate-fadeIn ${
          alert.type === 'success' 
            ? 'border-brand-success/40 bg-brand-success/15 text-brand-success shadow-neon-emerald' 
            : 'border-brand-danger/40 bg-brand-danger/15 text-brand-danger shadow-neon-rose'
        }">
          <i class="fa-solid ${alert.type === 'success' ? 'fa-circle-check text-xl' : 'fa-triangle-exclamation text-xl'}"></i>
          <span class="font-medium text-xs tracking-wide">${alert.message}</span>
        </div>
      `}

      <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Hero Header Section -->
        <section class="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3.5 py-1 text-3xs font-mono font-bold tracking-wider uppercase text-brand-primary mb-3">
              <span class="h-2 w-2 rounded-full bg-brand-primary inline-block live-pulse"></span>
              YOLOv5 Neural Object Recognition
            </div>
            <h1 class="font-display text-4xl sm:text-5xl font-black tracking-tight text-white">
              Real-Time Vehicle Vision <br />
              <span class="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
                & Intelligent Traffic Analytics
              </span>
            </h1>
            <p class="mt-3 max-w-2xl text-xs sm:text-sm text-slate-400">
              Autonomous computer vision dashboard for real-time tracking, vehicle classification (Cars, Motorcycles, Trucks, Buses), and traffic density forecasting.
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-3">
            <button 
              onClick=${() => setActiveTab('live')}
              class="btn-shimmer rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-brand-bg font-extrabold text-xs px-5 py-3 shadow-neon-cyan transition-all hover:scale-105 flex items-center gap-2"
            >
              <i class="fa-solid fa-circle-play text-sm"></i> Launch Live Feed
            </button>
          </div>
        </section>

        <!-- DASHBOARD TAB CONTENT -->
        ${activeTab === 'dashboard' && html`
          <div class="space-y-8 animate-fadeIn">
            
            <!-- Statistics KPI Cards -->
            <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <${StatCard} 
                title="Cars Tracked" 
                count=${cumulativeStats.car} 
                icon="fa-car" 
                colorClass="text-brand-primary" 
                shadowClass="shadow-neon-cyan"
                gradientFrom="from-brand-primary"
                gradientTo="to-brand-secondary"
              />
              <${StatCard} 
                title="Motorcycles" 
                count=${cumulativeStats.motorcycle} 
                icon="fa-motorcycle" 
                colorClass="text-brand-success" 
                shadowClass="shadow-neon-emerald"
                gradientFrom="from-brand-success"
                gradientTo="to-emerald-700"
              />
              <${StatCard} 
                title="Trucks Tracked" 
                count=${cumulativeStats.truck} 
                icon="fa-truck-front" 
                colorClass="text-brand-warning" 
                shadowClass="shadow-neon-purple"
                gradientFrom="from-brand-warning"
                gradientTo="to-amber-700"
              />
              <${StatCard} 
                title="Buses Tracked" 
                count=${cumulativeStats.bus} 
                icon="fa-bus-simple" 
                colorClass="text-brand-danger" 
                shadowClass="shadow-neon-rose"
                gradientFrom="from-brand-danger"
                gradientTo="to-rose-700"
              />
            </div>

            <!-- Live Monitoring & Density Index Row -->
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              <!-- Video Stream Viewer -->
              <div class="lg:col-span-2 flex flex-col rounded-2xl border border-brand-card-border bg-brand-card overflow-hidden glass-panel glass-panel-hover">
                <div class="flex items-center justify-between border-b border-brand-card-border px-6 py-4 bg-slate-950/40">
                  <div class="flex items-center gap-3">
                    <span class="flex h-3.5 w-3.5 items-center justify-center">
                      <span class="absolute inline-flex h-3 w-3 rounded-full opacity-75 ${isStreaming ? 'bg-brand-danger animate-ping' : 'bg-slate-600'}"></span>
                      <span class="relative inline-flex h-2 w-2 rounded-full ${isStreaming ? 'bg-brand-danger' : 'bg-slate-500'}"></span>
                    </span>
                    <h3 class="font-display font-bold text-white text-base">Live Video Monitor</h3>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    ${isStreaming && html`
                      <span class="rounded-full bg-slate-900 border border-brand-card-border px-3 py-1 text-3xs font-mono text-brand-primary">
                        FPS: ${fps} | YOLOv5n Active
                      </span>
                    `}
                    <button onClick=${toggleFullscreen} class="h-8 w-8 rounded-lg border border-brand-card-border bg-white/5 text-slate-400 hover:text-white hover:border-brand-primary transition-all flex items-center justify-center" title="Fullscreen View">
                      <i class="fa-solid fa-expand text-xs"></i>
                    </button>
                  </div>
                </div>

                <div ref=${streamRef} class="relative flex-grow bg-slate-950 flex items-center justify-center min-h-[320px] overflow-hidden">
                  ${isStreaming 
                    ? html`<img 
                        src="/api/video_feed?url=${cameraUrl}&confidence=${confidence}" 
                        class="w-full h-full max-h-[440px] object-contain" 
                        alt="Live Camera Stream" 
                      />`
                    : html`
                      <!-- Standby Screen -->
                      <div class="flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div class="relative flex items-center justify-center h-20 w-20 rounded-2xl border border-dashed border-brand-primary/40 text-brand-primary bg-brand-primary/5">
                          <i class="fa-solid fa-video-slash text-3xl"></i>
                        </div>
                        <div class="max-w-xs">
                          <h4 class="text-white font-bold font-display text-base">Camera Stream Standby</h4>
                          <p class="text-xs text-slate-400 mt-1">Select a video preset or camera index below and click Start Monitoring.</p>
                        </div>
                      </div>
                    `
                  }
                </div>

                <div class="border-t border-brand-card-border px-6 py-4 flex flex-wrap gap-4 items-center justify-between bg-slate-950/60">
                  <!-- Stream Presets -->
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-3xs font-mono text-slate-400 uppercase">Presets:</span>
                    <button onClick=${() => setCameraUrl('0')} class="rounded-lg bg-slate-900 border border-brand-card-border px-2.5 py-1 text-3xs font-mono text-slate-300 hover:border-brand-primary hover:text-white transition-all">Webcam 0</button>
                    <button onClick=${() => setCameraUrl('./video/Video1.mp4')} class="rounded-lg bg-slate-900 border border-brand-card-border px-2.5 py-1 text-3xs font-mono text-slate-300 hover:border-brand-primary hover:text-white transition-all">Traffic 1</button>
                    <button onClick=${() => setCameraUrl('./video/Video2.mp4')} class="rounded-lg bg-slate-900 border border-brand-card-border px-2.5 py-1 text-3xs font-mono text-slate-300 hover:border-brand-primary hover:text-white transition-all">Traffic 2</button>
                  </div>

                  <div class="flex gap-3">
                    ${isStreaming 
                      ? html`
                        <button onClick=${handleStopCamera} class="rounded-xl bg-brand-danger hover:bg-brand-danger/90 text-white font-bold text-xs px-5 py-2.5 flex items-center gap-2 transition-all shadow-neon-rose/30">
                          <i class="fa-solid fa-stop"></i> Stop Stream
                        </button>
                      `
                      : html`
                        <button onClick=${handleStartCamera} class="btn-shimmer rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-brand-bg font-extrabold text-xs px-5 py-2.5 flex items-center gap-2 transition-all shadow-neon-cyan">
                          <i class="fa-solid fa-play"></i> Start Stream
                        </button>
                      `
                    }
                  </div>
                </div>
              </div>

              <!-- Traffic Density & Controls -->
              <div class="flex flex-col gap-6">
                <${TrafficDensityCard} totalCount=${isStreaming ? (logs[0]?.total || 0) : 0} />
                
                <!-- Quick Settings Card -->
                <div class="glass-panel glass-panel-hover rounded-2xl p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 class="font-display font-bold text-white mb-4 text-base">Quick Controls</h3>
                    
                    <div class="space-y-5">
                      <!-- Confidence threshold slider -->
                      <div>
                        <div class="flex justify-between text-xs mb-1.5 font-mono">
                          <span class="text-slate-400">Confidence Cutoff</span>
                          <span class="text-brand-primary font-bold font-mono">${(confidence * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.10" 
                          max="0.90" 
                          step="0.05" 
                          value=${confidence} 
                          onChange=${(e) => setConfidence(parseFloat(e.target.value))}
                          class="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-primary border border-brand-card-border" 
                        />
                      </div>

                      <!-- Stream Input -->
                      <div>
                        <label class="block text-3xs font-mono text-slate-400 uppercase mb-1.5">Stream Source URL / Path</label>
                        <input 
                          type="text" 
                          value=${cameraUrl} 
                          onChange=${(e) => setCameraUrl(e.target.value)}
                          disabled=${isStreaming}
                          class="w-full rounded-xl border border-brand-card-border bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:border-brand-primary focus:outline-none disabled:opacity-50 font-mono" 
                          placeholder="e.g. 0 or video path"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="border-t border-brand-card-border pt-4 mt-6 flex justify-between gap-3">
                    <button onClick=${() => setActiveTab('settings')} class="rounded-xl bg-white/5 border border-brand-card-border hover:bg-white/10 text-white font-medium text-xs px-4 py-2 transition-all">
                      All Settings
                    </button>
                    <button onClick=${handleClearLogs} class="rounded-xl bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger font-medium text-xs px-4 py-2 border border-brand-danger/30 transition-all">
                      Clear Logs
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <!-- Upload Area & Analytics Preview Row -->
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              
              <!-- Image Upload Box -->
              <div class="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-display font-bold text-white text-lg">Image Detection Suite</h3>
                    <span class="text-3xs font-mono text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full border border-brand-primary/20">YOLOv5 Static Engine</span>
                  </div>
                  <p class="text-xs text-slate-400 mb-4">Upload custom traffic images or choose a sample snapshot below.</p>

                  <!-- 1-Click Sample Image Selector -->
                  <div class="mb-4">
                    <span class="text-3xs font-mono uppercase text-slate-400 block mb-2">Instant Test Samples:</span>
                    <div class="flex flex-wrap gap-2">
                      <button onClick=${() => loadSampleImage('./image/Bus2.jpeg')} class="rounded-lg bg-slate-900 border border-brand-card-border px-3 py-1.5 text-xs text-slate-300 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-1.5">
                        <i class="fa-solid fa-bus text-brand-danger"></i> Bus Sample 1
                      </button>
                      <button onClick=${() => loadSampleImage('./image/car.jpeg')} class="rounded-lg bg-slate-900 border border-brand-card-border px-3 py-1.5 text-xs text-slate-300 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-1.5">
                        <i class="fa-solid fa-car text-brand-primary"></i> Car Sample
                      </button>
                      <button onClick=${() => loadSampleImage('./image/Bus13.jpeg')} class="rounded-lg bg-slate-900 border border-brand-card-border px-3 py-1.5 text-xs text-slate-300 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-1.5">
                        <i class="fa-solid fa-bus text-brand-warning"></i> Bus Sample 2
                      </button>
                    </div>
                  </div>
                  
                  <!-- Drag & Drop Zone -->
                  <div 
                    onDragOver=${handleDragOver}
                    onDrop=${handleDrop}
                    onClick=${() => fileInputRef.current.click()}
                    class="relative border-2 border-dashed border-brand-card-border hover:border-brand-primary/60 bg-slate-950/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-white/1"
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
                        <div class="flex flex-wrap gap-4 w-full justify-center">
                          <div class="flex flex-col items-center">
                            <span class="text-3xs text-slate-400 mb-1 font-mono">Original</span>
                            <img src=${uploadPreview} class="h-32 object-contain rounded-xl border border-brand-card-border shadow-md" />
                          </div>
                          ${uploadResultImage && html`
                            <div class="flex flex-col items-center">
                              <span class="text-3xs text-brand-primary mb-1 font-mono">AI Bounding Boxes</span>
                              <img src=${uploadResultImage} class="h-32 object-contain rounded-xl border border-brand-primary/40 shadow-neon-cyan" />
                            </div>
                          `}
                        </div>
                      `
                      : html`
                        <div class="h-14 w-14 rounded-2xl bg-slate-900 border border-brand-card-border flex items-center justify-center text-brand-primary text-2xl shadow-xs">
                          <i class="fa-solid fa-cloud-arrow-up"></i>
                        </div>
                        <div class="text-center">
                          <span class="text-xs text-white font-bold">Click to upload image</span>
                          <span class="text-xs text-slate-400"> or drag and drop</span>
                          <p class="text-3xs text-slate-500 mt-1">Supports PNG, JPG, JPEG up to 15MB</p>
                        </div>
                      `
                    }
                  </div>

                  <!-- Upload Detection Summary Pills -->
                  ${uploadStats && html`
                    <div class="mt-5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 p-4 animate-fadeIn">
                      <h4 class="text-xs font-bold text-brand-primary uppercase tracking-wider font-mono mb-2">Detection Results</h4>
                      <div class="grid grid-cols-4 gap-2 text-center">
                        <div class="bg-slate-950/60 p-2 rounded-lg border border-brand-primary/20">
                          <div class="text-slate-400 text-3xs font-mono">CARS</div>
                          <div class="text-brand-primary font-black text-sm font-mono">${uploadStats.car}</div>
                        </div>
                        <div class="bg-slate-950/60 p-2 rounded-lg border border-brand-success/20">
                          <div class="text-slate-400 text-3xs font-mono">MC</div>
                          <div class="text-brand-success font-black text-sm font-mono">${uploadStats.motorcycle}</div>
                        </div>
                        <div class="bg-slate-950/60 p-2 rounded-lg border border-brand-warning/20">
                          <div class="text-slate-400 text-3xs font-mono">TRUCKS</div>
                          <div class="text-brand-warning font-black text-sm font-mono">${uploadStats.truck}</div>
                        </div>
                        <div class="bg-slate-950/60 p-2 rounded-lg border border-brand-danger/20">
                          <div class="text-slate-400 text-3xs font-mono">BUSES</div>
                          <div class="text-brand-danger font-black text-sm font-mono">${uploadStats.bus}</div>
                        </div>
                      </div>
                      <div class="text-center text-xs mt-3 text-white font-bold font-mono">
                        Total Count: <span class="text-brand-primary font-black">${uploadStats.total}</span> Vehicles
                      </div>
                    </div>
                  `}

                </div>

                <div class="flex gap-3 mt-6 border-t border-brand-card-border pt-4">
                  ${uploadPreview && html`
                    <button 
                      onClick=${() => { setUploadPreview(null); setUploadResultImage(null); setUploadStats(null); }}
                      class="flex-1 rounded-xl bg-white/5 border border-brand-card-border hover:bg-white/10 text-white font-medium text-xs py-2.5 transition-all"
                    >
                      Clear Image
                    </button>
                  `}
                  <button 
                    onClick=${handleDetectUpload}
                    disabled=${isUploading || !uploadPreview}
                    class="btn-shimmer flex-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-40 text-brand-bg font-black text-xs py-2.5 flex items-center justify-center gap-2 transition-all shadow-neon-cyan"
                  >
                    ${isUploading ? html`
                      <i class="fa-solid fa-spinner animate-spin"></i> Processing Neural Engine...
                    ` : html`
                      <i class="fa-solid fa-microchip"></i> Run AI Detection
                    `}
                  </button>
                </div>
              </div>

              <!-- Live Analytics Donut Chart -->
              <div class="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="font-display font-bold text-white text-lg">Vehicle Distribution</h3>
                    <button onClick=${() => setActiveTab('analytics')} class="text-xs text-brand-primary hover:underline font-mono">
                      Full Analytics <i class="fa-solid fa-chevron-right text-3xs"></i>
                    </button>
                  </div>
                  
                  <div class="bg-slate-950/60 rounded-2xl p-4 border border-brand-card-border">
                    <${SVGDonutChart} data=${cumulativeStats} />
                  </div>
                </div>

                <div class="mt-4">
                  <span class="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 block">Detections by Vehicle Class</span>
                  <div class="bg-slate-950/40 p-3 rounded-xl border border-brand-card-border">
                    <${SVGBarChart} data=${cumulativeStats} />
                  </div>
                </div>
              </div>

            </div>

            <!-- Recent Gallery Grid -->
            ${galleryDetections.length > 0 && html`
              <section class="glass-panel rounded-2xl p-6">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <h3 class="font-display font-bold text-white text-lg">Recent Detection Snapshots</h3>
                    <p class="text-xs text-slate-400 mt-0.5">Click any thumbnail image to view fullscreen bounding box inspect.</p>
                  </div>
                  <button onClick=${() => setActiveTab('history')} class="text-xs text-brand-primary font-mono hover:underline">
                    View All History Logs (${logs.length})
                  </button>
                </div>

                <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  ${galleryDetections.map((log, idx) => html`
                    <div 
                      key=${idx} 
                      onClick=${() => setModalImage(`/${log.image}`)}
                      class="group relative aspect-square rounded-xl border border-brand-card-border overflow-hidden bg-slate-950 cursor-pointer transition-all hover:border-brand-primary hover:shadow-neon-cyan"
                    >
                      <img src="/${log.image}" class="h-full w-full object-cover transition-all duration-300 group-hover:scale-110" alt="Snapshot" />
                      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-2.5">
                        <span class="text-4xs text-slate-400 font-mono">${log.timestamp.slice(11)}</span>
                        <span class="text-3xs font-bold text-brand-primary font-mono">${log.total} Vehicles</span>
                      </div>
                    </div>
                  `)}
                </div>
              </section>
            `}

          </div>
        `}

        <!-- LIVE STREAM TAB CONTENT -->
        ${activeTab === 'live' && html`
          <div class="space-y-6 animate-fadeIn">
            <div class="glass-panel rounded-2xl p-6">
              <h3 class="font-display font-bold text-white text-xl mb-2">Live Camera Monitoring Studio</h3>
              <p class="text-xs text-slate-400 mb-6">Stream high-resolution live video feeds with continuous YOLOv5 bounding box tracking.</p>
              
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Video Monitor Screen -->
                <div class="lg:col-span-2 flex flex-col rounded-2xl border border-brand-card-border overflow-hidden bg-slate-950 shadow-2xl">
                  <div class="bg-slate-900/80 px-5 py-3.5 flex justify-between items-center border-b border-brand-card-border">
                    <div class="flex items-center gap-2">
                      <span class="h-2.5 w-2.5 rounded-full ${isStreaming ? 'bg-brand-success live-pulse' : 'bg-slate-600'}"></span>
                      <span class="text-xs font-mono font-bold text-white">${isStreaming ? 'STREAM ONLINE' : 'STREAM STANDBY'}</span>
                    </div>
                    <button onClick=${toggleFullscreen} class="text-slate-400 hover:text-white font-mono text-xs flex items-center gap-1">
                      <i class="fa-solid fa-expand"></i> Fullscreen
                    </button>
                  </div>
                  
                  <div ref=${streamRef} class="relative flex-grow min-h-[380px] md:min-h-[440px] flex items-center justify-center bg-black">
                    ${isStreaming 
                      ? html`<img 
                          src="/api/video_feed?url=${cameraUrl}&confidence=${confidence}" 
                          class="w-full h-full max-h-[520px] object-contain" 
                          alt="Live Feed Stream" 
                        />`
                      : html`
                        <div class="flex flex-col items-center justify-center p-8 text-center space-y-4">
                          <i class="fa-solid fa-video-slash text-5xl text-slate-600"></i>
                          <div>
                            <h4 class="text-white font-bold font-display text-lg">Stream Inactive</h4>
                            <p class="text-xs text-slate-400 max-w-xs mt-1">Configure your stream parameters and click "Start Detection".</p>
                          </div>
                        </div>
                      `
                    }
                  </div>
                </div>

                <!-- Stream Settings Panel -->
                <div class="rounded-2xl border border-brand-card-border bg-slate-950/60 p-6 flex flex-col justify-between">
                  <div class="space-y-5">
                    <h4 class="text-sm font-bold text-white border-b border-brand-card-border pb-3 uppercase font-mono tracking-wider">Stream Parameters</h4>
                    
                    <div>
                      <label class="block text-3xs text-slate-400 font-mono mb-2">CAMERA STREAM SOURCE</label>
                      <input 
                        type="text" 
                        value=${cameraUrl} 
                        onChange=${(e) => setCameraUrl(e.target.value)}
                        disabled=${isStreaming}
                        class="w-full rounded-xl border border-brand-card-border bg-slate-900 px-4 py-2.5 text-xs text-white focus:border-brand-primary focus:outline-none disabled:opacity-50 font-mono" 
                        placeholder="e.g. 0 or RTSP stream"
                      />
                    </div>

                    <div>
                      <div class="flex justify-between text-xs font-mono mb-2">
                        <span class="text-slate-400">MIN CONFIDENCE</span>
                        <span class="text-brand-primary font-bold">${(confidence * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.10" 
                        max="0.90" 
                        step="0.05" 
                        value=${confidence} 
                        onChange=${(e) => setConfidence(parseFloat(e.target.value))}
                        class="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-brand-primary" 
                      />
                    </div>

                    <div class="pt-4 border-t border-brand-card-border">
                      <span class="block text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">Live Feed Telemetry</span>
                      <div class="grid grid-cols-2 gap-3 text-center">
                        <div class="bg-slate-900 p-3 rounded-xl border border-brand-card-border">
                          <span class="text-4xs text-slate-500 font-mono block">FPS</span>
                          <span class="text-lg font-bold font-mono text-white">${isStreaming ? fps : '0'}</span>
                        </div>
                        <div class="bg-slate-900 p-3 rounded-xl border border-brand-card-border">
                          <span class="text-4xs text-slate-500 font-mono block">LIVE COUNT</span>
                          <span class="text-lg font-bold font-mono text-brand-primary">${isStreaming ? (logs[0]?.total || 0) : '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="pt-6 border-t border-brand-card-border mt-6">
                    ${isStreaming 
                      ? html`
                        <button onClick=${handleStopCamera} class="w-full rounded-xl bg-brand-danger hover:bg-brand-danger/90 text-white font-bold text-xs py-3 transition-all shadow-neon-rose/30">
                          <i class="fa-solid fa-stop mr-2"></i> Stop Tracking Stream
                        </button>
                      `
                      : html`
                        <button onClick=${handleStartCamera} class="btn-shimmer w-full rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-brand-bg font-black text-xs py-3 transition-all shadow-neon-cyan">
                          <i class="fa-solid fa-play mr-2"></i> Start Tracking Stream
                        </button>
                      `
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        `}

        <!-- ANALYTICS TAB CONTENT -->
        ${activeTab === 'analytics' && html`
          <div class="space-y-6 animate-fadeIn">
            <div class="glass-panel rounded-2xl p-6">
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h3 class="font-display font-bold text-white text-xl">Comprehensive Traffic Analytics</h3>
                  <p class="text-xs text-slate-400 mt-1">Aggregated statistics compiled from image detections and live feeds.</p>
                </div>
                <div class="bg-slate-950 border border-brand-card-border rounded-xl p-3 flex items-center gap-4">
                  <div>
                    <span class="text-4xs text-slate-400 block font-mono uppercase">Total Vehicles Processed</span>
                    <span class="text-xl font-black font-mono text-brand-primary">${cumulativeStats.total}</span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="rounded-2xl border border-brand-card-border bg-slate-950/60 p-6">
                  <h4 class="text-sm font-bold text-white mb-1">Hourly Traffic Density Flow</h4>
                  <p class="text-3xs text-slate-400 mb-6">Volume trend line over 24-hour periods.</p>
                  <${SVGLineChart} logs=${logs} />
                </div>

                <div class="rounded-2xl border border-brand-card-border bg-slate-950/60 p-6">
                  <h4 class="text-sm font-bold text-white mb-1">Vehicle Share Distribution</h4>
                  <p class="text-3xs text-slate-400 mb-6">Percentage share across vehicle categories.</p>
                  <${SVGDonutChart} data=${cumulativeStats} />
                </div>

                <div class="rounded-2xl border border-brand-card-border bg-slate-950/60 p-6 md:col-span-2">
                  <h4 class="text-sm font-bold text-white mb-1">Class Comparison Metrics</h4>
                  <p class="text-3xs text-slate-400 mb-6">Absolute count breakdown per vehicle class.</p>
                  <${SVGBarChart} data=${cumulativeStats} />
                </div>
              </div>
            </div>
          </div>
        `}

        <!-- HISTORY LOGS TAB CONTENT -->
        ${activeTab === 'history' && html`
          <div class="space-y-6 animate-fadeIn">
            <div class="glass-panel rounded-2xl p-6">
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h3 class="font-display font-bold text-white text-xl">Detection Database Logs</h3>
                  <p class="text-xs text-slate-400 mt-1">Review CSV history records and download data reports.</p>
                </div>
                
                <div class="flex flex-wrap gap-3">
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    value=${searchQuery} 
                    onChange=${(e) => setSearchQuery(e.target.value)}
                    class="rounded-xl border border-brand-card-border bg-slate-950 px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-brand-primary focus:outline-none" 
                  />
                  <button onClick=${handleExportCSV} class="rounded-xl bg-white/5 border border-brand-card-border hover:bg-white/10 text-white font-medium text-xs px-4 py-2 transition-all flex items-center gap-2">
                    <i class="fa-solid fa-file-export text-brand-primary"></i> Export CSV
                  </button>
                  <button onClick=${handleClearLogs} class="rounded-xl bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger border border-brand-danger/30 font-medium text-xs px-4 py-2 transition-all flex items-center gap-2">
                    <i class="fa-solid fa-trash-can"></i> Clear History
                  </button>
                </div>
              </div>

              <!-- History Data Table -->
              <div class="w-full overflow-x-auto rounded-2xl border border-brand-card-border bg-slate-950/60">
                <table class="w-full text-left text-xs border-collapse font-mono">
                  <thead class="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-brand-card-border">
                    <tr>
                      <th class="px-5 py-4">Timestamp</th>
                      <th class="px-5 py-4">Source</th>
                      <th class="px-5 py-4 text-center">Cars</th>
                      <th class="px-5 py-4 text-center">MC</th>
                      <th class="px-5 py-4 text-center">Trucks</th>
                      <th class="px-5 py-4 text-center">Buses</th>
                      <th class="px-5 py-4 text-center">Total</th>
                      <th class="px-5 py-4 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-brand-card-border/40 text-slate-300">
                    ${filteredLogs.length === 0 ? html`
                      <tr>
                        <td colspan="8" class="px-5 py-12 text-center text-slate-500 font-medium">
                          No detection log records found.
                        </td>
                      </tr>
                    ` : filteredLogs.map((log, idx) => html`
                      <tr key=${idx} class="hover:bg-white/5 transition-all">
                        <td class="px-5 py-3.5 text-slate-400 font-medium">${log.timestamp}</td>
                        <td class="px-5 py-3.5 font-bold text-white">${log.source}</td>
                        <td class="px-5 py-3.5 text-center text-brand-primary font-bold">${log.cars}</td>
                        <td class="px-5 py-3.5 text-center text-brand-success font-bold">${log.motorcycles}</td>
                        <td class="px-5 py-3.5 text-center text-brand-warning font-bold">${log.trucks}</td>
                        <td class="px-5 py-3.5 text-center text-brand-danger font-bold">${log.buses}</td>
                        <td class="px-5 py-3.5 text-center font-black text-white">${log.total}</td>
                        <td class="px-5 py-3.5 text-right">
                          ${log.image ? html`
                            <button 
                              onClick=${() => setModalImage(`/${log.image}`)}
                              class="text-brand-primary hover:underline font-bold"
                            >
                              <i class="fa-solid fa-image mr-1"></i> Inspect
                            </button>
                          ` : html`<span class="text-slate-600">-</span>`}
                        </td>
                      </tr>
                    `)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `}

        <!-- SETTINGS TAB CONTENT -->
        ${activeTab === 'settings' && html`
          <div class="space-y-6 animate-fadeIn">
            <div class="glass-panel rounded-2xl p-6 max-w-2xl mx-auto">
              <h3 class="font-display font-bold text-white text-xl mb-2">System Configuration</h3>
              <p class="text-xs text-slate-400 mb-6">Manage model parameters, remote logging webhooks, and local database storage.</p>
              
              <div class="space-y-5">
                <div class="bg-slate-950/60 p-5 rounded-2xl border border-brand-card-border">
                  <div class="flex justify-between items-center mb-2">
                    <label class="text-xs font-bold text-white uppercase font-mono">Confidence Threshold</label>
                    <span class="text-sm font-bold text-brand-primary font-mono">${(confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p class="text-3xs text-slate-400 mb-3">Detections with confidence below this threshold will be discarded.</p>
                  <input 
                    type="range" 
                    min="0.10" 
                    max="0.90" 
                    step="0.05" 
                    value=${confidence} 
                    onChange=${(e) => setConfidence(parseFloat(e.target.value))}
                    class="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-brand-primary" 
                  />
                </div>

                <div class="bg-slate-950/60 p-5 rounded-2xl border border-brand-card-border">
                  <label class="block text-xs font-bold text-white uppercase font-mono mb-2">Live Camera Mapping</label>
                  <input 
                    type="text" 
                    value=${cameraUrl} 
                    onChange=${(e) => setCameraUrl(e.target.value)}
                    class="w-full rounded-xl border border-brand-card-border bg-slate-900 px-4 py-2.5 text-xs text-white focus:border-brand-primary focus:outline-none font-mono" 
                    placeholder="e.g. 0"
                  />
                </div>

                <div class="bg-slate-950/60 p-5 rounded-2xl border border-brand-card-border">
                  <label class="block text-xs font-bold text-white uppercase font-mono mb-2">Google Sheets Cloud Webhook</label>
                  <input 
                    type="text" 
                    value=${WEBHOOK_URL} 
                    disabled
                    class="w-full rounded-xl border border-brand-card-border bg-slate-900/40 px-4 py-2.5 text-xs text-slate-500 font-mono cursor-not-allowed" 
                  />
                </div>

                <div class="bg-brand-danger/10 p-5 rounded-2xl border border-brand-danger/30">
                  <h4 class="text-xs font-bold text-brand-danger uppercase font-mono mb-1">Clear Local Database</h4>
                  <p class="text-3xs text-slate-400 mb-4">Deletes all saved detection snapshot images and clears CSV log entries.</p>
                  <button onClick=${handleClearLogs} class="rounded-xl bg-brand-danger/20 hover:bg-brand-danger/30 text-brand-danger border border-brand-danger/40 font-bold text-xs px-5 py-2.5 transition-all">
                    <i class="fa-solid fa-trash-can mr-2"></i> Purge All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        `}

      </main>

      <!-- Fullscreen Image Inspect Modal -->
      ${modalImage && html`
        <div 
          onClick=${() => setModalImage(null)}
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fadeIn"
        >
          <div class="relative max-w-5xl w-full flex flex-col items-center">
            <button 
              onClick=${() => setModalImage(null)}
              class="absolute -top-10 right-0 text-white hover:text-brand-primary transition-all text-xl font-mono"
            >
              <i class="fa-solid fa-xmark mr-1"></i> Close
            </button>
            <img src=${modalImage} class="rounded-2xl border border-white/20 max-h-[85vh] w-auto max-w-full object-contain shadow-neon-cyan" />
          </div>
        </div>
      `}

      <!-- Footer -->
      <footer class="border-t border-brand-card-border bg-slate-950/60 py-6 mt-16 text-center text-xs text-slate-500 font-mono">
        <div class="container mx-auto px-4">
          <span>VehicleVision AI Traffic Analytics • Deep Learning Powered</span>
        </div>
      </footer>

    </div>
  `;
};

// RENDER REACT APP
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
