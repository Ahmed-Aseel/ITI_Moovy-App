// ========================
// Session Management
// ========================
/**
 * Saves the user session data in either localStorage (if "remember me" is checked)
 * or sessionStorage (for temporary session).
 */
export function saveUserSession(userData, remember) {
    const data = JSON.stringify(userData);
    if (remember) {
        localStorage.setItem("rememberedEmail", userData.email);
        localStorage.setItem("user", data);
    }
    else {
        sessionStorage.setItem("user", data);
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("user");
    }
}
/**
 * Retrieves the saved user session from localStorage or sessionStorage.
 */
export function getSavedUser() {
    return localStorage.getItem("user") || sessionStorage.getItem("user");
}
/**
 * Deletes the saved user session from localStorage and sessionStorage.
 */
export function deleteSavedUser() {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
}
// ========================
// Redirection Utilities
// ========================
/**
 * Redirects the user to the Sign In page.
 */
export function redirectToSignIn() {
    window.location.href = "signin.html";
}
/**
 * Redirects the user to the Home page.
 */
export function redirectToHome() {
    window.location.href = "index.html";
}
