// follow.js — Member 2
// Follow/unfollow and suggestions backed by API + DB.
// x_current_user.following is kept in sync after each toggle so that
// feed.js (Member 3) can still read me.following synchronously.

// ─── Local cache helpers ──────────────────────────────────────────────────────

function isFollowing(targetUserId) {
  var user = getCurrentUser();
  if (!user || !Array.isArray(user.following)) return false;
  return user.following.indexOf(targetUserId) !== -1;
}

// Update the x_current_user cache after a successful follow/unfollow so that
// feed.js's synchronous me.following check stays accurate.
function syncFollowingCache(targetUserId, nowFollowing) {
  var cached = getCurrentUser();
  if (!cached) return;
  var list = Array.isArray(cached.following) ? cached.following.slice() : [];
  var idx  = list.indexOf(targetUserId);
  if (nowFollowing && idx === -1) {
    list.push(targetUserId);
  } else if (!nowFollowing && idx !== -1) {
    list.splice(idx, 1);
  }
  cached.following = list;
  localStorage.setItem('x_current_user', JSON.stringify(cached));
}

// ─── Suggestions panel ────────────────────────────────────────────────────────

async function renderSuggestions() {
  var list = document.getElementById('suggestions-list');
  if (!list) return;

  var currentUser = getCurrentUser();
  if (!currentUser) return;

  try {
    var res  = await fetch('/api/users/suggestions?userId=' + currentUser.id);
    var data = await res.json();

    if (!data.success || data.users.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>No suggestions right now</p></div>';
      return;
    }

    var html = '';
    for (var i = 0; i < data.users.length; i++) {
      var u      = data.users[i];
      var avatar = u.avatar || DEFAULT_AVATAR;
      html +=
        '<div class="follow-item">' +
          '<img class="avatar avatar-sm" src="' + avatar + '" alt="avatar">' +
          '<div class="follow-item-info">' +
            '<a class="follow-name" href="profile.html?userId=' + u.id + '">' + u.username + '</a>' +
            '<span class="follow-handle">@' + u.username + '</span>' +
          '</div>' +
          '<button class="btn btn-secondary" type="button" data-follow-id="' + u.id + '">Follow</button>' +
        '</div>';
    }
    list.innerHTML = html;

  } catch (err) {
    list.innerHTML = '<div class="empty-state"><p>Failed to load suggestions</p></div>';
  }
}

function initSuggestions() {
  var list = document.getElementById('suggestions-list');
  if (!list) return;

  renderSuggestions();

  // Single delegated listener — avoids stacking a new one on every re-render
  list.addEventListener('click', async function (event) {
    var btn = event.target.closest('button[data-follow-id]');
    if (!btn) return;

    var currentUser = getCurrentUser();
    if (!currentUser) return;

    var targetId = parseInt(btn.getAttribute('data-follow-id'), 10);
    btn.disabled = true;

    try {
      var res  = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id, followingId: targetId })
      });
      var data = await res.json();

      if (data.success) {
        syncFollowingCache(targetId, data.following);
        // Re-render suggestions — the followed user is now excluded by the API
        await renderSuggestions();
        if (typeof renderFilteredFeed === 'function') renderFilteredFeed();
      }
    } catch (err) {
      btn.disabled = false;
    }
  });
}

// ─── Profile-page follow button ───────────────────────────────────────────────

function initFollowButtons() {
  var followBtn = document.getElementById('follow-user-btn');
  if (!followBtn) return;

  var profileUserId = null;
  var pairs = window.location.search.slice(1).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    if (parts[0] === 'userId') { profileUserId = parseInt(parts[1], 10); break; }
  }
  if (!profileUserId) return;

  var currentUser = getCurrentUser();
  if (!currentUser) return;

  // Initial state from cache (populated at login time)
  followBtn.textContent = isFollowing(profileUserId) ? 'Unfollow' : 'Follow';

  followBtn.addEventListener('click', async function () {
    followBtn.disabled = true;

    try {
      var res  = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id, followingId: profileUserId })
      });
      var data = await res.json();

      if (data.success) {
        syncFollowingCache(profileUserId, data.following);
        followBtn.textContent = data.following ? 'Unfollow' : 'Follow';

        // Update the follower count shown on the profile header
        var countEl = document.getElementById('profile-follower-count');
        if (countEl) countEl.textContent = data.followersCount;

        await renderSuggestions();
      }
    } finally {
      followBtn.disabled = false;
    }
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  initSuggestions();
  initFollowButtons();
});
