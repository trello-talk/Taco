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
const Model = require('../structures/PostgresModel');

class Webhook extends Model {
  static init(client, sequelize) {
    return super.init(client, {
      sequelize,
      modelName: 'webhook',
      modelKey: 'id'
    }, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      memberID: Sequelize.STRING,
      modelID: {
        type: Sequelize.STRING,
        allowNull: false
      },
      trelloWebhookID: Sequelize.STRING,
      filters: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '0'
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      locale: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      style: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'default'
      },
      guildID: {
        type: Sequelize.STRING,
        allowNull: false
      },
      webhookID: Sequelize.STRING,
      webhookToken: Sequelize.STRING,
      whitelist: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      lists: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: []
      },
      cards: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: []
      },
    });
  }
}

module.exports = Webhook;