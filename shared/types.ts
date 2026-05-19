/**
 * Shared types between frontend and backend.
 * Import from both projects for type safety.
 */

// --- Geocoding ---
export interface GeocodeSuggestion {
  address: string;
  lat: number;
  lng: number;
  propertyId?: string;
}

// --- Zoning & Controls ---
export interface PlanningControls {
  zone: {
    code: string;       // e.g. "R2"
    name: string;       // e.g. "Low Density Residential"
    description: string; // Plain English
  };
  height: {
    metres: number | null;
    source: string;
  };
  fsr: {
    ratio: number | null;
    source: string;
  };
  lotSize: {
    sqm: number | null;
    source: string;
  };
  heritage: boolean;
}

// --- Development Applications ---
export interface DevelopmentApplication {
  id: string;
  applicationNumber: string;
  description: string;
  status: string;
  lodgedDate: string;
  determinedDate?: string;
  estimatedCost?: number;
  applicant?: string;
  address: string;
  lat: number;
  lng: number;
  type: "DA" | "CDC";
}

export interface DASearchResult {
  applications: DevelopmentApplication[];
  total: number;
  page: number;
  pageSize: number;
}

// --- Hazards ---
export interface HazardResult {
  flood: {
    affected: boolean;
    level?: string;
  };
  bushfire: {
    affected: boolean;
    category?: string;
  };
  landslide: {
    affected: boolean;
    risk?: string;
  };
  acidSulfate: {
    affected: boolean;
    class?: number;
  };
}

// --- Connectivity ---
export interface NearbyStation {
  name: string;
  type: "train" | "metro" | "light_rail";
  distanceKm: number;
  walkMinutes: number;
}

// --- API Response Wrapper ---
export interface ApiResponse<T> {
  data: T;
  cached: boolean;
  timestamp: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
