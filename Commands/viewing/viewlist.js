const { Command } = require('faux-classes')

module.exports = class ViewList extends Command {
  get name() { return 'viewlist' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board'] }
  get aliases() { return ['list'] }
  get argRequirement() { return 1 }

  async exec(message, args, {user}) {
		let listname = args.join(' ').replace(/\s*$/, "");
		let matches = listname.match(/\s\d+$/);
		let p = 1;
		let ipp = 15;
		if(matches){
			if(!isNaN(matches[0])){
				p = parseInt(matches[0]);
			}

			if(p <= 0){
				p = 1;
			}

			listname = listname.replace(/\d+$/, "").replace(/\s*$/, "");
		}
    let body = await this.client.trello.get.lists(user.trelloToken, user.current)
    let bid = undefined;
    for(var board in body){
      board = body[board];
      if(board.name.toLowerCase() === listname.toLowerCase() || board.name.toLowerCase().startsWith(listname.toLowerCase())){
        bid = board;
      }
    }
    if(bid !== undefined){
      if(p > Math.ceil(bid.cards.length/ipp)){
        p = Math.ceil(bid.cards.length/ipp);
      }
      let cards = [];
      for(let card in bid.cards){
        card = bid.cards[card];
        let l = "";
        if(card.labels.length){
          l += "{"+this.client.util.layout.cardLabels(card.labels).join(', ')+"}";
        }
        if(card.subscribed){
          l += " <SUBSCRIBED>";
        }
        cards.push("["+card.name+"](ID: "+card.shortLink+")"+l)
      }
      let sets = this.client.util.splitArray(cards, ipp);
      let msg = `\`\`\`md\n#====== Page ${p}/${Math.ceil(bid.cards.length/ipp)} ======#\n`;
      if(!bid.cards.length){
        message.channel.send("```\nNo cards found.\n```");
      }else{
        sets[p-1].map(c=>msg+=c+"\n");
        message.channel.send(msg+"```\nUse `"+this.client.config.prefix+"card <cardID>` to view all info on the card");
      }
    }else{
      message.reply("No list by the name of "+listname+" was found!")
    }
  }

  get helpMeta() { return {
    category: 'Viewing',
    description: 'Lists all cards in that list.',
    usage: "<listName> [page]"
  } }
}