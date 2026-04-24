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
	const detailEl = document.getElementById('post-detail');
	const commentForm = document.getElementById('comment-form');
	const commentsList = document.getElementById('comments-list');

	if (detailEl) detailEl.classList.add('hidden');
	if (commentForm) commentForm.classList.add('hidden');
	if (commentsList) commentsList.classList.add('hidden');
}

function renderPostDetail(postId) {
	if (!window.Member3Posts) return null;

	const post = window.Member3Posts.getPostById(postId);
	if (!post) return null;

	const author = window.Member3Posts.getAuthorById(post.authorId);
	const currentUser = getCurrentUser();

	const avatarEl = document.getElementById('post-author-avatar');
	const contentEl = document.getElementById('post-content');
	const authorNameEl = document.getElementById('post-author-name');
	const handleEl = document.getElementById('post-author-handle');
	const timeEl = document.getElementById('post-time');
	const likeBtn = document.getElementById('like-post-btn');
	const likeCountEl = document.getElementById('post-like-count');
	const deleteBtn = document.getElementById('delete-post-btn');

	const username = author ? author.username : 'unknown';
	const avatar = author && author.avatar ? author.avatar : DEFAULT_AVATAR;
	const isLiked = currentUser && post.likes && post.likes.indexOf(currentUser.id) !== -1;
	const canDelete = currentUser && post.authorId === currentUser.id;

	if (avatarEl) {
		avatarEl.style.backgroundImage = 'url("' + avatar + '")';
		avatarEl.style.backgroundSize = 'cover';
		avatarEl.style.backgroundPosition = 'center';
		avatarEl.style.backgroundRepeat = 'no-repeat';
	}

	if (contentEl) contentEl.textContent = post.content;

	if (authorNameEl) {
		authorNameEl.textContent = username;
		authorNameEl.href = 'profile.html?userId=' + post.authorId;
	}

	if (handleEl) handleEl.textContent = '@' + username;
	if (timeEl) timeEl.textContent = window.Member3Posts.formatPostTime(post.timestamp);

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

	return post;
}

function initPostDetailPage() {
	const postDetailEl = document.getElementById('post-detail');
	if (!postDetailEl || !window.Member3Posts) return;

	const postId = window.Member3Posts.parsePostIdFromQuery();
	if (!postId) {
		setPostMessage('post not found');
		setPostUnavailableState();
		return;
	}

	let post = renderPostDetail(postId);
	if (!post) {
		setPostMessage('post not found');
		setPostUnavailableState();
		return;
	}

	const likeBtn = document.getElementById('like-post-btn');
	if (likeBtn) {
		likeBtn.addEventListener('click', function () {
			const currentUser = getCurrentUser();
			if (!currentUser) {
				window.location.href = 'login.html';
				return;
			}

			window.Member3Posts.updatePostById(postId, function (oldPost) {
				const likes = oldPost.likes || [];
				const index = likes.indexOf(currentUser.id);
				if (index === -1) likes.push(currentUser.id);
				else likes.splice(index, 1);
				oldPost.likes = likes;
				return oldPost;
			});

			post = renderPostDetail(postId);
			if (window.Member3Comments && window.Member3Comments.renderCommentsForPost) {
				window.Member3Comments.renderCommentsForPost(postId);
			}
		});
	}

	const deleteBtn = document.getElementById('delete-post-btn');
	if (deleteBtn) {
		deleteBtn.addEventListener('click', function () {
			const currentUser = getCurrentUser();
			if (!currentUser) {
				window.location.href = 'login.html';
				return;
			}

			const latestPost = window.Member3Posts.getPostById(postId);
			if (!latestPost || latestPost.authorId !== currentUser.id) return;

			window.Member3Posts.removePostById(postId);
			setPostMessage('post deleted');
			window.location.href = 'index.html';
		});
	}
}

document.addEventListener('DOMContentLoaded', function () {
	initPostDetailPage();
});
