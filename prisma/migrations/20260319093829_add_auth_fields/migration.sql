/*
  Warnings:

  - You are about to drop the column `parent_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `food_comments` table. All the data in the column will be lost.
  - You are about to drop the `comment_likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `food_comment_likes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `comment_likes` DROP FOREIGN KEY `comment_likes_comment_id_fkey`;

-- DropForeignKey
ALTER TABLE `comment_likes` DROP FOREIGN KEY `comment_likes_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_parent_id_fkey`;

-- DropForeignKey
ALTER TABLE `food_comment_likes` DROP FOREIGN KEY `food_comment_likes_comment_id_fkey`;

-- DropForeignKey
ALTER TABLE `food_comment_likes` DROP FOREIGN KEY `food_comment_likes_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `food_comments` DROP FOREIGN KEY `food_comments_parent_id_fkey`;

-- AlterTable
ALTER TABLE `comments` DROP COLUMN `parent_id`;

-- AlterTable
ALTER TABLE `food_comments` DROP COLUMN `parent_id`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `email_verified` DATETIME(3) NULL,
    ADD COLUMN `image` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `comment_likes`;

-- DropTable
DROP TABLE `food_comment_likes`;
