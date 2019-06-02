const { Command } = require('faux-classes')

module.exports = class ViewList extends Command {
  get name() { return 'viewlist' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board'] }
  get aliases() { return ['list'] }
  get argRequirement() { return 1 }

  async exec(message, args, {user}) {
		let listName = args.join(' ').replace(/\s*$/, "");
		let matches = listName.match(/\s\d+$/);
		let p = 1;
		let ipp = 15;
		if(matches){
      // pageNumber() will sort out numbers later
			p = parseInt(matches[0]);
			listName = listName.replace(/\d+$/, "").replace(/\s*$/, "");
		}
    let body = await this.client.trello.get.lists(user.trelloToken, user.current)
    let query = await this.client.util.query(
      message, body, 
      listName, 
      'name', item => `${item.name} (${item.cards.length} Cards)`,
      "Type the number of the list you want to view."
    )
    if(query.quit) return;
    let result = query.result;
    if(result !== null){
      let pageVars = this.client.util.pageNumber(ipp, result.cards.length, p),
        page = pageVars[0],
        maxPages = pageVars[1];
      let cards = [];
      for(let card in result.cards){
        card = result.cards[card];
        let l = "";
        if(card.labels.length){
          l += "{"+this.client.util.layout.cardLabels(card.labels).join(', ')+"}";
        }
        if(card.subscribed){
          l += " <SUBSCRIBED>";
        }
        cards.push("[" + card.name + "](ID: " + card.shortLink + ")" + l)
      }
      let sets = this.client.util.splitArray(cards, ipp);
      let msg = `\`\`\`md\n#====== Page ${page}/${maxPages} ======#\n`;
      if(!result.cards.length){
        message.channel.send("```\nNo cards found.\n```");
      }else{
        sets[page - 1].map(c=> msg += c + "\n");
        message.channel.send(msg+"```\nUse `" + this.client.config.prefix + "card <cardID>` to view all info on the card");
      }
    }else{
      message.reply(`No list by the name of "${listname}" was found!`)
    }
  }

  get helpMeta() { return {
    category: 'Viewing',
    description: 'Lists all cards in that list.',
    usage: "<listName> [page]"
  } }
}