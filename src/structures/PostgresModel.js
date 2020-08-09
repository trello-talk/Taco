/*
MIT License

Copyright (c) 2020 Trello Talk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
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