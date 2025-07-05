// --- Imports ---
import {
    regexPatterns,
    MESSAGES,
    showError,
    hideError,
    showPopup,
    hashPassword
} from "./shared.js";

import {
    registerUser,
    isEmailExist
} from "./api.js";

import { redirectToSignIn } from "./auth.js";

// --- Element References ---
const form = document.querySelector("form") as HTMLFormElement;
const userNameInput = document.getElementById("username") as HTMLInputElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;

const userNameAlert = userNameInput.nextElementSibling as HTMLElement;
const emailAlert = emailInput.nextElementSibling as HTMLElement;
const passwordAlert = passwordInput.parentElement!.nextElementSibling as HTMLElement;

// --- DOM Events ---
document.addEventListener("DOMContentLoaded", () => {
    userNameInput.addEventListener("input", () => validateUsername(userNameInput.value.trim(), userNameAlert));
    emailInput.addEventListener("input", () => validateEmailFormatOnly(emailInput.value.trim(), emailAlert));
    passwordInput.addEventListener("input", () => validatePassword(passwordInput.value.trim(), passwordAlert));

    const togglePassword = document.getElementById("togglePassword")!;
    const toggleIcon = document.getElementById("toggleIcon") as HTMLElement;

    togglePassword.addEventListener("click", () => {
        const isVisible = passwordInput.type === "text";
        passwordInput.type = isVisible ? "password" : "text";
        toggleIcon.classList.replace(
            isVisible ? "fa-eye-slash" : "fa-eye",
            isVisible ? "fa-eye" : "fa-eye-slash"
        );
    });

    form.addEventListener("submit", handleFormSubmit);
});

/**
 * Handles form submission:
 * - Validates inputs
 * - Checks email existence
 * - Hashes password and registers user
 */
async function handleFormSubmit(e: SubmitEvent) {
    e.preventDefault();

    const username = userNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    let isValid = true;
    if (!validateUsername(username, userNameAlert)) isValid = false;
    if (!await validateEmail(email, emailAlert)) isValid = false;
    if (!validatePassword(password, passwordAlert)) isValid = false;
    if (!isValid) return;

    try {
        const hashedPassword = await hashPassword(password);
        const newUser = { username, email, password: hashedPassword };

        const response = await registerUser(newUser);
        if (response.ok) {
            redirectToSignIn();
        } else {
            showPopup(MESSAGES.registerFail);
        }
    } catch {
        showPopup(MESSAGES.serverFail);
    }
}

/**
 * Validates username:
 * - Required
 * - Format must match pattern
 */
function validateUsername(username: string, alertDiv: HTMLElement): boolean {
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
 * Validates email format only (without checking server)
 */
function validateEmailFormatOnly(email: string, alertDiv: HTMLElement): boolean {
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
 * Validates email:
 * - Format check
 * - Checks if already exists on server
 */
async function validateEmail(email: string, alertDiv: HTMLElement): Promise<boolean> {
    if (!validateEmailFormatOnly(email, alertDiv)) return false;

    try {
        if (await isEmailExist(email)) {
            showError(alertDiv, MESSAGES.email.exists);
            return false;
        }
        hideError(alertDiv);
        return true;
    } catch {
        showPopup(MESSAGES.emailCheckFail);
        return false;
    }
}

/**
 * Validates password:
 * - Required
 * - Format must match pattern
 */
function validatePassword(password: string, alertDiv: HTMLElement): boolean {
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