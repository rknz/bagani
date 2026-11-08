# 📂 MASTER PROJECT PLAN: BAGANI (Smart Gardening & Plant Care)

> **App Name:** BAGANI  
> **Subtitle:** Smart Gardening & Plant Care  
> **Tagline:** Grow Smart, Live Green.  
> **Package Name:** `com.profix.bagani`  
> **Company / Developer:** ProFix - Web & Soft  

---

## ১. Project Overview & Platform Standards

| Property | Specification |
| :--- | :--- |
| **App Name** | **BAGANI** |
| **Company / Developer Name** | **ProFix - Web & Soft** |
| **Subtitle / Short Description** | Smart Gardening & Plant Care |
| **Tagline** | *Grow Smart, Live Green.* |
| **Package Identifier** | `com.profix.bagani` |
| **Target Platforms** | Cross-Platform Mobile (Android & iOS) using **Flutter / React Native** |
| **Android Compatibility** | **Android 10 (API 29)** through the latest current versions (**Android 14/15/16+**) & future updates |
| **iOS Compatibility** | **iOS 15.0** through the latest available & future iOS releases (**iOS 16–18 / iOS 26 / iOS 27+**) |
| **Performance Target** | Ultra-Fast, Lightweight (50–100 MB), Clutter-Free, Offline-First with Cloud Sync (No Hardware Sensors) |
| **Development Environment** | Windows 11 Pro, Antigravity IDE, Android Studio, Node.js |

---

## ২. Core Features & Functional Modules (মূল ফিচার ও কার্যপ্রণালী)

### **1. QR Code Plant Registration, Printable PDF Tag & Timeline Tracking (Main Feature)**
* **Digital Plant Registration:** নতুন গাছ বা টব যুক্ত করার সময় ম্যানুয়ালি অথবা নার্সারির QR স্ক্যান করে ডিজিটাল প্রোফাইল তৈরি (গাছের নাম, জাত, বারোমাসি কিনা, রোপণের তারিখ ও ছবি)।
* **Customizable Printable QR PDF Tag:**
  * প্রতিটি গাছের জন্য স্বয়ংক্রিয় ইউনিক QR কোড তৈরি।
  * প্রিন্ট করার সময় পপ-আপে **সাইজ (Small / Medium / Large বা শুধু QR)** কাস্টমাইজ করার সুবিধা।
  * ট্যাগে গাছের নাম, জাত, বারোমাসি ব্যাজ, মাঝখানে QR কোড, নিচে স্লোগান (*"গাছ লাগান, পরিবেশ বাঁচান"*) ও বাগানির নামসহ ক্লিন **প্রিন্টেবল PDF** তৈরি।
* **Instant Scanning, Checkboxes & Messenger-Style Scrollable Timeline:**
  * ফাস্ট স্ক্যানার দিয়ে টবের QR কোড স্ক্যান করলেই সরাসরি ওই গাছের ডিজিটাল প্রোফাইল ওপেন হবে।
  * নির্ধারিত পরিচর্যা (পানি বা সার) সম্পন্ন করে ইউজার **চেকবক্সে টিক (`✓`)** দিলেই তা তারিখ অনুযায়ী মেসেঞ্জারের মতো **স্ক্রলযোগ্য টাইমলাইনে** (কী সার/পানি দেওয়া হলো, বয়স, স্বাস্থ্য নোট ও ছবির ইতিহাসসহ) সেভ হয়ে থাকবে।

### **2. Plant Current & Future Status Dashboard (গাছের বর্তমান ও ভবিষ্যৎ অবস্থা ট্র্যাকিং)**
* **Home Dashboard Layout:**
  * উপরে ইউজারের ছবি, সময় অনুযায়ী শুভেচ্ছা (*শুভ সকাল / শুভ বিকেল / অভিনন্দন*) ও অনুপ্রেরণামূলক বাণী।
  * বর্তমান সময়, **বাংলা তারিখ ও ইংরেজি তারিখ**, এবং লাইভ লোকেশন আবহাওয়া উইজেট (**গত ৭ দিন + আজ + আগামী ৭ দিনের পূর্বাভাস**)।
  * আগামী ২–৩ দিনের জরুরি পরিচর্যা নোটিফিকেশন এবং নিচে ফিল্টারযোগ্য **Grid View বা List View**-তে রেজিস্টার্ড গাছগুলোর তালিকা।
