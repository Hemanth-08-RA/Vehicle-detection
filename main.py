import os
import cv2
import csv
import time
import torch
import numpy as np
import requests
import threading
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import base64

# Initialize FastAPI
app = FastAPI(title="VehicleVision AI Backend")

# Configure CORS for production and development
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- SETTINGS ---------------- #
WEBHOOK_URL = os.getenv(
    "WEBHOOK_URL",
    "https://script.google.com/macros/s/AKfycbzj7Y3Cg858enguXSXuq1k7CtDGRxkOl9Q6wmachbQGN9GWDkBRYCGNDyAD-ReHnVu2/exec"
)
LOG_DIR = os.getenv("LOG_DIR", "detections")
LOG_FILE = os.path.join(LOG_DIR, "log.csv")

# Ensure directories exist
os.makedirs(LOG_DIR, exist_ok=True)

# ---------------- MODEL SETUP ---------------- #
print("Optimizing memory and loading YOLOv5n (nano) model...")
try:
    # Limit PyTorch CPU threads to keep memory usage minimal
    torch.set_num_threads(1)
    torch.set_num_interop_threads(1)
    
    # Load the ultra-lightweight YOLOv5 nano model (3.9MB)
    model = torch.hub.load('ultralytics/yolov5', 'yolov5n', trust_repo=True)
    print("Model loaded successfully!")
    
    # Force python to clear memory cache
    import gc
    gc.collect()
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Helper to send cloud webhook
def send_webhook(timestamp: str, source: str, count: int, image_path: str):
    try:
        data = {
            "timestamp": timestamp,
            "source": source,
            "count": count,
            "image": image_path
        }
        requests.post(WEBHOOK_URL, json=data, timeout=5)
    except Exception as e:
        print(f"Cloud logging webhook failed: {e}")

# Global lock for camera threads
camera_thread_lock = threading.Lock()
active_streams = {}

# ---------------- API ENDPOINTS ---------------- #

