module.exports = class Command {
  constructor(client) {
    this.client = client;
  }

  get aliases() { return []; }
  get argRequirement() { return 0; }
  get cooldown() { return 1; }
  get listed() { return true; }
  get permissions() { return []; }

  get cooldownAbs() { return this.cooldown * 1000; }

  preload() { }
  exec(message, args, { user }) { }

  get helpMeta() {
    return {
      category: "Misc",
      description: "???",
      usage: ["???"]
    };
  }
};
