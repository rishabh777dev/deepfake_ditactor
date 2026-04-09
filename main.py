import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import ai_engine

app = FastAPI(title="TruthGuard AI")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse("static/index.html")

@app.post("/api/analyze")
async def analyze_media(media: UploadFile = File(...)):
    """
    Accepts audio, video, or image file and returns a full AI analysis report.
    The media type is auto-detected from the MIME type.
    """
    file_id = str(uuid.uuid4())[:8]
    ext = os.path.splitext(media.filename)[1] or ".bin"
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")

    try:
        with open(temp_path, "wb") as f:
            shutil.copyfileobj(media.file, f)

        # Detect media type
        content_type = media.content_type or ""
        if content_type.startswith("video/"):
            media_type = "video"
        elif content_type.startswith("image/"):
            media_type = "image"
        else:
            media_type = "audio"

        result = ai_engine.analyze_media_file(temp_path, media.filename, media_type)
        return result

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/api/health")
def health_check():
    return {"status": "online", "service": "TruthGuard AI", "version": "2.0.0"}
