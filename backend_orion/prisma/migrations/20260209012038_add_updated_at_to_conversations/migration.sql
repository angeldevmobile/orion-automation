/*
  Warnings:

  - Added the required column `updated_at` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
