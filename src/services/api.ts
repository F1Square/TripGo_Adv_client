// API endpoints
// Prefer Vite env, then runtime window override, then production backend, then localhost.
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) ||
  'https://trip-go-adv-server.vercel.app/api' ||
  'http://localhost:3000/api';
// Request configuration
interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

// API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    const token = localStorage.getItem('trip_tracker_token');
    console.log('Getting auth token:', token ? 'Token found' : 'No token found');
    return token;
  }

  private async request<T>(endpoint: string, config: RequestConfig = { method: 'GET' }): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const token = this.getAuthToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.headers,
      };

      // Add authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('Adding Authorization header');
      } else {
        console.log('No token available - request will be unauthorized');
      }

      console.log('Request headers:', headers);
      console.log('Request URL:', url);

      const requestConfig: RequestInit = {
        method: config.method,
        headers,
      };

      // Add body for non-GET requests
      if (config.body && config.method !== 'GET') {
        requestConfig.body = JSON.stringify(config.body);
      }

      const response = await fetch(url, requestConfig);

      // Handle no-content responses (e.g., CORS preflight, 204/205)
      if (response.status === 204 || response.status === 205) {
        return response.ok
          ? { success: true } as ApiResponse<T>
          : { success: false, error: response.statusText };
      }

      // Safely read body and parse JSON when present
      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();

      let data: any = undefined;
      if (rawText && contentType.includes('application/json')) {
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          // Fall back to text error on malformed JSON
          data = undefined;
        }
      }

      if (!response.ok) {
        // Normalize error into a readable string (avoid passing objects to UI)
        const payload = data && (data.error ?? data.message ?? data);
        let errorText: string | undefined;
        if (typeof payload === 'string') {
          errorText = payload;
        } else if (payload && typeof payload === 'object') {
          const code = (payload as any).code;
          const message = (payload as any).message;
          errorText = [code, message].filter(Boolean).join(': ') || JSON.stringify(payload);
        } else {
          errorText = rawText || undefined;
        }

        return {
          success: false,
          error: errorText || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  // POST request
  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  // PUT request
  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  // DELETE request
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Create and export a default instance
export const apiService = new ApiService();
export default apiService;