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

class Server extends Model {
  static init(client, sequelize) {
    return super.init(client, {
      sequelize,
      modelName: 'server',
      modelKey: 'serverID'
    }, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      serverID: {
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
      locale: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: client.config.sourceLocale
      },
      prefix: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: client.config.prefix
      },
      maxWebhooks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
    });
  }

  static _findObject(guild) {
    return this.findOrCreate({
      where: {
        serverID: guild.id,
      }
    });
  }
}

module.exports = Server;