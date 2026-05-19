/**
 * API client for PlanView backend.
 * All requests go through this — single point for auth, error handling, etc.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FetchOptions {
  params?: Record<string, string | number>;
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string | number>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async get<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const url = this.buildUrl(path, options.params);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: options.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new ApiError(response.status, error.error || "Request failed", error.details);
    }

    return response.json();
  }
}

export class ApiError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(status: number, message: string, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const api = new ApiClient(API_BASE);