* **Dedicated Plant Profile (2 Main Tabs):**
  1. **‘বর্তমান অবস্থা’ (Current Status):** গাছটির বর্তমান বয়স, শেষ পানি/সার দেওয়ার সময়, মাটির আনুমানিক আর্দ্রতা এবং সর্বশেষ স্ক্যান অনুযায়ী গাছটির স্বাস্থ্যগত অবস্থা; সাথে নতুন ছবি ও নোট যোগ করার অপশন।
  2. **‘ভবিষ্যৎ অবস্থা ও পূর্বাভাস’ (Future Outlook & Forecast):** গাছের ধরন, বয়স, আবহাওয়া ও বিগত লগ বিশ্লেষণ করে এআই পূর্বাভাস—**Harvesting Countdown** (আর কতদিন পর ফুল/ফল ধরবে), সামনের সপ্তাহে রোদ বা বৃষ্টির কারণে আগাম যত্নের নির্দেশনা এবং **আগামী ১–২ মাসের সম্ভাব্য গ্রোথ গ্রাফ ও গাইডলাইন**।

### **3. Smart Rooftop Garden Planner & Interactive Guide**
* **Preference & Taste Wizard:** ছাদের সাইজ, রোদের তীব্রতা এবং ইউজারের রুচি (ফল নাকি সবজি, দেশি নাকি বিদেশি, মিষ্টি নাকি টক ফল) ও এলাকার আবহাওয়া অনুযায়ী উপযুক্ত গাছের সাজেশন ও বাগান পরিকল্পনা তৈরি।
* **End-to-End Lifecycle Guide:** ছাদের ওয়াটারপ্রুফিং, ড্রেনেজ ও জিও ব্যাগ নির্বাচন, মাটি ও জৈব সার প্রস্তুত প্রণালী, চারা রোপণ, পরিচর্যা, হারভেস্টিং এবং পরবর্তী ছাদ রক্ষণাবেক্ষণের পূর্ণাঙ্গ গাইড।

### **4. 100% Free AI Camera Plant & Disease Finder + Symptom Q&A**
* **Species Identification:** কোনো পেইড সাবস্ক্রিপশন ছাড়াই ফ্রি এআই ভিশন ও বিল্ট-ইন ডাটাবেস দিয়ে যেকোনো গাছ বা পাতার ছবি তুলে শতভাগ নির্ভুলভাবে গাছের নাম ও তথ্য শনাক্তকরণ।
* **Interactive Symptom Q&A Diagnosis:** পাতার ছবি দেওয়ার পর অ্যাপ স্বয়ংক্রিয়ভাবে কয়েকটি লক্ষণভিত্তিক প্রশ্ন জিজ্ঞেস করে শতভাগ নিশ্চিত হয়ে রোগ নির্ণয় করবে এবং ঘরোয়া বা জৈব (Organic) সমাধান দেবে।

### **5. Granular Weather Care Schedule & Local Agri Directory**
* **Precise Care Prescriptions:** স্থানীয় আবহাওয়া ও গাছের জাত অনুযায়ী কোন গাছে **কত লিটার পানি, কোন সময়ে (সকালে/বিকেলে)**, কখন ছায়ায় রাখতে হবে এবং কখন কোন সার কতটুকু দিতে হবে তার স্বয়ংক্রিয় পুশ নোটিফিকেশন।
* **Local Agri Directory & Community:** ইউজারের জেলা/লোকেশন অনুযায়ী নিকটস্থ কৃষি অফিস, কৃষিবিদ, নার্সারি ও বীজ/সারের দোকানের হদিস এবং একই এলাকার বাগানিদের জন্য ক্লাউড-ভিত্তিক হালকা কমিউনিটি চ্যাট।

### **6. Auth, Profile, Dual Themes, Language Toggle & Monetization**
* **Google Sign-In & Editable Profile:** Google দিয়ে লগইনের পর নাম, ছবি, ঠিকানা, পেশা কাস্টমাইজ করা ও পাসওয়ার্ড সেটআপ (সাথে iOS-এর জন্য Apple Sign-In ও ইন-অ্যাপ অ্যাকাউন্ট ডিলিট অপশন)।
* **Offline-First & Google Cloud Sync:** ইন্টারনেট ছাড়াও লোকাল ডাটাবেজে সম্পূর্ণ সচল থাকবে এবং অনলাইনে আসলে স্বয়ংক্রিয়ভাবে Google অ্যাকাউন্টে ব্যাকআপ হয়ে থাকবে।
* **Dual Themes & Language Switch:**
  * **Light Mode (Default):** Clean White & Soft Earthy Tones.
  * **Dark Mode:** Deep Charcoal & Rich Black with Vibrant Emerald Green.
  * **System Default Switch** এবং এক ক্লিকে **বাংলা (`বাংলা`) ও ইংরেজি (`English`)** ভাষা পরিবর্তনের টগল।
