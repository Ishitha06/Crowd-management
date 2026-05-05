# Crowd Risk Monitoring System - CrowdSense

A real-time crowd management platform that predicts zone-wise risk levels (🟢 Controlled, 🟡 Medium, 🟠 High, 🔴 Critical) using Machine Learning and visualizes them through an interactive heatmap.

## Problem Statement

During large-scale events (concerts, festivals, stadiums), crowd density can become unsafe due to sudden surges and bottlenecks.
Manual monitoring is inefficient and delayed.

This project provides a real-time predictive system to detect and prevent crowd risks before they become dangerous.

## Solution Overview

This system:
- Simulates real-time crowd flow (entry/exit)
- Uses an ML model to predict crowd density
- Classifies risk levels dynamically
- Displays a live heatmap dashboard
- Allows organizers to block high-risk zones instantly
  
## System Architecture
- Frontend (HTML/CSS/JS)
- Backend (Node.js + Express)
- MongoDB Atlas (Database)
- Flask ML Service (Python)

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- ML Service: Flask, Scikit-learn
- Visualization: Matplotlib

## Workflow
1) Organizer initializes event (zones + capacity)
2) Backend generates dynamic crowd data
3) Data stored in MongoDB Atlas
4) Backend sends data to ML service
5) ML predicts crowd density
6) Risk levels are classified:
🟢 Controlled
🟡 Medium
🟠 High
🔴 Critical
7) Heatmap is generated and sent to frontend
7) Organizer monitors and can block zones

## Features
- Real-time crowd simulation
- ML-based risk prediction
- Zone-wise heatmap visualization
- Color-coded risk classification
- Zone blocking system
- Dynamic dashboard updates

## Project Structure
- frontend/      → UI (HTML, CSS, JS)
- backend/       → Node.js APIs
- ml-service/    → Flask ML service
