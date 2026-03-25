function getFeedPosts() {
  const session = getSession();
  if (!session || !session.currentUserId) return [];

  const users = getUsers();
  const me = users.find(function (u) { return u.id === session.currentUserId; });
  if (!me) return [];

  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');

  const feedPosts = posts.filter(function (p) {
    return me.following.indexOf(p.authorId) !== -1;
  });

  feedPosts.sort(function (a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return feedPosts;
}

function renderFilteredFeed() {
  const feedList = document.getElementById('feed-list');
  if (!feedList) return;

  const emptyState = document.getElementById('feed-empty-state');
  const currentUser = getCurrentUser();
  const posts = getFeedPosts();

  if (posts.length === 0) {
    feedList.innerHTML = '';
    if (emptyState) {
      emptyState.classList.remove('hidden');
      feedList.appendChild(emptyState);
    }
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  let html = '';
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const author = window.Member3Posts.getAuthorById(post.authorId);
    html += window.Member3Posts.createPostCardHtml(post, author, currentUser);
  }

  feedList.innerHTML = html;
}
