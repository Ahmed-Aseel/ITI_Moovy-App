// --- Imports ---
import {
    MESSAGES,
    showError,
    hideError,
    showPopup,
    hashPassword
} from "./shared.js";

import { fetchUserByEmail } from "./api.js";

import {
    saveUserSession,
    getSavedUser,
    redirectToHome
} from "./auth.js";

// --- Element References ---
const form = document.querySelector("form") as HTMLFormElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;
const rememberMeInput = document.getElementById("rememberMe") as HTMLInputElement;

const emailAlert = emailInput.nextElementSibling as HTMLElement;
const passwordAlert = passwordInput.closest(".mb-4")!.querySelector(".alert") as HTMLElement;

// --- DOM Events ---
document.addEventListener("DOMContentLoaded", () => {
    checkAutoLogin();
    setupPasswordToggle();
    form.addEventListener("submit", handleSignIn);
});

/**
 * Checks for existing user session and remembered email
 */
function checkAutoLogin(): void {
    const sessionUser = getSavedUser();
    if (sessionUser) {
        redirectToHome();
    }

    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMeInput.checked = true;
    }
}

/**
 * Sets up password visibility toggle
 */
function setupPasswordToggle(): void {
    const toggleBtn = document.getElementById("togglePassword")!;
    const toggleIcon = document.getElementById("toggleIcon")!;

    toggleBtn.addEventListener("click", () => {
        const visible = passwordInput.type === "text";
        passwordInput.type = visible ? "password" : "text";
        toggleIcon.classList.replace(
            visible ? "fa-eye-slash" : "fa-eye",
            visible ? "fa-eye" : "fa-eye-slash"
        );
    });
}

/**
 * Handles sign-in logic: validation, API call, hashing, session storage
 */
async function handleSignIn(e: SubmitEvent): Promise<void> {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeInput.checked;

    let isValid = true;

    if (!email) {
        showError(emailAlert, MESSAGES.email.required);
        isValid = false;
    } else {
        hideError(emailAlert);
    }

    if (!password) {
        showError(passwordAlert, MESSAGES.password.required);
        isValid = false;
    } else {
        hideError(passwordAlert);
    }

    if (!isValid) return;

    try {
        const users = await fetchUserByEmail(email);
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

        saveUserSession({ id: user.id, email: user.email }, rememberMe);
        redirectToHome();

    } catch {
        showPopup(MESSAGES.serverFail);
    }
}