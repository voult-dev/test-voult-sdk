import { PASSWORD_HINT, getPasswordValidationError } from '../lib/password';

export default function PasswordField({
  label = 'Password',
  name = 'password',
  value,
  onChange,
  placeholder = 'Str0ng!Pass',
  showHint = true,
  showValidation = false,
}) {
  const validationError = showValidation && value ? getPasswordValidationError(value) : null;

  return (
    <label>
      {label}
      <input
        name={name}
        type="password"
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        aria-invalid={Boolean(validationError)}
      />
      {showHint && <span className="hint">{PASSWORD_HINT}</span>}
      {validationError && <span className="field-error">{validationError}</span>}
    </label>
  );
}
