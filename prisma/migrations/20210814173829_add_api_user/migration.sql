-- CreateTable
CREATE TABLE "apiusers" (
    "id" VARCHAR(255) NOT NULL,
    "jwtDate" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    PRIMARY KEY ("id")
);
