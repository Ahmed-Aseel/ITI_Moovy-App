"use strict";
// Base URL for API calls
const API_BASE_URL = "http://localhost:3000";
// Regular expressions for validating input formats
const regexPatterns = {
    username: /^[a-zA-Z0-9_]{3,20}$/, // 3–20 chars: letters, numbers, underscore
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email format
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/ // Password strength
};
// User-facing validation and error messages
const MESSAGES = {
    username: {
        required: "Username is required",
        invalid: "Username must be 3-20 characters, letters, numbers or underscore only"
    },
    email: {
        required: "Email is required",
        invalid: "Email is not valid",
        exists: "Email already exists"
    },
    password: {
        required: "Password is required",
        invalid: "Password must be at least 6 characters and include uppercase, lowercase, number, and special character"
    },
    registerFail: "Failed to register user. Please try again.",
    serverFail: "Error connecting to server. Please try later.",
    emailCheckFail: "Error email check failed. Please try again."
};
// DOM element references
const form = document.querySelector("form");
const userNameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
// Alert containers for validation feedback
const userNameAlert = userNameInput.nextElementSibling;
const emailAlert = emailInput.nextElementSibling;
const passwordAlert = passwordInput.closest(".mb-3").querySelector(".alert");
// DOM ready event
document.addEventListener("DOMContentLoaded", () => {
    // Input listeners for real-time validation
    userNameInput.addEventListener("input", () => validateUsername(userNameInput.value.trim(), userNameAlert));
    emailInput.addEventListener("input", () => validateEmailFormatOnly(emailInput.value.trim(), emailAlert));
    passwordInput.addEventListener("input", () => validatePassword(passwordInput.value.trim(), passwordAlert));
    // Password visibility toggle
    const togglePassword = document.getElementById("togglePassword");
    const toggleIcon = document.getElementById("toggleIcon");
    togglePassword.addEventListener("click", () => {
        const isVisible = passwordInput.type === "text";
        passwordInput.type = isVisible ? "password" : "text";
        // Switch FontAwesome icon
        toggleIcon.classList.replace(isVisible ? "fa-eye-slash" : "fa-eye", isVisible ? "fa-eye" : "fa-eye-slash");
    });
    // Submit form
    form.addEventListener("submit", handleFormSubmit);
});
/**
 * Handles form submission with full validation and user registration
 */
async function handleFormSubmit(e) {
    e.preventDefault(); // Prevent form from refreshing the page
    // Extract trimmed values
    const username = userNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    // Run validation
    let isValid = true;
    if (!validateUsername(username, userNameAlert))
        isValid = false;
    if (!await validateEmail(email, emailAlert))
        isValid = false;
    if (!validatePassword(password, passwordAlert))
        isValid = false;
    if (!isValid)
        return;
    // Hash password securely before sending
    const hashedPassword = await hashPassword(password);
    // Send new user data to server
    const newUser = { username, email, password: hashedPassword };
    try {
        const response = await registerUser(newUser);
        if (response.ok) {
            redirectToSignIn(); // Success
        }
        else {
            showPopup(MESSAGES.registerFail);
        }
    }
    catch (error) {
        showPopup(MESSAGES.serverFail); // Connection error
    }
}
/* ------------------- Validation Functions ------------------- */
/**
 * Validates username input
 */
function validateUsername(username, alertDiv) {
    if (!username) {
        showError(alertDiv, MESSAGES.username.required);
        return false;
    }
    if (!regexPatterns.username.test(username)) {
        showError(alertDiv, MESSAGES.username.invalid);
        return false;
    }
    hideError(alertDiv);
    return true;
}
/**
 * Checks email input format only (no existence check)
 */
function validateEmailFormatOnly(email, alertDiv) {
    if (!email) {
        showError(alertDiv, MESSAGES.email.required);
        return false;
    }
    if (!regexPatterns.email.test(email)) {
        showError(alertDiv, MESSAGES.email.invalid);
        return false;
    }
    hideError(alertDiv);
    return true;
}
/**
 * Helper for triggering email format validation during typing
 */
function validateEmailOnInput(email, alertDiv) {
    validateEmailFormatOnly(email, alertDiv);
}
/**
 * Validates email format and uniqueness via API
 */
async function validateEmail(email, alertDiv) {
    if (!validateEmailFormatOnly(email, alertDiv))
        return false;
    if (await isEmailExist(email)) {
        showError(alertDiv, MESSAGES.email.exists);
        return false;
    }
    hideError(alertDiv);
    return true;
}
/**
 * Validates password against complexity rules
 */
function validatePassword(password, alertDiv) {
    if (!password) {
        showError(alertDiv, MESSAGES.password.required);
        return false;
    }
    if (!regexPatterns.password.test(password)) {
        showError(alertDiv, MESSAGES.password.invalid);
        return false;
    }
    hideError(alertDiv);
    return true;
}
/* ------------------- Utility / Helper Functions ------------------- */
/**
 * Shows validation error in the corresponding alert div
 */
function showError(alertDiv, message) {
    alertDiv.classList.remove("d-none");
    const small = alertDiv.querySelector("small");
    if (small)
        small.textContent = message;
}
/**
 * Hides the alert and clears its message
 */
function hideError(alertDiv) {
    alertDiv.classList.add("d-none");
    const small = alertDiv.querySelector("small");
    if (small)
        small.textContent = "";
}
/**
 * Checks server to see if email already exists
 */
async function isEmailExist(email) {
    try {
        const res = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(email)}`);
        if (!res.ok)
            return false;
        const data = await res.json();
        return data.length > 0;
    }
    catch (error) {
        showPopup(MESSAGES.emailCheckFail);
        return false;
    }
}
/**
 * Hashes password securely using SHA-256
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}
/**
 * Redirects user to the sign-in page
 */
function redirectToSignIn() {
    window.location.href = "signin.html";
}
/**
 * Sends new user data to API
 */
async function registerUser(user) {
    return await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    });
}
/**
 * Displays a temporary popup message (success or error)
 */
function showPopup(message, type = "danger") {
    const popup = document.getElementById("popupMessage");
    popup.className = `position-fixed top-0 start-50 translate-middle-x alert alert-${type}`;
    popup.textContent = message;
    popup.classList.remove("d-none");
    setTimeout(() => popup.classList.add("d-none"), 3000);
}
