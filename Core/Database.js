const redis = require("redis");
const chalk = require("chalk");
const bluebird = require("bluebird")
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const { EventEmitter } = require("eventemitter3");

module.exports = class Database extends EventEmitter {
  constructor(client) {
    super();
    this.reconnect = true;
    this.client = client;
  }

  get logPrefix() {
    return `${chalk.gray("[")}${chalk.red("REDIS")}${chalk.gray("]")}`;
  }

  connect({ host = "localhost", port, password }) {
    return new Promise((resolve, reject) => {
      this.redis = redis.createClient({ host, port, password });
      this.client.log(this.logPrefix, chalk.green("Connected"));
      this.redis.on("error", this.onError.bind(this));
      this.redis.on("warning", w => this.client.warn(this.logPrefix, w));
      this.redis.on("end", w => this.onClose.bind(this));
      this.redis.on("reconnecting", w => this.client.log(this.logPrefix, chalk.yellow("Reconnecting")));
      this.redis.on("ready", w => this.client.log(this.logPrefix, chalk.green("Ready.")));
      this.redis.on("connect", w => this.client.log(this.logPrefix, chalk.green("Redis connection has started.")));
      this.host = host;
      this.port = port;
      this.password = password;

      this.redis.once("ready", resolve.bind(this));
      this.redis.once("error", reject.bind(this));
    });
  }

  _p(k) { return (this.client.config.redis.prefix || "") + k; }

  async hget(key, hashkey) {
      return this.redis.HGET(this._p(key), hashkey);
  }

  async hset(key, hashkey, value) {
      return this.redis.HSET(this._p(key), hashkey, value)
  }

  async incr(key) {
      return this.redis.incr(this._p(key))
  }

  async get(key) {
      return this.redis.get(this._p(key))
  }

  async expire(key, ttl) {
      return this.redis.expire(key, ttl)
  }


  async exists(key) {
      return (await this.redis.exists(key)) === 1;
  }

  async set(key, value) {
    return this.redis.set(key, value)
  }

  async reconnect() {
    this.client.log("[DB]", "Attempting reconnection");
    this.conn = await this.connect(this);
    this.client.log("[DB]", "Reconnected");
  }

  onError(err) {
    this.client.log("[DB]", "Error", err);
    this.emit("error", err);
  }

  async onClose() {
    this.client.log("[DB]", "Closed");
    this.emit("close");
    await this.reconnect();
  }
};
