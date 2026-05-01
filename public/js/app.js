// Home-page tab wiring. Initial render uses the default "following" tab;
// each tab button switches feeds via renderFilteredFeed (defined in feed.js).

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('feed-list')) return;

  renderFilteredFeed('following');

  const tabButtons = document.querySelectorAll('.feed-tab');
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderFilteredFeed(btn.getAttribute('data-tab'));
    });
  });
});
