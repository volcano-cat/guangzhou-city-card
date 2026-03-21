/*
  Warnings:

  - You are about to drop the `chat_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `chat_messages` DROP FOREIGN KEY `chat_messages_session_id_fkey`;

-- DropForeignKey
ALTER TABLE `chat_sessions` DROP FOREIGN KEY `chat_sessions_user_id_fkey`;

-- AlterTable
ALTER TABLE `culture_items` ADD COLUMN `video` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `chat_messages`;

-- DropTable
DROP TABLE `chat_sessions`;
