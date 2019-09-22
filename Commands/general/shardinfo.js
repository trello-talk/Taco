const { Command } = require('faux-classes')
const table = require('text-table');

const broadcastString = `[
    this.shard.id,
    this.users.size,
    this.channels.size,
    this.guilds.size,
    process.memoryUsage().heapUsed / 1000000,
    this.util.toHHMMSS(process.uptime().toString())
]`;

module.exports = class ShardInfo extends Command {
  get name() { return 'shardinfo' }
  get cooldown() { return 2 }

  async exec(message, args) {
    if(!this.client.isSharded())
        return message.channel.send("The bot is currently not sharded.");
    
    let sharddata = await this.client.shard.broadcastEval(broadcastString)
    let totalMB = sharddata.reduce((prev, val)=>prev+val[4], 0).toFixed(2)+" MB";
    let tableValues = sharddata.map(s => {
        s[4] = s[4].toFixed(2)+" MB";
        return s;
    });
    tableValues.unshift(["ID","USERS","CHANNELS","GUILDS","MEM","UPTIME"]);
    tableValues.push([
        "TOTAL",
        sharddata.reduce((prev, val)=>prev+val[1], 0),
        sharddata.reduce((prev, val)=>prev+val[2], 0),
        sharddata.reduce((prev, val)=>prev+val[3], 0),
        totalMB,
        ""
    ]);
    tableValues[this.client.shard.id+1][0] += " <"
    let t = table(tableValues, { hsep: ' | ' });
    message.channel.send("```prolog\n" + t + "\n```");
  }

  get helpMeta() { return {
    category: 'General',
    description: 'Gives the stats for every shard.'
  } }
}
