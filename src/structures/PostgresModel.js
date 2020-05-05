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
const Sequelize = require('sequelize');

class PostgresModel extends Sequelize.Model {
  static init(client, { sequelize, modelName, modelKey }, model) {
    this.__sequelize = sequelize;
    this._modelKey = modelKey;
    this.__client = client;
    return super.init(model, { sequelize, modelName });
  }

  static async get(obj) {
    const [model] = await this._findObject(obj);
    return model.get({ plain: true });
  }

  static async onlyGet(objID) {
    const item = await this.findOne({
      where: {
        [this._modelKey]: objID,
      }
    });
    return item ? item.get({ plain: true }) : null;
  }

  static _findObject(obj) {
    return this.findOrCreate({
      where: {
        [this._modelKey]: obj.id,
      }
    });
  }

  static async addToArray(obj, field, item) {
    const [model] = await this._findObject(obj);

    return await model.update({
      [field]: this.__sequelize.fn('array_append_distinct', this.__sequelize.col(field), item),
    }, {
      where: {
        [this._modelKey]: obj.id,
      },
    });
  }

  static async removeFromArray(obj, field, item) {
    const [model] = await this._findObject(obj);

    return await model.update({
      [field]: this.__sequelize.fn('array_remove', this.__sequelize.col(field), item),
    }, {
      where: {
        [this._modelKey]: obj.id,
      },
    });
  }
}

module.exports = PostgresModel;