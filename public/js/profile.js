// profile.js — Member 2
// Loads profile data and posts from the API instead of localStorage.
// Post like/delete actions remain in Member 3's scope (posts.js localStorage).

document.addEventListener('DOMContentLoaded', async function () {
  var currentUser = getCurrentUser();
  if (!currentUser) return; // page guard in auth.js handles redirect

  var profileUserId = getProfileUserId(currentUser.id);

  try {
    // Fetch profile stats and posts in parallel
    var profileRes = await fetch('/api/users/' + profileUserId);
    var profileData = await profileRes.json();

    if (!profileData.success) {
      document.querySelector('main').innerHTML = '<p style="padding:2rem">user not found</p>';
      return;
    }

    var profileUser = profileData.user;

    var postsRes  = await fetch('/api/users/' + profileUserId + '/posts');
    var postsData = await postsRes.json();
    var userPosts = postsData.success ? postsData.posts : [];

    renderProfile(profileUser, currentUser);
    renderProfilePosts(profileUser, userPosts, currentUser);
    wireEditForm(profileUser, currentUser);

    // Delegated click handler for post like/delete on the profile page.
    // Like and delete still go through posts.js (Member 3 localStorage) so
    // those interactions are cross-member — counts may differ until Member 3
    // converts their code to use the API.
    var postsContainer = document.getElementById('profile-posts-list');
    if (postsContainer) {
      postsContainer.addEventListener('click', function (event) {
        handleProfilePostClick(event, profileUser, currentUser, userPosts);
      });
    }
  } catch (err) {
    document.querySelector('main').innerHTML = '<p style="padding:2rem">failed to load profile</p>';
  }
});

function getProfileUserId(fallbackId) {
  var search = window.location.search;
  if (!search) return fallbackId;
  var pairs = search.slice(1).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    if (parts[0] === 'userId') return parseInt(parts[1], 10);
  }
  return fallbackId;
}

// ─── Render profile header stats ─────────────────────────────────────────────

function renderProfile(profileUser, currentUser) {
  document.getElementById('profile-avatar').src = profileUser.avatar || DEFAULT_AVATAR;
  document.getElementById('profile-name').textContent    = profileUser.username;
  document.getElementById('profile-handle').textContent  = '@' + profileUser.username;
  document.getElementById('profile-bio').textContent     = profileUser.bio || '';
  document.getElementById('profile-post-count').textContent      = profileUser.postsCount;
  document.getElementById('profile-following-count').textContent = profileUser.followingCount;
  document.getElementById('profile-follower-count').textContent  = profileUser.followersCount;
  document.getElementById('profile-likes-count').textContent     = profileUser.likesCount;

  var isOwnProfile = profileUser.id === currentUser.id;
  var editBtn      = document.getElementById('edit-profile-btn');
  var followBtn    = document.getElementById('follow-user-btn');

  if (isOwnProfile) {
    editBtn.classList.remove('hidden');
    followBtn.classList.add('hidden');
  } else {
    editBtn.classList.add('hidden');
    followBtn.classList.remove('hidden');
  }
}

// ─── Render profile posts list ────────────────────────────────────────────────

function renderProfilePosts(profileUser, posts, currentUser) {
  var container  = document.getElementById('profile-posts-list');
  var emptyState = document.getElementById('profile-empty-state');

  if (!posts || posts.length === 0) {
    container.innerHTML = '';
    var p = emptyState.querySelector('p');
    if (p) {
      p.textContent = profileUser.id === currentUser.id
        ? "You haven't posted yet."
        : 'This user has not posted yet.';
    }
    emptyState.classList.remove('hidden');
    container.appendChild(emptyState);
    return;
  }

  emptyState.classList.add('hidden');

  // createPostCardHtml is defined in posts.js (Member 3) — posts from API
  // already carry `likes: [userId, ...]` and `timestamp` for compatibility.
  var html = '';
  for (var i = 0; i < posts.length; i++) {
    html += createPostCardHtml(posts[i], profileUser, currentUser);
  }
  container.innerHTML = html;
}

