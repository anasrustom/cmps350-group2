// Shared rendering helpers used by feed.js, comments.js, and post-detail.js.
// All actual post data comes from the database via /api/posts.* endpoints —
// this file does not read or write localStorage and does not wire any forms.

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

window.Member3Posts = {
	parsePostIdFromQuery: parsePostIdFromQuery,
	formatPostTime: formatPostTime,
	escapeHtml: escapeHtml,
	createPostCardHtml: createPostCardHtml
};
