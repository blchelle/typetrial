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

  const passage3 = await prisma.passage.create({
    data: {
      text: 'The station faced many difficulties in its early years. Although Palawan'
      + ' could receive some broadcasts from Manila and neighbouring Visayan islands, '
      + 'radio ownership among the 20,000-strong population was not high. The Tinio '
        + 'Electric Plant provided electricity only from 6 a.m. to 6 p.m. and to less '
        + 'than half the population. Then, in 1966, Decolongon was killed in a plane '
        + 'crash: his father, Emilio Decolongon, took over as company president.',
      source: 'user3',
    },
  });

  const passage4 = await prisma.passage.create({
    data: {
      text: 'Eiffel 65 also composed remixes of numerous popular songs, and they '
      + 'recorded "One Goal," one of the official songs of the UEFA Euro 2000, and '
      + '"Living In My City," for the 2006 Winter Olympics. With more than 20 million'
      + ' copies sold[3] and many gold, platinum and diamond records, Eiffel 65 is one'
      + ' of Italy\'s most popular electronic groups.',
      source: 'user3',
    },
  });

  const passage5 = await prisma.passage.create({
    data: {
      text: 'The Nobel Prize in Physiology or Medicine is awarded yearly by the Nobel'
      + ' Assembly at the Karolinska Institute for outstanding discoveries in '
      + 'physiology or medicine. The Nobel Prize is not a single prize, but five '
      + 'separate prizes that, according to Alfred Nobel\'s 1895 will, are awarded '
      + '"to those who, during the preceding year, have conferred the greatest benefit'
      + ' to humankind". Nobel Prizes are awarded in the fields of Physics, Chemistry,'
      + ' Physiology or Medicine, Literature, and Peace.',
      source: 'user3',
    },
  });

  const race1 = await prisma.race.create({
    data: {
      passageId: passage1.id,
      createdAt: new Date('March 1, 2022 03:24:13'),
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
      createdAt: new Date('March 4, 2022 12:19:08'),
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

  const race3 = await prisma.race.create({
    data: {
      passageId: passage3.id,
      createdAt: new Date('March 4, 2022 12:25:19'),
    },
  });

  await prisma.result.create({
    data: {
      userId: user1.id,
      raceId: race3.id,
      wpm: 80,
      rank: 2,
    },
  });

  await prisma.result.create({
    data: {
      userId: user2.id,
      raceId: race3.id,
      wpm: 87,
      rank: 1,
    },
  });

  await prisma.result.create({
    data: {
      userId: user3.id,
      raceId: race3.id,
      wpm: 19,
      rank: 3,
    },
  });

  const race4 = await prisma.race.create({
    data: {
      passageId: passage4.id,
      createdAt: new Date('March 10, 2022 9:39:03'),
    },
  });

  await prisma.result.create({
    data: {
      userId: user2.id,
      raceId: race4.id,
      wpm: 100,
      rank: 1,
    },
  });

  await prisma.result.create({
    data: {
      userId: user3.id,
      raceId: race4.id,
      wpm: 60,
      rank: 2,
    },
  });

  const race5 = await prisma.race.create({
    data: {
      passageId: passage5.id,
      createdAt: new Date('March 11, 2022 18:41:44'),
    },
  });

  await prisma.result.create({
    data: {
      userId: user1.id,
      raceId: race5.id,
      wpm: 124,
      rank: 1,
    },
  });

  await prisma.result.create({
    data: {
      userId: user3.id,
      raceId: race5.id,
      wpm: 70,
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
