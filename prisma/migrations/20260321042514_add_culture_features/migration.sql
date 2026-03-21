-- CreateTable
CREATE TABLE `cultures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PUBLISHED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `culture_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `culture_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PUBLISHED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `culture_favorites` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `culture_item_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `culture_favorites_user_id_culture_item_id_key`(`user_id`, `culture_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `culture_comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `culture_item_id` INTEGER NOT NULL,
    `parent_id` INTEGER NULL,
    `content` TEXT NOT NULL,
    `rating` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'APPROVED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `culture_comment_likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `comment_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `culture_comment_likes_user_id_comment_id_key`(`user_id`, `comment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `culture_items` ADD CONSTRAINT `culture_items_culture_id_fkey` FOREIGN KEY (`culture_id`) REFERENCES `cultures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `culture_favorites` ADD CONSTRAINT `culture_favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `culture_favorites` ADD CONSTRAINT `culture_favorites_culture_item_id_fkey` FOREIGN KEY (`culture_item_id`) REFERENCES `culture_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `culture_comments` ADD CONSTRAINT `culture_comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `culture_comments` ADD CONSTRAINT `culture_comments_culture_item_id_fkey` FOREIGN KEY (`culture_item_id`) REFERENCES `culture_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `culture_comments` ADD CONSTRAINT `culture_comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `culture_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `culture_comment_likes` ADD CONSTRAINT `culture_comment_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `culture_comment_likes` ADD CONSTRAINT `culture_comment_likes_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `culture_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
