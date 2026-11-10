# 🎨 BAGANI – Design System & UI/UX Architecture Specification (v2.5)

## 1. Project Information
- **Application Name:** BAGANI (বাগানি)
- **Application Subtitle:** Smart Gardening & Rooftop Plant Care
- **Application Version:** `2.5.0` (Build `25`)
- **Package Identifier:** `com.profix.bagani`
- **Developer Organization:** ProFix - Web & Soft
- **Target Platforms:** Android (API 29–35+), iOS (iOS 15.0–18+), Progressive Web App (PWA)
- **Primary Audience:** Urban Rooftop Gardeners, Balcony Growers, Botanical Enthusiasts, Master Agronomists, and Kitchen Gardeners.

---

## 2. Design Vision & Philosophy

BAGANI v2.5 implements a modern, minimalist, professional, and accessible UI/UX standard optimized for both compact mobile viewports and large desktop screens.

### Core Principles
1. **Clarity & Purpose First:** Every visual element has a functional purpose. Unnecessary shadows, heavy gradient overlays, and decorative clutter are eliminated in favor of clean lines, balanced whitespace, and readable typography.
2. **Compact Typography Hierarchy:** Text sizing is tuned for information density without sacrificing readability. Long headings wrap cleanly without overflowing or compressing adjacent controls into awkward single-letter breaks.
3. **Consistent Component Design:** Symmetrical card radiuses, unified padding tokens, consistent icon sizing (20–24px), and standardized interactive button heights.
4. **Resilient Responsive Layouts:** Flexible Yoga Flexbox rules with explicit `minWidth: 0`, `flexShrink: 0`, and `flexWrap: 'wrap'` prevent text overflow and button displacement across narrow mobile screens.
5. **Full Theme Harmony:** Complete dual-mode support for Light and Dark themes with strict WCAG AAA / AA contrast ratios.
6. **Cross-Platform Native Parity:** Identical functionality between Web previews and Android native APKs (runtime camera viewfinder, media picker permissions, local SQLite/AsyncStorage sync, and print service).

---

## 3. Brand & Semantic Color Tokens

### Core Botanical Palette
| Semantic Token | Hex Value | Purpose |
| :--- | :--- | :--- |
| **Primary Botanical Green** | `#167A45` | Primary brand accent, primary CTA buttons, active state highlights |
| **Secondary Leaf Green** | `#20A464` | Sub-highlights, secondary badges, success confirmations |
| **Soft Sage Mint** | `#E7F4EB` | Selected backgrounds, subtle notification banners (Light mode) |
| **Deep Forest Emerald** | `#123B29` | Botanical header contrast, premium card backgrounds |
| **Fresh Lime Indicator** | `#B9DB54` | High-visibility attention markers, live status dots |

### Theme Mode Tokens

#### Light Theme (`LIGHT_THEME`)
```typescript
{
  primary: '#167A45',
  primaryDark: '#0E5C32',
  secondary: '#20A464',
  background: '#F7F9F7',
  surface: '#FFFFFF',
  surfaceElevated: '#F0F5F1',
  textPrimary: '#17231C',
  textSecondary: '#66736A',
  border: '#E5EBE6',
  cardBackground: '#FFFFFF',
  accent: '#20A464',
  warning: '#E67E22',
  error: '#DC2626',
  success: '#16A34A',
  badgeBg: '#E7F4EB',
  badgeText: '#167A45',
}
```

#### Dark Theme (`DARK_THEME`)
```typescript
{
  primary: '#55C889',
  primaryDark: '#3DA86E',
  secondary: '#83D6A5',
  background: '#101713',
  surface: '#19231D',
  surfaceElevated: '#222E26',
  textPrimary: '#EDF5EF',
  textSecondary: '#A1B0A5',
  border: '#2D3B32',
  cardBackground: '#19231D',
  accent: '#55C889',
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#22C55E',
  badgeBg: '#1A3324',
  badgeText: '#83D6A5',
}
```

---

## 4. Typography & Font Hierarchy

