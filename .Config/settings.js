module.exports = {
  // [Object] Eris client options (https://abal.moe/Eris/docs/Client)
  discordConfig: {
    autoreconnect: true,
    allowedMentions: {
      everyone: false,
      roles: false,
      users: true
    },
    maxShards: "auto",
    messageLimit: 0,
    intents: [
      "guilds",
      "guildEmojis",
      "guildWebhooks",
      "guildMessages",
      "guildMessageReactions",
      "directMessages",
      "directMessageReactions"
    ] // 13865 - Intent Raw.
  }
};