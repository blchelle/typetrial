import { Passage } from '@prisma/client';
import db from '../prismaClient';

export const createPassage = async (passage: Passage) => db.passage.create({ data: { ...passage } });
