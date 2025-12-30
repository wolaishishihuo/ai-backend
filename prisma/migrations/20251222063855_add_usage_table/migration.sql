-- CreateTable
CREATE TABLE `usages` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `inputTokens` INTEGER NOT NULL,
    `outputTokens` INTEGER NOT NULL,
    `totalTokens` INTEGER NOT NULL,
    `cachedInputTokens` INTEGER NOT NULL DEFAULT 0,
    `reasoningTokens` INTEGER NOT NULL DEFAULT 0,
    `estimatedCost` DECIMAL(10, 6) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usages_messageId_key`(`messageId`),
    INDEX `usages_userId_idx`(`userId`),
    INDEX `usages_conversationId_idx`(`conversationId`),
    INDEX `usages_model_idx`(`model`),
    INDEX `usages_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usages` ADD CONSTRAINT `usages_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usages` ADD CONSTRAINT `usages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usages` ADD CONSTRAINT `usages_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
