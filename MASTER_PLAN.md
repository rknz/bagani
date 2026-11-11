# 📂 MASTER PROJECT PLAN: BAGANI v2.5 (Smart Gardening & Plant Care)

> **App Name:** BAGANI (বাগানি)  
> **Version:** 2.5.0 (Build 25)  
> **Subtitle:** Smart Gardening & Plant Care  
> **Tagline:** Grow Smart, Live Green.  
> **Package Identifier:** `com.profix.bagani`  
> **Company / Developer:** ProFix - Web & Soft  

---

## ১. Project Overview & Platform Standards (প্ল্যাটফর্ম স্ট্যান্ডার্ড)

| Property | Specification |
| :--- | :--- |
| **Application Name** | **BAGANI (বাগানি)** |
| **Current Version** | **v2.5.0 (Build 25)** |
| **Developer / Company** | **ProFix - Web & Soft** |
| **App Subtitle** | Smart Gardening & Plant Care |
| **Tagline** | *Grow Smart, Live Green. (গাছ লাগান, পরিবেশ বাঁচান।)* |
| **Package Identifier** | `com.profix.bagani` |
| **Target Platforms** | Cross-Platform Mobile: Android (Native APK / AAB) & iOS with Full Web Parity |
| **Android Compatibility** | Android 10 (API 29) through **Android 15 (API 35)** & future versions |
| **iOS Compatibility** | iOS 15.0 through **iOS 18+ / iOS 26+** |
| **Architecture** | Offline-First with Persistent AsyncStorage, Vector PDF Generation, Google Gemini AI & Live Camera Viewfinders |
| **Frameworks** | React Native 0.76.5, Expo SDK 52, TypeScript 5.3, Hermes Engine |

---

## ২. Core Architecture & Functional Modules (মূল ফিচার ও কার্যপ্রণালী)

### **1. AI Botanical Vision & Live Camera Pathology Hub**
* **Native Camera Viewfinder (`CameraView` & HTML5):** Full live video viewfinder in-app on both Android APK and Web preview with target reticle, flip camera, and instant snapshot capture.
* **Google Gemini 1.5 Flash Vision AI:** Real visual ML inference on captured leaf and plant photos to identify pathogens, nutritional deficiencies, and physiological stress with percentage confidence ratings.
* **Organic Treatment Formulation:** Specific organic remedies (neem oil foliar sprays, wood ash, tricho-compost, baking soda fungicides) with exact mixing ratios.
* **DAE Bangladesh Krishi Call Center (16123):** Built-in direct hotline for government agricultural extension officer support.

