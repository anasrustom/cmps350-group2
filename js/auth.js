const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='16' fill='%23dcfce7'/%3E%3Ccircle cx='16' cy='13' r='5' fill='%2322c55e'/%3E%3Cpath d='M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10' fill='%2322c55e'/%3E%3C/svg%3E";

document.addEventListener('DOMContentLoaded', function () {
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      handleRegister();
    });
  }
});

function handleRegister() {
  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm-password').value;

  clearError('register-username-error');
  clearError('register-email-error');
  clearError('register-password-error');
  clearError('register-confirm-password-error');

  const messageEl = document.getElementById('register-message');
  messageEl.classList.add('hidden');

  let valid = true;

  if (!username) {
    showError('register-username-error', 'username is required');
    valid = false;
  }

  const emailError = validateEmail(email);
  if (emailError) {
    showError('register-email-error', emailError);
    valid = false;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    showError('register-password-error', passwordError);
    valid = false;
  }

  if (!passwordError && password !== confirm) {
    showError('register-confirm-password-error', 'passwords do not match');
    valid = false;
  }

  if (!valid) return;

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

  const usernameTaken = users.find(function (u) {
    return u.username.toLowerCase() === username.toLowerCase();
  });
  if (usernameTaken) {
    showError('register-username-error', 'username is already taken');
    return;
  }

  const emailTaken = users.find(function (u) {
    return u.email.toLowerCase() === email.toLowerCase();
  });
  if (emailTaken) {
    showError('register-email-error', 'email is already registered');
    return;
  }

  const newUser = {
    id: Date.now(),
    username: username,
    email: email,
    password: password,
    bio: '',
    avatar: '',
    following: [],
    joinedAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  const session = { currentUserId: newUser.id };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      handleLogin();
    });
  }
});

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  clearError('login-email-error');
  clearError('login-password-error');

  const messageEl = document.getElementById('login-message');
  messageEl.classList.add('hidden');

  const emailError = validateEmail(email);
  if (emailError) {
    showError('login-email-error', emailError);
    return;
  }

  if (!password) {
    showError('login-password-error', 'password is required');
    return;
  }

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

  const user = users.find(function (u) {
    return u.email.toLowerCase() === email.toLowerCase();
  });

  if (!user || user.password !== password) {
    messageEl.textContent = 'incorrect email or password';
    messageEl.classList.remove('hidden');
    return;
  }

  const session = { currentUserId: user.id };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

  window.location.href = 'index.html';
}

// helpers available to all scripts loaded after auth.js

function getSession() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
}

function getCurrentUser() {
  const session = getSession();
  if (!session || !session.currentUserId) return null;
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  return users.find(function (u) { return u.id === session.currentUserId; }) || null;
}

// page guard + sidebar + logout

document.addEventListener('DOMContentLoaded', function () {
  const onGuestPage = document.getElementById('login-form') || document.getElementById('register-form');
  const onAppPage = document.getElementById('logout-btn');

  const session = getSession();
  const loggedIn = session && session.currentUserId;

  if (onGuestPage && loggedIn) {
    window.location.href = 'index.html';
    return;
  }

  if (onAppPage && !loggedIn) {
    window.location.href = 'login.html';
    return;
  }

  if (onAppPage && loggedIn) {
    const user = getCurrentUser();
    if (user) {
      const nameEl = document.getElementById('sidebar-user-name');
      const handleEl = document.getElementById('sidebar-user-handle');
      const avatarEl = document.getElementById('sidebar-avatar');

      if (nameEl) nameEl.textContent = user.username;
      if (handleEl) handleEl.textContent = '@' + user.username;
      if (avatarEl && avatarEl.tagName === 'IMG') {
        avatarEl.src = user.avatar || DEFAULT_AVATAR;
      }

      const composerAvatar = document.getElementById('composer-avatar');
      if (composerAvatar && composerAvatar.tagName === 'IMG') {
        composerAvatar.src = user.avatar || DEFAULT_AVATAR;
      }
    }

    document.getElementById('logout-btn').addEventListener('click', function () {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      window.location.href = 'login.html';
    });
  }
});
