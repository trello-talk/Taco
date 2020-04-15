const logger = require('./logger')('[EVENTS]');
const Util = require('./util');

module.exports = class Events {
  constructor(client) {
    this.client = client;
    client.on('messageCreate', this.onMessage.bind(this));
  }

  async onMessage(message) {
    if(message.author.bot || message.author.system) return;
    // Check to see if bot can send messages
    if(message.channel.type !== 1 && !message.channel.permissionsOf(this.client.user.id).has('sendMessages')) return;

    // Don't parse if Taco is in the guild
    if(this.client.config.sudoID &&
      this.client.user.id !== this.client.config.sudoID &&
      message.channel.guild) {
      const sudoBot = await message.channel.guild.members.has(this.client.config.sudoID)
      if(sudoBot) return;
    }

    // Command parsing
    const args = Util.Prefix.strip(message, this.client).split(' ');
    const commandName = args.splice(0, 1)[0];
    let command = this.client.cmds.get(commandName, message);
    if(!message.content.match(Util.Prefix.regex(this.client)) || !command) return;

    try {
      await command._exec(message, { args });
    } catch (e) {
      logger.error(`The '${command.name}' command failed.`);
      console.log(e);
      this.client.createMessage(message.channel.id, ':fire: An error occurred while processing that command!');
      this.client.stopTyping(message.channel);
    }
  }
};
