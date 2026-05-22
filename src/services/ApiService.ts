
export const API_BASE_URL = import.meta.env.DEV 
    ? 'http://localhost:8001' 
    : window.location.origin;
export const API_URL = `${API_BASE_URL}/api.php`;

export const fetchApi = async (params: string = '', options: RequestInit = {}) => {
    const url = params ? `${API_URL}?${params}` : API_URL;
    const headers: Record<string, string> = { ...options.headers as any };
    
    // Get token
    const token = localStorage.getItem('upago_token');
    
    // Inject token into body for POST requests to avoid header issues
    if (options.method === 'POST' && token) {
        let body = {};
        try {
            body = JSON.parse(options.body as string || '{}');
        } catch (e) {
            console.error("Error parsing request body", e);
        }
        body = { ...body, token };
        options.body = JSON.stringify(body);
    }
    
    // Keep Authorization header as fallback
    if (token && !options.body) {
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
