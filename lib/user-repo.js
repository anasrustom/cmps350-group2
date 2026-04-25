import prisma from './prisma.js';

// Strip password before returning user data to callers
function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    bio: user.bio || '',
    avatar: user.avatar || '',
    joinedAt: user.joinedAt,
  };
}

export async function createUser({ username, email, password, bio = '', avatar = '' }) {
  username = (username || '').trim();
  email = (email || '').trim().toLowerCase();
  bio = (bio || '').trim();
  avatar = (avatar || '').trim();

  if (!username) throw new Error('username is required');
  if (!email) throw new Error('email is required');
  if (!password) throw new Error('password is required');

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error('email is already registered');

  // SQLite string comparison is case-sensitive; check username case-insensitively in JS
  const allWithUsername = await prisma.user.findMany({
    where: { username },
    select: { id: true },
  });
  if (allWithUsername.length > 0) throw new Error('username is already taken');

  const user = await prisma.user.create({
    data: { username, email, password, bio, avatar },
  });

  return publicUser(user);
}

export async function loginUser({ identifier, email, password }) {
  const loginId = ((identifier || email || '')).trim().toLowerCase();
  if (!loginId) throw new Error('email is required');
  if (!password) throw new Error('password is required');

  // Try exact email match first, then exact username match
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: loginId }, { username: loginId }],
    },
  });

  if (!user || user.password !== password) {
    throw new Error('incorrect email or password');
  }

  return publicUser(user);
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) return null;
  return publicUser(user);
}

export async function getUserProfile(id) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) return null;

  // Count total likes received across all this user's posts
  const likesCount = await prisma.like.count({
    where: { post: { authorId: Number(id) } },
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    bio: user.bio || '',
    avatar: user.avatar || '',
    joinedAt: user.joinedAt,
    postsCount: user._count.posts,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    likesCount,
  };
}

export async function updateUser(id, { bio, avatar }) {
  const data = {};
  if (bio !== undefined) data.bio = (bio || '').trim();
  if (avatar !== undefined) data.avatar = (avatar || '').trim();

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data,
  });

  return publicUser(user);
}

// Returns posts in a shape compatible with createPostCardHtml in posts.js:
// - timestamp (not createdAt) for formatPostTime
// - likes as array of user IDs for indexOf / length checks
export async function getUserPosts(id) {
  const posts = await prisma.post.findMany({
    where: { authorId: Number(id) },
    orderBy: { createdAt: 'desc' },
    include: {
      likes: { select: { userId: true } },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    authorId: p.authorId,
    content: p.content,
    timestamp: p.createdAt,
    likes: p.likes.map((l) => l.userId),
    comments: [],
  }));
}
