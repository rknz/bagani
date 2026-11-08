/**
 * BAGANI — Modular Screen Routes & Navigation Registry
 * Supports all 5 primary bottom navigation tabs (Home, My Garden, Scan, Guide, Profile)
 * plus dedicated views for all 18 screens in DESIGN_SYSTEM.md.
 */

export type AppScreenRoute =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'home'
  | 'my_garden'
  | 'scan'
  | 'guide'
  | 'profile'
  | 'plant_profile'
  | 'weather_dashboard'
  | 'notifications'
  // Legacy alias routes mapped seamlessly
  | 'qr_tracker'
  | 'planner'
  | 'scanner'
  | 'directory'
  | 'settings';
