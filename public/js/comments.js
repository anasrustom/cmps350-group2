// Comments for a single post page. Comments come from
// GET /api/posts/[id]/comments and are added via POST /api/posts/[id]/comments.

function setCommentError(text) {
	const errorEl = document.getElementById('comment-error');
	if (!errorEl) return;

	if (!text) {
		errorEl.textContent = '';
		errorEl.classList.add('hidden');
		return;
	}

	errorEl.textContent = text;
	errorEl.classList.remove('hidden');
}

function createCommentHtml(comment) {
	const helpers = window.Member3Posts || {};
	const escape = helpers.escapeHtml || function (v) { return v == null ? '' : String(v); };
	const formatTime = helpers.formatPostTime || function () { return ''; };

	const user = comment.user || null;
	const username = user ? user.username : 'unknown';
	const avatar = user && user.avatar ? user.avatar : DEFAULT_AVATAR;

	return '' +
		'<article class="comment-card">' +
		'<img class="avatar avatar-sm" src="' + escape(avatar) + '" alt="comment author avatar">' +
		'<div class="comment-body">' +
		'<div class="comment-meta">' +
		'<a class="post-author" href="profile.html?userId=' + comment.userId + '">' + escape(username) + '</a>' +
		'<span class="post-time">' + escape(formatTime(comment.timestamp)) + '</span>' +
		'</div>' +
		'<p class="post-text">' + escape(comment.text) + '</p>' +
		'</div>' +
		'</article>';
}

async function loadComments(postId) {
	try {
		const res  = await fetch('/api/posts/' + postId + '/comments');
		const data = await res.json();
		return data.success ? data.comments : [];
	} catch {
		return [];
	}
}

async function renderCommentsForPost(postId) {
	const container  = document.getElementById('comments-list');
	const emptyState = document.getElementById('comments-empty-state');
	if (!container) return;

	const comments = await loadComments(postId);

	if (!comments || comments.length === 0) {
		container.innerHTML = '';
		if (emptyState) {
			const p = emptyState.querySelector('p');
			if (p) p.textContent = 'No comments yet. Be the first to comment.';
			emptyState.classList.remove('hidden');
			container.appendChild(emptyState);
		}
		return;
	}

	if (emptyState) emptyState.classList.add('hidden');

	let html = '';
	for (let i = 0; i < comments.length; i++) {
		html += createCommentHtml(comments[i]);
	}
	container.innerHTML = html;
}

function initCommentsPage() {
	const commentForm = document.getElementById('comment-form');
	if (!commentForm || !window.Member3Posts) return;

	const postId = window.Member3Posts.parsePostIdFromQuery();
	if (!postId) return;

	renderCommentsForPost(postId);

	commentForm.addEventListener('submit', async function (event) {
		event.preventDefault();

		const currentUser = getCurrentUser();
		if (!currentUser) {
			window.location.href = 'login.html';
			return;
		}

		const commentTextEl = document.getElementById('comment-text');
		if (!commentTextEl) return;

		const text = commentTextEl.value.trim();
		if (!text) {
			setCommentError('comment cannot be empty');
			return;
		}

		const submitBtn = document.getElementById('comment-submit');
		if (submitBtn) submitBtn.disabled = true;

		try {
			const res  = await fetch('/api/posts/' + postId + '/comments', {
				method:  'POST',
				headers: { 'Content-Type': 'application/json' },
				body:    JSON.stringify({ userId: currentUser.id, text: text }),
			});
			const data = await res.json();

			if (!data.success) {
				setCommentError(data.error || 'unable to save comment');
				return;
			}

			commentTextEl.value = '';
			setCommentError('');
			await renderCommentsForPost(postId);
		} catch {
			setCommentError('network error — please try again');
		} finally {
			if (submitBtn) submitBtn.disabled = false;
		}
	});
}

window.Member3Comments = {
	renderCommentsForPost: renderCommentsForPost
};

document.addEventListener('DOMContentLoaded', function () {
	initCommentsPage();
});
