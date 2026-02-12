# 🌐 360-viewer

> A 360°/HDRI image viewer. Designed to streamline the rendering workflow in Architecture and ArchViz.

![Status](https://img.shields.io/badge/status-functional-brightgreen)
![Electron](https://img.shields.io/badge/Electron-Portable-blue?logo=electron)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?logo=three.js)

## 📸 Preview

![App Demo](https://via.placeholder.com/800x450.png?text=360-viewer+Preview)

## 🚀 The Problem & The Solution

This project was developed to optimize the workflow in architectural visualization studios.

The standard process often required rendering equirectangular images and uploading them to online platforms just for internal validation or quality checks, creating unnecessary wait times.

**360-viewer** eliminates this bottleneck by allowing **instant** and **offline** viewing, featuring the same visual fidelity and navigation physics as web players, but running natively on Windows via a portable executable.

### ✨ Features

- **Native Drag & Drop:** Simply drag `.jpg`, `.png`, or `.hdr` files into the window.
- **Instant Viewing:** Direct FileSystem reading. No uploads, no network loading time.
- **Immersive Navigation:** Orbital camera controls with inertia (damping), identical to high-end web players.
- **Portable Mode:** A single `.exe` file that requires no installation.
- **HDRI Support:** Ready for high-dynamic-range textures.

---

## 📂 Project Structure

The project is organized to facilitate maintenance and automatic build generation for the end-user:

```text
360-viewer/
├── Code/               # Source Code (React + Electron + Three.js)
├── Build/              # Output folder (Where the final .exe will be saved)
├── iinstall.bat        # Automation script (Installs deps & runs build)
└── README.md           # Documentation