* **Banner Ad Placements:** ইউআই লেআউটের উপরে বা নিচে পরিপাটি ব্যানার অ্যাড প্রদর্শনের ব্যবস্থা (**ProFix - Web & Soft**)।

---

## ৩. Clean Folder & Technical Architecture

```text
com.profix.bagani/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── theme/          # Light, Dark & System themes, Bengali/English typography
│   │   ├── l10n/           # Bengali (bn) & English (en) language toggle strings
│   │   └── utils/          # Bengali/English date helpers, QR/PDF builders
│   ├── models/
│   │   ├── user_model.dart          # User profile & preferences
│   │   ├── plant_model.dart         # Plant details, QR ID, variety, planting date
│   │   ├── plant_log_model.dart     # Checkboxes, watering/fertilizer/photo timeline logs
│   │   ├── plant_forecast_model.dart# Current status & AI future growth/harvest forecast
│   │   ├── rooftop_plan_model.dart  # Wizard inputs & lifecycle guide milestones
│   │   └── care_schedule_model.dart # Granular weather-adjusted water/fertilizer tasks
│   ├── services/
│   │   ├── auth_service.dart        # Google/Apple Sign-In & account deletion
│   │   ├── local_db_service.dart    # Lightweight offline-first local storage
│   │   ├── cloud_sync_service.dart  # Compressed background cloud backup
│   │   ├── ai_scanner_service.dart  # Free AI plant finder & Symptom Q&A diagnosis
│   │   ├── qr_pdf_service.dart      # Unique QR generator, scanner & printable PDF tag
│   │   ├── weather_service.dart     # 7-day past + live + 7-day forecast weather sync
│   │   ├── notification_service.dart# Smart care schedule push/local alerts
│   │   └── ad_service.dart          # Top/bottom SafeArea banner ad integration
│   └── screens/
│       ├── auth/           # Login & customizable profile setup screen
│       ├── home/           # Greeting, BN/EN date, weather, Grid/List plant cards
│       ├── plant_profile/  # Dual-Tab (Current Status & Future Forecast) + Timeline
│       ├── qr_tracker/     # Fast QR Scanner popup & Printable PDF Tag designer
│       ├── planner/        # Smart Rooftop Garden Planner Wizard & Lifecycle Guide
│       ├── scanner/        # AI Camera Plant & Disease Finder + Symptom Q&A
│       ├── directory/      # District Agri-Office, Nursery & Community screen
│       └── settings/       # Theme switch, BN/EN toggle, cloud sync & legal pages
└── assets/
    ├── fonts/              # Crisp Bengali & English fonts
    ├── images/             # App logos & lightweight illustrations
    └── icons/              # Store-ready multi-resolution app icons
```

---

## ৪. Google Play Store & Apple App Store Compliance Standards

* **Android Compatibility (`Android 10 / API 29` $\rightarrow$ `Latest & Future Updates`):** Scoped Storage, Android Photo Picker, Runtime `POST_NOTIFICATIONS`, Android 15+ Edge-to-Edge (`enableEdgeToEdge`), Predictive Back Gesture, and 16 KB page-size (`arm64-v8a`) alignment.
* **iOS Compatibility (`iOS 15.0` $\rightarrow$ `iOS 27+ & Future Releases`):** Adaptive layouts (SE to Dynamic Island/ProMotion), `PrivacyInfo.xcprivacy` manifest, Sign in with Apple parity, and iOS ATT consent.
* **Mandatory Store Policies:** In-app Account & Cloud Data Deletion, foreground-only Coarse Location with manual district fallback, `SafeArea`-bounded banner ads, WCAG AA contrast in both themes, and built-in Privacy Policy, Terms & Conditions, and AI botanical disclaimers.

---

## ৫. Step-by-Step Development Roadmap

