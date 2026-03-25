const STORAGE_KEYS = {
  USERS: 'x_users',
  POSTS: 'x_posts',
  SESSION: 'x_session'
};

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function generateId() {
  return Date.now();
}

const STORAGE_SCHEMA = {
  x_users: [
    {
      id: null,
      username: '',
      email: '',
      password: '',
      bio: '',
      avatar: '',
      following: [],
      joinedAt: ''
    }
  ],
  x_posts: [
    {
      id: null,
      authorId: null,
      content: '',
      timestamp: '',
      likes: [],
      comments: [
        {
          id: null,
          userId: null,
          text: '',
          timestamp: ''
        }
      ]
    }
  ],
  x_session: {
    currentUserId: null
  }
};