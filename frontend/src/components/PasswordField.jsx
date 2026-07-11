import { useState } from 'react';
import { PASSWORD_HINT, getPasswordValidationError } from '../lib/password';

export default function PasswordField({
  label = 'Password',
  name = 'password',
  value,
  onChange,
  placeholder = 'Str0ng!Pass',
  showHint = true,
  showValidation = false,
  required = true,
}) {
  const [visible, setVisible] = useState(false);
  const validationError = showValidation && value ? getPasswordValidationError(value) : null;

  return (
    <label>
      {label}
      <div className="password-input-wrap">
        <input
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          aria-invalid={Boolean(validationError)}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {showHint && <span className="hint">{PASSWORD_HINT}</span>}
      {validationError && <span className="field-error">{validationError}</span>}
    </label>
  );
}