The typography system is engineered for dual Bengali and English readability, maintaining vertical balance across both scripts.

- **Bengali Primary Font:** `Hind Siliguri` (fallback: `Noto Sans Bengali`, sans-serif)
- **English Primary Font:** `Inter` (fallback: `Roboto`, system-ui, -apple-system)

### Type Scale
| Level | Font Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display Title** | `22–24px` | `28–30px` | Bold (`800`) | Screen headers, top modal headers |
| **Section Title** | `17–19px` | `24–26px` | Bold (`700`) | Major card sections, wizard steps |
| **Card Heading** | `15–16px` | `21–22px` | SemiBold (`700`) | Plant names, crop card titles, post titles |
| **Body Primary** | `13.5–14px`| `19–20px` | Regular (`500`) | Standard descriptions, guide steps, details |
| **Body Secondary**| `12–13px` | `17–18px` | Regular (`400`) | Metadata, timestamps, helper descriptions |
| **Caption / Badge**| `11–12px`| `15–16px` | Bold (`700`) | Category pills, suitability tags, chip text |
| **Button Label** | `13–14px` | `18–19px` | Bold (`700`) | Interactive CTA buttons, tab selectors |

---

## 5. Spacing, Elevation & Shape Tokens (`DESIGN_TOKENS`)

- **Screen Horizontal Inset:** `16px` (mobile), `24px` (tablet/desktop container max-width: `560px` centered)
- **Card Padding:** `14–16px`
- **Border Radius:**
  - Standard Cards: `14px`
  - Large Modal Panels: `20px` (top sheet / dialog)
  - Interactive Buttons & Inputs: `12px`
  - Chips & Badges: `8–10px`
  - Circular Avatars & FABs: `9999px`
- **Border Widths:** `1.2px` to `1.5px` (solid, clean edge definition without muddy shadows)
- **Elevation / Shadow:** Soft, low-blur offset (`0px 1px 3px rgba(0, 0, 0, 0.05)`) ensuring crisp rendering on both OLED and LCD panels.

---

## 6. Navigation Architecture

BAGANI v2.5 features a **5-Tab Bottom Navigation Bar** with high-contrast active states, clear icon symbology, and localized labels:

```
┌─────────────────────────────────────────────────────────────┐
│                       BAGANI v2.5                           │
│  [Logo] BAGANI (বাগানি)         (3) [Bell]  [Lang]  [Theme] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      Active Screen Body                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Home]   [My Garden]   [  (📷)  ]   [Guide]   [Profile]    │
│  হোম        বাগান         স্ক্যান        গাইড       প্রোফাইল   │
└─────────────────────────────────────────────────────────────┘
```

### Screen Modules

#### 1. Home Screen (`home`)
- **Brand Header:** BAGANI identity, notification counter, language switcher, and light/dark theme toggle.
- **Micro-Weather Glance:** Live temperature, humidity, rainfall probability, and rooftop care advisory.
- **Garden Metrics Counter:** Total plants, plants needing water, active disease logs, rooftop load factor.
- **Quick Action Bar:** Direct access to Camera Scanner, Add New Plant, and Weather Advisory.
- **Care Alerts & Daily Schedule:** Dynamic daily rooftop tasks based on current district conditions.
- **Global Botanical Search Engine Floating Trigger:** Quick modal search across verified botanical varieties.

#### 2. My Garden Screen (`my_garden`)
- **Interactive Plant Inventory:** Filterable grid/list by category (Fruits, Vegetables, Flowers, Herbs, Bonsai).
- **Smart Watering Calculator:** Modal tool calculating exact water volume (liters) from pot size, soil mixture, and weather.
- **Plant Profile & Timeline:** Detailed growth logs, pruning records, fertilizer cycles, and photo timeline.
- **QR Tag Generator & Exporter:** Single and batch A4 printable waterproof plant identification QR tags with botanical details.

#### 3. AI Botanical Scanner Screen (`scan`)
- **Dual-Engine Architecture:**
  - Native Android `expo-camera` (`CameraView`) with real-time viewfinder and torch support.
  - Web fallback `<video>` / canvas snapshot engine for browser previews.
