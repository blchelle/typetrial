import { Passage } from '@prisma/client';
import db from '../prismaClient';

// Handles requests to add passage, FR9

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export const createPassage = async (passage: Passage) => db.passage.create({ data: { ...passage } });

export const getPassage = async () => {
  const passageCount = await db.passage.count();
  const passageIndex = getRandomInt(passageCount);
  const randomPassage = await db.passage.findMany({ skip: passageIndex, take: 1 });
  return randomPassage[0];
};
