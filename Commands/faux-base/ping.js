const { Command } = require('faux-classes')

module.exports = class Ping extends Command {
  get name() { return 'ping' }

  async exec(message, Args) {
    let time1 = Date.now();
    let m = await message.channel.send("", { embed: {
      color: 0xffed58,
      title: 'Reaching the paddle...'
    }})

    let time = (Date.now()-time1)/1000;
    m.edit('', {embed: {
      color: 0xf7b300,
      title: 'Pong!',
      description: `${time} second delay\n${this.client.ping} WS ping`
    }});
  }

  get permissions() { return ['embed'] }

  get helpMeta() { return {
    category: 'General',
    description: 'Pong!'
  } }
}