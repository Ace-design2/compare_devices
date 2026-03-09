import type { DeviceData } from "../components/DeviceSlot";

const API_BASE_URL = "http://localhost:5001";

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

// Fetch all devices (can be updated to handle query parameters later)
export const fetchAllDevices = async (): Promise<DeviceData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices`);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    return data.map(mapBackendDeviceToFrontend);
  } catch (error) {
    console.error("Error fetching all devices:", error);
    return [];
  }
};

// Fetch a single device by ID
export const fetchSingleDevice = async (
  deviceId: string | number,
): Promise<DeviceData | null> => {
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
