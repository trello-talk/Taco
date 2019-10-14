/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah ???-2019
 Copyright (c) Yamboy1 (and contributors) 2019

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const rethinkdb = require("rethinkdb");
const chalk = require("chalk");
const { EventEmitter } = require("eventemitter3");

module.exports = class RethinkDB extends EventEmitter {
  constructor(client) {
    super();
    this.reconnect = true;
    this.client = client;
    this.r = rethinkdb;
  }

  get logPrefix() {
    return `${chalk.gray("[")}${chalk.yellow("RDB")}${chalk.gray("]")}`;
  }

  async connect({ host = "localhost", port, user, password, database }) {
    let conn = this.conn = await rethinkdb.connect({ host, port, user, password });
    if (database) conn.use(database);
    this.client.log(this.logPrefix, chalk.green("Recieved Connection"));
    conn.on("error", this.onError.bind(this));
    conn.on("close", w => this.onClose.bind(this));
    conn.on("connect", w => this.client.log(this.logPrefix, chalk.green("Connection has started.")));
    conn.on("timeout", w => this.client.log(this.logPrefix, chalk.green("Socket timeout.")));
    this.host = host;
    this.port = port;
  }

  async reconnect() {
    this.client.log(this.logPrefix, "Attempting reconnection");
    await this.conn.reconnect(this);
  }

  onError(err) {
    this.client.log(this.logPrefix, "Error", err);
    this.emit("error", err);
  }

  async onClose() {
    this.client.log(this.logPrefix, "Closed");
    this.emit("close");
    if (this.reconnect) await this.reconnect();
  }
};
