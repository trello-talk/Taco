const Eris = require('eris');
const dbots = require('dbots');
const Postgres = require('./postgres');
const Database = require('./database');
const EventHandler = require('./events');
const Webserver = require('./webserver');
const CommandLoader = require('./commandloader');
const LocaleHandler = require('./localehandler');
const MessageAwaiter = require('./messageawaiter');
const StatsManager = require('./stats');
const path = require('path');
const Airbrake = require('@airbrake/node');
const Bottleneck = require('bottleneck');
const CatLoggr = require('cat-loggr');

class TrelloBot extends Eris.Client {
  constructor({ configPath, packagePath, mainDir } = {}) {
    // Initialization
    const config = require(configPath || `${mainDir}/Config/`);
    const pkg = require(packagePath || `${mainDir}/package.json`);
    super(config.token, config.discordConfig);
    this.dir = mainDir;
    this.pkg = pkg;
    this.logger = new CatLoggr({
      level: config.debug ? 'debug' : 'info',
      levels: [
        { name: 'fatal', color: CatLoggr._chalk.red.bgBlack, err: true },
        { name: 'error', color: CatLoggr._chalk.black.bgRed, err: true },
        { name: 'warn', color: CatLoggr._chalk.black.bgYellow, err: true },
        { name: 'init', color: CatLoggr._chalk.black.bgGreen },
        { name: 'webserv', color: CatLoggr._chalk.black.bgBlue },
        { name: 'info', color: CatLoggr._chalk.black.bgCyan },
        { name: 'assert', color: CatLoggr._chalk.cyan.bgBlack },
        { name: 'poster', color: CatLoggr._chalk.yellow.bgBlack },
        { name: 'debug', color: CatLoggr._chalk.magenta.bgBlack, aliases: ['log', 'dir'] },
        { name: 'limiter', color: CatLoggr._chalk.gray.bgBlack },
        { name: 'fileload', color: CatLoggr._chalk.white.bgBlack }
      ]
    });
    this.logger.setGlobal();
    this.config = config;
    this.typingIntervals = new Map();
    this.stats = new StatsManager(this);
    this.requestHandler.userAgent += ` TrelloBot/${pkg.version} Node.js/${process.version}`;

    if (config.airbrake)
      this.airbrake = new Airbrake.Notifier({
        ...config.airbrake,
        keysBlocklist: [
          config.token,
          config.redis.password,
          config.pg.password,
          config.trello.token,
        ],
        version: pkg.version
      });

    if (this.config.webserver.enabled)
      this.webserver = new Webserver(this);

    // Events
    this.on('ready', () => console.info('All shards ready.'));
    this.on('disconnect', () => console.warn('All shards Disconnected.'));
    this.on('reconnecting', () => console.warn('Reconnecting client.'));
    this.on('debug', message => console.debug(message));

    // Shard Events
    this.on('connect', id => console.info(`Shard ${id} connected.`));
    this.on('error', (error, id) => console.error(`Error in shard ${id}`, error));
    this.on('hello', (_, id) => console.debug(`Shard ${id} recieved hello.`));
    this.on('warn', (message, id) => console.warn(`Warning in Shard ${id}`, message));
    this.on('shardReady', id => console.info(`Shard ${id} ready.`));
    this.on('shardResume', id => console.warn(`Shard ${id} resumed.`));
    this.on('shardDisconnect', (error, id) => console.warn(`Shard ${id} disconnected`, error));

    // SIGINT & uncaught exceptions
    process.once('uncaughtException', async err => {
      console.error('Uncaught Exception', err.stack);
      await this.dieGracefully();
      process.exit(0);
    });

    process.once('SIGINT', async () => {
      console.info('Caught SIGINT');
      await this.dieGracefully();
      process.exit(0);
    });

    console.init('Client initialized');
  }

  /**
   * Creates a promise that resolves on the next event
   * @param {string} event The event to wait for
   */
  waitTill(event) {
    return new Promise(resolve => this.once(event, resolve));
  }

