/**
 * Validates a full name.
 * Checks if the name is not empty and contains at least two words (suggesting first and last name).
 * @param {string} fullName - The full name string to validate.
 * @returns {{ status: boolean, errorMsg: string }} An object with validation status and error message.
 */
export const validateFullName = (fullName) => {
  if (!fullName || fullName.trim() === "") {
    return { status: false, errorMsg: "Full name cannot be empty." };
  }

  // Check if it contains at least two words (e.g., "John Doe")
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length < 2) {
    return { status: false, errorMsg: "Please enter both first and last name." };
  }

  // Optional: Check for invalid characters (e.g., numbers, special symbols)
  // This regex allows letters, spaces, hyphens, and apostrophes.
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(fullName)) {
    return { status: false, errorMsg: "Full name can only contain letters, spaces, hyphens, and apostrophes." };
  }

  return { status: true, errorMsg: "" };
};

/**
 * Validates an email address using a basic regex pattern.
 * @param {string} email - The email string to validate.
 * @returns {{ status: boolean, errorMsg: string }} An object with validation status and error message.
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return { status: false, errorMsg: "Email address cannot be empty." };
  }

  // A common regex for email validation. More robust patterns exist but this is good for most cases.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { status: false, errorMsg: "Please enter a valid email address (e.g., user@example.com)." };
  }

  return { status: true, errorMsg: "" };
};

/**
 * Validates a password and confirms it against a confirmation password.
 * Checks for minimum length, and requires confirmation password to match.
 * @param {string} password - The password string to validate.
 * @param {string} confirmPassword - The confirmation password string.
 * @returns {{ status: boolean, errorMsg: string }} An object with validation status and error message.
 */
export const validatePassword = (password, confirmPassword = "") => {
  if (!password || password.trim() === "") {
    return { status: false, errorMsg: "Password cannot be empty." };
  }

  // Minimum length check
  const minLength = 8;
  if (password.length < minLength) {
    return { status: false, errorMsg: `Password must be at least ${minLength} characters long.` };
  }

  // Optional: Add complexity requirements (uncomment as needed)
  // if (!/[A-Z]/.test(password)) {
  //   return { status: false, errorMsg: "Password must contain at least one uppercase letter." };
  // }
  // if (!/[a-z]/.test(password)) {
  //   return { status: false, errorMsg: "Password must contain at least one lowercase letter." };
  // }
  // if (!/[0-9]/.test(password)) {
  //   return { status: false, errorMsg: "Password must contain at least one number." };
  // }
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
  //   return { status: false, errorMsg: "Password must contain at least one special character." };
  // }

  // Confirm password check (only if confirmPassword is provided)
  if (confirmPassword !== undefined && confirmPassword !== null) {
    if (password !== confirmPassword) {
      return { status: false, errorMsg: "Passwords do not match." };
    }
  }

  return { status: true, errorMsg: "" };
};