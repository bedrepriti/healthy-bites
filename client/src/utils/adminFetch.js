import { API_BASE } from "./apiBase";

// Admin API helper
export async function adminApiRequest(endpoint, options = {}) {
  const adminToken = localStorage.getItem("PRITI_ADMIN_KEY");

  const headers = {
    "x-admin-key": adminToken || "",
    ...(options.headers || {}),
  };

  // Only set JSON header if body is NOT FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const msg = data.message || `API Error: ${response.status}`;
      throw new Error(msg);
    }

    return response;
  } catch (error) {
    console.error("Admin API request failed:", error);
    throw error;
  }
}