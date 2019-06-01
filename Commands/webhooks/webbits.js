const { Command } = require('faux-classes')

module.exports = class WebBits extends Command {
  get name() { return 'webbits' }
  get cooldown() { return 0 }
  get aliases() { return ['bits'] }

  async exec(message) {
		if(this.client.embed(message)){
			message.channel.send('', {
				embed: {
					color: this.client.config.color_scheme,
					author: {
						name: "Trello Webhook Bits",
						icon_url: this.client.config.icon_url
					},
					description: Object.keys(this.client.util.TrelloEvents).map(event=>`**${event}** - Triggered when ${this.client.util.TrelloEvents[event]}`).join("\n")
				}
			});
		}else{
			message.channel.send("__**Webhook Bits**__\n"+Object.keys(this.client.util.TrelloEvents).map(event => {
				return `**${event}** - Triggered when ${this.client.util.TrelloEvents[event]}`
			}).join('\n'));
		}
  }

  get helpMeta() { return {
    category: 'Webhooks',
    description: 'List webhook bits.'
  } }
}