  /**
   * Starts the processes and log-in to Discord.
   */
  async start() {
    // Redis
    this.db = new Database(this);
    await this.db.connect(this.config.redis);

    // Postgres
    this.pg = new Postgres(this, path.join(this.dir, this.config.modelsPath));
    await this.pg.connect(this.config.pg);

    // Bottleneck
    this.limiterConnection = new Bottleneck.RedisConnection({
      client: this.db.redis
    });
    this.limiter = new Bottleneck({
      // Per API key: https://help.trello.com/article/838-api-rate-limits
      reservoir: 300,
      reservoirRefreshAmount: 300,
      reservoirRefreshInterval: 10000,
      maxConcurrent: 15,

      // Clustering options
      id: 'trello-bot',
      datastore: 'redis',
      clearDatastore: false,
      connection: this.limiterConnection
    });
    this.limiter.on('error', err => console.error('Limiter Error', err));
    this.limiter.on('debug', (message, data) => console.limiter(message, data));
    await this.limiter.ready();

    // Discord
    await this.connect();
    await this.waitTill('ready');
    this.editStatus('online', {
      name: `boards scroll by me • ${this.config.prefix}help`,
      type: 3,
    });

    // Commands
    this.cmds = new CommandLoader(this, path.join(this.dir, this.config.commandsPath));
    this.cmds.reload();
    this.cmds.preloadAll();

    // Locale
    this.locale = new LocaleHandler(this, path.join(this.dir, this.config.localePath));
    this.locale.reload();

    // Events
    this.messageAwaiter = new MessageAwaiter(this);
    this.eventHandler = new EventHandler(this);

    // Botlist poster
    if (Object.keys(this.config.botlists).length) this.initPoster();

    if (this.webserver)
      await this.webserver.start();

    if (this.config.influx.enabled) {
      this.stats.connect();
      this.stats.cron.start();
    }
  }

  /**
   * @private
   */
  initPoster() {
    this.poster = new dbots.Poster({
      client: this,
      apiKeys: this.config.botlists,
      clientLibrary: 'eris',
      useSharding: false,
      voiceConnections: () => 0,
    });

    this.poster.post().then(this.onPost).catch(this.onPostFail);
    this.poster.addHandler('autopostSuccess', this.onPost);
    this.poster.addHandler('autopostFail', this.onPostFail.bind(this, true));
    this.poster.addHandler('postSuccess', this.onPostOne);
    this.poster.addHandler('postFail', this.onPostFail);
    this.poster.startInterval();
  }

  /**
   * @private
   */
  onPost() {
    console.poster('Posted stats to all bot lists.');
  }

  /**
   * @private
   */
  onPostOne(result) {
    console.poster(`Posted to ${result.request.socket.servername}!`);
  }

  /**
   * @private
   */
  onPostFail(error, auto = false) {
    console.poster(`Failed to ${auto ? 'auto-post' : 'post'}`, error);
  }

  /**
   * KIlls the bot
   */
  dieGracefully() {
    return new Promise(resolve => {
      console.info('Slowly dying...');
      this.waitTill('disconnect')
        .then(() => this.db.disconnect())
        .then(() => {
          if (this.webserver)
            return this.webserver.stop();
        }).then(() => {
          console.info('It\'s all gone...');
          resolve();
        });
      super.disconnect();
    });
  }

  // Typing

  /**
   * Start typing in a channel
   * @param {Channel} channel The channel to start typing in
   */
  async startTyping(channel) {
    if (this.isTyping(channel)) return;
    await channel.sendTyping();
    this.typingIntervals.set(channel.id, setInterval(() => {
      channel.sendTyping().catch(() => this.stopTyping(channel));
    }, 5000));
  }

  /**
   * Whether the bot is currently typing in a channel
   * @param {Channel} channel
   */
  isTyping(channel) {
    return this.typingIntervals.has(channel.id);
  }

  /**
   * Stops typing in a channel
   * @param {Channel} channel
   */
  stopTyping(channel) {
    if (!this.isTyping(channel)) return;
    const interval = this.typingIntervals.get(channel.id);
    clearInterval(interval);
    this.typingIntervals.delete(channel.id);
  }
}

const Bot = new TrelloBot({ mainDir: path.join(__dirname, '..') });
Bot.start().catch(e => {
  Bot.logger.error('Failed to start bot! Exiting in 10 seconds...');
  console.error(e);
  setTimeout(() => process.exit(0), 10000);
});
