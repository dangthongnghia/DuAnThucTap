
import { redirect } from "next/navigation";

class HttpError extends Error {
  status: number;
  payload: any;

  constructor(status: number, payload: any) {
    super(`HTTP error ${status}`);
    this.status = status;
    this.payload = payload;
  }
}

const getAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("token");
};

export async function fetcher(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.append("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      // Token hết hạn hoặc không hợp lệ, xóa token và redirect về trang login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Dùng window.location để redirect vì đây là client-side
        window.location.href = "/login";
      }
    }
    
    throw new HttpError(response.status, errorPayload);
  }

  // Nếu response không có content (vd: 204 No Content)
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
