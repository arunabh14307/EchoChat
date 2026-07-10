/**
 * Client-side form validators.
 * These mirror the Zod schemas on the server for instant UX feedback.
 */

/**
 * Validate an email address.
 * @param {string} email
 * @returns {string | null} Error message or null if valid.
 */
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Validate a password.
 * Rules: min 8 chars, at least one letter and one number.
 * @param {string} password
 * @returns {string | null}
 */
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

/**
 * Validate a username.
 * Rules: 2–30 chars, alphanumeric + underscores only.
 * @param {string} username
 * @returns {string | null}
 */
export const validateUsername = (username) => {
  if (!username) {
    return 'Username is required';
  }
  if (username.length < 2) {
    return 'Username must be at least 2 characters';
  }
  if (username.length > 30) {
    return 'Username must be 30 characters or fewer';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username may only contain letters, numbers, and underscores';
  }
  return null;
};

/**
 * Validate that a message is not empty.
 * @param {string} message
 * @returns {string | null}
 */
export const validateMessage = (message) => {
  if (!message || !message.trim()) {
    return 'Message cannot be empty';
  }
  if (message.length > 5000) {
    return 'Message cannot exceed 5000 characters';
  }
  return null;
};

/**
 * Validate an uploaded image file.
 * @param {File} file
 * @param {number} [maxSizeMB=5]
 * @returns {string | null}
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  if (!file) {
    return 'Please select a file';
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, GIF, and WebP images are allowed';
  }
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File size must be under ${maxSizeMB}MB`;
  }
  return null;
};
