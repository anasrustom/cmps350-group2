// Single-post page. The post itself comes from GET /api/posts/[id];
// likes and deletes go through the corresponding API routes.

function setPostMessage(text) {
	const messageEl = document.getElementById('post-message');
	if (!messageEl) return;

	if (!text) {
		messageEl.classList.add('hidden');
		return;
	}

	messageEl.textContent = text;
	messageEl.classList.remove('hidden');
}

function setPostUnavailableState() {
	const detailEl     = document.getElementById('post-detail');
	const commentForm  = document.getElementById('comment-form');
	const commentsList = document.getElementById('comments-list');

	if (detailEl) detailEl.classList.add('hidden');
	if (commentForm) commentForm.classList.add('hidden');
	if (commentsList) commentsList.classList.add('hidden');
}

async function fetchPostDetail(postId) {
	try {
		const res  = await fetch('/api/posts/' + postId);
		const data = await res.json();
		return data.success ? data.post : null;
	} catch {
		return null;
	}
}

function renderPostDetail(post) {
	if (!post) return;

	const helpers = window.Member3Posts || {};
	const formatTime = helpers.formatPostTime || function () { return ''; };

	const author      = post.author || null;
	const currentUser = getCurrentUser();
	const username    = author ? author.username : 'unknown';
	const avatar      = author && author.avatar ? author.avatar : DEFAULT_AVATAR;
	const isLiked     = currentUser && post.likes && post.likes.indexOf(currentUser.id) !== -1;
	const canDelete   = currentUser && post.authorId === currentUser.id;

	const avatarEl    = document.getElementById('post-author-avatar');
	const contentEl   = document.getElementById('post-content');
	const authorEl    = document.getElementById('post-author-name');
	const handleEl    = document.getElementById('post-author-handle');
	const timeEl      = document.getElementById('post-time');
	const likeBtn     = document.getElementById('like-post-btn');
	const likeCountEl = document.getElementById('post-like-count');
	const deleteBtn   = document.getElementById('delete-post-btn');

	if (avatarEl) {
		avatarEl.style.backgroundImage = 'url("' + avatar + '")';
		avatarEl.style.backgroundSize = 'cover';
		avatarEl.style.backgroundPosition = 'center';
		avatarEl.style.backgroundRepeat = 'no-repeat';
	}

	if (contentEl) contentEl.textContent = post.content;

	if (authorEl) {
		authorEl.textContent = username;
		authorEl.href = 'profile.html?userId=' + post.authorId;
	}

	if (handleEl) handleEl.textContent = '@' + username;
	if (timeEl) timeEl.textContent = formatTime(post.timestamp);

	if (likeBtn) {
		likeBtn.textContent = isLiked ? 'liked' : 'like';
		if (isLiked) likeBtn.classList.add('liked');
		else likeBtn.classList.remove('liked');
	}

	if (likeCountEl) {
		const count = post.likes ? post.likes.length : 0;
		likeCountEl.textContent = count + ' likes';
	}

	if (deleteBtn) {
		if (canDelete) deleteBtn.classList.remove('hidden');
		else deleteBtn.classList.add('hidden');
	}
}

async function initPostDetailPage() {
	const postDetailEl = document.getElementById('post-detail');
	if (!postDetailEl || !window.Member3Posts) return;

	const postId = window.Member3Posts.parsePostIdFromQuery();
	if (!postId) {
		setPostMessage('post not found');
		setPostUnavailableState();
		return;
	}

	let post = await fetchPostDetail(postId);
	if (!post) {
		setPostMessage('post not found');
		setPostUnavailableState();
		return;
	}

	renderPostDetail(post);

	const likeBtn = document.getElementById('like-post-btn');
	if (likeBtn) {
		likeBtn.addEventListener('click', async function () {
			const currentUser = getCurrentUser();
			if (!currentUser) {
				window.location.href = 'login.html';
				return;
			}

			try {
				const res  = await fetch('/api/posts/' + postId + '/like', {
					method:  'POST',
					headers: { 'Content-Type': 'application/json' },
					body:    JSON.stringify({ userId: currentUser.id }),
				});
				const data = await res.json();
				if (!data.success) return;

				post.likes = data.likes;
				renderPostDetail(post);
			} catch {
				setPostMessage('network error — please try again');
			}
		});
	}

	const deleteBtn = document.getElementById('delete-post-btn');
	if (deleteBtn) {
		deleteBtn.addEventListener('click', async function () {
			const currentUser = getCurrentUser();
			if (!currentUser) {
				window.location.href = 'login.html';
				return;
			}

			if (post.authorId !== currentUser.id) return;
			if (!confirm('Delete this post?')) return;

			try {
				const res  = await fetch('/api/posts/' + postId, {
					method:  'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body:    JSON.stringify({ userId: currentUser.id }),
				});
				const data = await res.json();
				if (!data.success) {
					setPostMessage(data.error || 'failed to delete');
					return;
				}
				window.location.href = 'index.html';
			} catch {
				setPostMessage('network error — please try again');
			}
		});
	}
}

document.addEventListener('DOMContentLoaded', function () {
	initPostDetailPage();
});
