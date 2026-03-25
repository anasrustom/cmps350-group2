function isFollowing(targetUserId) {
  const users = getUsers();
  const session = getSession();
  if (!session || !session.currentUserId) return false;
  const me = users.find(function (u) { return u.id === session.currentUserId; });
  if (!me) return false;
  return me.following.indexOf(targetUserId) !== -1;
}

function toggleFollow(targetUserId) {
  const session = getSession();
  if (!session || !session.currentUserId) return;

  const users = getUsers();
  const index = users.findIndex(function (u) { return u.id === session.currentUserId; });
  if (index === -1) return;

  const following = users[index].following;
  const pos = following.indexOf(targetUserId);
  if (pos === -1) {
    following.push(targetUserId);
  } else {
    following.splice(pos, 1);
  }

  saveUsers(users);
}

function getSuggestions() {
  const session = getSession();
  if (!session || !session.currentUserId) return [];

  const users = getUsers();
  const me = users.find(function (u) { return u.id === session.currentUserId; });
  if (!me) return [];

  return users.filter(function (u) {
    return u.id !== me.id && me.following.indexOf(u.id) === -1;
  });
}

function renderSuggestions() {
  const list = document.getElementById('suggestions-list');
  if (!list) return;

  const suggestions = getSuggestions();

  if (suggestions.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>no suggestions right now</p></div>';
    return;
  }

  let html = '';
  for (let i = 0; i < suggestions.length; i++) {
    const u = suggestions[i];
    const avatar = u.avatar || DEFAULT_AVATAR;
    html +=
      '<div class="follow-item">' +
        '<img class="avatar avatar-sm" src="' + avatar + '" alt="avatar">' +
        '<div class="follow-item-info">' +
          '<a class="follow-name" href="profile.html?userId=' + u.id + '">' + u.username + '</a>' +
          '<span class="follow-handle">@' + u.username + '</span>' +
        '</div>' +
        '<button class="btn btn-primary" type="button" data-follow-id="' + u.id + '">follow</button>' +
      '</div>';
  }

  list.innerHTML = html;

  list.addEventListener('click', function (event) {
    const btn = event.target.closest('button[data-follow-id]');
    if (!btn) return;

    const targetId = parseInt(btn.getAttribute('data-follow-id'), 10);
    toggleFollow(targetId);
    renderSuggestions();

    // re-render the feed if we're on the home page
    if (typeof renderFilteredFeed === 'function') {
      renderFilteredFeed();
    }
  });
}

function initFollowButtons() {
  const followBtn = document.getElementById('follow-user-btn');
  if (!followBtn) return;

  // read the profile userId from the url
  const search = window.location.search;
  let profileUserId = null;
  if (search) {
    const pairs = search.slice(1).split('&');
    for (let i = 0; i < pairs.length; i++) {
      const parts = pairs[i].split('=');
      if (parts[0] === 'userId') {
        profileUserId = parseInt(parts[1], 10);
        break;
      }
    }
  }

  if (!profileUserId) return;

  followBtn.textContent = isFollowing(profileUserId) ? 'unfollow' : 'follow';

  followBtn.addEventListener('click', function () {
    toggleFollow(profileUserId);

    followBtn.textContent = isFollowing(profileUserId) ? 'unfollow' : 'follow';

    // update follower count without re-rendering the whole profile
    const countEl = document.getElementById('profile-follower-count');
    if (countEl) {
      const users = getUsers();
      const count = users.filter(function (u) {
        return u.following.indexOf(profileUserId) !== -1;
      }).length;
      countEl.textContent = count;
    }

    renderSuggestions();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  renderSuggestions();
  initFollowButtons();
});
