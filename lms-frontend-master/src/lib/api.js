import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:3004/api";

export const makeApiRequest = async ({
  endpoint,
  method = "GET",
  body,
  suppressToast = false,
}) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include", // Always include cookies for authentication
    });

    // Handle non-JSON responses (like 204 No Content)
    if (response.status === 204) {
      return { response: { success: true } };
    }

    const responseData = await response.json();

    // Handle error responses
    if (!response.ok) {
      const errorMessage =
        responseData.error || responseData.message || "An error occurred";

      // Only show toast if not suppressed and not a 401 (authentication) error
      // 401 errors are expected when checking authentication status
      if (!suppressToast && response.status !== 401) {
        toast.error(errorMessage);
      }

      return { error: errorMessage, response: responseData };
    }

    // Handle success messages
    if (responseData.message && !suppressToast) {
      toast.success(responseData.message);
    }

    return { response: responseData };
  } catch (error) {
    console.error("API Error:", error);
    if (!suppressToast) {
      toast.error(error.message || "Network error occurred");
    }
    return { error: error.message || "Network error occurred" };
  }
};
