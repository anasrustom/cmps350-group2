import prisma from './prisma.js';

function formatPost(post) {
  return {
    id: post.id,
    authorId: post.authorId,
    content: post.content,
    timestamp: post.createdAt.toISOString(),
    likes: post.likes.map((l) => l.userId),
    author: post.author,
  };
}

export async function getFeedPosts(userId, tab) {
  userId = Number(userId);

  const followed = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = followed.map((f) => f.followingId);

  const where =
    tab === 'following'
      ? { authorId: { in: [userId, ...followingIds] } }
      : { authorId: { notIn: [userId, ...followingIds] } };

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      likes: { select: { userId: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return posts.map(formatPost);
}

export async function createPost(authorId, content) {
  const post = await prisma.post.create({
    data: { authorId: Number(authorId), content },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      likes: { select: { userId: true } },
    },
  });
  return formatPost(post);
}

export async function deletePost(postId, userId) {
  postId = Number(postId);
  userId = Number(userId);
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error('post not found');
  if (post.authorId !== userId) throw new Error('not authorized');
  await prisma.post.delete({ where: { id: postId } });
}

export async function toggleLike(postId, userId) {
  postId = Number(postId);
  userId = Number(userId);

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
  } else {
    await prisma.like.create({ data: { userId, postId } });
  }

  const likes = await prisma.like.findMany({
    where: { postId },
    select: { userId: true },
  });
  return likes.map((l) => l.userId);
}
