function showError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

function clearError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.classList.add('hidden');
}

function validateEmail(value) {
  if (!value) return 'email is required';
  if (!value.includes('@') || !value.includes('.')) return 'enter a valid email address';
  return '';
}

function validatePassword(value) {
  if (!value) return 'password is required';
  if (value.length < 6) return 'password must be at least 6 characters';

  let hasDigit = false;
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (c >= '0' && c <= '9') {
      hasDigit = true;
      break;
    }
  }
  if (!hasDigit) return 'password must include at least one number';

  const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  let hasSpecial = false;
  for (let i = 0; i < value.length; i++) {
    if (specials.includes(value[i])) {
      hasSpecial = true;
      break;
    }
  }
  if (!hasSpecial) return 'password must include at least one special character';

  return '';
}
