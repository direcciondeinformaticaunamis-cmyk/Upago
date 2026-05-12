
export const API_BASE_URL = import.meta.env.DEV 
    ? 'http://localhost:8001' 
    : window.location.origin;
export const API_URL = `${API_BASE_URL}/api.php`;

export const fetchApi = async (params: string = '', options: RequestInit = {}) => {
    const url = params ? `${API_URL}?${params}` : API_URL;
    const headers: Record<string, string> = { ...options.headers as any };
    
    // Automatically add Authorization token if available
    const token = localStorage.getItem('upago_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
};