@app.post("/api/detect")
async def detect_image(
    file: UploadFile = File(...), 
    confidence: float = Form(0.25),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    if model is None:
        raise HTTPException(status_code=500, detail="YOLOv5 model not loaded")
        
    try:
        # Read uploaded image bytes
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file format")
            
        # Run detection
        model.conf = confidence
        results = model(frame)
        df = results.pandas().xyxy[0]
        
        # Filter only vehicles
        vehicles = df[df['name'].isin(['car', 'bus', 'truck', 'motorcycle'])]
        total_vehicles = len(vehicles)
        
        # Count classes
        counts = {"car": 0, "motorcycle": 0, "truck": 0, "bus": 0}
        for name in vehicles['name']:
            if name in counts:
                counts[name] += 1
                
        # Draw bounding boxes
        for _, row in vehicles.iterrows():
            x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
            label = f"{row['name']} {row['confidence']:.2f}"
            
            # Colors: Car=Cyan, Bus=Pink, Truck=Gold, Motorcycle=Green
            color = (255, 245, 0)  # BGR Cyan (0, 245, 255) -> (255, 245, 0)
            if row['name'] == 'bus':
                color = (109, 77, 255)  # BGR Pink (255, 77, 109) -> (109, 77, 255)
            elif row['name'] == 'truck':
                color = (0, 215, 255)  # BGR Gold (255, 215, 0) -> (0, 215, 255)
            elif row['name'] == 'motorcycle':
                color = (136, 255, 0)  # BGR Green (0, 255, 136) -> (136, 255, 0)
                
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
        # Determine density
        density = "Low"
        if total_vehicles > 6:
            density = "High"
        elif total_vehicles > 2:
            density = "Medium"
            
        # Generate paths and save
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"detections/upload_{timestamp}.jpg"
        cv2.imwrite(filename, frame)
        
        # Log to CSV
        file_exists = os.path.exists(LOG_FILE)
        with open(LOG_FILE, mode='a', newline='') as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(["Timestamp", "Source", "Cars", "Motorcycles", "Trucks", "Buses", "TotalCount", "Image"])
            writer.writerow([
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Upload",
                counts["car"],
                counts["motorcycle"],
                counts["truck"],
                counts["bus"],
                total_vehicles,
                filename
            ])
            
        # Background task for Google Sheet Webhook
        background_tasks.add_task(send_webhook, timestamp, "Upload", total_vehicles, filename)
        
        # Encode detected image to Base64
        _, img_encoded = cv2.imencode('.jpg', frame)
        img_base64 = base64.b64encode(img_encoded).decode('utf-8')
        
        return {
            "success": True,
            "image": f"data:image/jpeg;base64,{img_base64}",
            "counts": {**counts, "total": total_vehicles},
            "density": density,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "filename": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


def gen_video_frames(source: str, confidence: float):
    # Parse source string. If it's a digit, treat it as webcam index
    try:
        src = int(source)
    except ValueError:
        src = source
        
    cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        print(f"Error: Unable to open video source {source}")
        return
        
    last_logged_time = 0
    save_interval = 5  # logs every 5 seconds if vehicles detected
    
    # Store cap globally so we can release it if needed
    thread_id = threading.get_ident()
    with camera_thread_lock:
        active_streams[thread_id] = cap
        
    try:
        while cap.isOpened():
            # Check if this stream has been removed/stopped
            with camera_thread_lock:
                if thread_id not in active_streams:
                    break
                    
            ret, frame = cap.read()
            if not ret:
                break
                
            # Run detection
            if model is not None:
                model.conf = confidence
                results = model(frame)
                df = results.pandas().xyxy[0]
                vehicles = df[df['name'].isin(['car', 'bus', 'truck', 'motorcycle'])]
                total_vehicles = len(vehicles)
            else:
                vehicles = []
                total_vehicles = 0
                
            counts = {"car": 0, "motorcycle": 0, "truck": 0, "bus": 0}
            
            # Draw boxes
            for _, row in vehicles.iterrows():
                x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
                name = row['name']
                if name in counts:
                    counts[name] += 1
                    
                color = (255, 245, 0)
                if name == 'bus':
                    color = (109, 77, 255)
                elif name == 'truck':
                    color = (0, 215, 255)
                elif name == 'motorcycle':
                    color = (136, 255, 0)
                    
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"{name} {row['confidence']:.2f}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                
            # Overlay status info on video frame
            cv2.putText(frame, f"Live Vehicle Tracking | Total: {total_vehicles}", (15, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 136), 2)
            cv2.putText(frame, f"Cars: {counts['car']} | Buses: {counts['bus']} | Trucks: {counts['truck']} | MC: {counts['motorcycle']}", (15, 55), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Write periodic log
            current_time = time.time()
            if total_vehicles > 0 and (current_time - last_logged_time) > save_interval:
                last_logged_time = current_time
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"detections/live_{timestamp}.jpg"
                cv2.imwrite(filename, frame)
                
                # Write to CSV
                file_exists = os.path.exists(LOG_FILE)
                with open(LOG_FILE, mode='a', newline='') as f:
                    writer = csv.writer(f)
                    if not file_exists:
                        writer.writerow(["Timestamp", "Source", "Cars", "Motorcycles", "Trucks", "Buses", "TotalCount", "Image"])
                    writer.writerow([
                        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        f"Stream: {source}",
                        counts["car"],
                        counts["motorcycle"],
                        counts["truck"],
                        counts["bus"],
                        total_vehicles,
                        filename
                    ])
                    
                # Webhook in a background thread to prevent streaming lag
                threading.Thread(target=send_webhook, args=(timestamp, f"Stream ({source})", total_vehicles, filename), daemon=True).start()
                
            # Encode frame to stream
            ret, jpeg = cv2.imencode('.jpg', frame)
            if not ret:
                continue
                
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')
                   
            # Limit streaming framerate to save CPU
            time.sleep(0.03)  # approx ~30 FPS max
            
    finally:
        cap.release()
        with camera_thread_lock:
            if thread_id in active_streams:
                del active_streams[thread_id]


@app.get("/api/video_feed")
def video_feed(url: str, confidence: float = 0.25):
    if not url:
        raise HTTPException(status_code=400, detail="Missing camera URL parameter")
    return StreamingResponse(
        gen_video_frames(url, confidence),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.post("/api/stop_feeds")
def stop_feeds():
    """Stops all active camera streams to free resources"""
    stopped_count = 0
    with camera_thread_lock:
        keys = list(active_streams.keys())
        for key in keys:
            try:
                active_streams[key].release()
                stopped_count += 1
            except Exception as e:
                print(f"Error stopping stream {key}: {e}")
            del active_streams[key]
    return {"success": True, "stopped_count": stopped_count}


@app.get("/api/logs")
def get_logs():
    if not os.path.exists(LOG_FILE):
        return []
        
    logs = []
    try:
        with open(LOG_FILE, mode='r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                logs.append({
                    "timestamp": row.get("Timestamp", ""),
                    "source": row.get("Source", ""),
                    "cars": int(row.get("Cars", 0) or 0),
                    "motorcycles": int(row.get("Motorcycles", 0) or 0),
                    "trucks": int(row.get("Trucks", 0) or 0),
                    "buses": int(row.get("Buses", 0) or 0),
                    "total": int(row.get("TotalCount", 0) or 0),
                    "image": row.get("Image", "").replace("\\", "/")  # Ensure URL friendly paths
                })
    except Exception as e:
        print(f"Error reading log CSV: {e}")
        
    # Return reversed to display newest detections first
    return logs[::-1]


@app.post("/api/clear_logs")
def clear_logs():
    try:
        # Clear files in detections directory
        for item in os.listdir(LOG_DIR):
            item_path = os.path.join(LOG_DIR, item)
            if os.path.isfile(item_path):
                # Delete files, but keep directory
                try:
                    os.remove(item_path)
                except Exception as e:
                    print(f"Failed to delete {item_path}: {e}")
                    
        # Recreate an empty log CSV with header
        with open(LOG_FILE, mode='w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(["Timestamp", "Source", "Cars", "Motorcycles", "Trucks", "Buses", "TotalCount", "Image"])
            
        return {"success": True, "message": "All detection history and image logs cleared."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear logs: {str(e)}")


# Ensure detections directory exists before mounting
os.makedirs(LOG_DIR, exist_ok=True)
app.mount("/detections", StaticFiles(directory=LOG_DIR), name="detections")

# Serve React static frontend files
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    # Use PORT environment variable set by Render (defaults to 10000 on Render, 8000 fallback locally)
    port = int(os.getenv("PORT", 8000))
    print(f"Starting VehicleVision AI server on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
