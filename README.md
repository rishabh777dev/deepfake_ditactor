# TruthGuard AI

TruthGuard AI is a multi-modal deepfake detection platform. It allows users to upload and analyze audio, video, and images to detect potential deepfake manipulations. 

## Features

- **Multi-Modal Detection:** Supports analysis for audio, video, and image media types.
- **FastAPI Backend:** Built dynamically and asynchronously with FastAPI for fast, robust performance.
- **AI-Powered:** Utilizes advanced AI (with `ai_engine.py`) to process and score uploaded media files.
- **Interactive Interface:** A simple, modern web-based frontend interface for users to upload and receive immediate analysis.

## Project Structure

- `main.py`: The entry point for the FastAPI application, containing API endpoints such as `/api/analyze`.
- `ai_engine.py`: The core AI engine logic that processes uploaded media files to determine authenticity.
- `static/`: Contains the frontend assets, including `index.html`, `app.js`, and `style.css`.
- `.env`: Environment variables (e.g., API keys, configuration settings).

## Getting Started

1. **Install Dependencies:**
   Ensure you have the virtual environment activated, and install the required dependencies (typically listed in `requirements.txt`).
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables:**
   Make sure you have your `.env` configured appropriately with the requisite API keys or models.

3. **Run the Application:**
   Start the FastAPI server utilizing `uvicorn`.
   ```bash
   uvicorn main:app --reload
   ```

4. **Access the Platform:**
   Head to `http://localhost:8000/` in your web browser to use TruthGuard AI.

## API Endpoints

- `GET /` - Serves the frontend interface.
- `POST /api/analyze` - Accepts an uploaded media file (audio, video, or image) and returns a comprehensive AI analysis report.
- `GET /api/health` - Basic health check status for the app.

## License

This project is open-source. Please check with the repository owner for appropriate use.
