// These are discord.js related settings
module.exports = {
    clientOptions: {
        autoReconnect:      true,
        disableEveryone:    true, // Whether the bot should be able to ping @everyone
        disabledEvents:     ["TYPING_START", "TYPING_STOP"],
        maxCachedMessages:  250
    },
    sharding: {
        totalShards: "auto",
        delay:       7500
    }
};
