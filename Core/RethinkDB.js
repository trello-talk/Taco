const rethinkdb = require("rethinkdb")
const chalk = require('chalk')
const { EventEmitter } = require("eventemitter3")

module.exports = class RethinkDB extends EventEmitter {
  constructor(client) {
    super()
    this.reconnect = true
    this.client = client
    this.r = rethinkdb
  }

  get logPrefix() {
    return `${chalk.gray('[')}${chalk.yellow('RDB')}${chalk.gray(']')}`
  }

  async connect({host = 'localhost', port, user, password, database}) {
    let conn = this.conn = await rethinkdb.connect({ host, port, user, password });
    if(database) conn.use(database);
    this.client.log(this.logPrefix, chalk.green('Recieved Connection'))
    conn.on('error', this.onError.bind(this))
    conn.on('close', w => this.onClose.bind(this))
    conn.on('connect', w => this.client.log(this.logPrefix, chalk.green('Connection has started.')))
    conn.on('timeout', w => this.client.log(this.logPrefix, chalk.green('Socket timeout.')))
    this.host = host
    this.port = port
  }

  async reconnect() {
    this.client.log(this.logPrefix, 'Attempting reconnection')
    await this.conn.reconnect(this)
  }

  onError(err) {
    this.client.log(this.logPrefix, 'Error', err)
    this.emit('error', err)
  }

  async onClose() {
    this.client.log(this.logPrefix, 'Closed')
    this.emit('close')
    if(this.reconnect) await this.reconnect();
  }
}