- **AI Plant Pathology & Health Vision:**
  - Gemini Vision 2.5 Flash botanical pathology engine.
  - Offline local pattern-matching pathology engine for zero-connectivity field conditions.
- **Instant Health Report:** Disease identification, confidence percentage, symptoms analysis, organic & chemical remedies, and long-term prevention protocols.
- **Integrated QR Tag Scanner:** Immediate redirection to plant profiles via printed QR tags.

#### 4. Practical Guide & Directory Screen (`guide`)
Structured into 3 main sub-views:
1. **Rooftop Planner Wizard (`planner`):**
   - Structural load safety guidelines (kg/sq.ft).
   - Sun exposure matrix (Full Sun, Partial Shade, Heavy Shade).
   - Geo-bag & container allocation calculator (5 gal to 45 gal).
   - Organic potting soil composition ratios (Loam, Vermicompost, Cocopeat, Trichoderma).
2. **Weather & Rooftop Care Dashboard (`weather`):**
   - 7-day microclimate forecast tailored to Bangladeshi divisional agro-zones.
   - District-adapted crop recommendations with clean, full-width title hierarchy and distinct suitability badges.
   - Seasonal rooftop hazard alerts (nor'westers, heatwaves, heavy monsoon drainage).
3. **Agriculture Directory & Community (`directory`):**
   - 5 dedicated directory sections:
     - 🏛️ **Agriculture Office (কৃষি অফিস):** Upazila & district DAE contact directories and hotline links.
     - 👨‍🌾 **Master Gardeners (অভিজ্ঞ বাগানী):** Verified rooftop experts, specialization badges, and consultation contacts.
     - 🪴 **Nurseries (নার্সারি ও চারা):** Certified organic nurseries and grafting specialists.
     - 💡 **Experience Vault (অভিজ্ঞতা ভল্ট):** Community-contributed rooftop case studies with structured pruning secrets and harvest yield records.
     - 💬 **Community (বাগানী আড্ডা):** Live Q&A and gardening exchange forum.

#### 5. Profile & Settings Screen (`profile`)
- **Compact Brand Header:** Clean aligned logo, localized brand name, and subtle utility buttons.
- **User Profile Information Card:** Side-by-side profile picture and user credentials, verified gardener badge, location, and organization tags.
- **Gardening Credentials:** Rooftop area, registered plant count, experience years.
- **App Settings & Tools:** Language preference, Theme mode (Light / Dark / System), Cloud data sync, Local cache backup.
- **Software Information:** App version `2.5.0`, build code `25`, developer credentials (ProFix - Web & Soft), Terms of Service, and Privacy Policy.

---

## 7. Android Native Parity & Permissions Standard

To guarantee 100% feature equality between web development previews and the native Android release APK:

1. **Camera Implementation:**
   - Native builds dynamically mount `<CameraView>` from `expo-camera`.
   - Web builds mount `<video>` with `navigator.mediaDevices.getUserMedia`.
2. **Runtime Permission Flow:**
   - Explicit calls to `requestCameraPermissionsAsync()` before camera viewfinder initialization.
   - Explicit calls to `requestMediaLibraryPermissionsAsync()` before photo gallery selection.
3. **Manifest Directives (`AndroidManifest.xml`):**
   - `android.permission.CAMERA`
   - `android.permission.READ_MEDIA_IMAGES` (Android 13+ / API 33+)
   - `android.permission.READ_EXTERNAL_STORAGE` (`maxSdkVersion="32"` for Android <= 12)
   - `android.permission.WRITE_EXTERNAL_STORAGE` (`maxSdkVersion="32"`)
   - `android:usesCleartextTraffic="true"` (ensuring local weather and tile asset connectivity)
4. **Offline Resilience:**
   - Local mock/cached botanical knowledge base ensures complete functionality when offline.
   - Local AsyncStorage and SQLite state persistence ensure user plants, notes, and photos persist without server dependencies.

---

*BAGANI v2.5 — Engineering excellence for smart urban agriculture.*
