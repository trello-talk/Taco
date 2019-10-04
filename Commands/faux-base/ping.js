const { Command } = require("faux-classes");

module.exports = class Ping extends Command {

  get name() { return "ping"; }
  get aliases() { return ["pong"]; }
  get permissions() { return ["embed"]; }

  async exec(message) {
    let startTime = Date.now();
    let m = await message.channel.send("", {
      embed: {
        color: 0xffed58,
        title: "Reaching the paddle..."
      }
    });
    let messageRecvTime = m.createdTimestamp - message.createdTimestamp;

    let messageUpdTime = Date.now() - startTime;
    m.edit("", {
      embed: {
        color: 0xf7b300,
        title: "Pong!",
        description: `**Message recieve delay**: ${messageRecvTime}ms\n` +
          `**Message update delay**: ${messageUpdTime}ms\n` +
          `**WebSocket ping**: ${Math.round(this.client.ping)}ms`
      }
    });
  }

  get helpMeta() {
    return {
      category: "General",
      description: "Pong!"
    };
  }
};