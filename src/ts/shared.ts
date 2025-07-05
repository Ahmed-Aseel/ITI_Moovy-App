// --- Validation Patterns ---
export const regexPatterns = {
    username: /^[a-zA-Z0-9_]{3,20}$/, // 3–20 chars: letters, numbers, underscore
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email format
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/ // At least 6 chars with upper, lower, number, special
};

// --- User-Facing Validation and Error Messages ---
export const MESSAGES = {
    username: {
        required: "Username is required",
        invalid: "Username must be 3–20 characters, letters, numbers, or underscores only"
    },
    email: {
        required: "Email is required",
        invalid: "Email is not valid",
        exists: "Email already exists",
        wrong: "Wrong email"
    },
    password: {
        required: "Password is required",
        invalid: "Password must be at least 6 characters and include uppercase, lowercase, number, and special character",
        wrong: "Wrong password"
    },
    registerFail: "Failed to register user. Please try again.",
    serverFail: "Error connecting to server. Please try later.",
    emailCheckFail: "Error email check failed. Please try again."
};

// --- UI Feedback Helpers ---

/**
 * Displays a validation error message.
 */
export function showError(alertDiv: HTMLElement, message: string) {
    alertDiv.classList.remove("d-none");
    const small = alertDiv.querySelector("small");
    if (small) small.textContent = message;
}

/**
 * Hides a validation error.
 */
export function hideError(alertDiv: HTMLElement) {
    alertDiv.classList.add("d-none");
    const small = alertDiv.querySelector("small");
    if (small) small.textContent = "";
}

/**
 * Displays a temporary popup message.
 */
export function showPopup(message: string, type: "success" | "danger" = "danger") {
    const popup = document.getElementById("popupMessage")!;
    popup.className = `position-fixed top-0 start-50 translate-middle-x alert alert-${type}`;
    popup.textContent = message;
    popup.classList.remove("d-none");

    setTimeout(() => popup.classList.add("d-none"), 3000);
}

// --- Password Utilities ---

/**
 * Hashes a password using SHA-256 and returns a hex string.
 */
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
}