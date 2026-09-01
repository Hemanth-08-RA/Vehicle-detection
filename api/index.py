from fastapi import FastAPI

app = FastAPI(title="VehicleVision AI API Proxy")

@app.get("/api/health")
def health():
    return {"status": "online", "message": "VehicleVision AI Frontend API Proxy Active"}