### **2. QR Code Plant Registration & Vector Printable PDF Tags**
* **Instant Digital Registration:** Create plant profiles with variety, planting date, container size, rooftop zone, and growth photo.
* **Vector Printable PDF Tags:**
  * Auto-generates high-resolution ISO/IEC 18004 standard QR tags.
  * Customizable tag sizes: **Small (2.5")**, **Medium (3.5")**, **Large (4.5")**, and **QR Code Only**.
  * Printable single cards or batch **A4 multi-tag sheets** for laminating.
  * Live dynamic age calculation in years, months, and days.
* **Global Real-Time QR Scanner:** Floating scan button on all screens with camera barcode detection for instant navigation to any plant profile.

### **3. Smart Watering Calculator & 15-Day Weather Scheduler**
* **Container & Soil Hydration Calculator:** Calculates precise water volume (liters) required based on container diameter, potting soil mix ratio, and current weather evaporation.
* **15-Day Weather Window:** Open-Meteo meteorological integration providing past 7-day history, live humidity, and 7-day future rain probabilities.
* **Rain-Smart Water Adjustments:** Automatically pauses watering alerts when rainfall is detected or forecasted.
* **Urgent Care Feed:** One-tap completion checkboxes (`✓`) that immediately append to the plant's timeline log.

### **4. Messenger-Style Scrollable Growth Timeline**
* **Timeline Feed:** Chronological history of watering, fertilization, organic sprays, pruning, and photo updates.
* **Photo Growth Tracking:** Attach high-resolution growth observation photos directly to individual timeline entries.
* **Plant Health State:** Real-time indicator (Healthy, Needs Attention, Diseased) dynamically updating from care history.

### **5. Smart Rooftop Garden Planner & Agri-Directory Hub**
* **Tactile 3-Tab Guide Switcher:** Seamlessly navigate between 'Rooftop Planner', 'Weather & Care', and 'Agri-Directory'.
* **Geobag & Half-Drum Wizard:** Scientific allocation for 24x24" (45-gallon half-drum alternatives), 20", 16", and 12" geobags with load-bearing safety tips.
* **64-District Crop Advisory:** Tailored fruit and vegetable recommendations optimized for regional Bangladeshi climates.
* **Agri-Directory Tiles:** Vertical navigation tiles for Upazila Agriculture Offices, Master Gardeners, Certified Nurseries, Experience Vaults, and Community discussions.

### **6. Global Botanical Plant & Variety Search Engine**
* **Universal Taxonomy & Cultivar Matching:** Search any plant worldwide with authentic cultivar catalogs (16 Mango varieties, 9 Litchi varieties, Jamun, Malta, Rose, etc.).
* **Variety Attribution:** Distinguishes parent species from specific cultivars, attributing varieties (e.g. Himsagar -> Mango) with category and sister varieties.
* **Elimination of Fake Syntheses:** Robust rejection of gibberish queries (e.g. `hjkj`) with zero dummy data and helpful recommendation chips.
* **Responsive Layout:** Text-overflow containment with horizontal scrolling so search buttons never move off-screen, with instant Enter-key search trigger.

### **7. Plant Management & Deletion Feature**
* **In-Profile Deletion:** Clean danger-action button at the bottom of the plant details screen.
* **Yes/No Confirmation Modal:** Secure verification modal explaining consequences before deletion.
* **Cascade Database Purge:** Automatically cleans up the plant, its timeline logs, and scheduled care tasks from local storage without orphan records.

### **8. Welcome Wizard & Feature Onboarding**
* **First-Launch Wizard:** Multi-slide visual walkthrough showcasing QR Tagging, AI Pathology, Smart Irrigation, and Growth Milestones.
* **Smooth Onboarding-to-Login Flow:** Seamlessly leads users directly into account creation or Google/Apple sign-in.
* **Always Accessible:** Re-launchable anytime from the Settings & Profile screen.

### **9. Interstitial Exit Flow & Confirmation Prompt**
* **Google AdSense Interstitial:** 5-second countdown timer during exit attempts.
* **Exit Confirmation Dialog:** Explicit modal asking "Are you sure you want to close the application?" to prevent accidental app dismissals.

### **10. User Profile, App Settings & Zero-Warning Android Packaging**
* **Verified Profile Card:** User avatar, name, verified gardener badge, email, secondary location/organization row, and compact taste chips.
* **Grouped Settings Rows:** Uniform segmented controls for Language (`বাংলা` | `English`) and Theme Mode (`লাইট` | `ডার্ক`).
* **Cloud Backup Status:** Real-time indicator of secured plant records and timeline logs.
* **Account & Security:** Clean action rows for secure Sign Out and Exit Application.
* **Zero-Warning Installation:** Enforced `android:usesCleartextTraffic="false"` and signed with official 2048-bit RSA PKCS12 release keystore for instant, warning-free installation on Android devices.

---

## ৩. UI/UX Design Standards (ডিজাইন স্পেসিফিকেশন)

* **Design Vision:** Minimalist, modern, clean, and nature-inspired UI with zero unnecessary heavy shadows, decorative clutter, or awkward wrapping.
* **Compact Typography:** Standardized font scale (14–16px titles, 11–12px descriptions, 10.5px footer) ensuring perfect readability across small (320px–360px) mobile screens.
* **Unified Iconography:** 17x17px SVG icons with uniform 1.8px stroke width across all top bars and settings rows.
* **Bilingual Parity:** Complete native localization in **বাংলা (Bengali)** and **English** with instant switching.

---

*BAGANI v2.5.0 — Designed & Developed with 💚 by ProFix - Web & Soft (2026).*
