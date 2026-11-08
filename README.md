# 🌿 BAGANI (বাগানি) — Smart Gardening & Plant Care

<div align="center">

<img src="./assets/images/logo.png" alt="BAGANI Logo" width="160" />

### **Grow Smart, Live Green.**
*আপনার ছাদ বাগানের বিশ্বস্ত ডিজিটাল সঙ্গী • Your Ultimate Urban Gardening Companion*

[![Platform: Android](https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/rknz/bagani/releases)
[![Target SDK: 35](https://img.shields.io/badge/Target%20SDK-35%20(Android%2015)-blue?style=for-the-badge&logo=android)](https://github.com/rknz/bagani)
[![Framework: React Native](https://img.shields.io/badge/React%20Native-0.76.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Engine: Hermes](https://img.shields.io/badge/Engine-Hermes-orange?style=for-the-badge)](https://hermesengine.dev/)
[![Expo: SDK 52](https://img.shields.io/badge/Expo-SDK%2052-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript: 5.3](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

---

### [📥 Download Android Release APK (v1.0.0)](https://github.com/rknz/bagani/releases/download/v1.0.0/BAGANI_v1.0.0.apk) &nbsp;•&nbsp; [📦 All Releases](https://github.com/rknz/bagani/releases) &nbsp;•&nbsp; [🌐 Live Web App](https://01dd807fae600e.lhr.life)

</div>

---

## 📖 About BAGANI (অ্যাপ সম্পর্কে)

**BAGANI (বাগানি)** is an advanced, production-grade smart gardening and botanical pathology mobile application engineered by **ProFix - Web & Soft**. Designed specifically for urban rooftop gardeners, balcony plant lovers, and modern agriculturalists in Bangladesh and South Asia, BAGANI turns any rooftop garden into a thriving, scientifically nurtured green ecosystem.

Whether you are diagnosing leaf diseases, printing weather-resistant QR code tracking tags for your flowerpots, automating weather-based watering schedules, or exploring 64-district crop advisory recommendations, BAGANI delivers seamless guidance directly in **বাংলা (Bengali)** and **English**.

<div align="center">
  <img src="./BAGANI%20Smart%20Gardening%20App%20Branding%20Sheet.png" alt="BAGANI Smart Gardening App Branding Sheet" width="100%" />
</div>

---

## 🚀 Key Features (প্রধান সুবিধাসমূহ)

### 1. 📷 Online AI Plant Pathology & Species Identification
* **Multi-Part Diagnosis:** Point the live camera or upload a gallery photo of leaves, fruits, flowers, soil, or entire plant canopy.
* **Instant Disease Detection:** Accurately identifies fungal infections (dieback, powdery mildew, anthracnose), bacterial leaf blight, and pest attacks (mealybugs, aphids).
* **Actionable Organic Remedies:** Detailed, step-by-step organic remedies with exact recipes (e.g. cold-pressed neem oil + mild soap folia spray) and micronutrient balances.
* **Botanical Taxonomy:** Reveals scientific botanical name, family, pot size recommendations, 40:30:20:10 container soil mixes, and pruning methods.

### 2. 🏷️ Smart QR Pot Tracking & Printable PDF Garden Tags
* **Customizable Tag Sizes:** Generate tags in **Small (2.5")**, **Medium (3.5")**, **Large (4.5")**, or **QR Code Only**.
* **Personalized Customization:** Customize inspirational quotes, gardener/owner name, rooftop zone, and planting date.
* **Live Dynamic Age Calculation:** Real-time calculation and display of plant age in years, months, and days (e.g., `১ বছর ৪ মাস (৪৯০ দিন)`).
* **Instant PDF Export:** Export high-resolution, vector-crisp PDF tags formatted for single pot cards or batch **A4 multi-tag sheets** ready for laminating and attaching to rooftop containers.

### 3. 💧 Dynamic Weather Window & Urgent Care Scheduler
* **15-Day Hyper-Local Forecast:** Integrates Open-Meteo meteorological API providing 7-day past history, live humidity, and 7-day upcoming rain probabilities.
* **Rain-Smart Watering Adjustments:** Intelligently halts watering schedules when heavy rainfall is forecasted, preventing root rot.
* **Urgent Care Feed:** One-tap scheduling for watering, vermicompost & organic nutrition, sanitary pruning, soil aeration, and canopy sunlight rotation.

### 4. 🗺️ 64-District Crop Advisory & Certified Nursery Directory
* **District-Specific Planting Guide:** Location-aware crop suggestions tailored to climate, soil, and temperature conditions across all 64 districts of Bangladesh.
* **Emergency Agriculture Helplines:** Integrated direct dialing for Krishok Call Center (16123), DAE regional offices, and emergency hotlines.
* **Directory Search:** Easily find registered agricultural suppliers, organic seed centers, and rooftop gardening specialists.

### 5. 🌐 Bilingual & Accessibility-First Experience
* **Instant Language Toggle:** Complete native support for both **বাংলা (Bengali)** and **English**.
* **Global Font Scaling:** Bounded dynamic text scaling slider (88% to 118%) ensures effortless readability for all ages while preserving layout integrity across all screens.
* **Full-Screen Dark & Light Themes:** High-contrast, nature-inspired palette engineered for high-visibility outdoors under direct sunlight.

---

## 🔒 Security, Privacy & Google Play Store Compliance

BAGANI is built strictly according to **Google Play Console 2025/2026 Developer Program Policies**:

* 🛡️ **Zero Invasive Storage Permissions:** `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, and `MANAGE_EXTERNAL_STORAGE` are explicitly blocked in accordance with Android 13+ Scoped Storage guidelines.
* 📍 **Privacy-Preserving Coarse Location:** Only utilizes `ACCESS_COARSE_LOCATION` when active to compute district weather; background location tracking is strictly blocked.
* 🔔 **Android 13+ Notification Standards:** Utilizes `POST_NOTIFICATIONS` with user opt-in for care reminders.
* 🔐 **Secure HTTPS-Only Networking:** All weather and botanical lookups run over encrypted TLS (HTTPS) with offline-first fallbacks.

---

## 🛠️ Architecture & Tech Stack

```
bagani/
├── App.tsx                     # Main App Shell, Routes, Hardware Back & State
├── app.json                    # Expo & Android 15 Manifest Configuration
├── eas.json                    # EAS Build & Play Store Configuration
├── android/                    # Native Android (Gradle 8.10.2, SDK 35, NDK 26.1)
├── lib/
│   ├── core/
│   │   ├── components/         # QR Scanner, Care Modals, Screen Transitions, Nav Bar
│   │   ├── constants/          # Application Configurations & Agro Standards
│   │   ├── l10n/               # Bengali (বাংলা) & English Comprehensive Translations
│   │   └── theme/              # High-contrast Theme, Design Tokens & Font Scaling
│   ├── models/                 # Care Tasks, Plant Models, Logs, Rooftop Plans
│   ├── screens/
│   │   ├── home/               # Urgent Care Feed, Weather Widget, Quick Actions
│   │   ├── my_garden/          # Plant Inventory, Health Status, Filtering
│   │   ├── scanner/            # AI Plant Pathology & Species Identifier
│   │   ├── qr_tracker/         # Dropdown Plant Selector, Printable PDF Tags & Age
│   │   ├── guide/              # Rooftop Garden Planner & Pruning Guide
│   │   ├── directory/          # 64-District Crop Advisory & Helplines
│   │   └── settings/           # Profile, Language, Font Scale, APK Download
│   └── services/
│       ├── ai_scanner_service.ts       # Botanical Vision & Pathology Diagnostics
│       ├── online_botanical_service.ts # Encyclopedia Retrieval & Auto-Correction
│       ├── qr_pdf_service.ts           # Crisp Vector PDF Tag & Sheet Generation
│       ├── weather_service.ts          # Open-Meteo Meteorological Integration
│       └── local_db_service.ts         # Persistent Offline-First Storage
```

---

## 📲 Direct Mobile Installation Guide

To install BAGANI directly onto your Android device:

1. Download the latest release: [**BAGANI_v1.0.0.apk**](https://github.com/rknz/bagani/releases/download/v1.0.0/BAGANI_v1.0.0.apk).
2. Open the downloaded `.apk` file from your device's notification tray or **Files / Downloads** folder.
3. If prompted with *"Install unknown apps"*, tap **Settings** and toggle **"Allow from this source"**.
4. Tap **Install** and launch **BAGANI** to begin managing your rooftop garden!

---

## 💻 Developer Quick Start

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Java Development Kit**: JDK 17 (Microsoft or OpenJDK)
* **Android SDK**: Build-tools `35.0.0`, Platform `android-35`

### 1. Clone the Repository
```bash
git clone https://github.com/rknz/bagani.git
cd bagani
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Web / Development Server
```bash
npx expo start
```

### 4. Build Android Release APK Locally
```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

---

## 📄 License & Attribution

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.

Developed with passion by **[ProFix - Web & Soft](https://github.com/rknz)**.  
*Copyright © 2026 ProFix - Web & Soft. All rights reserved.*

