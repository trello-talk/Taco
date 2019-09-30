const { Command } = require('faux-classes')

module.exports = class AddWebhook extends Command {
  get name() { return 'addwebhook' }
  get cooldown() { return 1 }
  get permissions() { return ['auth', 'trello-perm'] }
  get aliases() { return ['+webhook', 'createwebhook', 'makewebhook'] }
  get argRequirement() { return 2 }

  async exec(message, args, {user}) {
    const boardId = await this.client.util.getBoardId(user, args[0]);
    if (boardId === null) return message.channel.send("You don't have access to that board!");

    const webhookBoard = await this.client.data.get.webhookBoard(boardId);
    const trelloBoard = await this.client.trello.get.board(user.trelloToken, boardId);
    if (webhookBoard !== null) return message.reply(`A webhook for board ${trelloBoard.name} \`(${boardId})\` already exists`);
    
    const webhookRegex = /^(?<webhookUrl>https:\/\/((canary|ptb)?\.)?discordapp\.com\/api\/webhooks\/(?<webhookId>\d+)\/(?<webhookToken>[A-Za-z0-9_\-]+))\/?(?<extra>.*)$/;
    const { groups: { webhookId, webhookToken, webhookUrl, extra } } = args[1].match(webhookRegex) || { groups: {} };

    if (webhookUrl === undefined) return message.reply("That link is not a webhook!");
    if (extra !== "") await message.channel.send(`Ignoring \`/${extra}\` `);

    let webhook;
    try {
      webhook = await this.client.fetchWebhook(webhookId, webhookToken);
    } catch (e) {
      return message.reply("Invalid webhook link!");
    }
  
    try {
      const createdWebhook = await this.client.trello.add.webhook(user.trelloToken, trelloBoard.id);
      await this.client.data.add.webhook(message.guild.id, boardId, webhookUrl, trelloBoard.id, createdWebhook.id);
      await message.reply(`Added webhook ${webhook.name} in board ${trelloBoard.name} \`(${boardId})\``)
    } catch (e) {
      if (e.error.status === 400) {
        console.log(e.response);
        await message.reply(`An error occurred while adding webhook ${webhook.name} in board ${trelloBoard.name} \`(${boardId})\``)
      } else {
        throw e;
      }
    }
  }
  
  get helpMeta() { return {
    category: 'Webhooks',
    description: 'Sets a webhook to a board. You can only use boards you own.\nUse this link seen here: https://i.imgur.com/KrHHKDi.png',
    image: "https://i.imgur.com/KrHHKDi.png",
    usage: ["<boardID> <webhookURL>"]
  } }
}
