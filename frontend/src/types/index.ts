export interface PredictionInput {
  latitude: number;
  longitude: number;
  rainfall_24h_mm: number;
  rainfall_72h_mm: number;
  rainfall_7d_mm: number;
  rainfall_intensity_3h_mm: number;
  rainfall_anomaly_pct: number;
  elevation_m: number;
  slope_deg: number;
  aspect_deg: number;
  curvature: number;
  soil_moisture: number;
  clay_pct: number;
  ndvi: number;
  geology_risk_index: number;
  displacement_mm: number;
  historical_landslide_count: number;
  distance_to_road_km: number;
  distance_to_settlement_km: number;
  infrastructure_exposure_index: number;
}

export interface PredictionResult {
  prediction: number;
  landslide_probability: number;
  risk_score: number;
  risk_class: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface HotspotRecord {
  date: string;
  state: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_class: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  landslide_occurrence: number;
}

export interface SummaryStats {
  total_records: number;
  critical_zones: number;
  high_risk_zones: number;
  moderate_zones: number;
  low_risk_zones: number;
  landslide_events: number;
  states_monitored: number;
}

export interface HealthCheck {
  status: string;
  service: string;
  model_loaded: boolean;
}

export interface BroadcastRequest {
  state: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_class: string;
  message: string;
}

export interface BroadcastResponse {
  status: string;
  message: string;
  broadcast_id: string;
  timestamp: string;
}
