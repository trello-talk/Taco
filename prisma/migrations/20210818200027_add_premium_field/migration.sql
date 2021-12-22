-- AlterTable
ALTER TABLE "servers" ADD COLUMN     "premium" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "premium" BOOLEAN NOT NULL DEFAULT false;
