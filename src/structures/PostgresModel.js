/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah 2016 - 2019
 Copyright (c) Trello Talk Team 2019 - 2020

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

/**
 * A postgres model for the postgres database.
 */
class PostgresModel extends Sequelize.Model {
  /**
   * @param {TrelloBot} client
   * @param {Object} options
   * @param {Object} model The schema the model is in
   */
  static init(client, { sequelize, modelName, modelKey }, model) {
    this.__sequelize = sequelize;
    this._modelKey = modelKey;
    this.__client = client;
    return super.init(model, { sequelize, modelName });
  }

  /**
   * Gets a model based on the object, creates one if it does not exist
   * @param {Object} obj 
   */
  static async get(obj) {
    const [model] = await this._findObject(obj);
    return model.get({ plain: true });
  }

  /**
   * Gets a model based on the object
   * @param {*} objID 
   */
  static async onlyGet(objID) {
    const item = await this.findOne({
      where: {
        [this._modelKey]: objID,
      }
    });
    return item ? item.get({ plain: true }) : null;
  }

  /**
   * @private
   * @param {Object} obj 
   */
  static _findObject(obj) {
    return this.findOrCreate({
      where: {
        [this._modelKey]: obj.id,
      }
    });
  }

  /**
   * Appends an item to an array, if that item is already in the array it does nothing.
   * @param {Object} obj The object to get
   * @param {string} field The field to change
   * @param {*} item The item to append
   */
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

  /**
   * Removes an item from an array
   * @param {Object} obj The object to get
   * @param {string} field The field to change
   * @param {*} item The item to remove
   */
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