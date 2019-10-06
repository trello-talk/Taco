const { Command } = require('faux-classes');

module.exports = class ClearAuth extends Command {
  get name() { return 'clearauth'; }
  get cooldown() { return 0; }

  async exec(message, args, { user }) {
    const userId = message.author.id;
    const currentAuth = await this.client.data.get.user(userId);
    if (currentAuth === null) return message.reply('Your account is not currently authorized with Trello!');
    await message.channel.send('Are you sure you would like to clear your authorization? You will need to reauthorize again to use trello commands. (Type `yes` to continue)');
    try {
      const filter = m => m.author.id === userId;
      const messages = await message.channel.awaitMessages(filter, {
        max: 1,
        time: 30000,
        errors: ['time']
      });
      if (messages.first().content.toLowerCase() !== 'yes') {
        return message.channel.send('Cancelled!');
      }
    } catch(error) {
      return message.channel.send('Cancelled!');
      console.log('Error occured during clearauth command: \n', error);
    }
    await this.client.data.delete.user(userId);
    await message.channel.send('Auth cleared!');
  }

  get helpMeta() {
    return {
      category: 'General',
      description: 'Clears your Trello authorization. If you don\'t know what this means, please don\'t run this command.'
    };
  }
};
