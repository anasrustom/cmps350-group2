document.addEventListener('DOMContentLoaded', function () {
  const existing = localStorage.getItem('x_users');
  if (existing && JSON.parse(existing).length > 0) return;

  const users = [
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

  const posts = [
    {
      id: 101,
      authorId: 1,
      content: 'just finished my first html project. feels great!',
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
      content: 'anyone else love how flexbox handles alignment?',
      timestamp: '2025-01-17T14:00:00.000Z',
      likes: [],
      comments: []
    }
  ];

  localStorage.setItem('x_users', JSON.stringify(users));
  localStorage.setItem('x_posts', JSON.stringify(posts));
  localStorage.setItem('x_session', JSON.stringify({ currentUserId: null }));
});
