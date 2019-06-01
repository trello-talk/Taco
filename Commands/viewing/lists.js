const { Command } = require('faux-classes')

module.exports = class Lists extends Command {
  get name() { return 'lists' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board'] }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.lists(user.trelloToken, user.current)
    let p = 1;
    let ipp = 15;
    let count = body.length;
    if(args.length >= 1){
      if(Number(args[0])){
        p = Number(args[0]);
        if(p < 1){
          p = 1;
        }
        if(p > Math.ceil(body.length/ipp)){
          p = Math.ceil(body.length/ipp);
        }
      }
    }
    body = body.splice((p-1)*15,15);
    if(this.client.embed(message)){
      let embed = {
        color: this.client.config.color_scheme,
        url: body['shortUrl'],
        author: {
          name: `Trello Lists (${count}, Page ${p}/${Math.ceil(count/ipp)})`,
          icon_url: this.client.config.icon_url
        },
        footer: {
          text: "Use `"+this.client.config.prefix+"viewlist <listName>` to see all cards in that list"
        },
        fields: []
      }
      body.map(l=>{
        if(!l.closed){
          embed.fields.push({
            name: (l.subscribed ? ":bell: " : "") + l.name,
            value: String(l.cards.length)+" Cards",
            inline: true
          })
        }
      })
      message.channel.send('', { embed: embed });
    }else{
      let msg = `Trello Lists (${count}, Page ${p}/${Math.ceil(count/ipp)})`+"\n```md\n"
      for(var board in body){
        if(!board.closed){
          board = body[Number(board)];
          msg += "["+board.name+"]("+String(board.cards.length)+" cards) " + (l.subsribed ? "<SUBSCRIBED>" : "") + "\n";
        }
      }
      message.channel.send(msg+"\n```\nUse `"+this.client.config.prefix+"viewlist <listName>` to see all cards in that list")
    }
  }

  get helpMeta() { return {
    category: 'Viewing',
    description: 'Lists all the lists in the current board.',
    usage: "[page]"
  } }
}