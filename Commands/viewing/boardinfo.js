const { Command } = require("faux-classes");

module.exports = class BoardInfo extends Command {

  get name() { return "boardinfo"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board"]; }
  get aliases() { return ["board"]; }

  async exec(message, args, { user }) {
    let board = await this.client.trello.get.board(user.trelloToken, user.current);
    if (this.client.embed(message)) {
      let embed = {
        color: this.client.config.embedColor,
        url: board.shortUrl,
        description: board.desc,
        author: {
          name: board.name,
          icon_url: this.client.config.icon_url
        },
        fields: [{
          name: "Counts",
          value: `**Members:** ${board.members.length}\n` +
            `**Cards:** ${board.cards.length}\n` +
            `**Lists:** ${board.lists.length}`,
          inline: true
        }, {
          name: "User Settings",
          value: `**Subscribed:** ${board.subscribed ? "Yes" : "No"}\n` +
            `**Starred:** ${board.starred ? "Yes" : "No"}\n` +
            `**Pinned:** ${board.pinned ? "Yes" : "No"}`,
          inline: true
        }, {
          name: "Preferences",
          value: `**Visibility**: ${this.client.util.capFirst(board.prefs.permissionLevel)}\n` +
            `**Voting**: ${this.client.util.capFirst(board.prefs.voting)}\n` +
            `**Comments**: ${this.client.util.capFirst(board.prefs.comments)}\n` +
            `**Invitations**: ${this.client.util.capFirst(board.prefs.invitations)}\n`,
          inline: true
        }]
      };
      message.channel.send("", { embed });
    } else {
      let msg = "```md\n";
      msg += `** ${board.name} **\n`;
      if (board.desc !== "") {
        msg += `### ${board.desc}\n`;
      }
      msg += `# Members: ${board.members.length} \n`;
      msg += `# Cards: ${board.cards.length} \n`;
      message.channel.send(msg + "\n```");
    }
  }

  get helpMeta() {
    return {
      category: "Viewing",
      description: "Gives all info on the board."
    };
  }
};
