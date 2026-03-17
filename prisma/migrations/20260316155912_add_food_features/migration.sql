/*
  Warnings:

  - You are about to alter the column `rating` on the `attractions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(2,1)` to `Double`.
  - You are about to alter the column `status` on the `attractions` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(7))` to `VarChar(191)`.
  - You are about to alter the column `type` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - You are about to alter the column `status` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.
  - You are about to alter the column `status` on the `comments` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `VarChar(191)`.
  - You are about to alter the column `status` on the `foods` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `VarChar(191)`.
  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `VarChar(191)`.
  - You are about to alter the column `status` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(6))` to `VarChar(191)`.
  - You are about to drop the `cultures` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `attractions` MODIFY `rating` DOUBLE NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE `categories` MODIFY `type` VARCHAR(191) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `comments` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE `foods` ADD COLUMN `rating` DOUBLE NULL,
    ADD COLUMN `view_count` INTEGER NOT NULL DEFAULT 0,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE `users` MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE `cultures`;

-- CreateTable
CREATE TABLE `food_favorites` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `food_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `food_favorites_user_id_food_id_key`(`user_id`, `food_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `food_comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `food_id` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `rating` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'APPROVED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `food_favorites` ADD CONSTRAINT `food_favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `food_favorites` ADD CONSTRAINT `food_favorites_food_id_fkey` FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `food_comments` ADD CONSTRAINT `food_comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `food_comments` ADD CONSTRAINT `food_comments_food_id_fkey` FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
