import prisma from './prisma.js';

// Toggle follow/unfollow. Returns { following, followersCount, followingCount }.
export async function toggleFollow(followerId, followingId) {
  followerId = Number(followerId);
  followingId = Number(followingId);

  if (followerId === followingId) throw new Error('cannot follow yourself');

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  } else {
    await prisma.follow.create({ data: { followerId, followingId } });
  }

  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId } }),
    prisma.follow.count({ where: { followerId } }),
  ]);

  return { following: !existing, followersCount, followingCount };
}

// Returns suggested users not yet followed by userId, excluding themselves.
export async function getSuggestions(userId, limit = 8) {
  const followed = await prisma.follow.findMany({
    where: { followerId: Number(userId) },
    select: { followingId: true },
  });

  const excludeIds = followed.map((f) => f.followingId);
  excludeIds.push(Number(userId));

  return prisma.user.findMany({
    where: { id: { notIn: excludeIds } },
    select: { id: true, username: true, bio: true, avatar: true },
    take: limit,
  });
}

export async function isFollowing(followerId, followingId) {
  const row = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: Number(followerId),
        followingId: Number(followingId),
      },
    },
  });
  return !!row;
}

// Returns an array of user IDs that userId is following — used to populate
// the x_current_user.following cache for backward compat with feed.js.
export async function getFollowingIds(userId) {
  const rows = await prisma.follow.findMany({
    where: { followerId: Number(userId) },
    select: { followingId: true },
  });
  return rows.map((r) => r.followingId);
}