1. **[x] Phase 1 — Environment & Project Setup (COMPLETED):** Initialized `com.profix.bagani` (React Native / Expo + TypeScript) with clean modular directories (`lib/screens/`, `lib/models/`, `lib/services/`, `lib/core/`, `assets/`), store-compliant Android 10+ & iOS 15.0–27+ configuration, and verified zero TypeScript errors.
2. **[x] Phase 2 — Authentication & Monetization (COMPLETED):** Implemented Google Sign-In, Apple Sign-In (iOS Guideline 4.8), customizable user profile & photo picker, Gardener Taste FAQ, in-app account deletion, legal/privacy modal, and SafeArea-compliant Top/Bottom Banner Ad containers.
3. **[x] Phase 3 — Theme & Localization (COMPLETED):** Light/Dark/System themes, Bengali/English language toggle, and crisp Bengali/English Google Fonts (`Hind Siliguri` & `Plus Jakarta Sans`) with 6-tab ergonomic bottom navigation.
4. **[x] Phase 4 — Offline Database & Cloud Sync (COMPLETED):** Lightweight offline-first local database (`LocalDbService` with `AsyncStorage`) and Google account cloud synchronization.
5. **[x] Phase 5 — Core Modules (COMPLETED):**
   - [x] Home Dashboard (Greeting, BN/EN Date, 7-day past/future weather, Grid/List view)
   - [x] QR Code Plant Registration, Customizable Printable PDF Tag & Messenger-style Timeline with Checkboxes
   - [x] Plant Profile Dual-Tab Dashboard (*Current Status* & *Future Growth Forecast/Graph*)
   - [x] Smart Rooftop Garden Planner Wizard & 6-Stage Lifecycle Guide
   - [x] Free AI Camera Plant & Disease Finder with Interactive Symptom Q&A + Granular Weather Care Notifications + Local Agri Directory & Community
6. **[x] Phase 6 — Testing & Store Release (COMPLETED):** Completed all 8 core services (`AuthService`, `AdService`, `LocalDbService`, `CloudSyncService`, `WeatherService`, `NotificationService`, `AiScannerService`, `QrPdfService`), refined `Inter` + `Noto Sans Bengali` typography & zero-scrollbar Light/Dark UI, and prepared store release documentation (`STORE_RELEASE_GUIDE.md`) and `eas.json` profiles for `com.profix.bagani` by `ProFix - Web & Soft`.
7. **[x] Phase 7 — Complete 18-Screen Design System Unification & Live Weather/Care Hub (COMPLETED):** Unified all 18 screens under the Botanical Green (`#167A45`) Design System and 5-tab navigation (`Home`, `My Garden`, `Scan`, `Guide`, `Profile`), added the dedicated `WeatherCareScreen` (15-Day Forecast, Weather Alerts & Automated Plant-Specific Care Checkboxes), upgraded User Profile/Theme/Language/Settings in `SettingsScreen`, and launched both local (`http://localhost:8081`) and public HTTPS tunnel endpoints.
8. **[x] Phase 8 — Horticultural Verification, Precision Pruning & Community Insights (COMPLETED):**
   - [x] **Requirement 1 — Online Botanical Name Verification & Spell Auto-Correction:** Integrated Levenshtein distance typo correction (e.g. "sabeda"/"chabeda" $\rightarrow$ "সবেদা" Sapodilla) and Wikipedia API verification with rejection filter for nonsense inputs in `OnlineBotanicalService` and `AddPlantModal`.
   - [x] **Requirement 2 — Automatic Comprehensive Lifecycle Guidelines:** Auto-fetches verified soil selection, planting methods, ongoing care, fertilizer dosage, harvesting, and post-harvest maintenance upon adding a plant.
   - [x] **Requirement 3 — Structured Botanical Search Engine (`botanical_search_modal.tsx`):** Built structured plant and variety lookup modal accessible from `HomeScreen` and `MyGardenScreen` with 1-tap addition to garden.
   - [x] **Requirement 4 — Real-Time Location & Weather Crop Advisor:** Embedded geo-optimized fruit and vegetable recommendations in `WeatherCareScreen` based on user district, thermal units, humidity, and rain probability.
   - [x] **Requirement 5 — Plant Profile Online Knowledge & Organic Disease Remedies:** Displayed verified scientific names, soil formulas, and biological remedies (Neem oil, Trichoderma, baking soda) in `PlantProfileScreen` Tab 1.
   - [x] **Requirement 6 — Precision Pruning Engine for 2x Yield Boost:** Embedded canopy cutting techniques (3-branch architecture, 3G cutting, guava hard tip pruning, chili 1G/2G tip pinching) in `PlantProfileScreen` Tab 2.
   - [x] **Requirement 7 — Remotely Updatable Master Contacts & Nursery Database:** Connected `assets/data/remote_master_contacts.json` and `RemoteDirectoryService` to `DirectoryScreen` with district-priority display and live cloud sync button.
   - [x] **Requirement 8 — Gardener Experience & Key Insights Collection Vault:** Deployed community experience submission and upvoting system in `DirectoryScreen` capturing container mixes, pruning secrets, and actual yield results.
