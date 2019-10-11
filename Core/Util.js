module.exports = {
  prefixRegex(client) {
    return new RegExp(`^(?:<@!?${client.user.id}>|${this.escapeRegExp(client.config.prefix)}|${this.escapeRegExp(client.user.username)}|${this.escapeRegExp(client.user.username.toUpperCase())}|${this.escapeRegExp(client.user.username.toLowerCase())})\\s?(\\n|.)`);
  },
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  },
  stripPrefix(message) {
    return message.content.replace(this.prefixRegex(message.client), "$1").replace(/\s\s+/g, " ").trim();
  }
};
