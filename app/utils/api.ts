export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token is invalid or expired
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return response;
}
