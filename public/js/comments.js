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

function createCommentHtml(comment, user) {
	const username = user ? user.username : 'unknown';
	const avatar = user && user.avatar ? user.avatar : DEFAULT_AVATAR;
	const timeText = window.Member3Posts ? window.Member3Posts.formatPostTime(comment.timestamp) : '';
	const safeText = window.Member3Posts ? window.Member3Posts.escapeHtml(comment.text) : comment.text;
	const safeUsername = window.Member3Posts ? window.Member3Posts.escapeHtml(username) : username;
	const safeAvatar = window.Member3Posts ? window.Member3Posts.escapeHtml(avatar) : avatar;
	const safeTimeText = window.Member3Posts ? window.Member3Posts.escapeHtml(timeText) : timeText;

	return '' +
		'<article class="comment-card">' +
		'<img class="avatar avatar-sm" src="' + safeAvatar + '" alt="comment author avatar">' +
		'<div class="comment-body">' +
		'<div class="comment-meta">' +
		'<a class="post-author" href="profile.html?userId=' + comment.userId + '">' + safeUsername + '</a>' +
		'<span class="post-time">' + safeTimeText + '</span>' +
		'</div>' +
		'<p class="post-text">' + safeText + '</p>' +
		'</div>' +
		'</article>';
}

function renderCommentsForPost(postId) {
	if (!window.Member3Posts) return;

	const container = document.getElementById('comments-list');
	const emptyState = document.getElementById('comments-empty-state');
	if (!container) return;

	const post = window.Member3Posts.getPostById(postId);
	const users = window.Member3Posts.getUsersList();

	if (!post || !post.comments || post.comments.length === 0) {
		container.innerHTML = '';
		if (emptyState) {
			const p = emptyState.querySelector('p');
			if (p) {
				p.textContent = 'No comments yet. Be the first to comment.';
			}

			emptyState.classList.remove('hidden');
			container.appendChild(emptyState);
		}
		return;
	}

	if (emptyState) emptyState.classList.add('hidden');

	const comments = post.comments.slice();
	comments.sort(function (a, b) {
		return new Date(a.timestamp) - new Date(b.timestamp);
	});

	let html = '';
	for (let i = 0; i < comments.length; i++) {
		const comment = comments[i];
		const user = users.find(function (item) {
			return item.id === comment.userId;
		}) || null;
		html += createCommentHtml(comment, user);
	}

	container.innerHTML = html;
}

function initCommentsPage() {
	const commentForm = document.getElementById('comment-form');
	if (!commentForm || !window.Member3Posts) return;

	const postId = window.Member3Posts.parsePostIdFromQuery();
	if (!postId) return;

	renderCommentsForPost(postId);

	commentForm.addEventListener('submit', function (event) {
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

		const updatedPost = window.Member3Posts.updatePostById(postId, function (post) {
			const comments = post.comments || [];
			comments.push({
				id: Date.now(),
				userId: currentUser.id,
				text: text,
				timestamp: new Date().toISOString()
			});
			post.comments = comments;
			return post;
		});

		if (!updatedPost) {
			setCommentError('unable to save comment');
			return;
		}

		commentTextEl.value = '';
		setCommentError('');
		renderCommentsForPost(postId);
	});
}

window.Member3Comments = {
	renderCommentsForPost: renderCommentsForPost
};

document.addEventListener('DOMContentLoaded', function () {
	initCommentsPage();
});
