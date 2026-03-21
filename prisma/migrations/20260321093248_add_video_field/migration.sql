/*
  Warnings:

  - You are about to drop the column `video` on the `culture_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attractions` ADD COLUMN `video` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `culture_items` DROP COLUMN `video`;
