import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await argon2.hash('abc123ABC');

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@email.com',
      username: 'user1',
      password: hashedPassword,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: 'user2@email.com',
      username: 'user2',
      password: hashedPassword,
    },
  });
  const user3 = await prisma.user.create({
    data: {
      email: 'user3@email.com',
      username: 'user3',
      password: hashedPassword,
    },
  });

  const passage1 = await prisma.passage.create({
    data: {
      text: 'A late 20th century trend in typing, primarily used with devices with small'
      + ' keyboards (such as PDAs and Smartphones), is thumbing or thumb typing. This'
      + ' can be accomplished using one or both thumbs. Similar to desktop keyboards'
      + ' and input devices, if a user overuses keys which need hard presses and/or '
      + 'have small and unergonomic layouts, it could cause thumb tendonitis or other repetitive strain injury.',
      source: 'user3',
    },
  });

  const passage2 = await prisma.passage.create({
    data: {
      text: 'Freshwater snails are gastropod mollusks which live in fresh water. There '
      + 'are many different families. They are found throughout the world in various habitats'
      + ', ranging from ephemeral pools to the largest lakes, and from small seeps and '
      + 'springs to major rivers. The great majority of freshwater gastropods have a shell'
      + ', with very few exceptions.',
      source: 'user3',
    },
  });

  const race1 = await prisma.race.create({
    data: {
      passageId: passage1.id,
    },
  });

  await prisma.result.create({
    data: {
      userId: user1.id,
      raceId: race1.id,
      wpm: 100,
      rank: 1,
    },
  });

  await prisma.result.create({
    data: {
      userId: user2.id,
      raceId: race1.id,
      wpm: 70,
      rank: 2,
    },
  });

  await prisma.result.create({
    data: {
      userId: user3.id,
      raceId: race1.id,
      wpm: 50,
      rank: 3,
    },
  });

  const race2 = await prisma.race.create({
    data: {
      passageId: passage2.id,
    },
  });

  await prisma.result.create({
    data: {
      userId: user1.id,
      raceId: race2.id,
      wpm: 110,
      rank: 1,
    },
  });

  await prisma.result.create({
    data: {
      userId: user2.id,
      raceId: race2.id,
      wpm: 80,
      rank: 2,
    },
  });

  await prisma.result.create({
    data: {
      userId: user3.id,
      raceId: race2.id,
      wpm: 60,
      rank: 3,
    },
  });
}

main()
  .catch(() => {
    // console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
