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
const logger = require('./logger')('[REDIS]');

module.exports = class Database extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
    this.reconnectAfterClose = true;
    logger.info('Initialized');
  }

  connect({ host = 'localhost', port, password }) {
    logger.info('Connecting...');
    return new Promise((resolve, reject) => {
      this.redis = redis.createClient({ host, port, password });
      logger.info('Connected');
      this.redis.on('error', this.onError.bind(this));
      this.redis.on('warning', w => logger.warn(w));
      this.redis.on('end', () => this.onClose.bind(this));
      this.redis.on('reconnecting', () => logger.warn('Reconnecting'));
      this.redis.on('ready', () => logger.info('Ready'));
      this.redis.on('connect', () => logger.info('Redis connection has started.'));
      this.host = host;
      this.port = port;
      this.password = password;

      this.redis.once('ready', resolve.bind(this));
      this.redis.once('error', reject.bind(this));
    });
  }

  _p(k) { return (this.client.config.prefix || '') + k; }

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

  async reconnect() {
    logger.warn('Attempting reconnection');
    this.conn = await this.connect(this);
    logger.info('Reconnected');
  }

  disconnect() {
    this.reconnectAfterClose = false;
    return new Promise(resolve => {
      this.redis.once('end', resolve);
      this.redis.quit();
    });
  }

  onError(err) {
    logger.error('Error', err);
    this.emit('error', err);
  }

  async onClose() {
    logger.error('Closed');
    this.emit('close');
    if (this.reconnectAfterClose) await this.reconnect();
  }
};
