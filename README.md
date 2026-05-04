# DeepShield: Real-Time Deepfake Detection System

DeepShield is a full-stack web application designed to analyze images and videos for potential deepfake manipulation. The system combines a modern frontend with a scalable backend architecture and is structured to support integration of deep learning models for media forensics.


## Overview

DeepShield enables users to upload media files and receive analysis results indicating whether the content is authentic or manipulated. The application is built with a modular pipeline that supports real-time inference and can be extended with production-grade deep learning models.


## Key Features

### Media Processing

* Supports image formats: JPG, PNG, WebP
* Supports video formats: MP4, WebM
* Handles file upload and preprocessing for inference

### Detection Pipeline

* Designed for integration with deep learning models (e.g., EfficientNet, CNN-based classifiers)
* Outputs:

  * Prediction: Real or Fake
  * Confidence score (0–100%)

### Backend API

* REST-based architecture using FastAPI
* Endpoints:

  * `/predict` for inference
  * `/history` for storing and retrieving past analyses

### Frontend Interface

* Built with React and TypeScript
* Provides:

  * Upload interface
  * Real-time result visualization
  * Analysis history tracking

### Data Logging

* Stores:

  * File name
  * Prediction result
  * Confidence score
  * Timestamp


## Tech Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS

### Backend

* FastAPI
* Python

### AI / Processing (Extensible)

* PyTorch / TensorFlow (model integration ready)
* OpenCV (media preprocessing)


## System Workflow

1. User uploads an image or video
2. File is sent to the backend via `/predict`
3. Backend performs preprocessing and inference
4. Prediction and confidence score are generated
5. Result is returned to frontend and displayed
6. Entry is stored and accessible via `/history`


## Output Format

| Field      | Description                |
| ---------- | -------------------------- |
| Prediction | Real or Fake               |
| Confidence | Probability score (0–100%) |
| Timestamp  | Time of analysis           |


## Current Status

* Core full-stack system implemented
* API integration functional
* Model pipeline currently uses a placeholder inference layer
* Structured for integration with pretrained deepfake detection models


## Alignment with Deep Learning Pipeline

This project is designed to support:

* Ensemble deep learning models (e.g., EfficientNet-based classifiers)
* Real-time inference APIs
* Performance evaluation and result validation

The architecture allows replacement of the current inference layer with trained models for production-grade accuracy.


## Installation

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Live Demo

Frontend (User Interface):
https://deep-fake-detection-sable.vercel.app

Backend API (Swagger Docs):
https://deepfake-detection-spwc.onrender.com/docs


## Future Enhancements

* Integration of pretrained deepfake detection models
* Improved video frame-level analysis
* Deployment using cloud platforms (Render, Railway)
* Report generation and explainability modules
* Optimization for low-latency inference


