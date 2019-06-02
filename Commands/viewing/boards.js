const { Command } = require('faux-classes')

module.exports = class Boards extends Command {
  get name() { return 'boards' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'embed'] }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.boards(user.trelloToken, user.trelloID)
    let p = 1;
    let ipp = 20;
    let count = body.boards.length;
    if(args.length >= 1){
      if(Number(args[0])){
        p = Number(args[0]);
        if(p < 1){
          p = 1;
        }
        if(p > Math.ceil(count/ipp)){
          p = Math.ceil(count/ipp);
        }
      }
    }
    let embed = {
      color: this.client.config.color_scheme,
      description: "Use `"+ this.client.config.prefix + "switch <boardID>` to switch between boards\nUse `"+ this.client.config.prefix + "boards [page]` to iterate this list\n\n",
      author: {
        name: `Trello Boards (${count}, Page ${p}/${Math.ceil(count/ipp)})`,
        icon_url: this.client.config.icon_url
      },
      fields: []
    }
    let boards = body.boards.splice((p-1)*20,20);
    boards.map(board => {
      let emojis = (board.subscribed ? ":bell:" : "") + (board.starred ? ":star:" : "") + (board.pinned ? ":pushpin:" : "")
      if(board.shortLink == user.current){
        embed.description += `\`${board.shortLink}\` ${emojis} [${board.name} **(Current)**](${board.shortUrl})\n`
      } else {
        embed.description += `\`${board.shortLink}\` ${emojis} ${board.name}\n`
      }
    })
    message.channel.send("", { embed });
  }

  get helpMeta() { return {
    category: 'Viewing',
    description: 'Lists all of your boards.',
    usage: "[page]"
  } }
}