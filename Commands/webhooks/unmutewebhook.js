const { Command } = require('faux-classes')

module.exports = class UnmuteWebhook extends Command {
  get name() { return 'unmutewebhook' }
  get cooldown() { return 1 }
  get permissions() { return ['auth', 'trello-perm'] }
  get aliases() { return ['umwebhook', 'unmute', 'um', 'umwh'] }
  get argRequirement() { return 1 }

  async exec(message, args, {user}) {
    try {
      const boardId = await this.client.util.getBoardId(user, args[0]);
      if (boardId === null) return message.channel.send("You don't have access to that board!");
      const { webhookId = undefined } = await this.client.data.get.webhookBoard(boardId) || {}
      if (webhookId === undefined) return message.channel.send("You don't have a webhook connected to that board!")
      
      await this.client.data.set.webhookMute(message.guild.id, args[0], false)
      message.reply(`Unmuted board \`${boardId}\`.`);
    } catch (e) {
      if(e === 404){
        message.reply("Could not find webhook.");
      } else throw e;
    }
  }

  get helpMeta() { return {
    category: 'Webhooks',
    description: 'Unmutes a webhook.',
    usage: ["<boardID>"]
  } }
}
