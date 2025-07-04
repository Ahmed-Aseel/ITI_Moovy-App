// signin.ts
import { API_BASE_URL, MESSAGES, showError, hideError, showPopup, hashPassword } from "./shared.js"; // Reusing exports from shared
const form = document.querySelector("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMeInput = document.getElementById("rememberMe");
const emailAlert = emailInput.nextElementSibling;
const passwordAlert = passwordInput.closest(".mb-4").querySelector(".alert");
document.addEventListener("DOMContentLoaded", () => {
    // Auto-login redirect if session exists
    const sessionUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (sessionUser) {
        redirectToHome();
    }
    // Auto-fill remembered email
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMeInput.checked = true;
    }
    // Toggle password visibility
    const toggleBtn = document.getElementById("togglePassword");
    const toggleIcon = document.getElementById("toggleIcon");
    toggleBtn.addEventListener("click", () => {
        const visible = passwordInput.type === "text";
        passwordInput.type = visible ? "password" : "text";
        toggleIcon.classList.replace(visible ? "fa-eye-slash" : "fa-eye", visible ? "fa-eye" : "fa-eye-slash");
    });
    // Handle form submit
    form.addEventListener("submit", handleSignIn);
});
/**
 * Handles sign-in process:
 * - Fetch user by email
 * - Hash entered password
 * - Compare with stored hashed password
 */
async function handleSignIn(e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeInput.checked;
    let isValid = true;
    if (!email) {
        showError(emailAlert, MESSAGES.email.required);
        isValid = false;
    }
    else {
        hideError(emailAlert);
    }
    if (!password) {
        showError(passwordAlert, MESSAGES.password.required);
        isValid = false;
    }
    else {
        hideError(passwordAlert);
    }
    if (!isValid)
        return;
    try {
        const response = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(email)}`);
        const users = await response.json();
        const user = users[0];
        if (!user) {
            showPopup(MESSAGES.email.wrong);
            return;
        }
        const hashed = await hashPassword(password);
        if (user.password !== hashed) {
            showPopup(MESSAGES.password.wrong);
            return;
        }
        // Store user data based on "remember me"
        const sessionData = JSON.stringify({ id: user.id, email: user.email });
        if (rememberMe) {
            localStorage.setItem("rememberedEmail", email);
            localStorage.setItem("user", sessionData);
        }
        else {
            sessionStorage.setItem("user", sessionData);
            localStorage.removeItem("rememberedEmail");
            localStorage.removeItem("user");
        }
        // Redirect to homepage
        redirectToHome();
    }
    catch {
        showPopup(MESSAGES.serverFail);
    }
}
function redirectToHome() {
    window.location.href = "index.html";
}
