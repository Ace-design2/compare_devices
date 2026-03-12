import type { DeviceData } from "../components/DeviceSlot";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

// Basic device info for search results
export interface DeviceSearchItem {
  id: string;
  name: string;
  brand: string;
}

// Helper to safely extract and map backend backend structure to frontend format
export const mapBackendDeviceToFrontend = (device: any): DeviceData => {
  return {
    id: String(device.id),
    name: device.phone_model || device.model || "Unknown Model",
    brand: device.phone_brand || device.brand || "Unknown Brand",
    image: device.image_url || "",
    category: device.category || "",
    specs: device.specs || {},
  };
};

let memoryCache: DeviceData[] | null = null;
let searchCache: DeviceSearchItem[] | null = null;
const CACHE_KEY = "device_compare_app_devices_cache_v3";
const SEARCH_CACHE_KEY = "device_compare_app_search_cache_v2";

// Fetch minimal info for all devices for search
export const fetchDeviceSearchData = async (): Promise<DeviceSearchItem[]> => {
  if (searchCache) return searchCache;

  try {
    const sessionCache = sessionStorage.getItem(SEARCH_CACHE_KEY);
    if (sessionCache) {
      searchCache = JSON.parse(sessionCache);
      return searchCache!;
    }
  } catch (e) {
    console.warn("Failed to read search cache", e);
  }

  try {
    // Attempt to fetch minimal fields if backend supports it, otherwise fetch full and filter
    const response = await fetch(`${API_BASE_URL}/devices?fields=id,phone_model,phone_brand`);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    const mappedData: DeviceSearchItem[] = data.map((device: any) => ({
      id: String(device.id),
      name: device.phone_model || device.model || "Unknown Model",
      brand: device.phone_brand || device.brand || "Unknown Brand",
    }));

    searchCache = mappedData;
    try {
      sessionStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(mappedData));
    } catch (e) {
      console.warn("Failed to write search cache", e);
    }

    return mappedData;
  } catch (error) {
    console.error("Error fetching search data:", error);
    return [];
  }
};

// Fetch all devices (retaining for backward compatibility if needed, but optimized)
export const fetchAllDevices = async (): Promise<DeviceData[]> => {
  // If we already have full devices cached, use them
  if (memoryCache) return memoryCache;

  // Otherwise, we might want to avoid fetching 5000 full specs at once.
  // For now, let's keep the existing logic but recognize it might be heavy.
  try {
    const sessionCache = sessionStorage.getItem(CACHE_KEY);
    if (sessionCache) {
      memoryCache = JSON.parse(sessionCache);
      return memoryCache!;
    }
  } catch (e) {
    console.warn("Failed to read from session storage", e);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/devices`);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    const mappedData = data.map(mapBackendDeviceToFrontend);
    
    memoryCache = mappedData;
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(mappedData));
    } catch (e) {
      console.warn("Failed to write to session storage", e);
    }

    return mappedData;
  } catch (error) {
    console.error("Error fetching all devices:", error);
    return [];
  }
};

// Fetch a single device by ID
export const fetchSingleDevice = async (
  deviceId: string | number,
): Promise<DeviceData | null> => {
  // Try to grab from cache first if we have it
  if (memoryCache) {
    const found = memoryCache.find(d => d.id === String(deviceId));
    if (found) return found;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`);

    if (!response.ok) {
      if (response.status === 404) throw new Error("Device not found");
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return mapBackendDeviceToFrontend(data);
  } catch (error) {
    console.error(`Error fetching device ID ${deviceId}:`, error);
    return null;
  }
};

// Fetch multiple devices for comparison
export const fetchComparisonDevices = async (
  deviceIdsArray: (string | number)[],
): Promise<DeviceData[]> => {
  if (!deviceIdsArray || deviceIdsArray.length === 0) return [];

  // Try to resolve entirely from cache if possible
  if (memoryCache) {
    const foundDevices = memoryCache.filter(d => deviceIdsArray.map(String).includes(String(d.id)));
    if (foundDevices.length === deviceIdsArray.length) {
      return foundDevices;
    }
  }

  try {
    const idsString = deviceIdsArray.join(",");
    const response = await fetch(`${API_BASE_URL}/compare?ids=${idsString}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Network response was not ok");
    }

    const data = await response.json();
    return data.map(mapBackendDeviceToFrontend);
  } catch (error) {
    console.error("Error fetching comparison devices:", error);
    return [];
  }
};
