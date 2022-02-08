import { Passage } from '@prisma/client';
import { classifyPrismaError } from '../utils/errors';
import db from '../prismaClient';

export const createPassage = async (passage: Passage) => {
  try {
    const newPassage = await db.passage.create({ data: { ...passage } });
    return { passage: newPassage, error: null };
  } catch (e) {
    return { passage: null, error: classifyPrismaError(e) };
  }
};
