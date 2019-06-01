const { Command } = require('faux-classes')

module.exports = class Webhooks extends Command {
  get name() { return 'webhooks' }
  get cooldown() { return 1 }
  get aliases() { return ['allwebhooks'] }
  get permissions() { return ['trello-perm'] }

  toOrigin(str) {
    return Object.keys(this.client.util.TrelloEvents).filter(t => t.toLowerCase() == str.toLowerCase())[0];
  }

  async exec(message) {
    let webhooks = await this.client.data.get.webhooksOf(message.guild.id)
    if(webhooks.length !== 0){
      if(this.client.embed(message)){
        let embed = {
          color: this.client.config.color_scheme,
          author: {
            name: "Trello Webhooks",
            icon_url: this.client.config.icon_url
          },
          fields: []
        }
        webhooks.map(webhook => {
          let bits = webhook.bits;
          if(bits.length === 0){
            bits = Object.keys(bits);
          }
          embed.fields.push({
            name: "Board "+webhook.board,
            value: "**Bits**: "+bits.map(bit => `\`${this.toOrigin(bit)}\``).join(", ")
          });
        });
        message.channel.send('', { embed: embed });
      }else{
        let msg = `__**All Active Webhooks**__\n\n`;
        msg += webhooks.map(webhook => {
          let bits = webhook.bits;
          if(bits.length === 0){
            bits = Object.keys(bits);
          }
          return "__Board "+webhook.board+"__\n*Bits*: "+bits.map(bit => `\`${this.toOrigin(bit)}\``).join(", ");
        }).join("\n\n");
        message.channel.send(msg);
      }
    }else{
      message.reply("Could not find any active webhooks. `"+this.client.config.prefix+"help addwebhook` to learn how to create one!");
    }
  }

  get helpMeta() { return {
    category: 'Webhooks',
    description: 'List webhook bits.'
  } }
}