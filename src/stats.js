const Influx = require('influx');
const si = require('systeminformation');
const { CronJob } = require('cron');
const { EventEmitter } = require('eventemitter3');
const platform = require('os').platform();

/**
 * The statistics manager (using InfluxDB and crons)
 */
module.exports = class StatsManager extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
    this.cron = new CronJob('*/5 * * * *', this._cronTick.bind(this));

    /**
     * Array of user IDs that have used a command between crons
     */
    this.activeUsers = [];

    /**
     * Map of commands that count active users and times ran between crons
     */
    this.commandCounts = new Map();

    /**
     * Array of webhook IDs that have been used between crons
     */
    this.activeWebhooks = [];

    this.webhooksSent = 0;
    this.commandsRan = 0;
    this.messagesRecieved = 0;


    console.init('Stats initialized');
  }

  /**
   * Creates nessesary connections to databases
   */
  connect() {
    const influxConfig = this.client.config.influx;
    this.influx = new Influx.InfluxDB({
      ...influxConfig.options,
      schema: [{
        measurement: 'shards',
        fields: {
          ms: Influx.FieldType.INTEGER,
          state: Influx.FieldType.STRING,
          guilds: Influx.FieldType.INTEGER
        },
        tags: ['bot','shard','cluster']
      }, {
        measurement: 'bot_counts',
        fields: {
          servers: Influx.FieldType.INTEGER,
          users: Influx.FieldType.INTEGER,
          activeUsers: Influx.FieldType.INTEGER,
          messagesRecieved: Influx.FieldType.INTEGER,
          channels: Influx.FieldType.INTEGER,
          webhooks: Influx.FieldType.INTEGER,
          databaseUsers: Influx.FieldType.INTEGER,
          commandsRan: Influx.FieldType.INTEGER,
          processMemUsage: Influx.FieldType.FLOAT
        },
        tags: ['bot','cluster']
      }, {
        measurement: 'command_usage',
        fields: {
          used: Influx.FieldType.INTEGER,
          usedUnique: Influx.FieldType.INTEGER
        },
        tags: ['bot','name','cluster']
      }, {
        measurement: 'webhook_traffic',
        fields: {
          sent: Influx.FieldType.INTEGER,
          sentUnique: Influx.FieldType.INTEGER
        },
        tags: ['bot','cluster']
      }, {
        measurement: 'system_info',
        fields: {
          activeMemory: Influx.FieldType.INTEGER,
          memory: Influx.FieldType.FLOAT,
          cpuLoad: Influx.FieldType.FLOAT
        },
        tags: ['cluster']
      }]
    });
  }

  onCommandRun(userID, commandName) {
    if (!this.influx) return;

    const commandCount = this.commandCounts.get('commandName')
      || { users: [], used: 0 };
    
    if (!commandCount.users.includes(userID))
      commandCount.users.push(userID);
    
    commandCount.used++;
    this.commandsRan++;

    if (!this.activeUsers.includes(userID))
      this.activeUsers.push(userID);

    this.commandCounts.set(commandName, commandCount);
  }

  onWebhookSend(webhookID) {
    if (!this.influx) return;

    if (!this.activeWebhooks.includes(webhookID))
      this.activeWebhooks.push(webhookID);
    this.webhooksSent++;
  }

  /**
   * @private
   */
  async _collect(timestamp = new Date()) {
    if (!this.influx) return;

    const influxConfig = this.client.config.influx;
    const influxPoints = [];
    const defaultTags = {
      bot: influxConfig.botTag,
      cluster: influxConfig.clusterTag,
    };

    // Get postgres counts
    const dbUserCount = await this.client.pg.models.get('user').count();
    const webhookCount = await this.client.pg.models.get('webhook').count();

    // Insert bot counts & webhook traffic
    influxPoints.push({
      measurement: 'bot_counts',
      tags: defaultTags,
      fields: {
        servers: this.client.guilds.size,
        users: this.client.users.size,
        activeUsers: this.activeUsers.length,
        messagesRecieved: this.messagesRecieved,
        channels: this.client.guilds.reduce((prev, val) => prev + val.channels.size, 0),
        webhooks: webhookCount,
        databaseUsers: dbUserCount,
        commandsRan: this.commandsRan,
        processMemUsage: process.memoryUsage().heapUsed / 1000000
      },
      timestamp
    });

    if (this.client.config.webserver.enabled)
      influxPoints.push({
        measurement: 'webhook_traffic',
        tags: defaultTags,
        fields: {
          sent: this.webhooksSent,
          sentUnique: this.activeWebhooks.length
        },
        timestamp
      });
    
    // Insert command counts
    this.commandCounts.forEach((counts, name) => influxPoints.push({
      measurement: 'command_usage',
      tags: { ...defaultTags, name },
      fields: {
        used: counts.used,
        usedUnique: counts.users.length
      },
      timestamp
    }));

    // Insert shard data
    const serverMap = {};
    this.client.guilds.map(guild => {
      const shardID = guild.shard.id;
      if (serverMap[shardID])
        serverMap[shardID] += 1;
      else serverMap[shardID] = 1;
    });
    this.client.shards.map(shard => influxPoints.push({
      measurement: 'shards',
      tags: { ...defaultTags, shard: shard.id },
      fields: {
        ms: shard.latency,
        state: shard.status,
        guilds: serverMap[shard.id]
      },
      timestamp
    }));

    // Insert System Information
    if (influxConfig.sendSysInfo) {
      const mem = await si.mem();
      const currentLoad = platform.endsWith('bsd') ? null : await si.currentLoad();
      influxPoints.push({
        measurement: 'system_info',
        tags: { cluster: influxConfig.clusterTag },
        fields: {
          activeMemory: mem.active,
          memory: mem.active / mem.total * 100,
          cpuLoad: currentLoad ? currentLoad.currentload : 0
        },
        timestamp
      });
    }

    // Flush data for next cron
    this.activeUsers = [];
    this.activeWebhooks = [];
    this.commandCounts.clear();
    this.commandsRan = 0;
    this.webhooksSent = 0;
    this.messagesRecieved = 0;

    // Send to influx    
    await this.influx.writePoints(influxPoints);
    console.log('Sent stats to Influx.');
  }

  /**
   * @private
   */
  async _cronTick() {
    try {
      await this._collect(this.cron.lastDate());
    } catch (e) {
      if (this.client.airbrake) {
        await this.client.airbrake.notify({
          error: e,
          params: {
            type: 'stats-cron'
          }
        });
      } else if (this.client.config.debug) {
        console.error('The stats cron failed.');
        console.log(e);
      }
    }
  }
};
