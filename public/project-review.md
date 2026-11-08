# 🌿 BAGANI (বাগানি) — Complete Project Specification, Architecture & AI Review Blueprint

> **Application Name:** BAGANI  
> **Tagline:** Grow Smart, Live Green.  
> **Subtitle:** Smart Gardening & Plant Care  
> **Developer / Organization:** ProFix - Web & Soft  
> **Package Identifier:** `com.profix.bagani`  
> **Target Framework:** Cross-Platform React Native (Expo SDK 52) with React Native Web  
> **Target Platforms:** Android 10+ (API 29 to 35+), iOS 15.0 to 18+, Desktop & Mobile Web  
> **Current Version:** 1.0.0 (Production Candidate)  
> **Public Live Demo:** https://ab134a1a44c02b.lhr.life  
> **Full Codebase Bundle:** https://ab134a1a44c02b.lhr.life/bagani-codebase.txt  

---

## 1. Executive Summary & Core Purpose

**BAGANI (বাগানি)** is a high-performance, offline-first smart gardening companion tailored for urban rooftop gardeners, balcony growers, and agricultural hobbyists in Bangladesh and tropical regions. It bridges botanical science with modern software architecture to solve real-world urban gardening challenges:

1. **Digital Plant Tagging & Lifecycle Management:** Every pot/tree receives a distinct ID, customizable QR code PDF tag for physical pot labeling, and a messenger-style care timeline.
2. **Predictive Botanical Intelligence:** AI-driven harvest countdowns, season-specific watering/fertilizing schedules, and precision pruning regimens (1G/2G/3G pruning for double yield).
3. **Automated Name Correction & Variety Validation:** Plant names and varieties entered by users are verified against botanical taxonomies, correcting typos (e.g. "sabeda" -> "chabeda/sapodilla") and enriching entries with optimal soil, sunlight, and humidity parameters.
4. **Hyper-Local Climate Advisory:** Geo-aware weather engine calculating 7-day past, live, and 7-day forecast data to suggest district-tailored fruits and vegetables.
5. **Organic Treatment Engine:** Non-toxic, herbal pest control formulas (neem oil spray, tobacco water, wood ash) tailored to leaf disease diagnoses.
6. **Community Knowledge & Nursery Directory:** Remotely-synced verified contacts for regional agriculture officers, specialized nurseries, and a crowd-sourced gardener tip vault.

---

## 2. Technical Stack & Dependencies

| Layer | Technologies |
| :--- | :--- |
| **Core Framework** | React Native 0.76.5, React 18.3.1, Expo SDK 52 |
| **Web Runtime** | React Native Web 0.19.13, @expo/metro-runtime 4.0.0 |
| **Language & Typing** | TypeScript 5.3.3 (Strict mode, zero TypeScript compile errors) |
| **Graphics & Icons** | React Native SVG 15.8.0, Custom Scalable Vector Glyphs |
| **Offline Persistence** | @react-native-async-storage/async-storage 1.23.1, Local JSON schema |
| **Cloud Synchronization** | Google Cloud Sync Mock/Live Adapter (`CloudSyncService`) |
| **Hardware APIs** | Expo Location 18.0.0, Expo Camera 16.0.0, Expo Image Picker 16.0.0, Expo Print & Sharing 14.0.0 |
| **Design Tokens** | Custom responsive design system (`lib/core/theme/app_theme.ts`), Light/Dark mode, Global Font Scaling (88%-118%) |
| **Typography** | Bilingual English & Bengali (`Hind Siliguri` / `Noto Sans Bengali`, `Inter` / `Roboto`) |

---

## 3. Directory Structure & File Map

```text
baghani/
├── App.tsx                              # Root orchestrator, global navigation router, theme & font scale state
├── index.ts                             # Expo entrypoint
├── package.json                         # Dependencies & scripts (typecheck, expo start)
├── tsconfig.json                        # Strict TypeScript compiler options
├── bagani_master_project_specification.md # Master architectural blueprint
├── MASTER_PLAN.md                       # 8-Phase implementation and execution roadmap
├── public/                              # Publicly hosted review assets & static files
└── lib/
    ├── core/
    │   ├── components/
    │   │   ├── bottom_nav_bar.tsx       # 5-tab cohesive navigation bar with custom scan glyph
    │   │   ├── botanical_search_modal.tsx # Search engine for plants, varieties, and care guides
    │   │   └── banner_ad_view.tsx       # Configurable top/bottom revenue banner
    │   ├── l10n/
    │   │   └── app_strings.ts           # Complete English & Bengali translation dictionaries
    │   └── theme/
    │       └── app_theme.ts             # Light & Dark theme tokens, font scaler, responsive metrics
    ├── models/
    │   ├── user_model.ts                # Profile schemas, session state, theme preferences
    │   ├── plant_model.ts               # Core plant entity, QR code metadata, harvest dates
    │   ├── plant_log_model.ts           # Timeline history entries (watering, fertilizer, photos)
    │   ├── plant_forecast_model.ts      # Yield countdowns, weather vulnerability indexes
    │   ├── rooftop_plan_model.ts        # Rooftop wizard configuration, drainage & soil guides
    │   └── care_schedule_model.ts       # Granular weather-adjusted water/fertilizer schedules
    ├── screens/
    │   ├── auth/                        # Clean centered login, registration & legal modals
    │   ├── home/                        # Hero greeting, weather, quick tools, plant cards
    │   ├── my_garden/                   # Garden list/grid, plant registration modal, search
    │   ├── plant_profile/               # Dual tabs: Status/Organic Care & Precision Pruning Engine
    │   ├── scanner/                     # AI camera viewfinder, leaf disease diagnosis, remedies
    │   ├── rooftop_planner/             # Sunlight, space & rooftop drainage wizard
    │   ├── weather_care/                # Microclimate recommendations, 7-day forecast
    │   ├── directory/                   # Agricultural contacts directory & Gardener Experience Vault
    │   └── settings/                    # Profile settings, theme toggle, cloud backup, sign out
    └── services/
        ├── auth_service.ts              # Authentication & user profile persistence
        ├── local_db_service.ts          # Offline-first AsyncStorage CRUD operations
        ├── cloud_sync_service.ts        # Cloud backup & restoration engine
        ├── online_botanical_service.ts  # Online spell-correction, enrichment, lifecycle guidelines
        ├── precision_pruning_service.ts # 1G/2G/3G branch pruning algorithms for 2x yield
        ├── local_directory_service.ts   # Remotely updatable directory & gardener experience vault
        ├── ai_scanner_service.ts        # AI plant identification & interactive symptom diagnosis
        ├── qr_pdf_service.ts            # QR tag generator, printable multi-size PDF layout
        ├── weather_service.ts           # District weather forecasts & smart water prescriptions
        └── ad_service.ts                # Banner ad layout & placement configuration
```

