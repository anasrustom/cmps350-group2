// NOTE: passwords are stored as plain strings for course demo purposes only.
// This is NOT production-safe — do not use real passwords here.

const { PrismaClient } = require('@prisma/client');
const users    = require('./data/users.json');
const posts    = require('./data/posts.json');
const comments = require('./data/comments.json');
const likes    = require('./data/likes.json');
const follows  = require('./data/follows.json');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding QatarConnect database...');

  // Delete in dependency-safe order (children first)
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('Existing data cleared.');

  // Insert users
  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  console.log(`Inserted ${users.length} users.`);

  // Insert posts
  for (const post of posts) {
    await prisma.post.create({ data: post });
  }
  console.log(`Inserted ${posts.length} posts.`);

  // Insert comments
  for (const comment of comments) {
    await prisma.comment.create({ data: comment });
  }
  console.log(`Inserted ${comments.length} comments.`);

  // Insert likes (composite PK — skip duplicates gracefully)
  for (const like of likes) {
    await prisma.like.upsert({
      where:  { userId_postId: { userId: like.userId, postId: like.postId } },
      update: {},
      create: like,
    });
  }
  console.log(`Inserted ${likes.length} likes.`);

  // Insert follows (composite PK, no self-follows enforced by data)
  for (const follow of follows) {
    await prisma.follow.upsert({
      where:  { followerId_followingId: { followerId: follow.followerId, followingId: follow.followingId } },
      update: {},
      create: follow,
    });
  }
  console.log(`Inserted ${follows.length} follows.`);

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
