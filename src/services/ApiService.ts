export const API_BASE_URL = import.meta.env.DEV 
    ? 'http://localhost:8001' 
    : window.location.origin;
export const API_URL = `${API_BASE_URL}/api.php`;

/**
 * Super robust JSON extractor that matches braces and brackets.
 * It ignores characters inside strings and handles escaping.
 * This is 100% immune to HTML/JS appended at the end of the JSON response by Hostinger.
 */
export function extractJson(text: string): string {
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    
    if (firstBrace === -1 && firstBracket === -1) {
        throw new Error("No JSON found in response");
    }
    
    const startIdx = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) 
        ? firstBrace 
        : firstBracket;
        
    const startChar = text[startIdx];
    const endChar = startChar === '{' ? '}' : ']';
    
    let count = 0;
    let inString = false;
    let escaped = false;
    
    for (let i = startIdx; i < text.length; i++) {
        const char = text[i];
        
        if (escaped) {
            escaped = false;
            continue;
        }
        
        if (char === '\\') {
            escaped = true;
            continue;
        }
        
        if (char === '"') {
            inString = !inString;
            continue;
        }
        
        if (!inString) {
            if (char === startChar) {
                count++;
            } else if (char === endChar) {
                count--;
                if (count === 0) {
                    return text.substring(startIdx, i + 1);
                }
            }
        }
    }
    
    throw new Error("JSON brace/bracket mismatch");
}

export const fetchApi = async (params: string = '', options: RequestInit = {}) => {
    const cb = `_cb=${Date.now()}`;
    const url = params ? `${API_URL}?${params}&${cb}` : `${API_URL}?${cb}`;
    const headers: Record<string, string> = { ...options.headers as any };
    
    // Get token
    const token = localStorage.getItem('upago_token');
    
    // Inject token into body for POST requests to avoid header issues
    if (options.method === 'POST' && token) {
        if (options.body instanceof FormData) {
            options.body.append('token', token);
        } else {
            let body = {};
            try {
                body = JSON.parse(options.body as string || '{}');
            } catch (e) {
                console.error("Error parsing request body", e);
            }
            body = { ...body, token };
            options.body = JSON.stringify(body);
        }
    }
    
    // Always include Authorization header if token exists to avoid body dependency
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

    const text = await response.text();

    if (!response.ok) {
        let errMsg = `API Error: ${response.statusText}`;
        try {
            const errData = JSON.parse(text);
            if (errData && errData.message) {
                errMsg = errData.message;
            }
        } catch (e) {
            if (text) {
                errMsg = `Server Error: ${text.substring(0, 150)}`;
            }
        }
        throw new Error(errMsg);
    }

    try {
        return JSON.parse(text);
    } catch (jsonErr) {
        try {
            const extracted = extractJson(text);
            return JSON.parse(extracted);
        } catch (e) {
            console.error("Non-JSON API Response (after extraction attempt):", text);
            throw new Error(`Invalid JSON response: ${text.substring(0, 150)}`);
        }
    }
};
