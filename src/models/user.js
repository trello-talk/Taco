/*
This file is part of Taco

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
const Model = require('../structures/PostgresModel');

class User extends Model {
  static init(client, sequelize) {
    return super.init(client, {
      sequelize,
      modelName: 'user',
      modelKey: 'userID'
    }, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      bannedFromUse: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      banReason: Sequelize.STRING,
      trelloToken: Sequelize.STRING,
      trelloID: Sequelize.STRING,
      currentBoard: Sequelize.STRING,
      discordToken: Sequelize.STRING,
      discordRefresh: Sequelize.STRING,
      locale: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      prefixes: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: []
      }
    });
  }

  static _findObject(user) {
    return this.findOrCreate({
      where: {
        userID: user.id,
      }
    });
  }

  static async removeAuth(obj) {
    const [model] = await this._findObject(obj);

    return await model.update({
      trelloID: null,
      trelloToken: null,
    }, {
      where: {
        [this._modelKey]: obj.id,
      },
    });
  }
}

module.exports = User;