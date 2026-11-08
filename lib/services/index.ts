export * from './auth_service';
export * from './ad_service';
export * from './local_db_service';
export * from './cloud_sync_service';
export * from './weather_service';
export * from './notification_service';
export * from './ai_scanner_service';
export * from './qr_pdf_service';

export interface ServiceStatus {
  serviceName: string;
  isOfflineCapable: boolean;
  isInitialized: boolean;
}

export const CORE_SERVICES_REGISTRY: ServiceStatus[] = [
  { serviceName: 'AuthService', isOfflineCapable: true, isInitialized: true },
  { serviceName: 'AdService', isOfflineCapable: true, isInitialized: true },
  { serviceName: 'LocalDbService', isOfflineCapable: true, isInitialized: true },
  { serviceName: 'CloudSyncService', isOfflineCapable: true, isInitialized: true },
  { serviceName: 'QrPdfService', isOfflineCapable: true, isInitialized: true },
  { serviceName: 'AiScannerService', isOfflineCapable: true, isInitialized: true },
  { serviceName: 'WeatherService', isOfflineCapable: true, isInitialized: true },
  { serviceName: 'NotificationService', isOfflineCapable: true, isInitialized: true },
];
