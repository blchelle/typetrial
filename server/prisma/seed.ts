import fs from 'fs/promises'

import { Prisma, PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import path from 'path';

const prisma = new PrismaClient();

const main = async () => {
  // Create all the users
  const hashedPassword = await argon2.hash('abc123ABC');
  const users = await Promise.all(new Array(5).fill(null).map(async (_, i) => {
    const user = {
      email: `user${i}@test.com`,
      username: `user${i}`,
      password: hashedPassword
    }

    return prisma.user.create({ data: user })
  }))

  // Create all the passages
  const quotesFilePath = path.join(__dirname, '..', 'data', 'quotes.json')
  const filePassages: Prisma.PassageCreateManyInput[] = JSON.parse(await fs.readFile(quotesFilePath, 'utf-8'))
  const passages = await Promise.all(filePassages.map(async (quote) => prisma.passage.create({ data: quote})))

  // Create all the races
  const races = await Promise.all(
    passages.map(async (_, i) => prisma.race.create({
      data: {
        passageId: passages[i].id,
        createdAt: new Date(new Date().getTime() + i)
      }
    }))
  )
  
  // Create all the results
  await Promise.all(
    races.map(
      async (race, i) => {
        // Shuffles the ranks
        const rankPool = new Array(5).fill(null).map((_, i) => i+1)
        rankPool.sort(() => (Math.random() > .5) ? 1 : -1)

        return Promise.all(users.map(async (user) => {
          const randomRank = rankPool.pop()!;

          const minSpeed = 30 + Math.ceil(10 * i / races.length) // Mimic improvement overtime
          const rankPartition = 5 * (users.length - randomRank) // Ensures the ranks makes sense
          const randomness = Math.floor(5 * Math.random())

          const randomWpm = minSpeed + rankPartition + randomness
          return prisma.result.create( {data: {rank: randomRank, wpm: randomWpm, userId: user.id, raceId: race.id }} )
        }))
      })
    )
}

main()
  .catch(() => { process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
