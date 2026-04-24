function getFollowingPosts() {
  const session = getSession();
  if (!session || !session.currentUserId) return [];

  const users = getUsers();
  const me = users.find(function (u) { return u.id === session.currentUserId; });
  if (!me) return [];

  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
  const filtered = posts.filter(function (p) {
    return p.authorId === me.id || me.following.indexOf(p.authorId) !== -1;
  });

  filtered.sort(function (a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return filtered;
}

function getDiscoveryPosts() {
  const session = getSession();
  if (!session || !session.currentUserId) return [];

  const users = getUsers();
  const me = users.find(function (u) { return u.id === session.currentUserId; });
  if (!me) return [];

  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
  const filtered = posts.filter(function (p) {
    return p.authorId !== me.id && me.following.indexOf(p.authorId) === -1;
  });

  filtered.sort(function (a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return filtered;
}

function renderFilteredFeed(tab) {
  const feedList = document.getElementById('feed-list');
  if (!feedList) return;

  // if no tab given, read from the active tab button in the DOM
  if (!tab) {
    const activeBtn = document.querySelector('.feed-tab.active');
    tab = activeBtn ? activeBtn.getAttribute('data-tab') : 'following';
  }

  const emptyState = document.getElementById('feed-empty-state');
  const currentUser = getCurrentUser();
  const posts = (tab === 'discovery') ? getDiscoveryPosts() : getFollowingPosts();

  if (posts.length === 0) {
    feedList.innerHTML = '';
    if (emptyState) {
      const p = emptyState.querySelector('p');
      if (p) {
        p.textContent = tab === 'discovery'
          ? 'No posts from users you don\'t follow yet'
          : 'Follow someone to see their posts here';
      }
      emptyState.classList.remove('hidden');
      feedList.appendChild(emptyState);
    }
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  let html = '';
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    // call global functions directly — createPostCardHtml is not in window.Member3Posts
    const author = getAuthorById(post.authorId);
    html += createPostCardHtml(post, author, currentUser);
  }

  feedList.innerHTML = html;
}
