export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(path, method = "GET", body = null, token = null) {
  const res = await fetch(`http://localhost:5000/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    throw new Error(`Request failed with ${res.status}`);
  }

  return await res.json();
}
