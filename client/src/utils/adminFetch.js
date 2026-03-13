// Healthy Bites Admin API Helper
// Author: Priti Bedre

const API_BASE_URL = import.meta.env.VITE_API_BASE;

export async function adminApiRequest(endpoint, options = {}) {
  const adminToken = localStorage.getItem("PRITI_ADMIN_KEY");

  const headers = {
    "x-admin-key": adminToken || "",
    ...(options.headers || {}),
  };

  // Do NOT set JSON header when sending FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Admin API request failed:", error);
    throw error;
  }
}