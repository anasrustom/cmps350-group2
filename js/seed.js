document.addEventListener('DOMContentLoaded', function () {
  const existingUsers = JSON.parse(localStorage.getItem('x_users') || '[]');
  const alreadySeeded = existingUsers.some(function (u) { return u.id === 1; });
  if (alreadySeeded) return;

  const seedUsers = [
    {
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      password: 'Alice1!',
      bio: 'computer science student',
      avatar: '',
      following: [2],
      joinedAt: '2025-01-10T08:00:00.000Z'
    },
    {
      id: 2,
      username: 'bob',
      email: 'bob@example.com',
      password: 'Bobby2@',
      bio: 'loves web development',
      avatar: '',
      following: [1],
      joinedAt: '2025-01-11T09:00:00.000Z'
    },
    {
      id: 3,
      username: 'carol',
      email: 'carol@example.com',
      password: 'Carol3#',
      bio: 'design and ux enthusiast',
      avatar: '',
      following: [],
      joinedAt: '2025-01-12T10:00:00.000Z'
    }
  ];

  const seedPosts = [
    {
      id: 101,
      authorId: 1,
      content: 'Dr. Fadi is a very kind man, God bless him. ',
      timestamp: '2025-01-15T10:00:00.000Z',
      likes: [2],
      comments: []
    },
    {
      id: 102,
      authorId: 2,
      content: 'css grid is so much easier than i expected.',
      timestamp: '2025-01-16T11:30:00.000Z',
      likes: [1, 3],
      comments: []
    },
    {
      id: 103,
      authorId: 3,
      content: 'I am very scared from the Web Dev midterm',
      timestamp: '2025-01-17T14:00:00.000Z',
      likes: [],
      comments: []
    },
    {
      id: 104,
      authorId: 1,
      content: 'this project deserves an A for sure.',
      timestamp: '2025-01-18T09:15:00.000Z',
      likes: [2, 3],
      comments: []
    },
    {
      id: 105,
      authorId: 1,
      content: 'finally understood how the DOM works. why did no one explain it this clearly before',
      timestamp: '2025-01-20T16:00:00.000Z',
      likes: [2],
      comments: []
    },
    {
      id: 106,
      authorId: 2,
      content: 'flexbox or grid? honestly both once you get used to them',
      timestamp: '2025-01-19T13:00:00.000Z',
      likes: [1],
      comments: []
    },
    {
      id: 107,
      authorId: 2,
      content: 'submitted the project 2 minutes before the deadline. You cant rush quality',
      timestamp: '2025-01-21T23:58:00.000Z',
      likes: [1, 3],
      comments: []
    },
    {
      id: 108,
      authorId: 3,
      content: 'UI mockups are the most fun part of any project honestly',
      timestamp: '2025-01-19T11:00:00.000Z',
      likes: [1, 2],
      comments: []
    },
    {
      id: 109,
      authorId: 3,
      content: 'I hope I get an A in Web Dev',
      timestamp: '2025-01-22T15:30:00.000Z',
      likes: [1],
      comments: []
    }
  ];

  // merge seed data with any accounts the user already registered
  const nonSeedUsers = existingUsers.filter(function (u) {
    return u.id !== 1 && u.id !== 2 && u.id !== 3;
  });
  const existingPosts = JSON.parse(localStorage.getItem('x_posts') || '[]');
  const nonSeedPosts = existingPosts.filter(function (p) {
    return ![101, 102, 103, 104, 105, 106, 107, 108, 109].includes(p.id);
  });

  localStorage.setItem('x_users', JSON.stringify(seedUsers.concat(nonSeedUsers)));
  localStorage.setItem('x_posts', JSON.stringify(seedPosts.concat(nonSeedPosts)));
  if (!localStorage.getItem('x_session')) {
    localStorage.setItem('x_session', JSON.stringify({ currentUserId: null }));
  }
});

// dev helper — call resetSeedData() in the browser console to reset demo state
function resetSeedData() {
  localStorage.removeItem('x_users');
  localStorage.removeItem('x_posts');
  localStorage.removeItem('x_session');
  window.location.reload();
}
