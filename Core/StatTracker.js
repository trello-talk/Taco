/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah 2016 - 2019
 Copyright (c) Yamboy1 (and contributors) 2019 - 2020
 
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

require("./Extend");

module.exports = class StatTracker {
  constructor(client) {
    this.client = client;
    this.db = client.db;
    const HOUR = this.HOUR = 3600;

    this._keys = {
      "messages:total": null,
      "messages:lastHour": HOUR,
      "messages:lastDay": HOUR * 24,
      "messages:lastWeek": HOUR * 24 * 7,

      "commands:total": null,
      "commands:lastHour": HOUR,
      "commands:lastDay": HOUR * 24,
      "commands:lastWeek": HOUR * 24 * 7,

      "users:lastHour": HOUR,
      "users:lastDay": HOUR * 24,
      "users:lastWeek": HOUR * 24 * 7
    };
  }

  async init() {
    this._keys.keyValueForEach(this._prepKey.bind(this));
  }

  async _prepKey(key, expires) {
    return new Promise(async (resolve, reject) => {
      let exists = await this.db.exists(key).catch(e => reject(e));
      if (!exists) {
        await this.db.set(key, 0).catch(e => reject(e));
        if (expires !== null) await this.db.expire(key, expires).catch(e => reject(e));
      }
      resolve();
    });
  }

  prepKeysStart(start) {
    return this.prepThis(this._keys.sliceKeys(k => k.startsWith(start)));
  }

  prepThis(keys) {
    return keys.keyValueForEach(this._prepKey.bind(this));
  }

  incrAll(start) {
    return this.incrThis(this._keys.sliceKeys(k => k.startsWith(start)));
  }

  incrThis(keys) {
    return keys.keyValueForEach(this.db.incr.bind(this.db));
  }

  async bumpStat(stat) {
    await this.prepKeysStart(stat);
    await this.incrAll(stat);
  }

  async bumpCommandStat(command) {
    let stats = {};
    stats[`commands:${command}:total`] = null;
    stats[`commands:${command}:lastHour`] = this.HOUR;
    stats[`commands:${command}:lastDay`] = this.HOUR * 24;
    stats[`commands:${command}:lastWeek`] = this.HOUR * 24 * 7;
    await this.prepThis(stats);
    await this.incrAll(stats);
  }

  async getStats(keys) {
    let stats = {};
    await keys.map(async k => {
      let v = await this.db.get(k);
      stats[k] = v;
    });
    return stats;
  }

  getCommandStats(command) {
    return this.getStats([
      `commands:${command}:total`,
      `commands:${command}:lastHour`,
      `commands:${command}:lastDay`,
      `commands:${command}:lastWeek`
    ]);
  }

  getKeyStats(start) {
    return this.getStats(Object.keys(this._keys.sliceKeys(k => k.startsWith(start))));
  }
};
