document.addEventListener('DOMContentLoaded', function () {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const profileUserId = getProfileUserId(currentUser.id);
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const profileUser = users.find(function (u) { return u.id === profileUserId; });

  if (!profileUser) {
    document.querySelector('main').innerHTML = '<p style="padding:2rem">user not found</p>';
    return;
  }

  renderProfile(profileUser, currentUser, users);
  renderPosts(profileUser);
  wireEditForm(profileUser, currentUser, users);
});

function getProfileUserId(fallbackId) {
  const search = window.location.search;
  if (!search) return fallbackId;
  const pairs = search.slice(1).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const parts = pairs[i].split('=');
    if (parts[0] === 'userId') return parseInt(parts[1], 10);
  }
  return fallbackId;
}

function renderProfile(profileUser, currentUser, users) {
  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
  const userPosts = posts.filter(function (p) { return p.authorId === profileUser.id; });

  const followerCount = users.filter(function (u) {
    return u.following.indexOf(profileUser.id) !== -1;
  }).length;

  document.getElementById('profile-avatar').src = profileUser.avatar || DEFAULT_AVATAR;
  document.getElementById('profile-name').textContent = profileUser.username;
  document.getElementById('profile-handle').textContent = '@' + profileUser.username;
  document.getElementById('profile-bio').textContent = profileUser.bio || '';
  document.getElementById('profile-post-count').textContent = userPosts.length;
  document.getElementById('profile-following-count').textContent = profileUser.following.length;
  document.getElementById('profile-follower-count').textContent = followerCount;

  const isOwnProfile = profileUser.id === currentUser.id;
  const editBtn = document.getElementById('edit-profile-btn');
  const followBtn = document.getElementById('follow-user-btn');

  if (isOwnProfile) {
    editBtn.classList.remove('hidden');
    followBtn.classList.add('hidden');
  } else {
    editBtn.classList.add('hidden');
    followBtn.classList.remove('hidden');
  }
}

function wireEditForm(profileUser, currentUser, users) {
  if (profileUser.id !== currentUser.id) return;

  const editBtn = document.getElementById('edit-profile-btn');
  const editSection = document.getElementById('profile-edit-section');
  const cancelBtn = document.getElementById('profile-cancel-btn');
  const editForm = document.getElementById('profile-edit-form');
  const messageEl = document.getElementById('profile-message');

  editBtn.addEventListener('click', function () {
    document.getElementById('profile-avatar-input').value = profileUser.avatar || '';
    document.getElementById('profile-bio-input').value = profileUser.bio || '';
    editSection.classList.remove('hidden');
    editBtn.classList.add('hidden');
    messageEl.classList.add('hidden');
  });

  cancelBtn.addEventListener('click', function () {
    editSection.classList.add('hidden');
    editBtn.classList.remove('hidden');
  });

  editForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const newAvatar = document.getElementById('profile-avatar-input').value.trim();
    const newBio = document.getElementById('profile-bio-input').value.trim();

    profileUser.avatar = newAvatar;
    profileUser.bio = newBio;

    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const index = allUsers.findIndex(function (u) { return u.id === profileUser.id; });
    if (index !== -1) {
      allUsers[index] = profileUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
    }

    renderProfile(profileUser, currentUser, allUsers);

    const sidebarAvatar = document.getElementById('sidebar-avatar');
    if (sidebarAvatar && sidebarAvatar.tagName === 'IMG') {
      sidebarAvatar.src = newAvatar || DEFAULT_AVATAR;
    }

    editSection.classList.add('hidden');
    editBtn.classList.remove('hidden');

    messageEl.textContent = 'profile updated';
    messageEl.classList.remove('hidden');
  });
}

function renderPosts(profileUser) {
  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
  const userPosts = posts.filter(function (p) { return p.authorId === profileUser.id; });
  const container = document.getElementById('profile-posts-list');
  const emptyState = document.getElementById('profile-empty-state');

  if (userPosts.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  userPosts.sort(function (a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  userPosts.forEach(function (post) {
    const date = new Date(post.timestamp).toLocaleDateString();
    const card = document.createElement('article');
    card.className = 'post-card';
    card.innerHTML =
      '<div class="post-body">' +
        '<div class="post-meta">' +
          '<span class="post-author">' + profileUser.username + '</span>' +
          '<span class="post-time">' + date + '</span>' +
        '</div>' +
        '<p class="post-text">' + post.content + '</p>' +
      '</div>';
    container.appendChild(card);
  });
}
