// Home-feed composer and feed list. All persistence happens through
// /api/posts.* — no localStorage reads/writes for post data.

async function loadFeedPosts(tab) {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  try {
    const res  = await fetch('/api/posts?tab=' + tab + '&userId=' + currentUser.id);
    const data = await res.json();
    return data.success ? data.posts : [];
  } catch {
    return [];
  }
}

async function renderFilteredFeed(tab) {
  const feedList = document.getElementById('feed-list');
  if (!feedList) return;

  if (!tab) {
    const activeBtn = document.querySelector('.feed-tab.active');
    tab = activeBtn ? activeBtn.getAttribute('data-tab') : 'following';
  }

  const emptyState  = document.getElementById('feed-empty-state');
  const currentUser = getCurrentUser();
  const posts       = await loadFeedPosts(tab);

  if (posts.length === 0) {
    feedList.innerHTML = '';
    if (emptyState) {
      const p = emptyState.querySelector('p');
      if (p) {
        p.textContent = tab === 'discovery'
          ? "No posts from users you don't follow yet"
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
    html += createPostCardHtml(posts[i], posts[i].author, currentUser);
  }
  feedList.innerHTML = html;
}

async function renderFeedPosts() {
  await renderFilteredFeed();
}

function setFeedMessage(text) {
  const messageEl = document.getElementById('feed-message');
  if (!messageEl) return;
  if (!text) { messageEl.classList.add('hidden'); return; }
  messageEl.textContent = text;
  messageEl.classList.remove('hidden');
}

async function handleComposerSubmit(event) {
  event.preventDefault();

  const currentUser = getCurrentUser();
  if (!currentUser) { window.location.href = 'login.html'; return; }

  const composerText = document.getElementById('composer-text');
  if (!composerText) return;

  const content = composerText.value.trim();
  if (!content) { setFeedMessage('post content cannot be empty'); return; }

  const submitBtn = document.querySelector('#composer-form [type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const res  = await fetch('/api/posts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ authorId: currentUser.id, content }),
    });
    const data = await res.json();

    if (!data.success) {
      setFeedMessage(data.error || 'failed to create post');
      return;
    }

    composerText.value = '';
    const composerCount = document.getElementById('composer-count');
    if (composerCount) composerCount.textContent = '0';

    await renderFilteredFeed();
    setFeedMessage('post created');
  } catch {
    setFeedMessage('network error — please try again');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function handleFeedClick(event) {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) return;

  const card = actionButton.closest('[data-post-id]');
  if (!card) return;

  const postId = parseInt(card.getAttribute('data-post-id'), 10);
  if (!postId) return;

  const action = actionButton.getAttribute('data-action');

  if (action === 'view') {
    window.location.href = 'post.html?postId=' + postId;
    return;
  }

  if (action === 'like') {
    const currentUser = getCurrentUser();
    if (!currentUser) { window.location.href = 'login.html'; return; }
    try {
      await fetch('/api/posts/' + postId + '/like', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: currentUser.id }),
      });
      await renderFilteredFeed();
    } catch {
      setFeedMessage('network error — please try again');
    }
    return;
  }

  if (action === 'delete') {
    const currentUser = getCurrentUser();
    if (!currentUser) { window.location.href = 'login.html'; return; }

    if (!confirm('Delete this post?')) return;

    try {
      const res  = await fetch('/api/posts/' + postId, {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: currentUser.id }),
      });
      const data = await res.json();
      if (!data.success) { setFeedMessage(data.error || 'failed to delete'); return; }
      await renderFilteredFeed();
      setFeedMessage('post deleted');
    } catch {
      setFeedMessage('network error — please try again');
    }
  }
}

function initFeedPage() {
  const composerForm  = document.getElementById('composer-form');
  const composerText  = document.getElementById('composer-text');
  const composerCount = document.getElementById('composer-count');
  const feedList      = document.getElementById('feed-list');

  if (!composerForm || !composerText || !feedList) return;

  composerForm.addEventListener('submit', handleComposerSubmit);

  composerText.addEventListener('input', function () {
    if (composerCount) composerCount.textContent = composerText.value.length;
  });

  feedList.addEventListener('click', handleFeedClick);
}

document.addEventListener('DOMContentLoaded', function () {
  initFeedPage();
});
