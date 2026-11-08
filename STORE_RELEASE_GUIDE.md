# 🚀 BAGANI — Google Play Store & Apple App Store Release Guide (Phase 6)

**App Name:** BAGANI  
**Subtitle / Short Description:** Smart Gardening & Plant Care  
**Tagline:** *Grow Smart, Live Green.*  
**Package / Bundle Identifier:** `com.profix.bagani`  
**Company / Publisher:** ProFix - Web & Soft  

---

## 1. Platform & OS Compatibility Matrix

| Platform | Minimum Supported Version | Target / Maximum Tested Version | Store Format |
| :--- | :--- | :--- | :--- |
| **Android (Google Play Store)** | **Android 10 (API 29)** | **Android 15 / 16+ (API 35+)** & future releases | `.aab` (Play Store) / `.apk` (Direct Testing) |
| **iOS (Apple App Store)** | **iOS 15.0** | **iOS 18 – iOS 27+** & future releases | `.ipa` (App Store Connect / TestFlight) |
| **Web (Browser PWA)** | All modern Chromium, Safari & Firefox browsers | Responsive Desktop & Mobile Web | Static / Metro Web Bundle |

---

## 2. Google Play Store & Apple App Store Compliance Verification

1. **Scoped Storage & Photo Privacy (Android 10–16+ & iOS 15–27+):**
   - Legacy storage permissions (`READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `MANAGE_EXTERNAL_STORAGE`) are explicitly blocked in `app.json`.
   - Uses system Photo Picker (`expo-image-picker`) and print spooler (`expo-print`) without intrusive file-system permissions.
2. **Coarse Foreground-Only Location & Manual District Fallback:**
   - Requests only `ACCESS_COARSE_LOCATION` / `NSLocationWhenInUseUsageDescription` with full manual Bangladesh District selector fallback (`BANGLADESH_DISTRICTS`).
3. **Sign-In Parity & In-App Account Deletion (Apple Guideline 4.8 & 5.1.1(v), Google Play Data Safety):**
   - Includes both **Continue with Google** and **Continue with Apple**.
   - Provides immediate, self-service **Delete Account & Cloud Data (`🗑️ অ্যাকাউন্ট ও ডেটা ডিলিট`)** inside Settings with confirmation dialog.
4. **Apple `PrivacyInfo.xcprivacy` Manifest:**
   - Configured in `app.json` under `ios.privacyManifests` with required `NSPrivacyAccessedAPITypes` reasons (`CA92.1`, `C617.1`, `E174.1`, `35F9.1`).
5. **Ad Policy Compliance:**
   - Banner Ad slots (`BannerAdSlot`) are strictly bounded inside `SafeAreaView`, clearly labeled with an `AD` badge, and separated from navigation targets.

---

## 3. Build & Deployment Commands

### Run Live in Browser (Local Development)
```powershell
npm.cmd run web
```

### Run TypeScript Verification
```powershell
npm.cmd run typecheck
```

### Build Signed Android App Bundle (`.aab`) for Google Play Store
```powershell
npx.cmd eas-cli build --platform android --profile production
```

### Build Preview Android APK (`.apk`) for Direct Device Testing
```powershell
npx.cmd eas-cli build --platform android --profile preview
```

### Build Signed iOS Release (`.ipa`) for Apple App Store Connect
```powershell
npx.cmd eas-cli build --platform ios --profile production
```

