/*
  Warnings:

  - Added the required column `description` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `conversations` ADD COLUMN `description` VARCHAR(1024) NOT NULL;
