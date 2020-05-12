/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah (and contributors) 2016-2020

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

const redis = require('redis');
const { EventEmitter } = require('eventemitter3');

/**
 * The Redis database handler
 */
module.exports = class Database extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
    this.reconnectAfterClose = true;
    console.init('Redis initialized');
  }

  /**
   * Creates a client and connects to the database
   * @param {Object} options
   */
  connect({ host = 'localhost', port, password }) {
    console.info('Connecting to redis...');
    return new Promise((resolve, reject) => {
      this.redis = redis.createClient({ host, port, password });
      this.redis.on('error', this.onError.bind(this));
      this.redis.on('warning', w => console.warn('Redis Warning', w));
      this.redis.on('end', () => this.onClose.bind(this));
      this.redis.on('reconnecting', () => console.warn('Reconnecting to redis...'));
      this.redis.on('ready', () => console.info('Redis client ready.'));
      this.redis.on('connect', () => console.info('Redis connection has started.'));
      this.host = host;
      this.port = port;
      this.password = password;

      this.redis.once('ready', resolve.bind(this));
      this.redis.once('error', reject.bind(this));
    });
  }

  /**
   * @private
   * @param {string} k Key
   */
  _p(k) { return (this.client.config.prefix || '') + k; }

  // #region Redis functions
  hget(key, hashkey) {
    return new Promise((resolve, reject) => {
      this.redis.HGET(this._p(key), hashkey, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
  }

  hset(key, hashkey, value) {
    return new Promise((resolve, reject) => {
      this.redis.HSET(this._p(key), hashkey, value, (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  }

  incr(key) {
    return new Promise((resolve, reject) => {
      this.redis.incr(this._p(key), (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.redis.get(this._p(key), function(err, reply) {
        if (err) reject(err);
        resolve(reply);
      });
    });
  }

  expire(key, ttl) {
    return new Promise((resolve, reject) => {
      this.redis.expire(this._p(key), ttl, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
  }


  exists(key) {
    return new Promise((resolve, reject) => {
      this.redis.exists(this._p(key), (err, value) => {
        if (err) reject(err);
        resolve(value === 1);
      });
    });
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      this.redis.set(this._p(key), value, (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  }
  // #endregion

  /**
   * Reconnects the client
   */
  async reconnect() {
    console.warn('Attempting redis reconnection');
    this.conn = await this.connect(this);
  }

  /**
   * Disconnects the client
   */
  disconnect() {
    this.reconnectAfterClose = false;
    return new Promise(resolve => {
      this.redis.once('end', resolve);
      this.redis.quit();
    });
  }

  /**
   * @private
   */
  onError(err) {
    console.error('Redis Error', err);
    this.emit('error', err);
  }

  /**
   * @private
   */
  async onClose() {
    console.error('Redis closed');
    this.emit('close');
    if (this.reconnectAfterClose) await this.reconnect();
  }
};
