module.exports = class Command {
  constructor(client) {
    this.client = client
  }

  exec(Message, Args) { }
  preload() { }

  get cooldownAbs() { return this.cooldown * 1000 }

  get aliases() { return [] }
  get cooldown() { return 1 }
  get listed() { return true }
  get permissions() { return [] }
  get argRequirement() { return 0 }
  get helpMeta() { return {
    category: 'Misc',
    description: "???",
    usage: "???"
  } }
}