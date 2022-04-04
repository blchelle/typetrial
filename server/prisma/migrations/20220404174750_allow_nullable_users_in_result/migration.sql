/*
  Warnings:

  - A unique constraint covering the columns `[userId,raceId,rank]` on the table `Result` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Result` DROP FOREIGN KEY `Result_userId_fkey`;

-- DropIndex
DROP INDEX `Result_userId_raceId_key` ON `Result`;

-- AlterTable
ALTER TABLE `Result` MODIFY `userId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Result_userId_raceId_rank_key` ON `Result`(`userId`, `raceId`, `rank`);

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
