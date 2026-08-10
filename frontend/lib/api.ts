const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Kitchen {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodStock {
  id: string;
  kitchenId: string;
  menuName: string;
  portionCount: number;
  cookedAt?: string | null;
  safeUntil?: string | null;
  status: 'AVAILABLE' | 'MATCHED' | 'EXPIRED' | 'DISTRIBUTED';
  createdAt?: string;
  updatedAt?: string;
  kitchen?: Kitchen;
}

export interface Recipient {
  id: string;
  name: string;
  type: 'PANTI' | 'PENERIMA';
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchResultData {
  matchFound: boolean;
  foodId?: string;
  kitchenName?: string;
  kitchenId?: string;
  kitchenLatitude?: number;
  kitchenLongitude?: number;
  distanceKm?: number;
  estimatedTravelTimeMinutes?: number;
  menuName?: string;
  portionCount?: number;
  safeUntil?: string;
  food?: FoodStock;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options?.headers || {}),
      },
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || json.error || `HTTP error! status: ${res.status}`);
    }
    return json;
  } catch (error: any) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

// KITCHEN API
export async function getKitchens(): Promise<Kitchen[]> {
  const res = await request<Kitchen[]>('/kitchens');
  return res.data;
}

export async function createKitchen(data: { name: string; address: string; latitude: number; longitude: number }): Promise<Kitchen> {
  const res = await request<Kitchen>('/kitchens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateKitchen(id: string, data: Partial<Kitchen>): Promise<Kitchen> {
  const res = await request<Kitchen>(`/kitchens/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteKitchen(id: string): Promise<void> {
  await request(`/kitchens/${id}`, { method: 'DELETE' });
}

// RECIPIENT API
export async function getRecipients(): Promise<Recipient[]> {
  const res = await request<Recipient[]>('/recipients');
  return res.data;
}

export async function createRecipient(data: {
  name: string;
  type: 'PANTI' | 'PENERIMA';
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
}): Promise<Recipient> {
  const res = await request<Recipient>('/recipients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateRecipient(id: string, data: Partial<Recipient>): Promise<Recipient> {
  const res = await request<Recipient>(`/recipients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteRecipient(id: string): Promise<void> {
  await request(`/recipients/${id}`, { method: 'DELETE' });
}

// FOOD API
export async function getFoods(status?: string, expired?: boolean): Promise<FoodStock[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (expired !== undefined) params.append('expired', String(expired));
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await request<FoodStock[]>(`/foods${query}`);
  return res.data;
}

export async function createFood(data: {
  kitchenId: string;
  menuName: string;
  portionCount: number;
  cookedAt?: string;
}): Promise<FoodStock> {
  const res = await request<FoodStock>('/foods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function createFoodFromOcr(formData: FormData): Promise<FoodStock> {
  const res = await request<FoodStock>('/foods/from-ocr', {
    method: 'POST',
    body: formData,
  });
  return res.data;
}

export async function updateFoodStatus(id: string, status: 'AVAILABLE' | 'MATCHED' | 'EXPIRED' | 'DISTRIBUTED'): Promise<FoodStock> {
  const res = await request<FoodStock>(`/foods/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.data;
}

export async function deleteFood(id: string): Promise<void> {
  await request(`/foods/${id}`, { method: 'DELETE' });
}

// MATCHING API
export async function findMatches(recipientId: string, maxRadiusKm: number = 5): Promise<MatchResultData> {
  const res = await request<MatchResultData>('/matching/find', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientId, maxRadiusKm }),
  });
  return res.data;
}

// OCR API
export async function processOcr(formData: FormData): Promise<{ extractedText: string; parsedDate: string }> {
  const res = await request<{ extractedText: string; parsedDate: string }>('/ocr', {
    method: 'POST',
    body: formData,
  });
  return res.data;
}
