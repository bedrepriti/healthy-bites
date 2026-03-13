// Healthy Bites Admin API Helper
// Author: Priti Bedre

const API_BASE_URL = import.meta.env.VITE_API_BASE;

/**
 * Custom fetch wrapper for admin API calls
 * Automatically attaches admin key from localStorage
 */
export async function adminApiRequest(endpoint, options = {}) {
  const adminToken = localStorage.getItem("PRITI_ADMIN_KEY");

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminToken || "",
        ...(options.headers || {}),
      },
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