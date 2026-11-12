# 🌿 BAGANI (বাগানি) — Smart Gardening & Plant Care

<div align="center">

<img src="./assets/images/logo.png" alt="BAGANI Logo" width="160" />

### **Grow Smart, Live Green.**
*আপনার ছাদ বাগানের বিশ্বস্ত ডিজিটাল সঙ্গী • Your Ultimate Urban Gardening Companion*

[![Release: v2.5.0](https://img.shields.io/badge/Release-v2.5.0-167A45?style=for-the-badge&logo=android&logoColor=white)](https://github.com/rknz/bagani/releases)
[![Platform: Android](https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/rknz/bagani/releases)
[![Target SDK: 35](https://img.shields.io/badge/Target%20SDK-35%20(Android%2015)-blue?style=for-the-badge&logo=android)](https://github.com/rknz/bagani)
[![Framework: React Native](https://img.shields.io/badge/React%20Native-0.76.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Engine: Hermes](https://img.shields.io/badge/Engine-Hermes-orange?style=for-the-badge)](https://hermesengine.dev/)
[![Expo: SDK 52](https://img.shields.io/badge/Expo-SDK%2052-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript: 5.3](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

---

### [📥 Download Android Release APK (v2.5.0)](https://github.com/rknz/bagani/releases/download/v2.5.0/BAGANI_v2.5.0.apk) &nbsp;•&nbsp; [📦 GitHub Releases](https://github.com/rknz/bagani/releases) &nbsp;•&nbsp; [🌐 Live Localhost Web Preview](http://localhost:3000)

</div>

---

## 📖 About BAGANI (অ্যাপ সম্পর্কে)

**BAGANI (বাগানি)** is a comprehensive, production-grade smart gardening, rooftop planning, and botanical pathology mobile & web application engineered by **ProFix - Web & Soft**. Designed specifically for urban rooftop gardeners, balcony plant lovers, and modern agriculturalists in Bangladesh and South Asia, BAGANI transforms any rooftop or urban garden into a scientifically managed, thriving green ecosystem.

Whether diagnosing plant diseases through real-time camera visual analysis, generating weather-resistant QR code tracking tags for your containers, calculating precise watering volumes based on pot size and soil composition, automating weather-adjusted care schedules, or consulting verified botanical variety catalogs, BAGANI delivers seamless guidance directly in **বাংলা (Bengali)** and **English**.

---

## 🌟 What's New in Version 2.5.0 (নতুন সুবিধাসমূহ)

1. **✨ Vibrant Welcome Wizard On Launch (ওয়েলকাম উইজার্ড):**
   - A beautifully illustrated, multi-slide onboarding wizard that introduces first-time users to the app’s four core pillars:
     1. Digital Plant Registration & Printable QR Tags
     2. AI Leaf Pathology & 100% Organic Treatment Protocols
     3. Weather-Indexed Soil Mix & Precision Irrigation
     4. Harvesting Countdown & Growth Milestones
   - Guides users step-by-step on *what can be done and why*, before smoothly transitioning to the Login / Account Creation interface.

2. **🗑️ Delete Plant Feature with Confirmation Modal (গাছ অপসারণ সুবিধা):**
   - Easily remove perished or relocated plants from the rooftop garden directly from the bottom of the plant details page.
   - Triggers a secure confirmation modal with **"Yes (Delete)"** and **"No (Cancel)"** options.
   - Completely cascades and purges all related timeline logs and scheduled care tasks from local database without orphan residue.

3. **🔍 Authentic Botanical Search Engine & Parent Plant Attribution (নির্ভুল বোটানিক্যাল সার্চ):**
   - Complete removal of dummy/placeholder data and gibberish plant synthesis.
   - Searching a parent plant (e.g., `আম`, `লিচু`, `গোলাপ`, `টমেটো`) lists all true cultivars and varieties.
   - Searching a specific cultivar (e.g., `হিমসাগর`, `কাটিমন`, `বোম্বাই লিচু`, `চায়না-৩`, `কালো জাম`, `বারি মাল্টা-১`, `ডাচ গোলাপ`) highlights it with a cultivar badge, identifies the parent species, botanical family, and shows sister varieties.
   - Anchored search button firmly locked on the right with virtual/physical keyboard `Enter` execution.

4. **🚪 Full-Screen Interstitial Ad & Exit Confirmation (বিজ্ঞাপন ও প্রস্থান নিশ্চিতকরণ):**
   - Professional exit flow with a 5-second countdown timer for Google AdSense / Sponsor Interstitial.
   - After ad dismissal, displays a clean confirmation modal: *"Are you sure you want to close the application?"* to prevent accidental exits.

5. **🛡️ Zero-Warning Android Installation (প্লে-প্রটেক্ট ও সিকিউরিটি কমপ্লায়েন্স):**
   - Signed with authentic PKCS12 release keystore with SHA-256 with RSA (valid until 2054).
   - Enforced `android:usesCleartextTraffic="false"` and removed high-risk permissions (`MANAGE_EXTERNAL_STORAGE`, `ACCESS_BACKGROUND_LOCATION`) to ensure clean, instant APK installation without malware warnings on Android.

---

## 🚀 Core Features & Architectural Modules (মূল মডিউলসমূহ)

### 1. 📷 Online AI Plant Pathology & Species Identification Hub
* **Real-Time Live Viewfinder & Native Camera Capture:** Full-fidelity in-app camera viewfinder on both Android (via `CameraView`) and Web (via HTML5 Canvas) with reticle framing, camera flip, and instant photo capture.
* **Google Gemini 1.5 Flash Vision AI Integration:** Real visual machine-learning inference on leaf and plant photos to identify pathogens, nutritional deficiencies, and physiological stress with confidence ratings.
* **Multi-Part Analysis:** Diagnostic modes for leaves, fruits, flowers, soil/roots, and whole plant canopies.
* **Comprehensive Organic Prescriptions:** Step-by-step organic remedies with exact recipes (e.g. cold-pressed neem oil + mild soap foliar spray, wood ash, tricho-compost) and dosage guides.
* **Agricultural Extension Integration:** Integrated direct helpline to Bangladesh Krishok Call Center (16123) and DAE regional expert directories.

### 2. 🏷️ Smart QR Pot Tracking & Printable PDF Garden Tags
* **Customizable Tag Sizes:** Generate tags in **Small (2.5")**, **Medium (3.5")**, **Large (4.5")**, or **QR Code Only**.
* **Personalized Customization:** Custom quotes, owner name, rooftop zone, and planting date.
* **Live Dynamic Age Calculation:** Real-time computation and display of plant age in years, months, and days (e.g., `১ বছর ৪ মাস (৪৯০ দিন)`).
* **Isolated Vector PDF Printing:** High-resolution PDF tags formatted for single pot cards or batch **A4 multi-tag sheets** ready for laminating and attaching to rooftop containers.
* **Global Real-Time QR Scanner:** Instant camera recognition of pot tags with immediate redirection to the plant's profile and future care forecast.

### 3. 💧 Smart Watering Calculator & Dynamic Weather Care Scheduler
* **Pot & Soil Hydration Calculator:** Computes exact watering liters based on container diameter, potting soil mix (loam, vermicompost, coco peat), and current atmospheric evaporation.
* **15-Day Weather Window:** Integrates meteorological API data providing past 7-day history, live humidity, and 7-day rain forecasts.
* **Rain-Smart Water Adjustments:** Automatically halts watering schedules during rainfall to protect against root rot.
* **Urgent Care Feed:** 1-tap completion checkboxes (`✓`) for watering, fertilizing, and pruning that immediately log to the plant's timeline.

### 4. 🧭 Smart Rooftop Garden Planner & Botanical Guide
* **Tactile 3-Tab Guide System:** Seamlessly toggle between 'Rooftop Planner', 'Weather & Care', and 'Agri-Directory'.
* **Geobag & Container Allocation:** Scientific sizing wizard for 24x24" (45-gallon half-drum alternatives), 20", 16", and 12" geobags with load-bearing rooftop considerations.
* **Location-Adapted Crop Recommendations:** Tailored fruit and vegetable varieties optimized for regional climates (e.g., Jamalpur, Dhaka, Rajshahi).
* **Agri-Directory Hub:** Clean vertical tile interface with direct access to Upazila Agriculture Offices, Master Gardeners, Certified Nurseries, Experience Vaults, and Community gardening discussions.

### 5. 👤 User Authentication, Profile & Cloud Sync
* **Universal Authentication:** Email/Password registration, existing login, and one-tap social login with **Continue with Google** (Android & Web) and **Continue with Apple** (iOS only).
* **Profile Management:** Displays verified badge, personalized profile picture, name, email, district, and rooftop size.
* **Cloud Sync:** Bi-directional snapshot sync with Supabase and offline-first persistence via AsyncStorage.

---

## 🎨 Design System & Color Palette

BAGANI follows a nature-inspired, high-contrast, professional design language:

| Semantic Token | Hex Value | Purpose |
| :--- | :--- | :--- |
| **Primary Green** | `#167A45` | Primary brand identity & action buttons |
| **Secondary Green** | `#20A464` | Secondary accents & active indicators |
| **Soft Surface** | `#E7F4EB` | Subtle botanical chips & highlights |
| **Dark Forest** | `#123B29` | Deep contrast accent & hero headers |
| **Light Background**| `#F7F9F7` | Clean, crisp light mode canvas |
| **Dark Background** | `#101713` | Deep, battery-saving dark mode canvas |
| **Danger Red** | `#DC2626` | Safe deletion & emergency exit actions |

---

## 🔒 Security, Privacy & Android Permissions

BAGANI adheres strictly to **Google Play Console Developer Program Policies**:

* 📷 **Camera:** `android.permission.CAMERA` for real-time plant QR scanning and leaf disease diagnosis.
* 🖼️ **Media & Photos:** `android.permission.READ_MEDIA_IMAGES` (Android 13+) and scoped `READ_EXTERNAL_STORAGE` (Android 12 and below) with runtime permission requests before accessing gallery images.
* 📍 **Coarse Location:** `android.permission.ACCESS_COARSE_LOCATION` for local weather and regional crop suitability without background tracking.
* 🔔 **Care Notifications:** `android.permission.POST_NOTIFICATIONS` with user opt-in for watering reminders.
* 🌐 **Secure Networking:** Strict HTTPS enforcement with `usesCleartextTraffic="false"` to prevent installer security warnings.

---

## 🛠️ Local Development & Build Commands

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Start local dev server
npx expo start

# Export production web bundle
npx expo export -p web

# Build Android Release APK
cd android && gradlew.bat assembleRelease
```

---

## 👥 Credits & Developer Information

* **Application Name:** BAGANI (বাগানি)
* **Tagline:** Grow Smart, Live Green.
* **Engineering & Architecture:** ProFix - Web & Soft
* **Target Audience:** Rooftop Gardeners, Balcony Growers & Urban Botanists
* **License:** MIT License © 2026 ProFix - Web & Soft
