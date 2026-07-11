export const PASSWORD_SPECIAL_CHARS = '@$!%*?&';

export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character';

export const PASSWORD_HINT =
  `Use only these special characters: ${PASSWORD_SPECIAL_CHARS} (colon, underscore, and others are not allowed)`;

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function isValidPassword(password) {
  return typeof password === 'string' && PASSWORD_REGEX.test(password);
}

export function getPasswordValidationError(password) {
  if (!password) return 'Password is required';

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter';
  if (!/\d/.test(password)) return 'Include at least one number';
  if (!/[@$!%*?&]/.test(password)) {
    return `Include at least one special character from: ${PASSWORD_SPECIAL_CHARS}`;
  }

  if (!/^[A-Za-z\d@$!%*?&]+$/.test(password)) {
    return `Only letters, numbers, and ${PASSWORD_SPECIAL_CHARS} are allowed`;
  }

  return null;
}
