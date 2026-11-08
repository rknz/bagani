# 🎨 BAGANI – Professional UI/UX Redesign & Design System

## Project Information
- **App Name:** BAGANI
- **App Subtitle:** Smart Gardening & Plant Care
- **Tagline:** Grow Smart, Live Green.
- **Developer / Company:** ProFix - Web & Soft
- **Package Identifier:** `com.profix.bagani`
- **Target Platforms:** Android (API 29–35+) & iOS (iOS 15.0–27+)
- **Target Users:** Rooftop Gardeners, Plant Lovers, Home Gardeners, and Vegetable Growers.

---

## 1. Design Vision
Redesign the entire BAGANI application with a premium, modern, minimalist, and professional UI/UX. The application feels like a high-quality modern gardening technology platform.

**Design Principles:**
- Clean and minimalist.
- Nature-inspired but not overly green.
- Modern and elegant.
- Easy to navigate.
- Consistent across all screens.
- Excellent readability in Bengali and English.
- Fully responsive for Android, iOS, and Web.
- Avoid excessive gradients, unnecessary shadows, colorful cards, decorative elements, and inconsistent UI components.

---

## 2. Brand Color System

| Semantic Token | Hex Value | Purpose |
| :--- | :--- | :--- |
| **Primary Green** | `#167A45` | Primary brand identity & primary buttons (Light) |
| **Secondary Green** | `#20A464` | Secondary accents & active states |
| **Soft Green** | `#E7F4EB` | Selected surface & subtle botanical highlights |
| **Deep Forest** | `#123B29` | Deep botanical contrast accent |
| **Fresh Lime** | `#B9DB54` | High-visibility botanical indicator |

### Light Theme (`LIGHT_THEME`)
- **Background:** `#F7F9F7`
- **Surface:** `#FFFFFF`
- **Primary Text:** `#17231C`
- **Secondary Text:** `#66736A`
- **Border:** `#E5EBE6`
- **Primary Button:** `#167A45`
- **Selected Surface:** `#E7F4EB`

### Dark Theme (`DARK_THEME`)
- **Background:** `#101713`
- **Surface:** `#19231D`
- **Elevated Surface:** `#222E26`
- **Primary Text:** `#EDF5EF`
- **Secondary Text:** `#A1B0A5`
- **Border:** `#2D3B32`
- **Primary Green:** `#55C889`
- **Secondary Green:** `#83D6A5`
- **Selected Surface:** `#233D2D`

---

## 3. Typography System

- **Bengali:** Primary `Hind Siliguri`, Fallback `Noto Sans Bengali`
- **English:** Primary `Inter`, Fallback `Roboto`

| Style | Size | Weight | Line Height |
| :--- | :--- | :--- | :--- |
| **Main Heading** | `28–32px` | Bold (`700`) | `36–40px` |
| **Section Heading** | `20–24px` | SemiBold (`600`) | `28–32px` |
| **Card Heading** | `16–18px` | SemiBold (`600`) | `24–26px` |
| **Body** | `14–16px` | Regular (`400`) | `22–24px` |
| **Caption** | `12–14px` | Regular (`400`) | `18–20px` |
| **Button** | `14–16px` | SemiBold (`600`) | `20–22px` |

---

## 4. Component Design System (`DESIGN_TOKENS`)

- **Main Card Radius:** `16px`
- **Small Card Radius:** `12px`
- **Button Radius:** `12px`
- **Input Radius:** `12px`
- **Screen Horizontal Padding:** `20px`
- **Card Padding:** `16px`
- **Standard Spacing:** `8px`, `12px`, `16px`, `24px`, `32px`
- **Button Height:** `48–52px` (`50px`)
- **Standard Icon Size:** `20–24px` (`22px`)

---

## 5. Navigation & Screen Architecture

### 5-Tab Bottom Navigation Bar
1. **Home (`home`)** — Welcome message, Live Weather summary & Weather Dashboard trigger, Registered Plant Statistics, Plants Requiring Attention, Today's Care Recommendations, Recent Plant Activities, Quick AI Diagnosis & QR Scan actions.
2. **My Garden (`my_garden`)** — Filterable Grid/List of registered plants, Manual Plant Search, Add/Register Plant modal, Printable QR Tag Designer & Batch A4 Sheet Exporter.
3. **Scan (`scan`)** — Prominent center access to **AI Plant Disease Diagnosis** (Camera capture, Gallery upload, Image preview, Diagnosis progress, Disease name, Confidence level, Symptoms, Suggested treatment, Prevention recommendations, Non-guaranteed AI disclaimer) and **QR Code Scanner**.
4. **Guide (`guide`)** — Smart Rooftop Garden Planner Wizard, 6-Stage Practical Lifecycle Guide, Weather-Based Care Dashboard, and District Agriculture Directory & Community.
5. **Profile (`profile`)** — User Profile, Notifications Center, Language Selection (`বাংলা` / `English`), Theme Selection (`System Default`, `Light Mode`, `Dark Mode`), Onboarding / Splash Preview, Cloud Sync Backup, and Settings.

