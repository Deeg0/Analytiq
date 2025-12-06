// Automatically detect API URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api'; // Use relative path in production (same domain)

export async function analyzeUrl(url) {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputType: 'url',
            content: url,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Analysis failed');
    }

    return await response.json();
}

export async function analyzeText(text) {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputType: 'text',
            content: text,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Text analysis failed');
    }

    return await response.json();
}

