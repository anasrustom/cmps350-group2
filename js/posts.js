function getUsersList() {
	return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
}

function getPostsList() {
	return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
}

function savePostsList(posts) {
	localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

function getPostById(postId) {
	const posts = getPostsList();
	return posts.find(function (post) {
		return post.id === postId;
	}) || null;
}

function updatePostById(postId, updater) {
	const posts = getPostsList();
	const index = posts.findIndex(function (post) {
		return post.id === postId;
	});

	if (index === -1) return null;

	const updatedPost = updater(posts[index]);
	posts[index] = updatedPost;
	savePostsList(posts);
	return updatedPost;
}

function removePostById(postId) {
	const posts = getPostsList();
	const nextPosts = posts.filter(function (post) {
		return post.id !== postId;
	});
	savePostsList(nextPosts);
}

function getAuthorById(authorId) {
	const users = getUsersList();
	return users.find(function (user) {
		return user.id === authorId;
	}) || null;
}

function parsePostIdFromQuery() {
	const search = window.location.search;
	if (!search) return null;

	const pairs = search.slice(1).split('&');
	for (let i = 0; i < pairs.length; i++) {
		const parts = pairs[i].split('=');
		if (parts[0] === 'postId') {
			return parseInt(parts[1], 10);
		}
	}

	return null;
}

function escapeHtml(text) {
	const value = text == null ? '' : String(text);
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function formatPostTime(timestamp) {
	const date = new Date(timestamp);
	if (isNaN(date.getTime())) return '';
	return date.toLocaleString();
}

function setFeedMessage(text) {
	const messageEl = document.getElementById('feed-message');
	if (!messageEl) return;

	if (!text) {
		messageEl.classList.add('hidden');
		return;
	}

	messageEl.textContent = text;
	messageEl.classList.remove('hidden');
}

function createPostCardHtml(post, author, currentUser) {
	const username = author ? author.username : 'unknown';
	const avatar = author && author.avatar ? author.avatar : DEFAULT_AVATAR;
	const safeAvatar = escapeHtml(avatar);
	const likeCount = post.likes ? post.likes.length : 0;
	const isLiked = post.likes && currentUser ? post.likes.indexOf(currentUser.id) !== -1 : false;
	const canDelete = currentUser && post.authorId === currentUser.id;

	return '' +
		'<article class="post-card" data-post-id="' + post.id + '">' +
			'<div class="post-card-inner">' +
				'<img class="avatar avatar-md" src="' + safeAvatar + '" alt="author avatar">' +
				'<div class="post-body">' +
					'<div class="post-meta">' +
						'<a class="post-author" href="profile.html?userId=' + post.authorId + '">' + escapeHtml(username) + '</a>' +
						'<span class="post-username">@' + escapeHtml(username) + '</span>' +
						'<span class="post-time">' + escapeHtml(formatPostTime(post.timestamp)) + '</span>' +
					'</div>' +
					'<p class="post-text">' + escapeHtml(post.content) + '</p>' +
					'<div class="post-actions">' +
						'<button class="action-btn' + (isLiked ? ' liked' : '') + '" type="button" data-action="like">' + (isLiked ? 'liked' : 'like') + '</button>' +
						'<span class="post-time">' + likeCount + ' likes</span>' +
						'<button class="action-btn" type="button" data-action="view">view</button>' +
						(canDelete ? '<button class="action-btn" type="button" data-action="delete">delete</button>' : '') +
					'</div>' +
				'</div>' +
			'</div>' +
		'</article>';
}

function renderFeedPosts() {
	const feedList = document.getElementById('feed-list');
	if (!feedList) return;

	const emptyState = document.getElementById('feed-empty-state');
	const currentUser = getCurrentUser();

	const posts = getPostsList();
	posts.sort(function (a, b) {
		return new Date(b.timestamp) - new Date(a.timestamp);
	});

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
		const author = getAuthorById(post.authorId);
		html += createPostCardHtml(post, author, currentUser);
	}

	feedList.innerHTML = html;
}

function handleComposerSubmit(event) {
	event.preventDefault();

	const currentUser = getCurrentUser();
	if (!currentUser) {
		window.location.href = 'login.html';
		return;
	}

	const composerText = document.getElementById('composer-text');
	if (!composerText) return;

	const content = composerText.value.trim();
	if (!content) {
		setFeedMessage('post content cannot be empty');
		return;
	}

	const posts = getPostsList();
	const post = {
		id: Date.now(),
		authorId: currentUser.id,
		content: content,
		timestamp: new Date().toISOString(),
		likes: [],
		comments: []
	};

	posts.unshift(post);
	savePostsList(posts);

	composerText.value = '';
	const composerCount = document.getElementById('composer-count');
	if (composerCount) composerCount.textContent = '0';

	renderFeedPosts();
	setFeedMessage('post created');
}

function handleFeedClick(event) {
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
		if (!currentUser) {
			window.location.href = 'login.html';
			return;
		}

		updatePostById(postId, function (post) {
			const likes = post.likes || [];
			const index = likes.indexOf(currentUser.id);
			if (index === -1) likes.push(currentUser.id);
			else likes.splice(index, 1);
			post.likes = likes;
			return post;
		});

		renderFeedPosts();
		return;
	}

	if (action === 'delete') {
		const currentUser = getCurrentUser();
		if (!currentUser) {
			window.location.href = 'login.html';
			return;
		}

		const post = getPostById(postId);
		if (!post || post.authorId !== currentUser.id) return;

		removePostById(postId);
		renderFeedPosts();
		setFeedMessage('post deleted');
	}
}

function initFeedPage() {
	const composerForm = document.getElementById('composer-form');
	const composerText = document.getElementById('composer-text');
	const composerCount = document.getElementById('composer-count');
	const feedList = document.getElementById('feed-list');

	if (!composerForm || !composerText || !feedList) return;

	composerForm.addEventListener('submit', handleComposerSubmit);

	composerText.addEventListener('input', function () {
		if (composerCount) {
			composerCount.textContent = String(composerText.value.length);
		}
	});

	feedList.addEventListener('click', handleFeedClick);
	renderFeedPosts();
}

window.Member3Posts = {
	getUsersList: getUsersList,
	getPostsList: getPostsList,
	savePostsList: savePostsList,
	getPostById: getPostById,
	updatePostById: updatePostById,
	removePostById: removePostById,
	getAuthorById: getAuthorById,
	parsePostIdFromQuery: parsePostIdFromQuery,
	formatPostTime: formatPostTime,
	escapeHtml: escapeHtml,
	renderFeedPosts: renderFeedPosts
};

document.addEventListener('DOMContentLoaded', function () {
	initFeedPage();
});
