// These are discord.js related settings
module.exports = {
  clientOptions: {
    autoReconnect: true,
    disableEveryone: true, // Whether the bot should be able to ping @everyone
    maxCachedMessages: 250,
    intents: [
      "guilds",
      "guildEmojis",
      "guildWebhooks",
      "guildMessages",
      "guildMessageReactions",
      "directMessages",
      "directMessageReactions"
    ] // 13865 - Intent Raw.
  },
  sharding: {
    totalShards: "auto",
    delay: 7500
  }
};