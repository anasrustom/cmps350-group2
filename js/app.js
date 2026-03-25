// override posts.js's renderFeedPosts so all internal calls (like/delete/create)
// also re-render the correct filtered tab instead of showing all posts
function renderFeedPosts() {
  renderFilteredFeed();
}

document.addEventListener('DOMContentLoaded', function () {
  // render the default "following" tab on load
  renderFilteredFeed('following');

  // wire tab buttons
  const tabButtons = document.querySelectorAll('.feed-tab');
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderFilteredFeed(btn.getAttribute('data-tab'));
    });
  });
});
