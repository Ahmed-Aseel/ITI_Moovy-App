// --- API CONFIGURATION ---
const JSON_SERVER_BASE_URL = "http://localhost:3000";

const TMDB_API_KEY = "cc687401dafd56a04490baaaa29e1329";
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3/";

// Gemini Chat API
const GEMINI_API_KEY = "AIzaSyAlmSDOeizX0Ne60ladEFBTmC5pUGoo9qo";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;


// ===========================
// JSON SERVER (USER) METHODS
// ===========================

/**
 * Fetch users by email from JSON Server
 */
export async function fetchUserByEmail(email: string): Promise<any[]> {
    const response = await fetch(`${JSON_SERVER_BASE_URL}/users?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return await response.json();
}

/**
 * Register a new user
 */
export async function registerUser(user: { username: string; email: string; password: string }): Promise<Response> {
    return await fetch(`${JSON_SERVER_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    });
}

/**
 * Check whether an email is already registered
 */
export async function isEmailExist(email: string): Promise<boolean> {
    try {
        const users = await fetchUserByEmail(email);
        return users.length > 0;
    } catch {
        return false;
    }
}

// ======================
// TMDB API METHODS 
// ======================

/**
 * Fetch movies from a given TMDB endpoint (e.g., popular, top-rated, upcoming)
 */
export async function fetchMoviesByEndpoint(endpoint: string): Promise<any[]> {
    const response = await fetch(`${TMDB_API_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`);
    if (!response.ok) throw new Error("Failed to fetch movies");
    const data = await response.json();
    return data.results;
}

/**
 * Fetch popular or top-rated TV shows
 */
export async function fetchTVByEndpoint(endpoint: string): Promise<any[]> {
    const response = await fetch(`${TMDB_API_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`);
    if (!response.ok) throw new Error("Failed to fetch TV shows");
    const data = await response.json();
    return data.results;
}

/**
 * Fetch movies or TV shows by genre ID
 */
export async function fetchByGenre(type: "movie" | "tv", genreId: number): Promise<any[]> {
    const response = await fetch(`${TMDB_API_BASE_URL}discover/${type}?api_key=${TMDB_API_KEY}&with_genres=${genreId}`);
    if (!response.ok) throw new Error("Failed to fetch genre-based media");
    const data = await response.json();
    return data.results;
}

/**
 * Fetch detailed info and cast for a specific movie or TV show
 */
export async function fetchDetailsAndCredits(
    type: "movie" | "tv",
    id: number
): Promise<{ details: any; cast: any[] }> {
    const [detailsRes, creditsRes] = await Promise.all([
        fetch(`${TMDB_API_BASE_URL}${type}/${id}?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_API_BASE_URL}${type}/${id}/credits?api_key=${TMDB_API_KEY}`)
    ]);

    if (!detailsRes.ok || !creditsRes.ok) {
        throw new Error("Failed to fetch details or credits");
    }

    const details = await detailsRes.json();
    const credits = await creditsRes.json();

    return { details, cast: credits.cast };
}

/**
 * Fetch similar movies or TV shows
 */
export async function fetchSimilar(type: "movie" | "tv", id: number): Promise<any[]> {
    const response = await fetch(`${TMDB_API_BASE_URL}${type}/${id}/similar?api_key=${TMDB_API_KEY}`);
    if (!response.ok) throw new Error("Failed to fetch similar content");
    const data = await response.json();
    return data.results;
}

/**
 * Fetch recommendations based on a specific movie or TV show
 */
export async function fetchRecommendations(type: "movie" | "tv", id: number): Promise<any[]> {
    const response = await fetch(`${TMDB_API_BASE_URL}${type}/${id}/recommendations?api_key=${TMDB_API_KEY}`);
    if (!response.ok) throw new Error("Failed to fetch recommendations");
    const data = await response.json();
    return data.results;
}

/**
 * Search movies, TV shows, or people by keyword
 */
export async function searchTMDB(query: string): Promise<any[]> {
    const response = await fetch(`${TMDB_API_BASE_URL}search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Failed to search TMDB");
    const data = await response.json();
    return data.results;
}

// ======================
// GEMINI API METHODS 
// ======================
export async function getBotReply(prompt: string): Promise<string> {
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
            }),
        });

        const data = await response.json();
        const message = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return message || "Sorry, no response from Gemini.";
    } catch (err) {
        console.error("Gemini API error:", err);
        return "Error reaching Gemini API.";
    }
}