---

## 4. Key Functional Modules & Architectural Review

### 1. Botanical Search & Typo Verification Engine
- **Implementation:** `lib/services/online_botanical_service.ts` & `lib/core/components/botanical_search_modal.tsx`
- **Capabilities:**
  - Auto-corrects misspelled plant names entered by users (e.g., "sabeda" -> "সফেদা (Sapodilla / Manilkara zapota)").
  - Enriches new plant profiles with verified botanical data: ideal pH (5.5 - 6.8), soil mixtures (loamy + vermicompost), watering intervals, sunlight requirements (6+ hours), and yield timelines.
  - Interactive search modal accessible from both the Homepage and the Garden tab.

### 2. Dual-Tab Plant Profile & Precision Pruning Regimen
- **Implementation:** `lib/screens/plant_profile/plant_profile_screen.tsx` & `lib/services/precision_pruning_service.ts`
- **Tab 1 — Care & Organic Remedies:**
  - Real-time soil moisture estimate, age in days, time since last watered.
  - Organic remedies for common pests (Neem oil spray, garlic-chili deterrent, wood ash).
  - Messenger-style scrollable timeline with checkboxes for watering and fertilizing.
- **Tab 2 — Precision Pruning for 2x Yield:**
  - Step-by-step 1G, 2G, and 3G pruning instructions tailored to gourd, tomato, chili, and lemon plants.
  - Visual stage progression with optimal timing and expected yield boost multipliers.

### 3. Hyper-Local Climate Advisory & Crop Recommendations
- **Implementation:** `lib/screens/weather_care/weather_care_screen.tsx` & `lib/services/weather_service.ts`
- **Capabilities:**
  - Real-time district weather synthesis (temperature, humidity, precipitation).
  - District-specific crop suitability matching local soil and rainfall conditions across all 64 districts of Bangladesh.
  - 7-day past, today, and 7-day future weather forecasts.

### 4. Verified Directory & Gardener Experience Vault
- **Implementation:** `lib/screens/directory/directory_screen.tsx` & `lib/services/local_directory_service.ts`
- **Capabilities:**
  - Remote-updatable contact directory for nursery owners, seed suppliers, and upazila agriculture officers (`remote_master_contacts.json`).
  - Community Experience Vault allowing gardeners to share tips and upvote practical solutions.

### 5. Seamless Native-Style Navigation & Profile System
- **Implementation:** `lib/core/components/bottom_nav_bar.tsx` & `lib/screens/settings/settings_screen.tsx`
- **Highlights:**
  - 5-tab responsive bottom navigation dock with a dedicated light-white unselected tile and vibrant green active state for the **Scan** action.
  - Synchronized user profile data across the Homepage greeting header and the Profile settings page.
  - Clean one-tap theme toggle between Light Mode and Dark Mode.

---

## 5. Review Checklist for the Reviewing AI

When conducting an audit of this project, please evaluate the following core areas:

1. **Architecture & Separation of Concerns:**
   - Are the service abstractions (`LocalDbService`, `CloudSyncService`, `OnlineBotanicalService`) clean, maintainable, and decoupled from UI components?
2. **Performance & Scalability:**
   - Are list renderings in `MyGardenScreen` and `DirectoryScreen` optimized for hundreds of plant entries and timeline logs?
   - Is AsyncStorage accessed efficiently with proper caching?
3. **TypeScript Quality & Safety:**
   - Review `lib/models/` for complete type safety, null-checks, and avoidance of unnecessary `any` casts.
4. **Offline Resilience & Data Integrity:**
   - Does the app handle lack of network gracefully? Are online features equipped with fallback botanical databases?
5. **UI/UX & Mobile Responsiveness:**
   - Does the design adapt cleanly between narrow mobile viewports (360px-420px) and wide tablet/desktop viewports?
   - Are touch targets, typography hierarchy, and color contrast compliant with accessibility guidelines (WCAG AAA/AA)?
6. **Feature Enhancements & Botanical Accuracy:**
   - What additional horticultural features would deliver maximum value to urban rooftop gardeners?
   - Are the organic remedy formulas and 1G/2G/3G pruning guidelines botanically sound?

---

## 6. Accessing Code & Live Artifacts

- **View Live Mobile Web App:** [https://ab134a1a44c02b.lhr.life](https://ab134a1a44c02b.lhr.life)
- **Inspect Complete Codebase in One File:** [https://ab134a1a44c02b.lhr.life/bagani-codebase.txt](https://ab134a1a44c02b.lhr.life/bagani-codebase.txt)
- **Review Specification Markdown:** [https://ab134a1a44c02b.lhr.life/project-review.md](https://ab134a1a44c02b.lhr.life/project-review.md)
