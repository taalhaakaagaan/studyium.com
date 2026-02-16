# Project Structure & Deployment Guide

This document serves as a critical reference for the distinction between the Website and the Desktop Application.

## 1. Project Hierarchy

*   **ROOT (`/`) = The Marketing Website (`studyium.com`)**
    *   **Purpose:** The public-facing website where users learn about Studyium and download the app.
    *   **Tech Stack:** Next.js (Web), PHP API (Backend).
    *   **Main Page:** `src/app/page.tsx` (Landing Page).
    *   **Deployment:** Hostinger (Shared Hosting).

*   **SUBFOLDER (`/studyium.app`) = The Desktop Application**
    *   **Purpose:** The actual software installed on the user's computer.
    *   **Tech Stack:** Electron + Next.js.
    *   **Codebase:** Independent from the website (conceptually), but lives in this monorepo.
    *   **Deployment:** GitHub Releases (via Electron Builder).

---

## 2. Deployment Workflows

### A. Deploying the Website (Hostinger)
**Goal:** Update the landing page or web features.
1.  Navigate to **ROOT** directory.
2.  Run `npm run build` (Generates `out` folder).
3.  Run `python create_hostinger_zip.py`.
4.  **Result:** `hostinger_deploy.zip`.
5.  **Action:** Upload this zip to Hostinger `public_html` and extract.

### B. Deploying the Application (Desktop App)
**Goal:** Release a new version (v0.x.x) of the software.
1.  Navigate to `studyium.app` directory.
2.  Update version in `package.json`.
3.  Push tag (e.g., `v0.5.1`) to GitHub.
4.  **GitHub Actions** automatically builds `.exe` and `.AppImage`.
5.  **Result:** Files appear in GitHub Releases.
6.  **Auto-Update:** The app updates itself automatically via `electron-updater`.

---

> **CRITICAL REMINDER:** 
> Do NOT edit `studyium.app/src/app/page.tsx` when you mean to update the Website Landing Page. 
> The Website Landing Page is in the **ROOT** `src/app/page.tsx`.
