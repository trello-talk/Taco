const { Command } = require('faux-classes')

module.exports = class RenameList extends Command {
  get name() { return 'renamelist' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board', 'trello-perm'] }
  get argRequirement() { return 3 }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.lists(user.trelloToken, user.current)
    if(!args.join(" ").match(/\s\|\s/,"|")){message.channel.send(`Format is invalid!`); return;}
    let c = args.join(" ").replace(/\s\|\s/,"|").split("|");
    let cargs = c.reverse()[0].split(" ");
    let bid = undefined;
    for(let board in body){
      board = body[board];
      if(board.name.toLowerCase() === c.slice(c.length-1).join(" ").toLowerCase()){
        bid = board;
      }
    }
    if(bid !== undefined){
      if(bid.name !== cargs.join(" ")){
        await this.client.trello.set.list.name(user.trelloToken, bid.id, cargs.join(" "))
        message.reply(`Renamed list \`${bid.name}\` to \`${cargs.join(" ")}\`.`)
      }else{
        message.reply(`Renamed list \`${bid.name}\` to \`${cargs.join(" ")}\`.`);
      }
    }else{
      message.reply(`No list by the name of "${c.slice(c.length-1).join(' ')}" was found!`)
    }
  }

  get helpMeta() { return {
    category: 'Editing',
    description: 'Renames a list.',
    usage: "<oldname> | <newname>"
  } }
}