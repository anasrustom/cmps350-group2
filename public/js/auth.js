// Default avatar SVG used throughout the app
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='16' fill='%23dcfce7'/%3E%3Ccircle cx='16' cy='13' r='5' fill='%2322c55e'/%3E%3Cpath d='M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10' fill='%2322c55e'/%3E%3C/svg%3E";

// ─── Session helpers (called synchronously by feed.js, posts.js, follow.js) ──

function getSession() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
}

// Returns the cached user object stored at login/register time.
// The object shape: { id, username, email, bio, avatar, joinedAt, following: [] }
// `following` is an array of followed-user IDs, cached here so feed.js can
// filter posts synchronously without a network round-trip.
function getCurrentUser() {
  var stored = localStorage.getItem('x_current_user');
  if (!stored) return null;
  try { return JSON.parse(stored); } catch (e) { return null; }
}

// ─── Persist session after a successful login or register ─────────────────────

function saveSession(user) {
  // x_session stores only currentUserId — this key is stable across all scripts
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ currentUserId: user.id }));
  // x_current_user caches the full user object for synchronous getCurrentUser()
  localStorage.setItem('x_current_user', JSON.stringify(user));
}

// ─── Register ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  var registerForm = document.getElementById('register-form');
  if (!registerForm) return;
  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();
    handleRegister();
  });
});

async function handleRegister() {
  var username = document.getElementById('register-username').value.trim();
  var email    = document.getElementById('register-email').value.trim();
  var password = document.getElementById('register-password').value;
  var confirm  = document.getElementById('register-confirm-password').value;

  clearError('register-username-error');
  clearError('register-email-error');
  clearError('register-password-error');
  clearError('register-confirm-password-error');

  var messageEl = document.getElementById('register-message');
  messageEl.classList.add('hidden');

  var valid = true;

  if (!username) {
    showError('register-username-error', 'username is required');
    valid = false;
  }

  var emailError = validateEmail(email);
  if (emailError) { showError('register-email-error', emailError); valid = false; }

  var passwordError = validatePassword(password);
  if (passwordError) { showError('register-password-error', passwordError); valid = false; }

  if (!passwordError && password !== confirm) {
    showError('register-confirm-password-error', 'passwords do not match');
    valid = false;
  }

  if (!valid) return;

  var submitBtn = document.querySelector('#register-form [type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    var res  = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, email: email, password: password })
    });
    var data = await res.json();

    if (!data.success) {
      var msg = data.error || 'registration failed';
      if (msg.includes('username')) {
        showError('register-username-error', msg);
      } else if (msg.includes('email')) {
        showError('register-email-error', msg);
      } else {
        messageEl.textContent = msg;
        messageEl.classList.remove('hidden');
      }
      return;
    }

    // New accounts start with no follows — include empty array for feed.js compat
    saveSession(Object.assign({}, data.user, { following: [] }));
    window.location.href = 'index.html';

  } catch (err) {
    messageEl.textContent = 'network error — please try again';
    messageEl.classList.remove('hidden');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  var loginForm = document.getElementById('login-form');
  if (!loginForm) return;
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    handleLogin();
  });
});

async function handleLogin() {
  var email    = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;

  clearError('login-email-error');
  clearError('login-password-error');

  var messageEl = document.getElementById('login-message');
  messageEl.classList.add('hidden');

  var emailError = validateEmail(email);
  if (emailError) { showError('login-email-error', emailError); return; }

  if (!password) { showError('login-password-error', 'password is required'); return; }

  var submitBtn = document.querySelector('#login-form [type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    var res  = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });
    var data = await res.json();

    if (!data.success) {
      messageEl.textContent = data.error || 'incorrect email or password';
      messageEl.classList.remove('hidden');
      return;
    }

    // data.user includes `following: [id, ...]` from the login API
    saveSession(data.user);
    window.location.href = 'index.html';

  } catch (err) {
    messageEl.textContent = 'network error — please try again';
    messageEl.classList.remove('hidden');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ─── Page guard, sidebar, and logout ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  var onGuestPage = document.getElementById('login-form') || document.getElementById('register-form');
  var onAppPage   = document.getElementById('logout-btn');

  var session  = getSession();
  var loggedIn = session && session.currentUserId;

  if (onGuestPage && loggedIn) {
    window.location.href = 'index.html';
    return;
  }

  if (onAppPage && !loggedIn) {
    window.location.href = 'login.html';
    return;
  }

  if (onAppPage && loggedIn) {
    var user = getCurrentUser();
    if (user) {
      var nameEl   = document.getElementById('sidebar-user-name');
      var handleEl = document.getElementById('sidebar-user-handle');
      var avatarEl = document.getElementById('sidebar-avatar');

      if (nameEl)   nameEl.textContent = user.username;
      if (handleEl) handleEl.textContent = '@' + user.username;
      if (avatarEl && avatarEl.tagName === 'IMG') {
        avatarEl.src = user.avatar || DEFAULT_AVATAR;
      }

      var composerAvatar = document.getElementById('composer-avatar');
      if (composerAvatar && composerAvatar.tagName === 'IMG') {
        composerAvatar.src = user.avatar || DEFAULT_AVATAR;
      }
    }

    document.getElementById('logout-btn').addEventListener('click', function () {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem('x_current_user');
      window.location.href = 'login.html';
    });
  }
});
