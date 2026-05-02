import prisma from './prisma.js';

const ACTIVITY_WINDOW_MONTHS = 3;

async function getTotals() {
  const [users, posts, comments, likes, follows] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.like.count(),
    prisma.follow.count(),
  ]);
  return { users, posts, comments, likes, follows };
}

function computeAverages(totals) {
  const { users, posts, follows } = totals;
  if (users === 0) {
    return { followersPerUser: 0, postsPerUser: 0 };
  }
  return {
    followersPerUser: follows / users,
    postsPerUser: posts / users,
  };
}

async function getMostLikedPost() {
  // orderBy on a related _count is supported by Prisma — sorts in SQL
  const post = await prisma.post.findFirst({
    orderBy: { likes: { _count: 'desc' } },
    include: {
      author: { select: { username: true } },
      _count: { select: { likes: true } },
    },
  });
  if (!post) return null;
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    authorUsername: post.author?.username ?? null,
    likeCount: post._count.likes,
  };
}

async function getMostCommentedPost() {
  const post = await prisma.post.findFirst({
    orderBy: { comments: { _count: 'desc' } },
    include: {
      author: { select: { username: true } },
      _count: { select: { comments: true } },
    },
  });
  if (!post) return null;
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    authorUsername: post.author?.username ?? null,
    commentCount: post._count.comments,
  };
}

async function getMostActiveUserLast3Months() {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - ACTIVITY_WINDOW_MONTHS);

  // groupBy returns one row per user — not the raw posts/comments
  const [postGroups, commentGroups] = await Promise.all([
    prisma.post.groupBy({
      by: ['authorId'],
      where: { createdAt: { gte: cutoff } },
      _count: { _all: true },
    }),
    prisma.comment.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: cutoff } },
      _count: { _all: true },
    }),
  ]);

  const byUser = new Map();
  for (const g of postGroups) {
    byUser.set(g.authorId, { postCount: g._count._all, commentCount: 0 });
  }
  for (const g of commentGroups) {
    const existing = byUser.get(g.userId) ?? { postCount: 0, commentCount: 0 };
    existing.commentCount = g._count._all;
    byUser.set(g.userId, existing);
  }

  if (byUser.size === 0) return null;

  let winnerId = null;
  let winnerTotal = -1;
  let winnerCounts = null;
  for (const [userId, counts] of byUser) {
    const total = counts.postCount + counts.commentCount;
    if (total > winnerTotal) {
      winnerTotal = total;
      winnerId = userId;
      winnerCounts = counts;
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: winnerId },
    select: { id: true, username: true, avatar: true },
  });
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    postCount: winnerCounts.postCount,
    commentCount: winnerCounts.commentCount,
    totalActivity: winnerTotal,
  };
}

export async function getStatsDashboardData() {
  const totals = await getTotals();
  const [mostActiveUserLast3Months, mostLikedPost, mostCommentedPost] = await Promise.all([
    getMostActiveUserLast3Months(),
    getMostLikedPost(),
    getMostCommentedPost(),
  ]);

  return {
    totals,
    averages: computeAverages(totals),
    mostActiveUserLast3Months,
    mostLikedPost,
    mostCommentedPost,
    generatedAt: new Date().toISOString(),
  };
}
