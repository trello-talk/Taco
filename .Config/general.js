module.exports = {
  // [string] The token for the bot
  token: "",
  // [string] The prefix for the bot
  prefix: "T!",
  // [Array<string>] An array of elevated IDs, giving them access to developer commands
  elevated: [],
  // [string] The path where the commands will be found
  commandsPath: "./src/commands",
  // [boolean] Whether debug logs will be shown
  debug: false,
  // [number] The main embed color (#ffffff -> 0xffffff)
  embedColor: 0x429bce,
  // [string?] The main bot ID, if there are multiple instances of the bot, this bot will not post messages if
  // the sudo one is in the same guild
  sudoID: "620126394390675466",
  // [string] The main locale
  sourceLocale: 'en_US',
  // [string] Where the locales will be found
  localePath: "./locale/bot",
  // [string] Where the postgres models will be found
  modelsPath: "./src/models",
  // [object?] Airbrake config (https://airbrake.io/)
  airbrake: {
    projectId: '',
    projectKey: '',
    environment: 'production',
  }
};
