-- CreateTable
CREATE TABLE "servers" (
    "id" SERIAL NOT NULL,
    "serverID" VARCHAR(255) NOT NULL,
    "bannedFromUse" BOOLEAN NOT NULL DEFAULT false,
    "banReason" VARCHAR(255),
    "locale" VARCHAR(255) DEFAULT E'en_US',
    "prefix" VARCHAR(255) NOT NULL DEFAULT E'TD!',
    "maxWebhooks" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "userID" VARCHAR(255) NOT NULL,
    "bannedFromUse" BOOLEAN NOT NULL DEFAULT false,
    "banReason" VARCHAR(255),
    "trelloToken" VARCHAR(255),
    "trelloID" VARCHAR(255),
    "currentBoard" VARCHAR(255),
    "locale" VARCHAR(255),
    "prefixes" VARCHAR(255)[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "discordToken" VARCHAR(255),
    "discordRefresh" VARCHAR(255),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" SERIAL NOT NULL,
    "memberID" VARCHAR(255),
    "modelID" VARCHAR(255) NOT NULL,
    "trelloWebhookID" VARCHAR(255),
    "filters" VARCHAR(255) NOT NULL DEFAULT E'0',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "locale" VARCHAR(255),
    "style" VARCHAR(255) NOT NULL DEFAULT E'default',
    "guildID" VARCHAR(255) NOT NULL,
    "webhookID" VARCHAR(255),
    "webhookToken" VARCHAR(255),
    "whitelist" BOOLEAN NOT NULL DEFAULT true,
    "lists" VARCHAR(255)[],
    "cards" VARCHAR(255)[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "servers.serverID_unique" ON "servers"("serverID");

-- CreateIndex
CREATE UNIQUE INDEX "users.userID_unique" ON "users"("userID");
