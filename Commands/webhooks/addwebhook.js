const { Command } = require('faux-classes')

module.exports = class AddWebhook extends Command {
  get name() { return 'addwebhook' }
  get cooldown() { return 1 }
  get permissions() { return ['auth', 'trello-perm'] }
  get aliases() { return ['+webhook', 'createwebhook', 'makewebhook'] }
  get argRequirement() { return 2 }

  async exec(message, args, {user}) {
    return new Promise(async (resolve,reject) => {
      let boards = await this.client.trello.get.boards(user.trelloToken, user.trelloID)
      if(!boards.boards.map(b => b.shortLink).includes(args[0])){
        message.channel.send("You don't have access to that board!");
      }else{
        if(!args[1].startsWith('https://discordapp.com/api/webhooks/') && !args[1].startsWith('https://canary.discordapp.com/api/webhooks/') && !args[1].startsWith('https://ptb.discordapp.com/api/webhooks/')){
          resolve(message.reply("That link is not a webhook!"));
        }else if(args[1].endsWith('/slack') || args[1].endsWith('/github')){
          resolve(message.reply("That link can't be used!"));
        }else{
          this.client.trello.try(args[1]).then(async body => {
            let webhookBoard = await this.client.data.get.webhookBoard(args[0])
            let board = await this.client.trello.get.board(user.trelloToken, args[0])
            if(webhookBoard === null || !webhookBoard.webhookId){
              try {
                let r = await this.client.trello.add.webhook(user.trelloToken, board.id);
                await this.client.data.add.webhook(message.guild.id, args[0], args[1], board.id, r.id);
                resolve(message.reply("Added webhook "+body.name+" in board "+board.name+" `("+args[0]+")` Solved Code: `1`"));
              } catch (e) {
                if(e.error.status === 400){
                  // console.log(e.response)
                  try {
                    await this.client.data.add.webhook(message.guild.id, args[0], args[1], board.id);
                    resolve(message.reply("Added webhook "+body.name+" in board "+board.name+" `("+args[0]+")` Solved Code: `2`"));
                  } catch(e) {
                    reject(e);
                  }
                } else reject(e);
              }
            } else {
              await this.client.data.add.webhook(message.guild.id, args[0], args[1], board.id);
              resolve(message.reply("Added webhook "+body.name+" in board "+board.name+" `("+args[0]+")` Solved Code: `3`"));
            }
          }).catch(e => {
            if(e.errorCode === "statusfail"){
              resolve(message.reply("Invalid webhook link!"));
            } else reject(e);
          });
        }
      }
    })
  }

  get helpMeta() { return {
    category: 'Webhooks',
    description: 'Sets a webhook to a board. You can only use boards you own.\nUse this link seen here: https://i.imgur.com/KrHHKDi.png',
    image: "https://i.imgur.com/KrHHKDi.png",
    usage: "<boardID> <webhookURL>"
  } }
}