// ─── Post action delegation (like / delete / view) ───────────────────────────
// Like and delete still call Member 3's localStorage helpers (updatePostById,
// removePostById) from posts.js. TODO: update when Member 3 converts to API.

function handleProfilePostClick(event, profileUser, currentUser, posts) {
  var btn = event.target.closest('button[data-action]');
  if (!btn) return;

  var card = btn.closest('[data-post-id]');
  if (!card) return;

  var postId = parseInt(card.getAttribute('data-post-id'), 10);
  if (!postId) return;

  var action = btn.getAttribute('data-action');

  if (action === 'view') {
    window.location.href = 'post.html?postId=' + postId;
    return;
  }

  if (action === 'like') {
    if (!currentUser) return;
    updatePostById(postId, function (post) {
      var likes = post.likes || [];
      var idx   = likes.indexOf(currentUser.id);
      if (idx === -1) likes.push(currentUser.id); else likes.splice(idx, 1);
      post.likes = likes;
      return post;
    });
    renderProfilePosts(profileUser, posts, currentUser);
    return;
  }

  if (action === 'delete') {
    if (!currentUser) return;
    var post = getPostById(postId);
    if (!post || post.authorId !== currentUser.id) return;

    var ok = confirm('Delete this post?');
    if (!ok) return;

    removePostById(postId);
    renderProfilePosts(profileUser, posts.filter(function (p) { return p.id !== postId; }), currentUser);

    var msgEl = document.getElementById('profile-message');
    if (msgEl) {
      msgEl.textContent = 'post deleted';
      msgEl.classList.remove('hidden');
    }
  }
}

// ─── Edit profile form ────────────────────────────────────────────────────────

function wireEditForm(profileUser, currentUser) {
  if (profileUser.id !== currentUser.id) return;

  var editBtn     = document.getElementById('edit-profile-btn');
  var editSection = document.getElementById('profile-edit-section');
  var cancelBtn   = document.getElementById('profile-cancel-btn');
  var editForm    = document.getElementById('profile-edit-form');
  var messageEl   = document.getElementById('profile-message');

  editBtn.addEventListener('click', function () {
    document.getElementById('profile-avatar-input').value = profileUser.avatar || '';
    document.getElementById('profile-bio-input').value    = profileUser.bio    || '';
    editSection.classList.remove('hidden');
    editBtn.classList.add('hidden');
    messageEl.classList.add('hidden');
  });

  cancelBtn.addEventListener('click', function () {
    editSection.classList.add('hidden');
    editBtn.classList.remove('hidden');
  });

  editForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    var newAvatar = document.getElementById('profile-avatar-input').value.trim();
    var newBio    = document.getElementById('profile-bio-input').value.trim();

    var saveBtn = document.getElementById('profile-save-btn');
    if (saveBtn) saveBtn.disabled = true;

    try {
      var res  = await fetch('/api/users/' + profileUser.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: newAvatar, bio: newBio })
      });
      var data = await res.json();

      if (!data.success) {
        messageEl.textContent = data.error || 'failed to save';
        messageEl.classList.remove('hidden');
        return;
      }

      profileUser.avatar = data.user.avatar;
      profileUser.bio    = data.user.bio;

      // Update the cached x_current_user so sidebar reflects the new avatar
      var cached = getCurrentUser();
      if (cached && cached.id === profileUser.id) {
        cached.avatar = data.user.avatar;
        cached.bio    = data.user.bio;
        localStorage.setItem('x_current_user', JSON.stringify(cached));
      }

      renderProfile(profileUser, currentUser);

      var sidebarAvatar = document.getElementById('sidebar-avatar');
      if (sidebarAvatar && sidebarAvatar.tagName === 'IMG') {
        sidebarAvatar.src = newAvatar || DEFAULT_AVATAR;
      }

      editSection.classList.add('hidden');
      editBtn.classList.remove('hidden');
      messageEl.textContent = 'profile updated';
      messageEl.classList.remove('hidden');

    } catch (err) {
      messageEl.textContent = 'network error — please try again';
      messageEl.classList.remove('hidden');
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  });
}
